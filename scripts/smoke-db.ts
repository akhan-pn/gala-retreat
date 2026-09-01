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
import { count, countDistinct, desc, gte, sql } from 'drizzle-orm'
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

  console.log('\n✓ Schema and every dashboard query execute correctly.\n')
}

main()
  .catch((e) => {
    console.error('\n✗', e.message, '\n')
    process.exitCode = 1
  })
  .finally(() => pool.end())
