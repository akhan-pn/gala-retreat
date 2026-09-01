import { count, countDistinct, desc, gte, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import TrafficBars, { type Day } from '@/components/TrafficBars'
import { isAuthed, isConfigured } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { SOURCE_LABELS } from '@/lib/source'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000
const IST = 'Asia/Kolkata'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="u-grid pt-16">
      <div className="col-span-12">{children}</div>
    </div>
  )
}

function Notice({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <Shell>
      <p className="u-label text-accent">Gala Retreat — Dashboard</p>
      <h1 className="u-display mt-6 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">
        {title}
      </h1>
      <div className="u-measure-wide mt-6 space-y-3 text-ink/72">{body}</div>
    </Shell>
  )
}

function Stat({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="border-t border-ink/12 pt-6">
      {/* Hero number — no plot, so no legend and no tooltip. */}
      <p className="u-numeral text-[clamp(2.2rem,4.5vw,3.2rem)] tabular-nums text-ink">
        {value}
      </p>
      <p className="u-label mt-4 text-accent">{label}</p>
      {note && <p className="mt-2 text-xs text-ink/60">{note}</p>}
    </div>
  )
}

/** Time windows for the dashboard, read once per request. */
async function currentWindows() {
  const now = Date.now()
  return {
    now,
    since30: new Date(now - 30 * DAY),
    since14: new Date(now - 13 * DAY),
  }
}

