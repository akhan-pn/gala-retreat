import { experiments, type ExperimentDeclaration } from '@/content/experiments'
import type { ExperimentGoal } from '@/lib/db/schema'
import { readConsent } from '@/lib/consent'

/**
 * First-party A/B testing.
 *
 * ── The flash-of-wrong-variant problem, and why this design does not have one
 *
 * The usual failure is: ship control in the HTML, let React discover the arm
 * on the client, then swap the copy. That repaints after hydration, which is
 * a visible flicker on the exact element the test is measuring — and it
 * biases the result, because the flicker only happens to the treated arm.
 * Hiding the hero until JavaScript decides is worse: it blanks the page for
 * everyone, and leaves content at opacity 0 when JS never arrives.
 *
 * Instead every arm ships inside the one statically prerendered document, as
 * inert slots:
 *
 *     <span data-gx-e="hero_cta" data-gx-v="control">Enquire</span>
 *     <span data-gx-e="hero_cta" data-gx-v="check_date" hidden>Check your date</span>
 *
 * Three layers then decide what is on screen, in this order:
 *
 *   1. The `hidden` attribute. With no CSS and no JavaScript at all, exactly
 *      one arm — control — is on the page. That is what a crawler indexes and
 *      what a JS-off visitor reads. Nothing is ever at opacity 0.
 *   2. EXPERIMENT_CSS, hoisted into <head> by React. Same outcome by default,
 *      plus one rule per arm keyed off an attribute on <html>.
 *   3. EXPERIMENT_BOOT_SCRIPT — blocking, inline, first child of <body>, the
 *      same slot as the theme script. It stamps data-gx-<key>="<variant>" on
 *      <html> before the parser has reached the hero, so the very first paint
 *      already shows the assigned arm. There is no earlier moment at which a
 *      wrong variant could be painted, so there is nothing to flicker.
 *
 * React is never told the variant and never re-renders: the slots are static
 * markup, and the choice is made entirely by an attribute and a stylesheet.
 * The client only reads the attribute afterwards, to report the exposure.
 *
 * ── Assignment
 *
 * FNV-1a over `${seed}:${key}`, mapped onto cumulative weights. Deterministic
 * and storage-free: the same visitor lands in the same arm on every page and
 * every device that carries the same seed, with no lookup and no round trip.
 *
 * The seed is gr_bkt = HMAC(gr_vid, EXPERIMENT_SALT), a readable cookie set
 * beside the httpOnly gr_vid. Readable, because the boot script has to see it
 * before first paint; an HMAC rather than gr_vid itself, so the server can
 * recompute a visitor's arm and mark a spoofed or stale one `dirty` instead
 * of letting it quietly poison an arm.
 *
 * Only consented visitors have a gr_vid, so only consented visitors are ever
 * enrolled. Everyone else has no gr_bkt, gets no attribute, and reads control
 * — the site works exactly as before and nothing at all is recorded.
 */

/** Readable bucketing seed. Only ever issued after the consent gate passes. */
export const BUCKET_COOKIE = 'gr_bkt'
/** The httpOnly anonymous id the pageview log already uses. */
export const VISITOR_COOKIE = 'gr_vid'
export const EXPERIMENT_ENDPOINT = '/api/experiment'

export type ExperimentKey = (typeof experiments)[number]['key']
type DeclarationOf<K extends ExperimentKey> = Extract<
  (typeof experiments)[number],
  { key: K }
>
export type VariantName<K extends ExperimentKey> =
  DeclarationOf<K>['variants'][number]['name']

export type ExposureReport = { key: string; variant: string }

/**
 * Assignment, written once and used twice: the server and the React tree call
 * this function directly, and its own source text is what ships inside the
 * boot script. One implementation means the server's recomputation can never
 * drift from the browser's — a drift that would silently mark every exposure
 * dirty.
 *
 * It must therefore stay self-contained: no imports, no module-level
 * constants, nothing the bundler could rename out from under the inlined copy.
 */
export function pickVariant(
  seed: string,
  key: string,
  names: readonly string[],
  weights: readonly number[],
): string {
  const input = seed + ':' + key
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  let total = 0
  for (let i = 0; i < weights.length; i++) total += weights[i]
  if (total <= 0) return names[0]
  const point = hash % total
  let running = 0
  for (let i = 0; i < names.length; i++) {
    running += weights[i]
    if (point < running) return names[i]
  }
  return names[0]
}

/** The arm this seed belongs in, for one declared experiment. */
export function variantFor(seed: string, declaration: ExperimentDeclaration) {
  return pickVariant(
    seed,
    declaration.key,
    declaration.variants.map((v) => v.name),
    declaration.variants.map((v) => v.weight),
  )
}

const byKey = new Map<string, ExperimentDeclaration>(
  experiments.map((e): [string, ExperimentDeclaration] => [e.key, e]),
)

/** The declaration for a key, or undefined for one that is not declared. */
export function experimentByKey(key: string) {
  return byKey.get(key)
}

export function isVariantOf(declaration: ExperimentDeclaration, name: string) {
  return declaration.variants.some((v) => v.name === name)
}

/* ------------------------------------------------------------------
   Generated CSS and boot script.

   Both are derived from the declarations, so adding an experiment cannot
   leave the two out of step with each other or with the markup.
   ------------------------------------------------------------------ */

