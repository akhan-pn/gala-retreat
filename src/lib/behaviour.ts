/**
 * The wire contract for consent-gated behaviour capture, shared by
 * BehaviourTracker and /api/events.
 *
 * Both ends import the same allowlists, so every name the tracker can produce
 * is a name the server already accepts — and nothing outside those lists can
 * reach the database. The body is still treated as hostile: the tracker is one
 * client of this endpoint, not the only possible one, so parseBehaviourPayload
 * is the single door into the tables and it rebuilds every stored value from
 * validated parts rather than trusting what arrived.
 */
import type { EventKind } from '@/lib/db/schema'

/** Batch endpoint. One request carries a whole view's worth of behaviour. */
export const BEHAVIOUR_ENDPOINT = '/api/events'

/** A batch is capped rather than allowed to grow; surplus events are dropped. */
export const MAX_EVENTS_PER_BATCH = 24
export const MAX_NAME_LENGTH = 60
export const MAX_PATH_LENGTH = 200
/** Repeat counter for genuinely repeatable events; three digits keeps the
 *  composed dedupe key inside the column's 120 characters. */
export const MAX_SEQ = 999
export const MAX_EVENT_VALUE = 10_000
export const MAX_SCROLL_PCT = 100
/** Four hours of engaged reading on one view is already absurd. */
export const MAX_ACTIVE_MS = 4 * 60 * 60 * 1_000
export const MAX_RAGE_CLICKS = 500

/**
 * The kinds the dashboard knows how to read. Declared here rather than
 * imported as a value from the schema so the tracker does not pull the Drizzle
 * table builders into the browser bundle; `satisfies` keeps the two in step by
 * failing the build if a kind appears here that the column's type rejects.
 */
export const BEHAVIOUR_EVENT_KINDS = [
  'cta',
  'outbound',
  'section',
  'rage',
] as const satisfies readonly EventKind[]

export type BehaviourEventKind = (typeof BEHAVIOUR_EVENT_KINDS)[number]

/**
 * Every name that may ever be stored, per kind.
 *
 * This list is the guarantee that no typed text — and therefore no keystroke,
 * no search term, no form value — can land in site_events. A derived name that
 * is not here is dropped on the client and rejected on the server.
 */
export const BEHAVIOUR_EVENT_NAMES = {
  cta: [
    'home',
    'about',
    'gallery',
    'enquiry',
    'contact',
    'call',
    'directions',
    'submit_enquiry',
    'callback',
    'hero_cta',
  ],
  outbound: [
    'whatsapp',
    'whatsapp_float',
    'whatsapp_contact',
    'instagram',
    'facebook',
    'maps',
    'phone',
    'email',
    'external',
  ],
  section: [
    'hero',
    'spaces',
    'gallery',
    'packages',
    'amenities',
    'testimonials',
    'faq',
    'location',
    'contact',
    'enquiry',
    'section_1',
    'section_2',
    'section_3',
    'section_4',
    'section_5',
    'section_6',
    'section_7',
    'section_8',
    'section_9',
    'section_10',
    'section_11',
    'section_12',
  ],
  rage: ['hero_cta', 'nav', 'form', 'gallery', 'link', 'page'],
} as const satisfies Record<BehaviourEventKind, readonly string[]>

/** How many positional section names exist, so the tracker stops observing. */
export const MAX_TRACKED_SECTIONS = 12

const VIEW_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
/** Site routes only: no query, no fragment, no encoded payloads. */
const PATH_RE = /^\/[A-Za-z0-9\-._~/]*$/

export function isBehaviourEventKind(value: unknown): value is BehaviourEventKind {
  return (
    typeof value === 'string' &&
    (BEHAVIOUR_EVENT_KINDS as readonly string[]).includes(value)
  )
}

export function isAllowedEventName(kind: BehaviourEventKind, name: string) {
  return (BEHAVIOUR_EVENT_NAMES[kind] as readonly string[]).includes(name)
}

/** Folds a DOM-derived label into the slug shape the allowlist is written in. */
export function normaliseName(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, MAX_NAME_LENGTH)
}

