'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { readConsent } from '@/lib/consent'

const KEY = 'gr-visitor'
const DISMISS_DAYS = 30
/** Pages where asking would be redundant or rude. */
const SKIP = ['/enquiry', '/privacy']

export const VISITOR_CONSENT_TEXT =
  'I am happy for Gala Retreat to call or message me about dates and availability.'

type Errors = Partial<Record<'name' | 'phone' | 'consent' | 'form', string>>

function alreadyAnswered() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return false
    if (raw === 'submitted') return true
    const at = Number(raw.split(':')[1])
    if (!Number.isFinite(at)) return false
    return Date.now() - at < DISMISS_DAYS * 86_400_000
  } catch {
    return true // Storage blocked — do not nag on every page.
  }
}

/**
 * A short callback prompt for visitors who are clearly interested but have not
 * opened the enquiry form. Two fields and an explicit tick box — nothing is
 * sent or stored unless they fill it in and agree.
 *
 * Deliberately held back until the visitor has actually engaged, and never
 * shown on top of the cookie prompt.
 */
export default function VisitorCapture() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const eligible = useRef(false)

  useEffect(() => {
    eligible.current =
      !SKIP.includes(pathname ?? '') && !alreadyAnswered() && readConsent() !== null

    if (!eligible.current) return

    const reveal = () => {
      if (!eligible.current) return
      eligible.current = false
      setOpen(true)
    }

    // Whichever comes first: a while spent reading, or most of a page scrolled.
    const timer = window.setTimeout(reveal, 30_000)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max > 0.55) reveal()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  const remember = useCallback((value: string) => {
    try {
      localStorage.setItem(KEY, value)
    } catch {}
  }, [])

  function dismiss() {
    remember(`dismissed:${Date.now()}`)
    setOpen(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setErrors({})

    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          contactConsent: form.get('contactConsent') === 'on',
          capturedOn: pathname,
        }),
      })
      const json = await res.json()
      if (json.ok) {
        remember('submitted')
        setDone(true)
        window.setTimeout(() => setOpen(false), 4000)
      } else {
        setErrors(json.errors ?? { form: 'Something went wrong. Please try again.' })
      }
    } catch {
      setErrors({ form: 'We could not reach the server just now.' })
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-label="Request a callback"
      className="fixed bottom-0 left-0 z-90 w-full max-w-[27rem] border-t border-r border-ink/15 bg-surface/97 p-6 backdrop-blur-md sm:bottom-5 sm:left-5 sm:border"
    >
      {done ? (
        <>
          <p className="u-label text-accent">Got it</p>
          <p className="u-display-sm mt-4 text-[1.35rem] text-ink">
            We will be in touch.
          </p>
          <p className="mt-3 text-[0.9rem] text-ink/72">
            Someone from the team will call you about available dates.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <p className="u-label text-accent">Planning something?</p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="-mt-1 text-ink/60 transition-colors duration-300 hover:text-ink"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/72">
            Leave a name and number and we will call you with dates that are
            still open — no form to fill in.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vc-name" className="sr-only">
                  Your name
                </label>
                <input
                  id="vc-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Name"
                  aria-invalid={Boolean(errors.name)}
                  className="w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-2 pt-1 text-ink placeholder:text-ink/50 transition-colors duration-300 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="vc-phone" className="sr-only">
                  Phone number
                </label>
                <input
                  id="vc-phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Phone"
                  aria-invalid={Boolean(errors.phone)}
                  className="w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-2 pt-1 text-ink placeholder:text-ink/50 transition-colors duration-300 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {(errors.name || errors.phone) && (
              <p role="alert" className="text-xs text-danger">
                {errors.name ?? errors.phone}
              </p>
            )}

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="contactConsent"
                required
                aria-invalid={Boolean(errors.consent)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
              />
              <span className="text-[0.8rem] leading-relaxed text-ink/72">
                {VISITOR_CONSENT_TEXT}
              </span>
            </label>

            {errors.consent && (
              <p role="alert" className="text-xs text-danger">
                {errors.consent}
              </p>
            )}
            {errors.form && (
              <p role="alert" className="text-xs text-danger">
                {errors.form}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <button
                type="submit"
                disabled={sending}
                className="u-label border border-accent px-7 py-3.5 text-accent transition-colors duration-400 hover:bg-accent hover:text-on-accent disabled:opacity-45"
              >
                {sending ? 'Sending…' : 'Call me back'}
              </button>
              <Link href="/privacy" className="u-link u-label ml-auto text-ink/60">
                How we use this
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