/** Keys and variant names become attribute selectors and varchar(40) values. */
const SLUG = /^[a-z][a-z0-9_]{0,38}$/

for (const experiment of experiments) {
  if (!SLUG.test(experiment.key)) {
    throw new Error(`[experiments] invalid key "${experiment.key}"`)
  }
  for (const variant of experiment.variants) {
    if (!SLUG.test(variant.name)) {
      throw new Error(
        `[experiments] invalid variant "${variant.name}" in "${experiment.key}"`,
      )
    }
  }
}

/** The attribute the boot script stamps on <html> for one experiment. */
export function experimentAttribute(key: string) {
  return `data-gx-${key}`
}

export const EXPERIMENT_CSS = [
  // A slot must not introduce a box of its own around the copy it wraps, or
  // swapping a word would change the layout around it.
  '[data-gx-e]{display:contents}',
  // Non-control slots ship with `hidden`. This restates the user-agent rule at
  // author specificity so the line above cannot accidentally reveal them.
  '[data-gx-e][hidden]{display:none}',
  // One pair per arm: show the assigned slot, hide its siblings. Both are more
  // specific than the two defaults above, so an assignment always wins.
  ...experiments.flatMap((experiment) =>
    experiment.variants.flatMap((variant) => {
      const on = `html[${experimentAttribute(experiment.key)}="${variant.name}"]`
      const slot = `[data-gx-e="${experiment.key}"]`
      return [
        `${on} ${slot}[data-gx-v="${variant.name}"]{display:contents}`,
        `${on} ${slot}:not([data-gx-v="${variant.name}"]){display:none}`,
      ]
    }),
  ),
].join('')

function buildBootScript() {
  const table = JSON.stringify(
    experiments.map((e) => ({
      k: e.key,
      n: e.variants.map((v) => v.name),
      w: e.variants.map((v) => v.weight),
    })),
  ).replace(/</g, '\\u003c')

  // No seed cookie means an unconsented or first-time visitor: no attribute is
  // stamped, so the CSS default holds and they read control, unenrolled.
  return (
    '(function(){try{' +
    `var m=document.cookie.match(/(?:^|; )${BUCKET_COOKIE}=([^;]*)/);if(!m)return;` +
    'var s=decodeURIComponent(m[1]);if(!s)return;' +
    `var pick=${pickVariant.toString()};` +
    `var t=${table},d=document.documentElement;` +
    "for(var i=0;i<t.length;i++)d.setAttribute('data-gx-'+t[i].k,pick(s,t[i].k,t[i].n,t[i].w));" +
    '}catch(e){}})()'
  )
}

/**
 * Inline, blocking, and tiny. Mount it as the first child of <body>, beside
 * the theme script — it has to run before the parser reaches the hero.
 */
export const EXPERIMENT_BOOT_SCRIPT = buildBootScript()

/* ------------------------------------------------------------------
   Seed derivation (server) — Web Crypto, so this module stays importable
   from client components. Never call it without a consent check first.
   ------------------------------------------------------------------ */

/**
 * gr_bkt = HMAC-SHA256(gr_vid, salt), truncated to 128 bits.
 *
 * Derived rather than random so the server can recompute it from the cookie
 * it already trusts, and reject a hand-edited one.
 */
export async function deriveBucketSeed(visitorId: string, salt: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(visitorId))
  const bytes = new Uint8Array(signature)
  let hex = ''
  for (let i = 0; i < 16; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

/* ------------------------------------------------------------------
   Client reporting. Both calls are gated here on the visitor's own
   consent, and again server-side in the route — a beacon that skips the
   first gate still writes nothing.
   ------------------------------------------------------------------ */

/** The arm the boot script assigned, or null for an unenrolled visitor. */
export function assignedVariant(key: string) {
  if (typeof document === 'undefined') return null
  return document.documentElement.getAttribute(experimentAttribute(key))
}

function post(body: { path: string; exposures?: ExposureReport[]; goals?: string[] }) {
  void fetch(EXPERIMENT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => {
    // Measurement must never break the page.
  })
}

const reported = new Set<string>()
let pending: ExposureReport[] = []
let flushQueued = false

/**
 * Batches every exposure mounted in the same commit into one request.
 *
 * An unenrolled visitor still posts — with no exposures — because that empty
 * beacon is what asks the server for a seed cookie. They are recorded as
 * nothing; the seed simply means their *next* document can be enrolled.
 */
function scheduleFlush() {
  if (flushQueued) return
  flushQueued = true
  queueMicrotask(() => {
    flushQueued = false
    const exposures = pending
    pending = []
    post({ path: location.pathname, exposures })
  })
}

export function reportExposure(key: string) {
  if (typeof document === 'undefined') return
  if (readConsent() !== 'granted') return
  if (reported.has(key)) return
  reported.add(key)

  const variant = assignedVariant(key)
  if (variant) pending.push({ key, variant })
  scheduleFlush()
}

/**
 * Records a conversion, once per visitor per goal (the database enforces it).
 *
 * Deliberately experiment-agnostic: the goal carries no experiment key and is
 * attributed to an arm at read time, so a form or a WhatsApp button can call
 * this without knowing whether a test is running.
 */
export function recordExperimentGoal(goal: ExperimentGoal, path?: string) {
  if (typeof document === 'undefined') return
  if (readConsent() !== 'granted') return
  post({ path: path ?? location.pathname, goals: [goal] })
}
