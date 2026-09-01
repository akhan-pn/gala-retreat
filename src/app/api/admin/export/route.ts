import { and, count, countDistinct, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { experiments } from '@/content/experiments'
import { isAuthed } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'

/** Escapes a value for CSV, and defuses spreadsheet formula injection. */
function cell(value: unknown) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return `"${value.toISOString()}"`
  if (typeof value === 'boolean') return value ? '"Yes"' : '"No"'
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

function csv(header: string[], rows: unknown[][]) {
  return [header.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n')
}

const DAY = 86_400_000

function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0
}

/**
 * Wilson score interval, kept beside the export so a downloaded sheet carries
 * the same honesty the dashboard draws: at small samples the plain rate looks
 * far more certain than it is.
 */
function wilson(successes: number, trials: number): [number, number] {
  if (trials === 0) return [0, 0]
  const z = 1.96
  const p = successes / trials
  const denominator = 1 + (z * z) / trials
  const centre = p + (z * z) / (2 * trials)
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * trials)) / trials)
  return [
    Math.max(0, (centre - margin) / denominator),
    Math.min(1, (centre + margin) / denominator),
  ]
}

export async function GET(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ ok: false }, { status: 503 })

  const set = new URL(request.url).searchParams.get('set')
  const stamp = new Date().toISOString().slice(0, 10)
  const since30 = new Date(Date.now() - 30 * DAY)
  const windowStart = since30.toISOString().slice(0, 10)

  let body: string
  let name: string

  if (set === 'visitors') {
    const rows = await db
      .select()
      .from(schema.visitors)
      .orderBy(desc(schema.visitors.createdAt))

    name = `gala-retreat-callbacks-${stamp}.csv`
    body = csv(
      ['ID', 'Received', 'Name', 'Phone', 'Asked from', 'Source', 'Device',
       'City', 'Country', 'Consent given', 'Consent wording'],
      rows.map((r) => [
        r.id, r.createdAt, r.name, r.phone, r.capturedOn, r.source,
        r.device, r.city, r.country, r.consentAt, r.consentText,
      ]),
    )
  } else if (set === 'behaviour') {
    // One row per page. Every figure counts only visits from people who
    // accepted measurement, so the column headings say so rather than
    // letting a spreadsheet read as a total.
    const rows = await db
      .select({
        path: schema.pageEngagement.path,
        visits: count(),
        visitors: countDistinct(schema.pageEngagement.visitorId),
        avgScroll: sql<number>`coalesce(round(avg(${schema.pageEngagement.maxScrollPct})), 0)::int`,
        reached25: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 25)::int`,
        reached50: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 50)::int`,
        reached75: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 75)::int`,
        reached100: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 100)::int`,
        medianActiveMs: sql<number>`coalesce(percentile_cont(0.5) within group (order by ${schema.pageEngagement.activeMs}), 0)::int`,
        rageClicks: sql<number>`coalesce(sum(${schema.pageEngagement.rageClicks}), 0)::int`,
      })
      .from(schema.pageEngagement)
      .where(gte(schema.pageEngagement.createdAt, since30))
      .groupBy(schema.pageEngagement.path)
      .orderBy(desc(count()))

    name = `gala-retreat-pages-${stamp}.csv`
    body = csv(
      ['Page', 'Measured visits', 'Measured visitors', 'Average depth reached %',
       'Reached a quarter', 'Reached halfway', 'Reached three quarters',
       'Reached the bottom', 'Reached the bottom %', 'Typical seconds reading',
       'Frustrated clicks', 'Window start', 'Basis'],
      rows.map((r) => [
        r.path, r.visits, r.visitors, r.avgScroll,
        r.reached25, r.reached50, r.reached75,
        r.reached100, percent(r.reached100, r.visits), Math.round(r.medianActiveMs / 1000),
        r.rageClicks, windowStart, 'Consented visits only',
      ]),
    )
  } else if (set === 'interactions') {
    const [clicks, rage] = await Promise.all([
      db
        .select({
          kind: schema.siteEvents.kind,
          name: schema.siteEvents.name,
          path: schema.siteEvents.path,
          times: count(),
        })
        .from(schema.siteEvents)
        .where(
          and(
            gte(schema.siteEvents.createdAt, since30),
            inArray(schema.siteEvents.kind, ['cta', 'outbound']),
          ),
        )
        .groupBy(schema.siteEvents.kind, schema.siteEvents.name, schema.siteEvents.path)
        .orderBy(desc(count())),
      db
        .select({
          name: schema.siteEvents.name,
          path: schema.siteEvents.path,
          times: count(),
          clicks: sql<number>`coalesce(sum(${schema.siteEvents.value}), 0)::int`,
        })
        .from(schema.siteEvents)
        .where(
          and(
            gte(schema.siteEvents.createdAt, since30),
            eq(schema.siteEvents.kind, 'rage'),
          ),
        )
        .groupBy(schema.siteEvents.name, schema.siteEvents.path)
        .orderBy(desc(count())),
    ])

    name = `gala-retreat-clicks-${stamp}.csv`
    // Clicks and stuck points share a shape — what, where, how often — so one
    // sheet with a Type column beats two downloads.
    body = csv(
      ['Type', 'What', 'Page', 'Times', 'Clicks in the burst', 'Window start', 'Basis'],
      [
        ...clicks.map((r) => [
          r.kind === 'cta' ? 'Stayed on the site' : 'Left for WhatsApp, Maps, social',
          r.name, r.path, r.times, '', windowStart, 'Consented visits only',
        ]),
        ...rage.map((r) => [
          'Frustration', r.name, r.path, r.times, r.clicks, windowStart,
          'Consented visits only',
        ]),
      ],
    )
  } else if (set === 'experiments') {
    // One row per wording per goal, so a spreadsheet can pivot it. The
    // pre-registered stopping rule rides along in its own columns — a rate
    // read without them is the thing this test exists to prevent.
    const rows: unknown[][] = []

    for (const declaration of experiments) {
      const since = new Date(`${declaration.startedAt}T00:00:00Z`)
      const daysRunning = Math.max(
        0,
        Math.floor((Date.now() - since.getTime()) / DAY),
      )

      const perGoal = await Promise.all(
        declaration.goals.map((goal) =>
          db
            .select({
              variant: schema.experimentExposures.variant,
              exposed: countDistinct(schema.experimentExposures.visitorId),
              converted: countDistinct(schema.experimentGoals.visitorId),
            })
            .from(schema.experimentExposures)
            .leftJoin(
              schema.experimentGoals,
              and(
                eq(
                  schema.experimentGoals.visitorId,
                  schema.experimentExposures.visitorId,
                ),
                eq(schema.experimentGoals.goal, goal),
                // A conversion that happened before the visitor saw the arm
                // was not caused by it.
                gte(
                  schema.experimentGoals.createdAt,
                  schema.experimentExposures.createdAt,
                ),
              ),
            )
            .where(
              and(
                eq(schema.experimentExposures.experimentKey, declaration.key),
                // Exposures the server could not reproduce are excluded here
                // exactly as they are on the dashboard.
                eq(schema.experimentExposures.dirty, false),
                gte(schema.experimentExposures.createdAt, since),
              ),
            )
            .groupBy(schema.experimentExposures.variant),
        ),
      )

      const exposedFor = (variant: string) =>
        perGoal[0]?.find((r) => r.variant === variant)?.exposed ?? 0
      const smallestArm = Math.min(
        ...declaration.variants.map((v) => exposedFor(v.name)),
      )
      const readable =
        smallestArm >= declaration.minPerArm && daysRunning >= declaration.minDays

      for (const variant of declaration.variants) {
        const exposed = exposedFor(variant.name)
        declaration.goals.forEach((goal, i) => {
          const converted =
            perGoal[i].find((r) => r.variant === variant.name)?.converted ?? 0
          const [low, high] = wilson(converted, exposed)
          rows.push([
            declaration.key,
            declaration.startedAt,
            daysRunning,
            variant.name,
            variant.note,
            variant.name === declaration.variants[0].name ? 'Currently live' : 'New wording',
            exposed,
            goal,
            i === 0 ? 'Primary' : 'Guardrail',
            converted,
            percent(converted, exposed),
            Math.round(low * 1000) / 10,
            Math.round(high * 1000) / 10,
            declaration.minPerArm,
            declaration.minDays,
            readable ? 'Yes' : 'No — too early to tell',
          ])
        })
      }
    }

    name = `gala-retreat-wording-test-${stamp}.csv`
    body = csv(
      ['Experiment', 'Started', 'Days running', 'Variant', 'Wording', 'Role',
       'Visitors in this arm', 'Goal', 'Goal type', 'Conversions',
       'Conversion rate %', 'Realistic range low %', 'Realistic range high %',
       'Visitors needed per arm', 'Days needed', 'Enough data to call it'],
      rows,
    )
  } else {
    const rows = await db
      .select()
      .from(schema.enquiries)
      .orderBy(desc(schema.enquiries.createdAt))

    name = `gala-retreat-enquiries-${stamp}.csv`
    body = csv(
      ['ID', 'Received', 'Name', 'Phone', 'Email', 'Occasion', 'Date of interest',
       'Guests', 'Source', 'Message', 'Contact consent', 'Marketing opt-in',
       'Consent given', 'Consent wording'],
      rows.map((r) => [
        r.id, r.createdAt, r.name, r.phone, r.email, r.eventType, r.eventDate,
        r.guests, r.source, r.message, r.contactConsent, r.marketingConsent,
        r.consentAt, r.consentText,
      ]),
    )
  }

  return new NextResponse(`﻿${body}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  })
}
