'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import {
  BEHAVIOUR_ENDPOINT,
  type BehaviourEventKind,
  type BehaviourEventInput,
  MAX_EVENTS_PER_BATCH,
  MAX_SEQ,
  MAX_TRACKED_SECTIONS,
  createViewId,
  dedupeKeyFor,
  isAllowedEventName,
  normaliseName,
} from '@/lib/behaviour'
import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeConsent,
} from '@/lib/consent'

/** Reading counts as engaged until this long without any input. */
const IDLE_MS = 30_000
const TICK_MS = 1_000
/** Periodic flush, so a visitor who never leaves still produces a row. */
const FLUSH_MS = 15_000
/** A queued event gets a companion flush shortly after, not one request each. */
const EVENT_FLUSH_MS = 4_000
const RAGE_WINDOW_MS = 700
const RAGE_RADIUS_PX = 32
const RAGE_THRESHOLD = 3
/** A section must hold still in view before it counts as read. */
const SECTION_DWELL_MS = 1_000
/** Route content mounts after this effect does, so sections are swept twice. */
const SECTION_SWEEPS_MS = [250, 1_500]
/** Below this, a re-flush of the same numbers is not worth a request. */
const ACTIVE_MS_STEP = 3_000

type Target = { kind: BehaviourEventKind; name: string }

const INTERNAL_CTA: Record<string, string> = {
  '/': 'home',
  '/about': 'about',
  '/gallery': 'gallery',
  '/enquiry': 'enquiry',
  '/contact': 'contact',
}

function classifyLink(anchor: HTMLAnchorElement): Target | null {
  const raw = anchor.getAttribute('href') ?? ''
  if (raw.startsWith('tel:')) return { kind: 'outbound', name: 'phone' }
  if (raw.startsWith('mailto:')) return { kind: 'outbound', name: 'email' }

  let url: URL
  try {
    url = new URL(anchor.href, window.location.href)
  } catch {
    return null
  }

  if (url.origin !== window.location.origin) {
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (host === 'wa.me' || host.includes('whatsapp'))
      return { kind: 'outbound', name: 'whatsapp' }
    if (host.includes('instagram')) return { kind: 'outbound', name: 'instagram' }
    if (host.includes('facebook') || host === 'fb.com')
      return { kind: 'outbound', name: 'facebook' }
    if (host.endsWith('goo.gl') || (host.includes('google') && url.pathname.startsWith('/maps')))
      return { kind: 'outbound', name: 'maps' }
    return { kind: 'outbound', name: 'external' }
  }

  const name = INTERNAL_CTA[url.pathname.replace(/(.)\/+$/, '$1')]
  return name ? { kind: 'cta', name } : null
}

function classifyControl(el: Element): Target | null {
  const control = el.closest('button')
  if (!control || control.type !== 'submit' || !control.form) return null
  // The callback prompt is the only other form on the site; it identifies
  // itself by its dialog label. If that ever changes this degrades to the
  // enquiry name rather than inventing one.
  const callback = control.closest('[aria-label="Request a callback"]')
  return { kind: 'cta', name: callback ? 'callback' : 'submit_enquiry' }
}

/**
 * Works out what was clicked from markup this component does not own: an
 * explicit data-analytics label wins, otherwise the link target or the form
 * role decides. Anything that does not resolve to an allowlisted name is not
 * recorded at all — there is no "other" bucket carrying text along with it.
 */
function classify(el: Element): Target | null {
  const anchor = el.closest('a[href]')
  const natural =
    anchor instanceof HTMLAnchorElement ? classifyLink(anchor) : classifyControl(el)

  const labelled = el.closest('[data-analytics]')
  if (labelled) {
    const name = normaliseName(labelled.getAttribute('data-analytics') ?? '')
    const kinds: BehaviourEventKind[] = natural?.kind === 'outbound'
      ? ['outbound', 'cta']
      : ['cta', 'outbound']
    for (const kind of kinds) {
      if (isAllowedEventName(kind, name)) return { kind, name }
    }
  }
  return natural
}

function rageBucket(el: Element): string {
  if (el.closest('form')) return 'form'
  if (el.closest('nav, header')) return 'nav'
  if (el.closest('a, button')) return 'link'
  return 'page'
}

function sectionName(el: Element, index: number): string | null {
  const label = el.getAttribute('data-section') ?? el.id
  if (label) {
    const name = normaliseName(label)
    if (isAllowedEventName('section', name)) return name
  }
  if (index >= MAX_TRACKED_SECTIONS) return null
  return `section_${index + 1}`
}

