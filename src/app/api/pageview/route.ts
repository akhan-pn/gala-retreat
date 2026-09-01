import { randomUUID } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { CONSENT_COOKIE, consentGrantedFromCookie } from '@/lib/consent'
import { getDb, schema } from '@/lib/db'
import { resolveGeo } from '@/lib/geo'
import { resolveDevice, resolveSource } from '@/lib/source'

const VISITOR_COOKIE = 'gr_vid'
const ONE_YEAR = 60 * 60 * 24 * 365

export async function POST(request: Request) {
  const db = getDb()
  // No database configured — accept and drop, rather than 500 on every page.
  if (!db) return NextResponse.json({ ok: false, reason: 'not-configured' })

  let payload: { path?: string; referrer?: string | null; utm?: string | null }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const path = typeof payload.path === 'string' ? payload.path.slice(0, 200) : '/'
  // Never log the admin area as marketing traffic.
  if (path.startsWith('/admin')) return NextResponse.json({ ok: true })

  const jar = await cookies()

  // Server-side gate as well as the client one: without a consent cookie we
  // record nothing and issue no identifier, whatever the request claims.
  if (!consentGrantedFromCookie(jar.get(CONSENT_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, reason: 'no-consent' })
  }

  let visitorId = jar.get(VISITOR_COOKIE)?.value
  const isNew = !visitorId
  if (!visitorId) visitorId = randomUUID()

  const head = await headers()
  const ua = head.get('user-agent')
  const geo = resolveGeo(head)

  try {
    await db.insert(schema.pageviews).values({
      path,
      visitorId,
      source: resolveSource(payload.referrer ?? null, payload.utm ?? null),
      referrer: payload.referrer?.slice(0, 500) ?? null,
      device: resolveDevice(ua),
      city: geo.city,
      country: geo.country,
    })
  } catch (error) {
    console.error('[pageview] insert failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })
  if (isNew) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ONE_YEAR,
    })
  }
  return response
}
