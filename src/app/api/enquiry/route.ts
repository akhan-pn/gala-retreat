import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { CONSENT_TEXT } from '@/lib/consent'
import { getDb, schema } from '@/lib/db'
import { resolveSource, sanitiseReferrer } from '@/lib/source'

export type EnquiryErrors = Partial<
  Record<
    'name' | 'phone' | 'email' | 'message' | 'guests' | 'consent' | 'form',
    string
  >
>

function str(v: unknown) {
  return typeof v === 'string' ? v.trim() : ''
}

/** Checkboxes arrive as true, "true" or "on" depending on the caller. */
function checked(v: unknown) {
  return v === true || v === 'true' || v === 'on'
}

/** Accepts Indian mobile formats with or without +91, spaces or dashes. */
function validPhone(v: string) {
  const digits = v.replace(/[^\d]/g, '')
  return digits.length >= 10 && digits.length <= 15
}

function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Malformed request.' } }, { status: 400 })
  }

  // Honeypot — real people never fill this in.
  if (str(body.company)) return NextResponse.json({ ok: true })

  const name = str(body.name)
  const phone = str(body.phone)
  const email = str(body.email)
  const message = str(body.message)
  const eventType = str(body.eventType)
  const eventDate = str(body.eventDate)
  const guestsRaw = str(body.guests)
  const contactConsent = checked(body.contactConsent)
  const marketingConsent = checked(body.marketingConsent)

  const errors: EnquiryErrors = {}
  if (name.length < 2) errors.name = 'Please tell us your name.'
  if (name.length > 120) errors.name = 'That name is too long.'
  if (!validPhone(phone)) errors.phone = 'Please enter a phone number we can reach you on.'
  if (email && !validEmail(email)) errors.email = 'That email address does not look right.'
  if (message.length > 2000) errors.message = 'Please keep this under 2000 characters.'
  // A lead cannot exist without permission to hold it.
  if (!contactConsent)
    errors.consent = 'Please tick this so we can hold your details and reply.'

  let guests: number | null = null
  if (guestsRaw) {
    const n = Number(guestsRaw)
    if (!Number.isFinite(n) || n < 1 || n > 100000) errors.guests = 'Enter a number of guests.'
    else guests = Math.round(n)
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  const db = getDb()
  if (!db) {
    console.error('[enquiry] DATABASE_URL is not set — enquiry was not saved:', {
      name,
      phone,
    })
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form:
            'We could not save your enquiry just now. Please call or WhatsApp us instead — we will answer straight away.',
        },
      },
      { status: 503 },
    )
  }

  const jar = await cookies()
  const referrer = (await headers()).get('referer')

  try {
    await db.insert(schema.enquiries).values({
      name,
      phone,
      email: email || null,
      eventType: eventType || null,
      eventDate: eventDate || null,
      guests,
      message: message || null,
      contactConsent,
      marketingConsent,
      consentAt: new Date(),
      consentText: CONSENT_TEXT,
      // Prefer the source recorded on the visitor's first pageview.
      source: resolveSource(jar.get('gr_first_ref')?.value ?? referrer),
      referrer: sanitiseReferrer(referrer),
    })
  } catch (error) {
    console.error('[enquiry] insert failed', error)
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form:
            'Something went wrong saving your enquiry. Please call or WhatsApp us — we will pick up.',
        },
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
