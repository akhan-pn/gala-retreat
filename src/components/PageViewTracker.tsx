'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { CHANGED_EVENT } from './ConsentBanner'
import { readConsent } from '@/lib/consent'

/**
 * Records one pageview per route change — but only once the visitor has
 * accepted. Before that nothing is sent and no identifier is issued.
 *
 * The visitor id is a first-party httpOnly cookie set by the API route, so
 * there is no third-party script and no cross-site tracking.
 */
export default function PageViewTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  const send = useCallback((path: string) => {
    if (readConsent() !== 'granted') return
    if (lastSent.current === path) return
    lastSent.current = path

    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
        utm: new URLSearchParams(window.location.search).get('utm_source'),
      }),
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {
      // Measurement must never break the page.
    })
  }, [])

  useEffect(() => {
    if (pathname) send(pathname)
  }, [pathname, send])

  // If consent is granted later, count the page they are already on.
  useEffect(() => {
    const onChange = (e: Event) => {
      const value = (e as CustomEvent<string>).detail
      if (value === 'granted') {
        if (pathname) send(pathname)
      } else {
        // Withdrawn — allow a later re-grant to re-send this path.
        lastSent.current = null
      }
    }
    window.addEventListener(CHANGED_EVENT, onChange)
    return () => window.removeEventListener(CHANGED_EVENT, onChange)
  }, [pathname, send])

  return null
}
