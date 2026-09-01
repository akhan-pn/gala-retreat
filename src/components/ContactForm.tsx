'use client'

import { useRef, useState } from 'react'
import { CONSENT_TEXT, MARKETING_TEXT } from '@/lib/consent'
import type { EnquiryErrors } from '@/app/api/enquiry/route'

const field =
  'w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-2 text-ink placeholder:text-ink/50 transition-colors duration-300 focus:border-accent focus:outline-none'

/**
 * The short message form on the contact page.
 *
 * Posts to the same endpoint as the full enquiry form, so a message and a
 * date enquiry land in one list rather than two — the venue team should not
 * have to check two places for a lead.
 *
 * The pointer-tracked highlight is set through CSS variables rather than
 * React state, so moving the cursor never re-renders the form.
 */
export default function ContactForm() {
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = panel.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--px', `${e.clientX - r.left}px`)
    el.style.setProperty('--py', `${e.clientY - r.top}px`)
    el.style.setProperty('--pa', '1')
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setErrors({})

    const form = new FormData(e.currentTarget)
    const data = {
      ...Object.fromEntries(form.entries()),
      contactConsent: form.get('contactConsent') === 'on',
      marketingConsent: form.get('marketingConsent') === 'on',
    }

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) setDone(true)
      else setErrors(json.errors ?? { form: 'Something went wrong. Please try again.' })
    } catch {
      setErrors({ form: 'We could not reach the server. Please call or WhatsApp us.' })
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="border-t border-accent/40 pt-10">
        <p className="u-label text-accent">Message sent</p>
        <p className="u-display-sm mt-5 text-[clamp(1.4rem,2.6vw,2rem)] text-ink">
          Thank you — we have it.
        </p>
        <p className="u-measure-wide mt-4 text-ink/72">
          Someone will come back to you, usually within a working day.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={panel}
      onPointerMove={onPointerMove}
      onPointerLeave={() => panel.current?.style.setProperty('--pa', '0')}
      className="group relative border border-ink/12 p-[clamp(1.5rem,3.5vw,2.75rem)]"
    >
      {/* A highlight that follows the pointer across the panel. Deliberately
          faint — it should register as the surface catching the light, not as
          an effect. Invisible until the pointer enters, and never on touch. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[var(--pa,0)] transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(320px circle at var(--px,50%) var(--py,50%), color-mix(in srgb, var(--color-accent) 9%, transparent), transparent 70%)',
        }}
      />

      <form onSubmit={onSubmit} noValidate className="relative space-y-8">
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-name" className="u-label mb-3 block text-ink/60">
              Your name
            </label>
            <input
              id="cf-name"
              name="name"
              required
              autoComplete="name"
              placeholder="Full name"
              aria-invalid={Boolean(errors.name)}
              className={field}
            />
            {errors.name && (
              <p role="alert" className="mt-2 text-xs text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cf-phone" className="u-label mb-3 block text-ink/60">
              Phone
            </label>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 00000 00000"
              aria-invalid={Boolean(errors.phone)}
              className={field}
            />
            {errors.phone && (
              <p role="alert" className="mt-2 text-xs text-danger">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cf-email" className="u-label mb-3 block text-ink/60">
            Email <span className="text-ink/60">— optional</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className={field}
          />
          {errors.email && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-message" className="u-label mb-3 block text-ink/60">
            Message
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="A date you are weighing up, a question about the hall, anything at all…"
            className={`${field} resize-none`}
          />
        </div>

        <fieldset className="space-y-4 border-t border-ink/12 pt-7">
          <legend className="sr-only">Permissions</legend>
          <label className="flex cursor-pointer items-start gap-3.5">
            <input
              type="checkbox"
              name="contactConsent"
              required
              aria-invalid={Boolean(errors.consent)}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="text-[0.9rem] leading-relaxed text-ink/72">{CONSENT_TEXT}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3.5">
            <input
              type="checkbox"
              name="marketingConsent"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="text-[0.9rem] leading-relaxed text-ink/60">{MARKETING_TEXT}</span>
          </label>
          {errors.consent && (
            <p role="alert" className="text-xs text-danger">
              {errors.consent}
            </p>
          )}
        </fieldset>

        {errors.form && (
          <p role="alert" className="border-l-2 border-danger pl-4 text-sm text-danger">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="u-label border border-accent px-9 py-4 text-accent transition-colors duration-400 hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
