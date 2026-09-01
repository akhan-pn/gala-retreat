'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  CONSENT_EVENT,
  getConsentServerSnapshot,
  getConsentSnapshot,
  notifyConsent,
  subscribeConsent,
  writeConsent,
  type Consent,
} from '@/lib/consent'

/** Lets the footer link reopen the panel after a choice has been made. */
export const REOPEN_EVENT = 'gr:consent-reopen'
/** Tells PageViewTracker that the answer changed, without a reload. */
export const CHANGED_EVENT = CONSENT_EVENT

export default function ConsentBanner() {
  // Read during render rather than in an effect: the cookie is an external
  // store, and the server snapshot keeps the panel out of the SSR markup so
  // returning visitors never see it flash.
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  )
  const [reopened, setReopened] = useState(false)

  useEffect(() => {
    const reopen = () => setReopened(true)
    window.addEventListener(REOPEN_EVENT, reopen)
    return () => window.removeEventListener(REOPEN_EVENT, reopen)
  }, [])

  const answer = useCallback((value: Consent) => {
    writeConsent(value)
    setReopened(false)
    notifyConsent(value)
  }, [])

  const current = consent === 'granted' || consent === 'denied' ? consent : null
  const open = reopened || consent === 'unanswered'

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies and visitor measurement"
      className="fixed bottom-0 left-0 z-100 w-full max-w-[30rem] border-t border-r border-ink/15 bg-surface/97 p-6 backdrop-blur-md sm:bottom-5 sm:left-5 sm:border"
    >
      <p className="u-label text-accent">Before you look around</p>

      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/72">
        We would like to count visits to this site so we know which pages are
        useful and how people found us. That needs one small cookie holding a
        random number — no name, no email, nothing shared with anyone else.
      </p>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/72">
        Say no and the site works exactly the same; we simply will not count you.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => answer('granted')}
          className="u-label border border-accent px-7 py-3.5 text-accent transition-colors duration-400 hover:bg-accent hover:text-on-accent"
        >
          {current === 'granted' ? 'Keep counting' : 'Allow'}
        </button>
        <button
          type="button"
          onClick={() => answer('denied')}
          className="u-link u-label text-ink/72"
        >
          {current === 'granted' ? 'Stop counting' : 'No thanks'}
        </button>
        <Link href="/privacy" className="u-link u-label ml-auto text-ink/60">
          What we collect
        </Link>
      </div>
    </div>
  )
}

/** Footer control that reopens the panel so a choice can be changed. */
export function ConsentReopenLink({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
      className={`u-link u-label ${className}`}
    >
      Cookie choices
    </button>
  )
}
