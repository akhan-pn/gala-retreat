import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

/** Enquiry form leads — the client's actual sales pipeline. */
export const enquiries = pgTable(
  'enquiries',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    email: varchar('email', { length: 200 }),
    eventType: varchar('event_type', { length: 60 }),
    eventDate: varchar('event_date', { length: 20 }),
    guests: integer('guests'),
    message: text('message'),
    /** Where this lead came from — instagram, google, direct, … */
    source: varchar('source', { length: 60 }),
    referrer: text('referrer'),
    status: varchar('status', { length: 20 }).notNull().default('new'),

    /**
     * Explicit permission to hold these details and reply to the enquiry.
     * Required to submit the form — a lead cannot exist without it.
     */
    contactConsent: boolean('contact_consent').notNull().default(false),
    /** Separate, optional opt-in for offers and seasonal announcements. */
    marketingConsent: boolean('marketing_consent').notNull().default(false),
    /** When consent was given, so the client can evidence it later. */
    consentAt: timestamp('consent_at', { withTimezone: true }),
    /** The wording the visitor actually agreed to, kept for the record. */
    consentText: text('consent_text'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('enquiries_created_at_idx').on(t.createdAt)],
)

/** Visitor log powering the dashboard's traffic figures. */
export const pageviews = pgTable(
  'pageviews',
  {
    id: serial('id').primaryKey(),
    path: varchar('path', { length: 200 }).notNull(),
    /** Anonymous first-party id, so repeat visits collapse into one visitor. */
    visitorId: varchar('visitor_id', { length: 64 }).notNull(),
    source: varchar('source', { length: 60 }).notNull().default('direct'),
    referrer: text('referrer'),
    device: varchar('device', { length: 20 }),
    /** Coarse location from the edge, city-level at best. Never an IP. */
    city: varchar('city', { length: 80 }),
    country: varchar('country', { length: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('pageviews_created_at_idx').on(t.createdAt),
    index('pageviews_visitor_idx').on(t.visitorId),
  ],
)

/**
 * Contact details left through the short in-page prompt rather than the full
 * enquiry form — someone who wanted a callback without filling anything in.
 * Only written when the visitor ticks the consent box.
 */
export const visitors = pgTable(
  'visitors',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    email: varchar('email', { length: 200 }),
    /** Which page they were reading when they left their number. */
    capturedOn: varchar('captured_on', { length: 200 }),
    source: varchar('source', { length: 60 }),
    referrer: text('referrer'),
    device: varchar('device', { length: 20 }),
    city: varchar('city', { length: 80 }),
    country: varchar('country', { length: 2 }),
    /** Links the details to the anonymous visit log, when both were consented. */
    visitorId: varchar('visitor_id', { length: 64 }),
    contactConsent: boolean('contact_consent').notNull().default(false),
    consentAt: timestamp('consent_at', { withTimezone: true }),
    consentText: text('consent_text'),
    status: varchar('status', { length: 20 }).notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('visitors_created_at_idx').on(t.createdAt)],
)

/* ------------------------------------------------------------------
   Behaviour and experiment analytics.

   Everything below this line is written only after the consent gate in
   src/lib/consent.ts has passed, on both the client and the server. None
   of it identifies a person: no IP address, no user agent beyond a coarse
   device bucket, and no text a visitor typed. The only identifier is the
   same anonymous gr_vid the pageview log already uses.
   ------------------------------------------------------------------ */

/**
 * One row per page visit, upserted in place, so the table grows with
 * pageviews rather than with scroll ticks.
 *
 * viewId is unique because that is what makes the endpoint idempotent: a
 * beacon that duplicates an earlier fetch resolves through
 * onConflictDoUpdate with GREATEST(), so a late, lower reading can never
 * overwrite a higher one. Holding all three continuous metrics on one row
 * turns the 25/50/75/100 read-depth funnel into four FILTER clauses over a
 * single integer instead of four stored rows per visit.
 */
export const pageEngagement = pgTable(
  'page_engagement',
  {
    id: serial('id').primaryKey(),
    /** Client-generated id for one page visit — the upsert's conflict target. */
    viewId: varchar('view_id', { length: 36 }).notNull(),
    /** Stamped server-side from the httpOnly gr_vid cookie, never from the body. */
    visitorId: varchar('visitor_id', { length: 64 }).notNull(),
    path: varchar('path', { length: 200 }).notNull(),
    /** Coarse bucket only — mobile / tablet / desktop / unknown. */
    device: varchar('device', { length: 20 }),
    /** Deepest point reached, 0–100. Merged with GREATEST so it only ever rises. */
    maxScrollPct: integer('max_scroll_pct').notNull().default(0),
    /** Time the tab was visible and being read, not wall clock since arrival. */
    activeMs: integer('active_ms').notNull().default(0),
    /** Frustration signal: repeated clicks on the same unresponsive spot. */
    rageClicks: integer('rage_clicks').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** The upsert must set this explicitly; it dates the freshest beacon. */
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('page_engagement_view_id_idx').on(t.viewId),
    index('page_engagement_created_at_idx').on(t.createdAt),
    /** Path breakdowns always carry a date window, so the window rides along. */
    index('page_engagement_path_idx').on(t.path, t.createdAt),
    /** The only route from an event back to a visitor is an explicit join here. */
    index('page_engagement_visitor_idx').on(t.visitorId),
  ],
)

/** The event shapes the dashboard knows how to read. */
export const EVENT_KINDS = ['cta', 'outbound', 'section', 'rage'] as const
export type EventKind = (typeof EVENT_KINDS)[number]

/**
 * Append-only discrete events — a CTA press, an outbound tap, a section
 * coming into view, a rage burst.
 *
 * dedupeKey is composed on the client (viewId:kind:name for once-per-view
 * facts, with a trailing counter for genuinely repeatable ones) so
 * onConflictDoNothing absorbs every duplicate beacon with no server-side
 * bookkeeping. name is checked against the shared allowlist before insert,
 * which is what guarantees no typed text ever reaches this table.
 *
 * There is deliberately no visitorId: tying an event to a person requires an
 * explicit join through pageEngagement on viewId, which keeps casual queries
 * aggregate by default.
 */
export const siteEvents = pgTable(
  'site_events',
  {
    id: serial('id').primaryKey(),
    /** Idempotency key, composed client-side. Absorbs retried beacons. */
    dedupeKey: varchar('dedupe_key', { length: 120 }).notNull(),
    /** Joins to pageEngagement.viewId — the only path back to a visitor. */
    viewId: varchar('view_id', { length: 36 }).notNull(),
    path: varchar('path', { length: 200 }).notNull(),
    kind: varchar('kind', { length: 16 }).$type<EventKind>().notNull(),
    /** An allowlisted slug, never free text. Rejected at the API if unknown. */
    name: varchar('name', { length: 60 }).notNull(),
    /** Optional magnitude — the size of a rage burst, for example. */
    value: integer('value'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('site_events_dedupe_key_idx').on(t.dedupeKey),
    /** Recent-first feed across every kind. */
    index('site_events_created_at_idx').on(t.createdAt),
    /** The dashboard's grouped read: counts per kind and name inside a window. */
    index('site_events_kind_name_idx').on(t.kind, t.name, t.createdAt),
    /** Which page an interaction happened on, again inside a window. */
    index('site_events_path_idx').on(t.path, t.createdAt),
    /** Joining a visit's events back to its engagement row. */
    index('site_events_view_idx').on(t.viewId),
  ],
)

/**
 * One row per visitor per experiment.
 *
 * The unique index is the design rather than an optimisation: it makes the
 * denominator "unique visitors in this arm", locks a visitor to the first arm
 * recorded for them, and makes the beacon idempotent so a double mount or a
 * retry cannot inflate a count.
 */
export const experimentExposures = pgTable(
  'experiment_exposures',
  {
    id: serial('id').primaryKey(),
    experimentKey: varchar('experiment_key', { length: 40 }).notNull(),
    variant: varchar('variant', { length: 40 }).notNull(),
    /** gr_vid, the same anonymous id pageviews use, so consent already applies. */
    visitorId: varchar('visitor_id', { length: 64 }).notNull(),
    path: varchar('path', { length: 200 }),
    /** Coarse bucket only, for segmenting an arm by device. */
    device: varchar('device', { length: 20 }),
    /**
     * The client-reported arm disagreed with the server's recomputation —
     * stale CDN HTML, a rotated salt, or tampering. Excluded from results
     * rather than left to quietly poison an arm.
     */
    dirty: boolean('dirty').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('experiment_exposures_visitor_idx').on(
      t.experimentKey,
      t.visitorId,
    ),
    index('experiment_exposures_key_created_at_idx').on(
      t.experimentKey,
      t.createdAt,
    ),
  ],
)

/** The conversions worth measuring. Anything else is rejected at the API. */
export const EXPERIMENT_GOALS = [
  'enquiry_submitted',
  'callback_requested',
  'whatsapp_click',
  'hero_cta_click',
] as const
export type ExperimentGoal = (typeof EXPERIMENT_GOALS)[number]

/**
 * Conversions, recorded once per visitor per goal.
 *
 * Deliberately experiment-agnostic: a goal is attributed to an arm by joining
 * on visitorId at read time, so a goal logged today can be re-attributed to
 * any experiment that was running when it happened, and a second experiment
 * needs no new table.
 *
 * The unique index makes every metric a clean per-visitor binomial, which is
 * the precondition for the Wilson interval and two-proportion test being
 * valid — counting events instead would break independence and overstate
 * significance.
 */
export const experimentGoals = pgTable(
  'experiment_goals',
  {
    id: serial('id').primaryKey(),
    goal: varchar('goal', { length: 40 }).$type<ExperimentGoal>().notNull(),
    /** gr_vid again — this column is the whole attribution mechanism. */
    visitorId: varchar('visitor_id', { length: 64 }).notNull(),
    /** Where the conversion happened, for reporting only. */
    path: varchar('path', { length: 200 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('experiment_goals_visitor_idx').on(t.goal, t.visitorId),
    index('experiment_goals_created_at_idx').on(t.createdAt),
  ],
)

export type Enquiry = typeof enquiries.$inferSelect
export type Pageview = typeof pageviews.$inferSelect
export type Visitor = typeof visitors.$inferSelect
export type PageEngagement = typeof pageEngagement.$inferSelect
export type SiteEvent = typeof siteEvents.$inferSelect
export type ExperimentExposure = typeof experimentExposures.$inferSelect
export type ExperimentGoalRow = typeof experimentGoals.$inferSelect
