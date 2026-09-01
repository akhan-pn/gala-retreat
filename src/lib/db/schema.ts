import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
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

export type Enquiry = typeof enquiries.$inferSelect
export type Pageview = typeof pageviews.$inferSelect
export type Visitor = typeof visitors.$inferSelect
