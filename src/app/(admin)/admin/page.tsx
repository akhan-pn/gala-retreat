import { and, count, countDistinct, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import TrafficBars, { type Day } from '@/components/TrafficBars'
import { experiments, type ExperimentDeclaration } from '@/content/experiments'
import { isAuthed, isConfigured } from '@/lib/auth'
import { getDb, schema, type Db } from '@/lib/db'
import type { ExperimentGoal } from '@/lib/db/schema'
import { SOURCE_LABELS } from '@/lib/source'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000
const IST = 'Asia/Kolkata'
const nf = new Intl.NumberFormat('en-IN')

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

/**
 * One ranked row: a name, a single-hue bar, a number — the same mark the
 * traffic tables already use, so every ranking on this page reads alike.
 */
function BarRow({
  label,
  hint,
  value,
  fraction,
}: {
  label: string
  hint?: string
  value: string
  fraction: number
}) {
  // A non-zero count must still leave a visible mark, or a small number reads
  // as no number at all.
  const width = fraction > 0 ? Math.max(fraction * 100, 1.5) : 0
  return (
    <tr className="border-t border-ink/10">
      <th scope="row" className="py-4 pr-4 text-left font-normal text-ink/72">
        {label}
        {hint && <span className="mt-1 block text-xs text-ink/60">{hint}</span>}
      </th>
      <td className="w-1/2 py-4">
        <span
          className="block h-1.5 rounded-r-[4px] bg-accent"
          style={{ width: `${width}%` }}
        />
      </td>
      <td className="py-4 pl-4 text-right tabular-nums text-ink/72">{value}</td>
    </tr>
  )
}

function ratio(part: number, whole: number) {
  return whole > 0 ? part / whole : 0
}

function percent(part: number, whole: number) {
  return `${Math.round(ratio(part, whole) * 100)}%`
}

/** Engaged time, in the words a person would use out loud. */
function duration(ms: number) {
  const total = Math.round(ms / 1000)
  if (total < 60) return `${total}s`
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`
}

/* ------------------------------------------------------------------
   Plain-English names for the slugs the tracker stores. The allowlist in
   src/lib/behaviour.ts is written for a database column; a venue manager
   should never have to read one.
   ------------------------------------------------------------------ */

const INTERACTION_LABELS: Record<string, string> = {
  home: 'Home link',
  about: 'About link',
  gallery: 'Gallery link',
  enquiry: 'Enquiry link',
  contact: 'Contact link',
  call: 'Call us',
  directions: 'Get directions',
  submit_enquiry: 'Sent the enquiry form',
  callback: 'Asked for a callback',
  hero_cta: 'Main button on the hero',
  whatsapp: 'WhatsApp',
  whatsapp_float: 'WhatsApp — floating button',
  whatsapp_contact: 'WhatsApp — contact page',
  instagram: 'Instagram',
  facebook: 'Facebook',
  maps: 'Google Maps',
  phone: 'Phone number',
  email: 'Email address',
  external: 'Another website',
  nav: 'The top menu',
  form: 'The enquiry form',
  link: 'A link',
  page: 'Somewhere on the page',
}

const KIND_LABELS: Record<string, string> = {
  cta: 'Stayed on the site',
  outbound: 'Left for WhatsApp, Maps, social',
  section: 'Section seen',
  rage: 'Frustration',
}

function interactionLabel(name: string) {
  return INTERACTION_LABELS[name] ?? name.replace(/_/g, ' ')
}

const GOAL_LABELS: Record<ExperimentGoal, string> = {
  enquiry_submitted: 'Sent an enquiry',
  callback_requested: 'Asked for a callback',
  whatsapp_click: 'Opened WhatsApp',
  hero_cta_click: 'Pressed the hero button',
}

/** The same four goals as they read inside a sentence. */
const GOAL_PHRASES: Record<ExperimentGoal, string> = {
  enquiry_submitted: 'sending an enquiry',
  callback_requested: 'asking for a callback',
  whatsapp_click: 'opening WhatsApp',
  hero_cta_click: 'pressing the hero button',
}

/* ------------------------------------------------------------------
   The small amount of statistics an A/B result needs to be honest.

   Both are per-visitor binomials — the unique indexes on the exposure and
   goal tables are what make that true, so these formulas apply.
   ------------------------------------------------------------------ */

/**
 * Wilson score interval. At the handful of visits a venue website collects in
 * its first fortnight the textbook interval runs past 0% and 100% and reads
 * as certainty; this one does not.
 */
function wilson(successes: number, trials: number): [number, number] {
  if (trials === 0) return [0, 0]
  const z = 1.96
  const p = successes / trials
  const denominator = 1 + (z * z) / trials
  const centre = p + (z * z) / (2 * trials)
  const margin =
    z * Math.sqrt((p * (1 - p) + (z * z) / (4 * trials)) / trials)
  return [
    Math.max(0, (centre - margin) / denominator),
    Math.min(1, (centre + margin) / denominator),
  ]
}

/** Abramowitz & Stegun 7.1.26 — plenty for turning a z into a probability. */
function erf(x: number) {
  const sign = x < 0 ? -1 : 1
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x)
  return sign * y
}

/**
 * Two-sided probability of seeing a gap at least this large between two arms
 * if the two wordings really performed identically. Never shown as a bare
 * number — the copy that renders it says what it means.
 */
function chanceOfGap(a: number, na: number, b: number, nb: number) {
  if (na === 0 || nb === 0) return null
  const pooled = (a + b) / (na + nb)
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / na + 1 / nb))
  if (!Number.isFinite(se) || se === 0) return null
  const z = (a / na - b / nb) / se
  return 1 - erf(Math.abs(z) / Math.SQRT2)
}

/* ------------------------------------------------------------------
   Experiment reads.
   ------------------------------------------------------------------ */

type ArmReport = {
  variant: string
  note: string
  exposed: number
  /** Index-aligned with the declaration's goals, primary first. */
  converted: number[]
}

type ExperimentReport = {
  declaration: ExperimentDeclaration
  daysRunning: number
  arms: ArmReport[]
  totalExposed: number
  discarded: number
}

async function readExperiment(
  db: Db,
  declaration: ExperimentDeclaration,
  now: number,
): Promise<ExperimentReport> {
  // The declared start date is a date in the venue's own timezone, and the
  // rest of this page buckets by IST too. Reading it as UTC midnight would
  // drop every visitor enrolled in the first five and a half hours of the
  // day the test went live.
  const since = new Date(`${declaration.startedAt}T00:00:00+05:30`)

  const [perGoal, [discarded]] = await Promise.all([
    Promise.all(
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
              // A conversion recorded before the visitor ever saw the arm was
              // not caused by it. The goals table is experiment-agnostic and
              // older than this test, so the window has to be explicit.
              gte(
                schema.experimentGoals.createdAt,
                schema.experimentExposures.createdAt,
              ),
            ),
          )
          .where(
            and(
              eq(schema.experimentExposures.experimentKey, declaration.key),
              // Arms the server could not reproduce are counted, then left
              // out of the maths rather than allowed to tilt it.
              eq(schema.experimentExposures.dirty, false),
              gte(schema.experimentExposures.createdAt, since),
            ),
          )
          .groupBy(schema.experimentExposures.variant),
      ),
    ),
    db
      .select({ n: countDistinct(schema.experimentExposures.visitorId) })
      .from(schema.experimentExposures)
      .where(
        and(
          eq(schema.experimentExposures.experimentKey, declaration.key),
          eq(schema.experimentExposures.dirty, true),
          gte(schema.experimentExposures.createdAt, since),
        ),
      ),
  ])

  // Declaration order, not result order: the control arm stays first even
  // before anybody has landed in it.
  const arms: ArmReport[] = declaration.variants.map((variant) => ({
    variant: variant.name,
    note: variant.note,
    exposed:
      perGoal[0]?.find((row) => row.variant === variant.name)?.exposed ?? 0,
    converted: declaration.goals.map(
      (_, i) => perGoal[i].find((row) => row.variant === variant.name)?.converted ?? 0,
    ),
  }))

  return {
    declaration,
    daysRunning: Math.max(0, Math.floor((now - since.getTime()) / DAY)),
    arms,
    totalExposed: arms.reduce((sum, arm) => sum + arm.exposed, 0),
    discarded: discarded?.n ?? 0,
  }
}

/**
 * The stopping rule, applied. The thresholds were pre-registered in
 * src/content/experiments.ts before the test started, so this reads them
 * rather than deciding what "enough" means after seeing the data.
 */
function readOut(report: ExperimentReport) {
  const { declaration, arms, daysRunning } = report
  const { minPerArm, minDays } = declaration
  const primary = GOAL_PHRASES[declaration.goals[0]]
  const smallest = Math.min(...arms.map((arm) => arm.exposed))
  const dayWord = daysRunning === 1 ? 'day' : 'days'

  if (arms.length < 2 || report.totalExposed === 0) {
    return {
      headline: 'Nobody has been counted yet.',
      body:
        'Both wordings are live. This fills in as visitors who accepted ' +
        'measurement arrive; until then there is nothing to read.',
    }
  }

  if (smallest < minPerArm || daysRunning < minDays) {
    const missing: string[] = []
    if (smallest < minPerArm) {
      missing.push(
        `${nf.format(minPerArm)} visitors in each wording (the smaller one is on ${nf.format(smallest)})`,
      )
    }
    if (daysRunning < minDays) {
      missing.push(
        `${minDays} days of running (${daysRunning === 0 ? 'it started today' : `it has been ${daysRunning} ${dayWord}`})`,
      )
    }
    return {
      headline: 'Too early to tell — do not change anything yet.',
      body:
        `This test was set up in advance to need ${missing.join(' and ')}. ` +
        'With numbers this small, one busy Sunday can put either wording ' +
        'in front. Whichever is ahead today is very likely to swap places ' +
        'again, so treat the figures below as a progress bar, not a result.',
    }
  }

  const control = arms[0]
  const rate = (arm: ArmReport) => ratio(arm.converted[0], arm.exposed)
  const best = arms
    .slice(1)
    .reduce((a, b) => (rate(b) > rate(a) ? b : a), arms[1])

  const p = chanceOfGap(
    best.converted[0],
    best.exposed,
    control.converted[0],
    control.exposed,
  )
  const inHundred =
    p === null ? null : p < 0.005 ? 'fewer than 1' : String(Math.round(p * 100))

  if (p === null || p >= 0.05) {
    return {
      headline: 'No difference worth acting on.',
      body:
        `Both wordings convert at close to the same rate for ${primary}. ` +
        (inHundred === null
          ? ''
          : `A gap this size would turn up by chance in about ${inHundred} of every 100 tests like this one, ` +
            'and this test was set in advance to act only below 5 in 100. ') +
        'Keep the wording that is already live.',
    }
  }

  // chanceOfGap is two-sided: a small p says the two arms differ, not which
  // way round. Without this, an arm that loses significantly reads as a win.
  if (rate(best) <= rate(control)) {
    return {
      headline: 'The wording already live is ahead — do not switch.',
      body:
        `"${best.note}" converts worse than "${control.note}" for ${primary}, and the sample is ` +
        `large enough to say so: a gap this size would turn up by chance in about ${inHundred} of every 100 tests like this one, ` +
        'below the 5 in 100 line this test was set to before it started. ' +
        `Keep "${control.note}" and retire the alternative.`,
    }
  }

  // A win on the primary metric that costs the guardrail is not a win. The
  // declaration lists guardrails after the primary goal for exactly this.
  for (let i = 1; i < declaration.goals.length; i += 1) {
    const guardControl = ratio(control.converted[i], control.exposed)
    const guardBest = ratio(best.converted[i], best.exposed)
    if (guardBest >= guardControl) continue
    const guardP = chanceOfGap(
      best.converted[i],
      best.exposed,
      control.converted[i],
      control.exposed,
    )
    if (guardP !== null && guardP < 0.05) {
      return {
        headline: `Ahead on ${primary}, behind on ${GOAL_PHRASES[declaration.goals[i]]} — keep the current wording.`,
        body:
          `"${best.note}" wins the press, but fewer of those people end up ` +
          `${GOAL_PHRASES[declaration.goals[i]]}. That is curiosity, not interest, and ` +
          'the test was written in advance to reject exactly this outcome.',
      }
    }
  }

  return {
    headline: `"${best.note}" is ahead, and the sample is large enough to say so.`,
    body:
      `It converts better than "${control.note}" for ${primary}, with no fall in the guardrail. ` +
      `If the two wordings really performed the same, a gap this size would turn up by chance in about ${inHundred} of every 100 tests like this one — ` +
      'below the 5 in 100 line this test was set to before it started. Safe to make it permanent.',
  }
}

/** Time windows for the dashboard, read once per request. */
async function currentWindows() {
  const now = Date.now()
  // The 14-day chart buckets by IST calendar day, so its lower bound has to be
  // an IST midnight. A plain now - 13 * DAY leaves the oldest bar holding only
  // the slice of its day that falls after the current time of day, so it reads
  // short next to thirteen full ones. IST never shifts, so +05:30 is fixed.
  const oldestDay = new Date(now - 13 * DAY).toLocaleDateString('en-CA', {
    timeZone: IST,
  })
  return {
    now,
    since30: new Date(now - 30 * DAY),
    since14: new Date(`${oldestDay}T00:00:00+05:30`),
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
    [engagement],
    depthByPath,
    interactions,
    rageSpots,
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

    /* Behaviour. One row per page visit, so "visits" here counts visits that
       reported at least once — never more than the pageview log. */
    db
      .select({
        visits: count(),
        reached25: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 25)::int`,
        reached50: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 50)::int`,
        reached75: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 75)::int`,
        reached100: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 100)::int`,
        medianActiveMs: sql<number>`coalesce(percentile_cont(0.5) within group (order by ${schema.pageEngagement.activeMs}), 0)::int`,
        rageClicks: sql<number>`coalesce(sum(${schema.pageEngagement.rageClicks}), 0)::int`,
      })
      .from(schema.pageEngagement)
      .where(gte(schema.pageEngagement.createdAt, since30)),
    db
      .select({
        path: schema.pageEngagement.path,
        visits: count(),
        avgScroll: sql<number>`coalesce(round(avg(${schema.pageEngagement.maxScrollPct})), 0)::int`,
        reachedEnd: sql<number>`count(*) filter (where ${schema.pageEngagement.maxScrollPct} >= 100)::int`,
        medianActiveMs: sql<number>`coalesce(percentile_cont(0.5) within group (order by ${schema.pageEngagement.activeMs}), 0)::int`,
        rageClicks: sql<number>`coalesce(sum(${schema.pageEngagement.rageClicks}), 0)::int`,
      })
      .from(schema.pageEngagement)
      .where(gte(schema.pageEngagement.createdAt, since30))
      .groupBy(schema.pageEngagement.path)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({
        kind: schema.siteEvents.kind,
        name: schema.siteEvents.name,
        n: count(),
      })
      .from(schema.siteEvents)
      .where(
        and(
          gte(schema.siteEvents.createdAt, since30),
          inArray(schema.siteEvents.kind, ['cta', 'outbound']),
        ),
      )
      .groupBy(schema.siteEvents.kind, schema.siteEvents.name)
      .orderBy(desc(count()))
      .limit(12),
    db
      .select({
        name: schema.siteEvents.name,
        path: schema.siteEvents.path,
        bursts: count(),
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
      .orderBy(desc(count()))
      .limit(8),
  ])

  const reports = await Promise.all(
    experiments.map((declaration) => readExperiment(db, declaration, now)),
  )

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
  const interactionMax = Math.max(1, ...interactions.map((i) => i.n))
  const rageMax = Math.max(1, ...rageSpots.map((r) => r.clicks))
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
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <a href="/api/admin/export" className="u-link u-label text-ink/72">
            Enquiries CSV
          </a>
          <a href="/api/admin/export?set=visitors" className="u-link u-label text-ink/72">
            Callbacks CSV
          </a>
          <a href="/api/admin/export?set=behaviour" className="u-link u-label text-ink/72">
            Pages CSV
          </a>
          <a href="/api/admin/export?set=interactions" className="u-link u-label text-ink/72">
            Clicks CSV
          </a>
          <a href="/api/admin/export?set=experiments" className="u-link u-label text-ink/72">
            Wording test CSV
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

      {/* ---------------------------------------------------------------
          How the site is actually used.
          --------------------------------------------------------------- */}

      <section className="col-span-12 border-t border-ink/12 pt-14">
        <h2 className="u-display-sm text-[clamp(1.4rem,2.6vw,1.9rem)] text-ink">
          What people do on the site
        </h2>
        <p className="u-measure-wide mt-4 text-sm text-ink/72">
          Reading, tapping and scrolling — last 30 days. Same caveat as above:
          only visits from people who accepted measurement appear here, so
          every figure in this section is a floor, not a total.
        </p>
      </section>

      {engagement.visits === 0 ? (
        <section className="col-span-12 -mt-8">
          <p className="text-sm text-ink/60">
            Nothing recorded yet. Figures appear once consenting visitors have
            browsed a few pages.
          </p>
        </section>
      ) : (
        <>
          <section className="col-span-12 -mt-8 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            <Stat
              value={nf.format(engagement.visits)}
              label="Visits measured"
              note="Everything below is out of this many"
            />
            <Stat
              value={duration(engagement.medianActiveMs)}
              label="Typical time on a page"
              note="Time actually reading, not the tab left open"
            />
            <Stat
              value={percent(engagement.reached50, engagement.visits)}
              label="Read past halfway"
              note={`${nf.format(engagement.reached50)} of ${nf.format(engagement.visits)} visits`}
            />
            <Stat
              value={nf.format(engagement.rageClicks)}
              label="Frustrated clicks"
              note="Repeated jabs at one spot"
            />
          </section>

          <section className="col-span-12 grid gap-x-12 gap-y-14 lg:grid-cols-2">
            <div>
              <h3 className="u-label mb-2 text-accent">How far down people get</h3>
              <p className="mb-8 text-xs text-ink/60">
                Out of {nf.format(engagement.visits)} measured visits, how many
                reached each point down the page.
              </p>
              <table className="w-full text-sm">
                <caption className="sr-only">Share of visits reaching each scroll depth</caption>
                <tbody>
                  {[
                    ['A quarter of the way', engagement.reached25],
                    ['Halfway', engagement.reached50],
                    ['Three quarters', engagement.reached75],
                    ['All the way to the bottom', engagement.reached100],
                  ].map(([label, n]) => (
                    <BarRow
                      key={String(label)}
                      label={String(label)}
                      value={`${percent(Number(n), engagement.visits)} · ${nf.format(Number(n))}`}
                      fraction={ratio(Number(n), engagement.visits)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="u-label mb-2 text-accent">What people click</h3>
              <p className="mb-8 text-xs text-ink/60">
                Buttons and links pressed. Nothing typed is recorded — only
                which of a fixed list of buttons was used.
              </p>
              {interactions.length === 0 ? (
                <p className="text-sm text-ink/60">No clicks recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <caption className="sr-only">Clicks by button</caption>
                  <tbody>
                    {interactions.map((row) => (
                      <BarRow
                        key={`${row.kind}:${row.name}`}
                        label={interactionLabel(row.name)}
                        hint={KIND_LABELS[row.kind] ?? row.kind}
                        value={nf.format(row.n)}
                        fraction={ratio(row.n, interactionMax)}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="col-span-12">
            <h3 className="u-label mb-2 text-accent">
              How far down each page people read
            </h3>
            <p className="mb-8 text-xs text-ink/60">
              A low figure on a long page usually means the answer people came
              for is not near the top.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] text-sm">
                <caption className="sr-only">Read depth and engaged time by page</caption>
                <thead>
                  <tr className="border-b border-ink/15">
                    {['Page', 'Visits', 'How far they read', 'Reached the bottom', 'Typical time', 'Frustrated clicks'].map(
                      (h) => (
                        <th key={h} scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {depthByPath.map((row) => (
                    <tr key={row.path} className="border-b border-ink/10">
                      <th scope="row" className="py-5 pr-6 text-left font-normal text-ink">
                        {row.path}
                      </th>
                      <td className="py-5 pr-6 tabular-nums text-ink/72">
                        {nf.format(row.visits)}
                      </td>
                      <td className="w-[36%] py-5 pr-6">
                        <span className="mb-2 block tabular-nums text-ink/72">
                          {row.avgScroll}%
                        </span>
                        <span
                          className="block h-1.5 rounded-r-[4px] bg-accent"
                          style={{ width: `${Math.max(row.avgScroll, row.avgScroll > 0 ? 1.5 : 0)}%` }}
                        />
                      </td>
                      <td className="py-5 pr-6 tabular-nums text-ink/72">
                        {percent(row.reachedEnd, row.visits)}
                      </td>
                      <td className="py-5 pr-6 whitespace-nowrap tabular-nums text-ink/72">
                        {duration(row.medianActiveMs)}
                      </td>
                      <td className="py-5 pr-6 tabular-nums text-ink/72">
                        {row.rageClicks > 0 ? nf.format(row.rageClicks) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-7">
            <h3 className="u-label mb-2 text-accent">Where people get stuck</h3>
            <p className="mb-8 text-xs text-ink/60">
              Three or more quick jabs at the same spot within a moment. It
              usually means something looks tappable and is not, or a button
              that feels slow.
            </p>
            {rageSpots.length === 0 ? (
              <p className="text-sm text-ink/60">
                No stuck points recorded. Nothing on the site is frustrating
                people enough to jab at it.
              </p>
            ) : (
              <table className="w-full text-sm">
                <caption className="sr-only">Rage-click hotspots</caption>
                <tbody>
                  {rageSpots.map((row) => (
                    <BarRow
                      key={`${row.path}:${row.name}`}
                      label={interactionLabel(row.name)}
                      hint={`${row.path} · ${nf.format(row.bursts)} ${row.bursts === 1 ? 'time' : 'times'}`}
                      value={`${nf.format(row.clicks)} clicks`}
                      fraction={ratio(row.clicks, rageMax)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {/* ---------------------------------------------------------------
          Wording tests.
          --------------------------------------------------------------- */}

      {reports.length > 0 && (
        <section className="col-span-12 border-t border-ink/12 pt-14">
          <h2 className="u-display-sm text-[clamp(1.4rem,2.6vw,1.9rem)] text-ink">
            Wording tests
          </h2>
          <p className="u-measure-wide mt-4 text-sm text-ink/72">
            Two versions of the same button are live at once, each shown to
            half of the visitors who accepted measurement. The same person
            always sees the same version.
          </p>
        </section>
      )}

      {reports.map((report) => {
        const { declaration, arms } = report
        const call = readOut(report)
        const armMax = Math.max(
          0.0001,
          ...arms.map((arm) => ratio(arm.converted[0], arm.exposed)),
        )
        return (
          <section key={declaration.key} className="col-span-12 -mt-8">
            <h3 className="u-label mb-2 text-accent">
              {arms.map((arm) => `“${arm.note}”`).join(' vs ')}
            </h3>
            <p className="mb-10 text-xs text-ink/60">
              Measured on {GOAL_PHRASES[declaration.goals[0]]} · started{' '}
              {declaration.startedAt} · {report.daysRunning} of the{' '}
              {declaration.minDays} days it needs to run
            </p>

            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
              <Stat
                value={nf.format(report.totalExposed)}
                label="Visitors in the test"
                note={`${nf.format(declaration.minPerArm)} in each wording needed before it can be called`}
              />
              {arms.map((arm) => (
                <Stat
                  key={arm.variant}
                  value={nf.format(arm.exposed)}
                  label={`Saw “${arm.note}”`}
                  note={`of the ${nf.format(declaration.minPerArm)} this arm needs`}
                />
              ))}
            </div>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[48rem] text-sm">
                <caption className="sr-only">
                  Exposures and conversions by wording
                </caption>
                <thead>
                  <tr className="border-b border-ink/15">
                    <th scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                      Wording
                    </th>
                    <th scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                      Visitors
                    </th>
                    {declaration.goals.map((goal, i) => (
                      <th
                        key={goal}
                        scope="col"
                        className="u-label py-4 pr-6 text-left text-ink/60"
                      >
                        {GOAL_LABELS[goal]}
                        {i > 0 && ' (guardrail)'}
                      </th>
                    ))}
                    <th scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                      Conversion rate
                    </th>
                    <th scope="col" className="u-label py-4 pr-6 text-left text-ink/60">
                      Realistic range
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {arms.map((arm, index) => {
                    const rate = ratio(arm.converted[0], arm.exposed)
                    const [low, high] = wilson(arm.converted[0], arm.exposed)
                    return (
                      <tr key={arm.variant} className="border-b border-ink/10">
                        <th scope="row" className="py-5 pr-6 text-left font-normal text-ink">
                          &ldquo;{arm.note}&rdquo;
                          <span className="mt-1 block text-xs text-ink/60">
                            {index === 0 ? 'Currently live' : 'New wording'}
                          </span>
                        </th>
                        <td className="py-5 pr-6 tabular-nums text-ink/72">
                          {nf.format(arm.exposed)}
                        </td>
                        {arm.converted.map((n, i) => (
                          <td
                            key={declaration.goals[i]}
                            className="py-5 pr-6 tabular-nums text-ink/72"
                          >
                            {nf.format(n)}
                          </td>
                        ))}
                        <td className="w-[22%] py-5 pr-6">
                          <span className="mb-2 block tabular-nums text-ink/72">
                            {percent(arm.converted[0], arm.exposed)}
                          </span>
                          <span
                            className="block h-1.5 rounded-r-[4px] bg-accent"
                            style={{
                              width: `${rate > 0 ? Math.max((rate / armMax) * 100, 1.5) : 0}%`,
                            }}
                          />
                        </td>
                        <td className="py-5 pr-6 whitespace-nowrap tabular-nums text-ink/72">
                          {arm.exposed === 0
                            ? '—'
                            : `${Math.round(low * 100)}% – ${Math.round(high * 100)}%`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-12 border-l border-accent/30 pl-6">
              <p className="u-display-sm text-[clamp(1.05rem,1.9vw,1.3rem)] text-ink">
                {call.headline}
              </p>
              <p className="u-measure-wide mt-4 text-sm text-ink/72">{call.body}</p>
              <p className="u-measure-wide mt-4 text-xs text-ink/60">
                Realistic range is where each wording&rsquo;s true rate probably
                sits, allowing for how few visitors have seen it. While the two
                ranges overlap as much as they do now, the wordings cannot be
                told apart.
                {report.discarded > 0 &&
                  ` ${nf.format(report.discarded)} visitor${report.discarded === 1 ? '' : 's'} left out: the version they were shown did not match what the server expected, usually a cached page.`}
              </p>
              <p className="u-measure-wide mt-4 text-xs text-ink/60">
                Why this test: {declaration.hypothesis}
              </p>
            </div>
          </section>
        )
      })}

      <section className="col-span-12 border-t border-ink/12 pt-14">
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
                        <span className="text-ink/60">—</span>
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
