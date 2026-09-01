/**
 * Exercises the schema and every aggregate the dashboard runs, against a real
 * Postgres. Neon's HTTP driver speaks the same SQL, so this is where query
 * mistakes surface without needing a Neon project.
 *
 *   docker run -d --name gala-pg -e POSTGRES_PASSWORD=gala -e POSTGRES_DB=gala \
 *     -p 55432:5432 postgres:16-alpine
 *   psql "$SMOKE_DATABASE_URL" -f drizzle/0000_*.sql
 *   SMOKE_DATABASE_URL=postgresql://postgres:gala@localhost:55432/gala \
 *     npx tsx scripts/smoke-db.ts
 */
import { and, count, countDistinct, desc, eq, gte, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../src/lib/db/schema'

const url = process.env.SMOKE_DATABASE_URL
if (!url) throw new Error('Set SMOKE_DATABASE_URL')

const DAY = 86_400_000
const IST = 'Asia/Kolkata'
const pool = new Pool({ connectionString: url })
const db = drizzle(pool, { schema })

const ok = (label: string, value: unknown) =>
  console.log(`  ✓ ${label.padEnd(34)} ${JSON.stringify(value)}`)

async function main() {
  await db.delete(schema.pageviews)
  await db.delete(schema.enquiries)
  await db.delete(schema.siteEvents)
  await db.delete(schema.pageEngagement)
  await db.delete(schema.experimentGoals)
  await db.delete(schema.experimentExposures)

  console.log('\nSeeding…')
  const now = Date.now()
  await db.insert(schema.pageviews).values(
    Array.from({ length: 60 }, (_, i) => ({
      path: ['/', '/gallery', '/enquiry', '/about', '/contact'][i % 5],
      visitorId: `visitor-${i % 9}`,
      source: ['instagram', 'direct', 'google', 'whatsapp'][i % 4],
      referrer: null,
      device: ['mobile', 'desktop', 'tablet'][i % 3],
      createdAt: new Date(now - (i % 14) * DAY),
    })),
  )
  await db.insert(schema.enquiries).values([
    {
      name: 'Test Enquiry',
      phone: '+91 90000 00001',
      email: 'a@example.com',
      eventType: 'Wedding',
      eventDate: '2027-02-14',
      guests: 450,
      message: 'Checking the lawn and hall together.',
      source: 'instagram',
    },
    { name: 'Second', phone: '9000000002', guests: null, source: 'direct' },
  ])

  const since30 = new Date(now - 30 * DAY)
  const since14 = new Date(now - 13 * DAY)

  console.log('\nDashboard queries…')

  const [views30] = await db
    .select({ n: count() })
    .from(schema.pageviews)
    .where(gte(schema.pageviews.createdAt, since30))
  ok('page views, 30d', views30.n)

  const [visitors30] = await db
    .select({ n: countDistinct(schema.pageviews.visitorId) })
    .from(schema.pageviews)
    .where(gte(schema.pageviews.createdAt, since30))
  ok('unique visitors, 30d', visitors30.n)

  const [enquiriesAll] = await db.select({ n: count() }).from(schema.enquiries)
  ok('enquiries, all time', enquiriesAll.n)

  const sources = await db
    .select({ source: schema.pageviews.source, n: countDistinct(schema.pageviews.visitorId) })
    .from(schema.pageviews)
    .where(gte(schema.pageviews.createdAt, since30))
    .groupBy(schema.pageviews.source)
    .orderBy(desc(countDistinct(schema.pageviews.visitorId)))
    .limit(8)
  ok('traffic sources', sources)

  const topPages = await db
    .select({ path: schema.pageviews.path, n: count() })
    .from(schema.pageviews)
    .where(gte(schema.pageviews.createdAt, since30))
    .groupBy(schema.pageviews.path)
    .orderBy(desc(count()))
    .limit(8)
  ok('top pages', topPages.map((p) => `${p.path}:${p.n}`))

  // The one with real scope for error: timezone-shifted day bucketing.
  const daily = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${schema.pageviews.createdAt} AT TIME ZONE ${IST}), 'YYYY-MM-DD')`,
      views: count(),
      visitors: countDistinct(schema.pageviews.visitorId),
    })
    .from(schema.pageviews)
    .where(gte(schema.pageviews.createdAt, since14))
    .groupBy(sql`1`)
    .orderBy(sql`1`)
  ok('daily buckets (IST)', `${daily.length} days, first=${daily[0]?.day}`)

  const recent = await db
    .select()
    .from(schema.enquiries)
    .orderBy(desc(schema.enquiries.createdAt))
    .limit(50)
  ok('recent enquiries', recent.map((r) => r.name))

  if (daily.length === 0) throw new Error('daily bucket query returned nothing')
  if (visitors30.n !== 9) throw new Error(`expected 9 unique visitors, got ${visitors30.n}`)
  if (enquiriesAll.n !== 2) throw new Error(`expected 2 enquiries, got ${enquiriesAll.n}`)

  /* ----------------------------------------------------------------
     Behaviour analytics: engagement rows are upserted, events are
     append-only, and both must survive a duplicated beacon unchanged.
     ---------------------------------------------------------------- */

  console.log('\nSeeding behaviour…')

  const engagementRows = Array.from({ length: 40 }, (_, i) => ({
    viewId: `view-${i}`,
    visitorId: `visitor-${i % 9}`,
    path: ['/', '/gallery', '/enquiry', '/about', '/contact'][i % 5],
    device: ['mobile', 'desktop', 'tablet'][i % 3],
    maxScrollPct: [10, 30, 55, 80, 100][i % 5],
    activeMs: 1_000 * ((i % 10) + 1),
    rageClicks: i % 7 === 0 ? 3 : 0,
    createdAt: new Date(now - (i % 14) * DAY),
    updatedAt: new Date(now - (i % 14) * DAY),
  }))
  await db.insert(schema.pageEngagement).values(engagementRows)

  // The beacon that arrives late with a smaller reading. GREATEST is the whole
  // point of the upsert: depth and engaged time may only ever climb.
  await db
    .insert(schema.pageEngagement)
    .values(
      engagementRows.slice(0, 10).map((r) => ({
        ...r,
        maxScrollPct: 5,
        activeMs: 1,
        rageClicks: 0,
      })),
    )
    .onConflictDoUpdate({
      target: schema.pageEngagement.viewId,
      set: {
        maxScrollPct: sql`greatest(${schema.pageEngagement.maxScrollPct}, excluded.max_scroll_pct)`,
        activeMs: sql`greatest(${schema.pageEngagement.activeMs}, excluded.active_ms)`,
        rageClicks: sql`greatest(${schema.pageEngagement.rageClicks}, excluded.rage_clicks)`,
        updatedAt: new Date(now),
      },
    })

  const eventRows = [
    ...Array.from({ length: 20 }, (_, i) => ({
      dedupeKey: `view-${i}:section:hero`,
      viewId: `view-${i}`,
      path: ['/', '/gallery', '/enquiry', '/about', '/contact'][i % 5],
      kind: 'section' as const,
      name: 'hero',
      value: null,
      createdAt: new Date(now - (i % 14) * DAY),
    })),
    ...[0, 2, 4, 6, 8, 10, 12, 14, 16, 18].map((i) => ({
      dedupeKey: `view-${i}:cta:enquire_now`,
      viewId: `view-${i}`,
      path: ['/', '/gallery', '/enquiry', '/about', '/contact'][i % 5],
      kind: 'cta' as const,
      name: 'enquire_now',
      value: null,
      createdAt: new Date(now - (i % 14) * DAY),
    })),
    ...[0, 5, 10, 15].map((i) => ({
      dedupeKey: `view-${i}:outbound:whatsapp`,
      viewId: `view-${i}`,
      path: '/contact',
      kind: 'outbound' as const,
      name: 'whatsapp',
      value: null,
      createdAt: new Date(now - (i % 14) * DAY),
    })),
    ...[0, 7, 14].map((i) => ({
      dedupeKey: `view-${i}:rage:hero_cta:1`,
      viewId: `view-${i}`,
      path: '/',
      kind: 'rage' as const,
      name: 'hero_cta',
      value: 3,
      createdAt: new Date(now - (i % 14) * DAY),
    })),
  ]
  await db.insert(schema.siteEvents).values(eventRows)
  // A retried beacon replays the identical batch; nothing may be double-counted.
  await db.insert(schema.siteEvents).values(eventRows).onConflictDoNothing()

  console.log('\nBehaviour queries…')

  const [engagement] = await db
    .select({
      views: count(),
      visitors: countDistinct(schema.pageEngagement.visitorId),
      reached25: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 25)::int`,
      reached50: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 50)::int`,
      reached75: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 75)::int`,
      reached100: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 100)::int`,
      medianActiveMs: sql<number>`coalesce(percentile_cont(0.5) within group (order by ${schema.pageEngagement.activeMs}), 0)::int`,
      rageTotal: sql<number>`coalesce(sum(${schema.pageEngagement.rageClicks}), 0)::int`,
    })
    .from(schema.pageEngagement)
    .where(gte(schema.pageEngagement.createdAt, since30))
  ok('engagement rows, 30d', engagement.views)
  ok(
    'read-depth funnel',
    `25:${engagement.reached25} 50:${engagement.reached50} 75:${engagement.reached75} 100:${engagement.reached100}`,
  )
  ok('median active ms / rage total', `${engagement.medianActiveMs} / ${engagement.rageTotal}`)

  const depthByPath = await db
    .select({
      path: schema.pageEngagement.path,
      views: count(),
      avgScroll: sql<number>`round(avg(${schema.pageEngagement.maxScrollPct}))::int`,
    })
    .from(schema.pageEngagement)
    .where(gte(schema.pageEngagement.createdAt, since30))
    .groupBy(schema.pageEngagement.path)
    .orderBy(desc(count()))
  ok('read depth by path', depthByPath.map((p) => `${p.path}:${p.avgScroll}%`))

  const byKind = await db
    .select({
      kind: schema.siteEvents.kind,
      name: schema.siteEvents.name,
      n: count(),
    })
    .from(schema.siteEvents)
    .where(gte(schema.siteEvents.createdAt, since30))
    .groupBy(schema.siteEvents.kind, schema.siteEvents.name)
    .orderBy(desc(count()))
  ok('events by kind + name', byKind.map((e) => `${e.kind}/${e.name}:${e.n}`))

  const eventsByPath = await db
    .select({ path: schema.siteEvents.path, n: count() })
    .from(schema.siteEvents)
    .where(gte(schema.siteEvents.createdAt, since30))
    .groupBy(schema.siteEvents.path)
    .orderBy(desc(count()))
    .limit(8)
  ok('events by path', eventsByPath.map((e) => `${e.path}:${e.n}`))

  const recentEvents = await db
    .select()
    .from(schema.siteEvents)
    .orderBy(desc(schema.siteEvents.createdAt))
    .limit(20)
  ok('recent events feed', recentEvents.length)

  // An event only reaches a person through an explicit join — site_events
  // carries no visitor id of its own.
  const [ctaVisitors] = await db
    .select({ n: countDistinct(schema.pageEngagement.visitorId) })
    .from(schema.siteEvents)
    .innerJoin(
      schema.pageEngagement,
      eq(schema.pageEngagement.viewId, schema.siteEvents.viewId),
    )
    .where(eq(schema.siteEvents.kind, 'cta'))
  ok('unique visitors who hit a CTA', ctaVisitors.n)

  /* ----------------------------------------------------------------
     Experiments: one exposure per visitor per arm, one goal per visitor
     per goal, attributed by joining the two on visitor_id.
     ---------------------------------------------------------------- */

  console.log('\nSeeding experiments…')

  const exposureRows = Array.from({ length: 9 }, (_, i) => ({
    experimentKey: 'hero_copy',
    variant: i % 2 === 0 ? 'control' : 'headline_b',
    visitorId: `visitor-${i}`,
    path: '/',
    device: ['mobile', 'desktop', 'tablet'][i % 3],
    // One visitor whose reported arm disagreed with the server recomputation.
    dirty: i === 8,
    createdAt: new Date(now - (i % 5) * DAY),
  }))
  await db.insert(schema.experimentExposures).values(exposureRows)
  // A remount reports the opposite arm. The first arm recorded must stick.
  await db
    .insert(schema.experimentExposures)
    .values(
      exposureRows.map((r) => ({
        ...r,
        variant: r.variant === 'control' ? 'headline_b' : 'control',
      })),
    )
    .onConflictDoNothing()

  const goalRows = [
    ...[0, 1, 2, 3].map((i) => ({
      goal: 'enquiry_submitted' as const,
      visitorId: `visitor-${i}`,
      path: '/enquiry',
      createdAt: new Date(now - DAY),
    })),
    {
      goal: 'whatsapp_click' as const,
      visitorId: 'visitor-0',
      path: '/contact',
      createdAt: new Date(now - DAY),
    },
  ]
  await db.insert(schema.experimentGoals).values(goalRows)
  // A second enquiry from the same visitor is the same conversion.
  await db.insert(schema.experimentGoals).values(goalRows).onConflictDoNothing()

  console.log('\nExperiment queries…')

  const [exposures] = await db
    .select({ n: count() })
    .from(schema.experimentExposures)
    .where(eq(schema.experimentExposures.experimentKey, 'hero_copy'))
  ok('exposures, hero_copy', exposures.n)

  const [controlLocked] = await db
    .select({ n: count() })
    .from(schema.experimentExposures)
    .where(
      and(
        eq(schema.experimentExposures.experimentKey, 'hero_copy'),
        eq(schema.experimentExposures.variant, 'control'),
      ),
    )
  ok('control arm still locked', controlLocked.n)

  const arms = await db
    .select({
      variant: schema.experimentExposures.variant,
      exposed: countDistinct(schema.experimentExposures.visitorId),
      converted: countDistinct(schema.experimentGoals.visitorId),
    })
    .from(schema.experimentExposures)
    .leftJoin(
      schema.experimentGoals,
      and(
        eq(schema.experimentGoals.visitorId, schema.experimentExposures.visitorId),
        eq(schema.experimentGoals.goal, 'enquiry_submitted'),
      ),
    )
    .where(
      and(
        eq(schema.experimentExposures.experimentKey, 'hero_copy'),
        eq(schema.experimentExposures.dirty, false),
      ),
    )
    .groupBy(schema.experimentExposures.variant)
    .orderBy(schema.experimentExposures.variant)
  ok('arms (clean only)', arms.map((a) => `${a.variant}:${a.converted}/${a.exposed}`))

  const [goalsAll] = await db.select({ n: count() }).from(schema.experimentGoals)
  ok('goal rows, all time', goalsAll.n)

  if (engagement.views !== 40)
    throw new Error(`expected 40 engagement rows, got ${engagement.views}`)
  if (engagement.reached25 !== 32 || engagement.reached100 !== 8)
    throw new Error('read-depth funnel lost rows to the lower re-beacon')
  if (engagement.rageTotal !== 18)
    throw new Error(`expected 18 rage clicks, got ${engagement.rageTotal}`)
  if (recentEvents.length !== 20) throw new Error('recent events feed came back short')
  if (byKind.reduce((n, e) => n + e.n, 0) !== eventRows.length)
    throw new Error('duplicate beacons were counted twice')
  if (ctaVisitors.n !== 9) throw new Error(`expected 9 CTA visitors, got ${ctaVisitors.n}`)
  if (exposures.n !== 9) throw new Error(`expected 9 exposures, got ${exposures.n}`)
  if (controlLocked.n !== 5) throw new Error(`a remount moved a visitor's arm: ${controlLocked.n}`)
  if (arms.length !== 2) throw new Error(`expected 2 clean arms, got ${arms.length}`)
  if (arms.some((a) => a.exposed !== 4 || a.converted !== 2))
    throw new Error(`arm maths wrong: ${JSON.stringify(arms)}`)
  if (goalsAll.n !== 5) throw new Error(`expected 5 goal rows, got ${goalsAll.n}`)

  console.log('\n✓ Schema and every dashboard query execute correctly.\n')
}

main()
  .catch((e) => {
    console.error('\n✗', e.message, '\n')
    process.exitCode = 1
  })
  .finally(() => pool.end())
