import { sql } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { parseBehaviourPayload } from '@/lib/behaviour'
import { CONSENT_COOKIE, consentGrantedFromCookie } from '@/lib/consent'
import { getDb, schema } from '@/lib/db'
import { resolveDevice } from '@/lib/source'

const VISITOR_COOKIE = 'gr_vid'

/**
 * Batched behaviour capture: one upserted engagement row per page visit plus
 * whatever discrete events came with it.
 *
 * The same two gates as /api/pageview apply — the tracker checks consent
 * before sending, and this route checks the cookie again before writing, so a
 * hand-rolled request cannot record anything either. Unlike pageview this
 * route never issues an identifier: gr_vid is stamped from the existing
 * httpOnly cookie or the batch is refused, which keeps the browser out of the
 * identity business entirely and stops behaviour data from minting a visitor
 * the pageview log has never seen.
 */
export async function POST(request: Request) {
  const db = getDb()
  // No database configured — accept and drop, rather than 500 on every page.
  if (!db) return NextResponse.json({ ok: false, reason: 'not-configured' })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const jar = await cookies()

  // Server-side gate as well as the client one: without a consent cookie we
  // record nothing, whatever the request claims.
  if (!consentGrantedFromCookie(jar.get(CONSENT_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, reason: 'no-consent' })
  }

  const visitorId = jar.get(VISITOR_COOKIE)?.value
  // Consent is granted but the pageview beacon has not landed yet. Retryable:
  // the tracker keeps its queue and the next flush will carry it.
  if (!visitorId) return NextResponse.json({ ok: false, reason: 'no-visitor' })

  const parsed = parseBehaviourPayload(body)
  if (!parsed) return NextResponse.json({ ok: false }, { status: 400 })

  // Never log the admin area as marketing traffic.
  if (parsed.path.startsWith('/admin')) return NextResponse.json({ ok: true })

  const head = await headers()
  const device = resolveDevice(head.get('user-agent'))

  try {
    await db
      .insert(schema.pageEngagement)
      .values({
        viewId: parsed.viewId,
        visitorId,
        path: parsed.path,
        device,
        maxScrollPct: parsed.maxScrollPct,
        activeMs: parsed.activeMs,
        rageClicks: parsed.rageClicks,
      })
      .onConflictDoUpdate({
        target: schema.pageEngagement.viewId,
        set: {
          // A beacon that arrives late with a smaller reading must never
          // undo a larger one already recorded for this view.
          maxScrollPct: sql`greatest(${schema.pageEngagement.maxScrollPct}, excluded.max_scroll_pct)`,
          activeMs: sql`greatest(${schema.pageEngagement.activeMs}, excluded.active_ms)`,
          rageClicks: sql`greatest(${schema.pageEngagement.rageClicks}, excluded.rage_clicks)`,
          updatedAt: new Date(),
        },
      })

    if (parsed.events.length > 0) {
      await db
        .insert(schema.siteEvents)
        .values(
          parsed.events.map((event) => ({
            dedupeKey: event.dedupeKey,
            viewId: parsed.viewId,
            path: parsed.path,
            kind: event.kind,
            name: event.name,
            value: event.value,
          })),
        )
        .onConflictDoNothing()
    }
  } catch (error) {
    console.error('[behaviour] write failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true, events: parsed.events.length })
}