export default async function AdminDashboard() {
  if (!isConfigured()) {
    return (
      <Notice
        title="Dashboard is not configured."
        body={
          <>
            <p>
              Set <code className="text-accent">ADMIN_PASSWORD</code> and{' '}
              <code className="text-accent">ADMIN_SESSION_SECRET</code> in the
              deployment&rsquo;s environment variables, then reload.
            </p>
            <p>See README.md &rarr; &ldquo;Environment&rdquo;.</p>
          </>
        }
      />
    )
  }

  if (!(await isAuthed())) redirect('/admin/login')

  const db = getDb()
  if (!db) {
    return (
      <Notice
        title="Database is not connected."
        body={
          <p>
            Set <code className="text-accent">DATABASE_URL</code> to the Neon
            connection string and run{' '}
            <code className="text-accent">npm run db:push</code>.
          </p>
        }
      />
    )
  }

  // Read the clock outside the render path — the dashboard is force-dynamic,
  // so every request gets a fresh window.
  const { now, since30, since14 } = await currentWindows()

  const [
    [views30],
    [visitors30],
    [enquiriesAll],
    [enquiries30],
    sources,
    topPages,
    dailyRaw,
    recent,
    callbacks,
    [callbacks30],
    cities,
  ] = await Promise.all([
    db.select({ n: count() }).from(schema.pageviews).where(gte(schema.pageviews.createdAt, since30)),
    db
      .select({ n: countDistinct(schema.pageviews.visitorId) })
      .from(schema.pageviews)
      .where(gte(schema.pageviews.createdAt, since30)),
    db.select({ n: count() }).from(schema.enquiries),
    db
      .select({ n: count() })
      .from(schema.enquiries)
      .where(gte(schema.enquiries.createdAt, since30)),
    db
      .select({ source: schema.pageviews.source, n: countDistinct(schema.pageviews.visitorId) })
      .from(schema.pageviews)
      .where(gte(schema.pageviews.createdAt, since30))
      .groupBy(schema.pageviews.source)
      .orderBy(desc(countDistinct(schema.pageviews.visitorId)))
      .limit(8),
    db
      .select({ path: schema.pageviews.path, n: count() })
      .from(schema.pageviews)
      .where(gte(schema.pageviews.createdAt, since30))
      .groupBy(schema.pageviews.path)
      .orderBy(desc(count()))
      .limit(8),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${schema.pageviews.createdAt} AT TIME ZONE ${IST}), 'YYYY-MM-DD')`,
        views: count(),
        visitors: countDistinct(schema.pageviews.visitorId),
      })
      .from(schema.pageviews)
      .where(gte(schema.pageviews.createdAt, since14))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db
      .select()
      .from(schema.enquiries)
      .orderBy(desc(schema.enquiries.createdAt))
      .limit(50),
    db
      .select()
      .from(schema.visitors)
      .orderBy(desc(schema.visitors.createdAt))
      .limit(50),
    db
      .select({ n: count() })
      .from(schema.visitors)
      .where(gte(schema.visitors.createdAt, since30)),
    db
      .select({ city: schema.pageviews.city, n: countDistinct(schema.pageviews.visitorId) })
      .from(schema.pageviews)
      .where(gte(schema.pageviews.createdAt, since30))
      .groupBy(schema.pageviews.city)
      .orderBy(desc(countDistinct(schema.pageviews.visitorId)))
      .limit(6),
  ])

  // Fill the gaps so quiet days read as zero rather than vanishing.
  const byDay = new Map(dailyRaw.map((d) => [d.day, d]))
  const days: Day[] = Array.from({ length: 14 }, (_, i) => {
    const key = new Date(now - (13 - i) * DAY).toLocaleDateString('en-CA', {
      timeZone: IST,
    })
    const hit = byDay.get(key)
    return { day: key, views: hit?.views ?? 0, visitors: hit?.visitors ?? 0 }
  })

  const sourceMax = Math.max(1, ...sources.map((s) => s.n))
  const pageMax = Math.max(1, ...topPages.map((p) => p.n))
  const fmt = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: IST,
  })

  return (
    <div className="u-grid gap-y-16 pt-14">
      <header className="col-span-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="u-label text-accent">Gala Retreat</p>
          <h1 className="u-display mt-4 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">
            Visitors &amp; enquiries
          </h1>
        </div>
        <div className="flex items-center gap-7">
          <a href="/api/admin/export" className="u-link u-label text-ink/72">
            Enquiries CSV
          </a>
          <a href="/api/admin/export?set=visitors" className="u-link u-label text-ink/72">
            Callbacks CSV
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="u-link u-label text-ink/60">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
        <Stat value={String(visitors30.n)} label="Unique visitors" note="Last 30 days" />
        <Stat value={String(views30.n)} label="Page views" note="Last 30 days" />
        <Stat value={String(enquiries30.n)} label="Enquiries" note="Last 30 days" />
        <Stat
          value={String(callbacks30.n)}
          label="Callback requests"
          note="Left details without using the form"
        />
      </section>

      <p className="col-span-12 -mt-8 text-xs text-ink/60">
        Visitor figures count only people who accepted measurement; anyone who
        declined is genuinely not recorded, so treat these as a floor rather
        than a total. {enquiriesAll.n} enquiries all time.
      </p>

      <section className="col-span-12">
        <h2 className="u-label mb-8 text-accent">Page views — last 14 days</h2>
        <TrafficBars days={days} />
      </section>

      <section className="col-span-12 grid gap-x-12 gap-y-14 lg:grid-cols-2">
        <div>
          <h2 className="u-label mb-8 text-accent">
            Where visitors came from — last 30 days
          </h2>
          {sources.length === 0 ? (
            <p className="text-sm text-ink/60">No traffic recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Unique visitors by traffic source</caption>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.source} className="border-t border-ink/10">
                    <th scope="row" className="py-4 pr-4 text-left font-normal text-ink/72">
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </th>
                    <td className="w-1/2 py-4">
                      <span
                        className="block h-1.5 rounded-r-[4px] bg-accent"
                        style={{ width: `${(s.n / sourceMax) * 100}%` }}
                      />
                    </td>
                    <td className="py-4 pl-4 text-right tabular-nums text-ink/72">
                      {s.n}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="u-label mb-8 text-accent">Most-visited pages — last 30 days</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-ink/60">No traffic recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Page views by page</caption>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.path} className="border-t border-ink/10">
                    <th scope="row" className="py-4 pr-4 text-left font-normal text-ink/72">
                      {p.path}
                    </th>
                    <td className="w-1/2 py-4">
                      <span
                        className="block h-1.5 rounded-r-[4px] bg-accent"
                        style={{ width: `${(p.n / pageMax) * 100}%` }}
                      />
                    </td>
                    <td className="py-4 pl-4 text-right tabular-nums text-ink/72">
                      {p.n}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {cities.some((c) => c.city) && (
        <section className="col-span-12 lg:col-span-6">
          <h2 className="u-label mb-8 text-accent">Where visitors are — last 30 days</h2>
          <table className="w-full text-sm">
            <caption className="sr-only">Unique visitors by city</caption>
            <tbody>
              {cities.map((c) => (
                <tr key={c.city ?? 'unknown'} className="border-t border-ink/10">
                  <th scope="row" className="py-4 pr-4 text-left font-normal text-ink/72">
                    {c.city ?? 'Not reported'}
                  </th>
                  <td className="py-4 pl-4 text-right tabular-nums text-ink/72">{c.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="col-span-12">
        <h2 className="u-label mb-2 text-accent">
          Callback requests — most recent {callbacks.length}
        </h2>
        <p className="mb-8 text-xs text-ink/60">
          People who left a name and number through the in-page prompt rather
          than the enquiry form. Every row carries an explicit consent tick.
        </p>

        {callbacks.length === 0 ? (
          <p className="text-sm text-ink/60">No callback requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">Callback requests</caption>
              <thead>
                <tr className="border-b border-ink/15">
                  {['Received', 'Name', 'Phone', 'Asked from', 'Source', 'City', 'Consent'].map(
                    (h) => (
                      <th key={h} scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {callbacks.map((v) => (
                  <tr key={v.id} className="border-b border-ink/10 align-top">
                    <td className="py-5 pr-6 whitespace-nowrap text-ink/60">
                      {fmt.format(v.createdAt)}
                    </td>
                    <td className="py-5 pr-6 text-ink">{v.name}</td>
                    <td className="py-5 pr-6 whitespace-nowrap">
                      <a href={`tel:${v.phone}`} className="u-link text-accent">
                        {v.phone}
                      </a>
                    </td>
                    <td className="py-5 pr-6 text-ink/72">{v.capturedOn ?? '—'}</td>
                    <td className="py-5 pr-6 text-ink/60">
                      {SOURCE_LABELS[v.source ?? 'direct'] ?? v.source}
                    </td>
                    <td className="py-5 pr-6 text-ink/60">{v.city ?? '—'}</td>
                    <td className="py-5 pr-6 whitespace-nowrap text-ink/60">
                      {v.consentAt ? fmt.format(v.consentAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="col-span-12">
        <h2 className="u-label mb-8 text-accent">
          Enquiries — most recent {recent.length}
        </h2>

        {recent.length === 0 ? (
          <p className="text-sm text-ink/60">
            No enquiries yet. They will appear here the moment someone submits the form.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] text-sm">
              <caption className="sr-only">Enquiry form submissions</caption>
              <thead>
                <tr className="border-b border-ink/15">
                  {['Received', 'Name', 'Phone', 'Email', 'Occasion', 'Date', 'Guests', 'Source', 'Marketing'].map(
                    (h) => (
                      <th key={h} scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id} className="border-b border-ink/8 align-top">
                    <td className="py-5 pr-6 whitespace-nowrap text-ink/60">
                      {fmt.format(e.createdAt)}
                    </td>
                    <td className="py-5 pr-6 text-ink">{e.name}</td>
                    <td className="py-5 pr-6 whitespace-nowrap">
                      <a href={`tel:${e.phone}`} className="u-link text-accent">
                        {e.phone}
                      </a>
                    </td>
                    <td className="py-5 pr-6 text-ink/72">
                      {e.email ? (
                        <a href={`mailto:${e.email}`} className="u-link break-all">
                          {e.email}
                        </a>
                      ) : (
                        <span className="text-ink/50">—</span>
                      )}
                    </td>
                    <td className="py-5 pr-6 text-ink/72">{e.eventType ?? '—'}</td>
                    <td className="py-5 pr-6 whitespace-nowrap text-ink/72">
                      {e.eventDate ?? '—'}
                    </td>
                    <td className="py-5 pr-6 tabular-nums text-ink/72">{e.guests ?? '—'}</td>
                    <td className="py-5 pr-6 text-ink/60">
                      {SOURCE_LABELS[e.source ?? 'direct'] ?? e.source}
                    </td>
                    <td className="py-5 pr-6 whitespace-nowrap text-ink/60">
                      {e.marketingConsent ? 'Opted in' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recent.some((e) => e.message) && (
          <div className="mt-14 space-y-8">
            <h3 className="u-label text-accent">Messages</h3>
            {recent
              .filter((e) => e.message)
              .map((e) => (
                <div key={e.id} className="border-l border-accent/30 pl-6">
                  <p className="u-label text-ink/60">
                    {e.name} · {fmt.format(e.createdAt)}
                  </p>
                  <p className="u-measure-wide mt-3 text-ink/72">{e.message}</p>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
