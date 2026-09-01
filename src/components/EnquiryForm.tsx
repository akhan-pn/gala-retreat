'use client'

import { useState } from 'react'
import { CONSENT_TEXT, MARKETING_TEXT } from '@/lib/consent'
import { eventTypes } from '@/content/spaces'
import { site, whatsappLink } from '@/config/site'
import type { EnquiryErrors } from '@/app/api/enquiry/route'

const field =
  'w-full border-0 border-b border-ink/20 bg-transparent px-0 pb-3 pt-2 text-ink placeholder:text-ink/50 focus:border-accent focus:outline-none focus:ring-0 transition-colors duration-300'

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="u-label mb-3 block text-ink/60">{label}</label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-ink/60">{hint}</p>}
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default function EnquiryForm() {
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

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
      setErrors({
        form: 'We could not reach the server. Please check your connection, or WhatsApp us.',
      })
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="border-t border-accent/30 pt-10">
        <p className="u-label text-accent">Enquiry received</p>
        <h2 className="u-display mt-6 text-[clamp(2rem,4vw,3rem)] text-ink">
          Thank you — we have your details.
        </h2>
        <p className="u-measure-wide mt-6 text-ink/72">
          Someone from the {site.name} team will call you back, usually within a
          working day. If your date is close, WhatsApp is faster.
        </p>
        <a
          href={whatsappLink(
            `Hi ${site.name}, I've just submitted an enquiry on your website.`,
          )}
          target="_blank"
          rel="noreferrer noopener"
          className="u-label mt-10 inline-block border border-accent px-8 py-4 text-accent transition-colors duration-400 hover:bg-accent hover:text-on-accent"
        >
          Continue on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-9">
      {/* Honeypot — visually and programmatically hidden from real users. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Your name" error={errors.name}>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Full name"
          className={field}
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <div className="grid gap-9 sm:grid-cols-2">
        <Field label="Phone" error={errors.phone}>
          <input
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 00000 00000"
            className={field}
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>

        <Field label="Email" hint="Optional" error={errors.email}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={field}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
      </div>

      <div className="grid gap-9 sm:grid-cols-3">
        <Field label="Occasion">
          <select name="eventType" className={`${field} [&>option]:bg-surface`}>
            <option value="">Select…</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date of interest" hint="Approximate is fine">
          <input name="eventDate" type="date" className={field} />
        </Field>

        <Field label="Guests" error={errors.guests}>
          <input
            name="guests"
            type="number"
            min={1}
            max={100000}
            inputMode="numeric"
            placeholder="e.g. 400"
            className={field}
            aria-invalid={Boolean(errors.guests)}
          />
        </Field>
      </div>

      <Field label="Anything else we should know" error={errors.message}>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Catering, decor, rooms for the family, a date you are weighing up…"
          className={`${field} resize-none`}
        />
      </Field>

      {/* Consent sits with the submit button, not buried above it, so the
          visitor reads it at the moment they are actually agreeing. */}
      <fieldset className="space-y-4 border-t border-ink/12 pt-8">
        <legend className="sr-only">Permissions</legend>

        <label className="flex cursor-pointer items-start gap-3.5">
          <input
            type="checkbox"
            name="contactConsent"
            required
            aria-invalid={Boolean(errors.consent)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span className="text-[0.9rem] leading-relaxed text-ink/72">
            {CONSENT_TEXT}
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3.5">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span className="text-[0.9rem] leading-relaxed text-ink/60">
            {MARKETING_TEXT}{' '}
            <span className="text-ink/50">Optional.</span>
          </span>
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

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
        <button
          type="submit"
          disabled={sending}
          className="u-label border border-accent px-9 py-4 text-accent transition-colors duration-400 hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sending ? 'Sending…' : 'Send enquiry'}
        </button>

        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer noopener"
          className="u-link u-label text-ink/72"
        >
          or message us on WhatsApp
        </a>
      </div>
    </form>
  )
}