/**
 * Consent-gated behaviour capture: one upserted engagement row per page visit
 * plus a small batch of discrete events.
 *
 * Nothing is collected, let alone sent, until the visitor has accepted — the
 * effect below does not even attach its listeners otherwise, and re-attaches
 * only because consent is read through an external store rather than state.
 * The component holds no React state at all: every counter is an effect-local
 * variable, so a scroll or a click costs no render.
 */
export default function BehaviourTracker() {
  const pathname = usePathname()
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  )
  // Survives route changes: once the server says it will not store this, there
  // is no point asking again for the rest of the session.
  const stopped = useRef(false)

  useEffect(() => {
    if (consent !== 'granted' || !pathname) return
    if (stopped.current) return

    const viewId = createViewId()
    const queue: BehaviourEventInput[] = []
    const claimed = new Set<string>()
    const sectionSeen = new WeakSet<Element>()
    const sectionNames = new WeakMap<Element, string>()
    const dwell = new Map<Element, ReturnType<typeof setTimeout>>()

    let maxScrollPct = 0
    let activeMs = 0
    let rageClicks = 0
    let rageBursts = 0
    let sent = { scroll: -1, active: -1, rage: -1 }
    let lastSample = Date.now()
    let lastActivity = Date.now()
    let frame = 0
    let eventTimer: ReturnType<typeof setTimeout> | null = null
    let closed = false

    const queueEvent = (kind: BehaviourEventKind, name: string, seq = 0, value: number | null = null) => {
      if (closed || !isAllowedEventName(kind, name)) return
      const key = dedupeKeyFor(viewId, kind, name, seq)
      // Already queued or already accepted: the server would drop it anyway.
      if (claimed.has(key)) return
      // Drop rather than grow: a stuck connection must not accumulate a heap.
      if (queue.length >= MAX_EVENTS_PER_BATCH) return
      claimed.add(key)
      queue.push({ kind, name, seq, value })
      if (!eventTimer) eventTimer = setTimeout(() => flush(false), EVENT_FLUSH_MS)
    }

    const readGranted = () => {
      try {
        return getConsentSnapshot() === 'granted'
      } catch {
        return false
      }
    }

    const dirty = () =>
      queue.length > 0 ||
      maxScrollPct > sent.scroll ||
      activeMs >= sent.active + ACTIVE_MS_STEP ||
      rageClicks > sent.rage

    const flush = (final: boolean) => {
      try {
        if (eventTimer) {
          clearTimeout(eventTimer)
          eventTimer = null
        }
        if (stopped.current) return
        // Client gate. The cookie may have been withdrawn since this effect ran.
        if (!readGranted()) return
        if (!dirty()) return

        const batch = queue.slice(0, MAX_EVENTS_PER_BATCH)
        const body = JSON.stringify({
          viewId,
          path: pathname,
          maxScrollPct,
          activeMs,
          rageClicks,
          events: batch,
        })
        const settled = { scroll: maxScrollPct, active: activeMs, rage: rageClicks }
        const accept = () => {
          queue.splice(0, batch.length)
          sent = settled
        }

        // A page being hidden or unloaded cannot wait for a response, and a
        // fetch may be cancelled with the document. sendBeacon survives it.
        if (final && typeof navigator.sendBeacon === 'function') {
          if (navigator.sendBeacon(BEHAVIOUR_ENDPOINT, new Blob([body], { type: 'application/json' }))) {
            accept()
          }
          return
        }

        void fetch(BEHAVIOUR_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
          credentials: 'same-origin',
        })
          .then((response) => (response.ok ? response.json() : null))
          .then((data: { ok?: boolean; reason?: string } | null) => {
            if (!data) return
            if (data.ok) {
              accept()
              return
            }
            // The server refuses to store this at all: stop asking. A missing
            // visitor id is different — the pageview beacon simply has not
            // landed yet, so the queue is kept for the next flush.
            if (data.reason === 'no-consent' || data.reason === 'not-configured') {
              stopped.current = true
              queue.length = 0
            }
          })
          .catch(() => {
            // Measurement must never break the page; the queue is capped, so
            // a failed flush costs nothing but this batch.
          })
      } catch {
        // Same reasoning: nothing here is worth an exception in the page.
      }
    }

    /* Engagement ------------------------------------------------------- */

    const measureScroll = () => {
      frame = 0
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      const pct =
        scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100)
      const clamped = Math.min(100, Math.max(0, pct))
      if (clamped > maxScrollPct) maxScrollPct = clamped
    }

    const onScroll = () => {
      lastActivity = Date.now()
      if (frame) return
      frame = requestAnimationFrame(measureScroll)
    }

    const onActivity = () => {
      lastActivity = Date.now()
    }

    // Engaged time, not wall clock: a hidden tab or a visitor who walked away
    // stops counting, and a suspended machine cannot bank the whole gap.
    const tick = () => {
      const now = Date.now()
      const delta = now - lastSample
      lastSample = now
      if (document.visibilityState !== 'visible') return
      if (now - lastActivity > IDLE_MS) return
      activeMs += Math.min(delta, TICK_MS * 2)
    }

    /* Clicks ----------------------------------------------------------- */

    let burst: { x: number; y: number; at: number; count: number } | null = null

    const onClick = (event: MouseEvent) => {
      try {
        const target = event.target
        if (!(target instanceof Element)) return

        const hit = classify(target)
        // Once per view per CTA: repeat presses inflate a count without
        // telling the dashboard anything the visitor total does not.
        if (hit) queueEvent(hit.kind, hit.name)

        const now = Date.now()
        const near =
          burst !== null &&
          now - burst.at < RAGE_WINDOW_MS &&
          Math.abs(event.clientX - burst.x) < RAGE_RADIUS_PX &&
          Math.abs(event.clientY - burst.y) < RAGE_RADIUS_PX

        if (near && burst) {
          burst.count += 1
          burst.at = now
          if (burst.count >= RAGE_THRESHOLD) {
            rageClicks += 1
            if (burst.count === RAGE_THRESHOLD) {
              // The whole burst counts, not just the click that crossed it.
              rageClicks += RAGE_THRESHOLD - 1
              rageBursts = Math.min(rageBursts + 1, MAX_SEQ)
              queueEvent('rage', rageBucket(target), rageBursts, RAGE_THRESHOLD)
            }
          }
        } else {
          burst = { x: event.clientX, y: event.clientY, at: now, count: 1 }
        }
      } catch {
        // A click must reach the page whatever happens here.
      }
    }

    /* Sections --------------------------------------------------------- */

    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const existing = dwell.get(entry.target)
                if (!entry.isIntersecting) {
                  if (existing) {
                    clearTimeout(existing)
                    dwell.delete(entry.target)
                  }
                  continue
                }
                if (existing || sectionSeen.has(entry.target)) continue
                const name = sectionNames.get(entry.target)
                if (!name) continue
                dwell.set(
                  entry.target,
                  setTimeout(() => {
                    dwell.delete(entry.target)
                    sectionSeen.add(entry.target)
                    queueEvent('section', name)
                  }, SECTION_DWELL_MS),
                )
              }
            },
            { threshold: 0, rootMargin: '-25% 0px -25% 0px' },
          )
        : null

    const sweeps = SECTION_SWEEPS_MS.map((delay) =>
      setTimeout(() => {
        if (closed) return
        // A page whose images have not landed is shorter than it will be, so
        // the first honest read of depth waits for layout rather than
        // recording a full-height view of a page nobody has seen.
        measureScroll()
        if (!observer) return
        const nodes = document.querySelectorAll('main section, main [data-section]')
        nodes.forEach((node, index) => {
          if (sectionNames.has(node) || sectionSeen.has(node)) return
          const name = sectionName(node, index)
          if (!name) return
          // Named here rather than in the observer callback: the second sweep
          // must be able to tell an already-watched node from a new one, and
          // this component may not annotate markup it does not own.
          sectionNames.set(node, name)
          observer.observe(node)
        })
      }, delay),
    )

    /* Wiring ----------------------------------------------------------- */

    const onHide = () => {
      if (document.visibilityState === 'hidden') flush(true)
    }
    const onPageHide = () => flush(true)

    const interval = setInterval(tick, TICK_MS)
    const flushTimer = setInterval(() => flush(false), FLUSH_MS)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('pointerdown', onActivity, { passive: true })
    window.addEventListener('pointermove', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity, { passive: true })
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)
    // Capture phase: an analytics listener must not depend on the page letting
    // the click bubble.
    document.addEventListener('click', onClick, true)

    return () => {
      closed = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('pointermove', onActivity)
      window.removeEventListener('keydown', onActivity)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('click', onClick, true)
      clearInterval(interval)
      clearInterval(flushTimer)
      sweeps.forEach(clearTimeout)
      dwell.forEach(clearTimeout)
      dwell.clear()
      observer?.disconnect()
      if (frame) cancelAnimationFrame(frame)
      if (eventTimer) clearTimeout(eventTimer)
      // The view is over — send whatever it learned before the route changes.
      flush(true)
    }
  }, [consent, pathname])

  return null
}