/**
 * viewId:kind:name for once-per-view facts, with a trailing counter for the
 * repeatable ones. Composed from validated parts on the server rather than
 * accepted from the body, so one visitor cannot squat on another view's
 * dedupe space or push arbitrary text into an indexed column.
 */
export function dedupeKeyFor(
  viewId: string,
  kind: BehaviourEventKind,
  name: string,
  seq: number,
) {
  return seq > 0 ? `${viewId}:${kind}:${name}:${seq}` : `${viewId}:${kind}:${name}`
}

/** A UUID, from the browser when it can, in the same shape when it cannot. */
export function createViewId(): string {
  const source = globalThis.crypto
  if (source && typeof source.randomUUID === 'function') return source.randomUUID()

  // Older Safari and insecure origins have no randomUUID. Keeping the fallback
  // UUID-shaped is what lets the server enforce one strict format.
  const bytes = new Uint8Array(16)
  if (source && typeof source.getRandomValues === 'function') {
    source.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** What the tracker puts on the wire for one discrete event. */
export type BehaviourEventInput = {
  kind: BehaviourEventKind
  name: string
  seq?: number
  value?: number | null
}

/** What the tracker puts on the wire for one page visit. */
export type BehaviourPayload = {
  viewId: string
  path: string
  maxScrollPct: number
  activeMs: number
  rageClicks: number
  events: BehaviourEventInput[]
}

export type ParsedBehaviourEvent = {
  dedupeKey: string
  kind: BehaviourEventKind
  name: string
  value: number | null
}

export type ParsedBehaviour = {
  viewId: string
  path: string
  maxScrollPct: number
  activeMs: number
  rageClicks: number
  events: ParsedBehaviourEvent[]
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

function parsePath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  // Query strings and fragments can carry anything a visitor typed, so they are
  // cut before the value is ever looked at, let alone stored.
  const bare = value.split(/[?#]/)[0].slice(0, MAX_PATH_LENGTH)
  if (!PATH_RE.test(bare)) return null
  return bare
}

/**
 * The only way into page_engagement and site_events.
 *
 * Returns null for a body that is malformed at the view level; individual
 * events that fail validation are dropped rather than failing the batch, so
 * one bad entry cannot cost a visitor's whole engagement row.
 */
export function parseBehaviourPayload(body: unknown): ParsedBehaviour | null {
  if (typeof body !== 'object' || body === null) return null
  const raw = body as Record<string, unknown>

  const viewId = typeof raw.viewId === 'string' ? raw.viewId.toLowerCase() : ''
  if (!VIEW_ID_RE.test(viewId)) return null

  const path = parsePath(raw.path)
  if (!path) return null

  const events: ParsedBehaviourEvent[] = []
  const seen = new Set<string>()
  if (Array.isArray(raw.events)) {
    for (const entry of raw.events.slice(0, MAX_EVENTS_PER_BATCH)) {
      if (typeof entry !== 'object' || entry === null) continue
      const item = entry as Record<string, unknown>
      if (!isBehaviourEventKind(item.kind)) continue
      if (typeof item.name !== 'string') continue

      const name = normaliseName(item.name)
      if (!isAllowedEventName(item.kind, name)) continue

      const seq = clampInt(item.seq, 0, MAX_SEQ, 0)
      const dedupeKey = dedupeKeyFor(viewId, item.kind, name, seq)
      // A batch that repeats itself would otherwise trip the unique index and
      // abort the whole multi-row insert.
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      events.push({
        dedupeKey,
        kind: item.kind,
        name,
        value:
          item.value === null || item.value === undefined
            ? null
            : clampInt(item.value, 0, MAX_EVENT_VALUE, 0),
      })
    }
  }

  return {
    viewId,
    path,
    maxScrollPct: clampInt(raw.maxScrollPct, 0, MAX_SCROLL_PCT, 0),
    activeMs: clampInt(raw.activeMs, 0, MAX_ACTIVE_MS, 0),
    rageClicks: clampInt(raw.rageClicks, 0, MAX_RAGE_CLICKS, 0),
    events,
  }
}
