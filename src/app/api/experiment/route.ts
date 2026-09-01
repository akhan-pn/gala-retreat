import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { parsePath } from '@/lib/behaviour'
import { CONSENT_COOKIE, consentGrantedFromCookie } from '@/lib/consent'
import { getDb, schema } from '@/lib/db'
import { EXPERIMENT_GOALS, type ExperimentGoal } from '@/lib/db/schema'
import {
  BUCKET_COOKIE,
  VISITOR_COOKIE,
  deriveBucketSeed,
  experimentByKey,
  isVariantOf,
  variantFor,
} from '@/lib/experiments'
import { resolveDevice } from '@/lib/source'

/**
 * Exposures, conversions, and the bucketing seed that makes both possible.
 *
 * Consent is checked twice, exactly as in /api/pageview: the client refuses to
 * call this at all without a granted cookie, and this route refuses to write —
 * or to issue gr_bkt — whatever the request body claims. An unconsented
 * visitor is never seeded, so they are never assigned, so there is nothing to
 * record about them. They still see the site: with no seed the boot script
 * stamps no attribute and the CSS default puts control on screen.
 *
 * Every write is idempotent (unique index + onConflictDoNothing), so a
 * duplicate beacon, a double mount or a keepalive retry cannot inflate an arm.
 */

const ONE_YEAR = 60 * 60 * 24 * 365
/** A page cannot plausibly carry more than this; anything more is noise. */
const MAX_EXPOSURES = 8
const MAX_GOALS = 4

type Payload = {
  path?: unknown
  exposures?: unknown
  goals?: unknown
}

function asArray(value: unknown, limit: number) {
  return Array.isArray(value) ? value.slice(0, limit) : []
}

function isGoal(value: unknown): value is ExperimentGoal {
  return (
    typeof value === 'string' &&
    (EXPERIMENT_GOALS as readonly string[]).includes(value)
  )
}

export async function POST(request: Request) {
  const db = getDb()
  // Nothing to record against — accept and drop rather than 500 on every page.
  if (!db) return NextResponse.json({ ok: false, reason: 'not-configured' })

  let payload: Payload
  try {
    payload = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Same door as /api/events: the query string and fragment are cut before the
  // value is looked at, so nothing a visitor typed can reach the path column.
  // A path that fails validation is stored as null rather than costing the
  // visitor their exposure or their conversion.
  const path = parsePath(payload.path)
  // The admin area is not part of anybody's experiment.
  if (path?.startsWith('/admin')) return NextResponse.json({ ok: true })

  const jar = await cookies()

  // Server-side gate as well as the client one.
  if (!consentGrantedFromCookie(jar.get(CONSENT_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, reason: 'no-consent' })
  }

  // The id is minted by /api/pageview on the first consented view; this route
  // deliberately does not mint its own, or a race between the two beacons
  // would hand one visitor two identities and split their arm.
  const visitorId = jar.get(VISITOR_COOKIE)?.value
  if (!visitorId) return NextResponse.json({ ok: false, reason: 'no-visitor' })

  const salt = process.env.EXPERIMENT_SALT ?? process.env.ADMIN_SESSION_SECRET
  if (!salt) return NextResponse.json({ ok: false, reason: 'no-salt' })

  const seed = await deriveBucketSeed(visitorId, salt)
  // Wrong or missing means a first consented visit, a rotated salt, or an
  // edited cookie. Re-issuing it is what enrols them, from the next document.
  const reseed = jar.get(BUCKET_COOKIE)?.value !== seed

  const device = resolveDevice((await headers()).get('user-agent'))

  const exposureRows: (typeof schema.experimentExposures.$inferInsert)[] = []
  for (const entry of asArray(payload.exposures, MAX_EXPOSURES)) {
    if (typeof entry !== 'object' || entry === null) continue
    const { key, variant } = entry as { key?: unknown; variant?: unknown }
    if (typeof key !== 'string' || typeof variant !== 'string') continue

    const declaration = experimentByKey(key)
    // Not a declared experiment, or not one of its arms — never stored, so a
    // stale deploy or a crafted body cannot invent a column value.
    if (!declaration || !isVariantOf(declaration, variant)) continue

    exposureRows.push({
      experimentKey: declaration.key,
      variant,
      visitorId,
      path,
      device,
      // The client's arm disagrees with what this seed actually assigns —
      // stale HTML from a CDN, a rotated salt, or tampering. Recorded so the
      // count is honest, flagged so the dashboard can exclude it.
      dirty: variant !== variantFor(seed, declaration),
    })
  }

  const goalRows: (typeof schema.experimentGoals.$inferInsert)[] = []
  for (const goal of asArray(payload.goals, MAX_GOALS)) {
    if (!isGoal(goal)) continue
    goalRows.push({ goal, visitorId, path })
  }

  try {
    if (exposureRows.length) {
      await db
        .insert(schema.experimentExposures)
        .values(exposureRows)
        .onConflictDoNothing()
    }
    if (goalRows.length) {
      await db
        .insert(schema.experimentGoals)
        .values(goalRows)
        .onConflictDoNothing()
    }
  } catch (error) {
    console.error('[experiment] insert failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const response = NextResponse.json({
    ok: true,
    seeded: reseed,
    exposures: exposureRows.length,
    goals: goalRows.length,
  })

  if (reseed) {
    // Readable on purpose: the blocking boot script has to see it before first
    // paint, and JavaScript cannot read an httpOnly cookie. It is an HMAC of
    // gr_vid, so it carries no more information than the id already does, and
    // the server can always recompute it.
    response.cookies.set(BUCKET_COOKIE, seed, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ONE_YEAR,
    })
  }

  return response
}
