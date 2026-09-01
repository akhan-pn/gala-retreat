import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { VISITOR_CONSENT_TEXT } from '@/components/VisitorCapture'
import { CONSENT_COOKIE, consentGrantedFromCookie } from '@/lib/consent'
import { getDb, schema } from '@/lib/db'
import { resolveGeo } from '@/lib/geo'
import { resolveDevice, resolveSource, sanitiseReferrer } from '@/lib/source'

export type VisitorErrors = Partial<
  Record<'name' | 'phone' | 'consent' | 'form', string>
>

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const checked = (v: unknown) => v === true || v === 'true' || v === 'on'

function validPhone(v: string) {
  const digits = v.replace(/[^\d]/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Malformed request.' } }, { status: 400 })
  }

  const name = str(body.name)
  const phone = str(body.phone)
  const capturedOn = str(body.capturedOn).slice(0, 200) || null

  const errors: VisitorErrors = {}
  if (name.length < 2) errors.name = 'Please add your name.'
  if (name.length > 120) errors.name = 'That name is too long.'
  if (!validPhone(phone)) errors.phone = 'Please enter a number we can call.'
  // Nothing is stored without an explicit tick.
  if (!checked(body.contactConsent))
    errors.consent = 'Please tick the box so we may call you.'

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        errors: { form: 'We could not save that just now — please call or WhatsApp us.' },
      },
      { status: 503 },
    )
  }

  const head = await headers()
  const jar = await cookies()
  const referrer = head.get('referer')

  // The tick box only agrees to being called back. Where the visitor came
  // from, what they browsed on and where they are is analytics, and the
  // banner asked about that separately — so a visitor who said "No thanks"
  // leaves us a name and a number and nothing else.
  const analytics = consentGrantedFromCookie(jar.get(CONSENT_COOKIE)?.value)
  const geo = analytics ? resolveGeo(head) : { city: null, country: null }

  try {
    await db.insert(schema.visitors).values({
      name,
      phone,
      capturedOn,
      source: analytics ? resolveSource(referrer) : null,
      referrer: analytics ? sanitiseReferrer(referrer) : null,
      device: analytics ? resolveDevice(head.get('user-agent')) : null,
      city: geo.city,
      country: geo.country,
      // gr_vid is deliberately never written here. The banner and the privacy
      // page both promise the measurement id identifies nobody, and a name and
      // a phone number sitting on the same row as it would make that untrue —
      // one join would hand over a named person's whole behaviour trail.
      contactConsent: true,
      consentAt: new Date(),
      consentText: VISITOR_CONSENT_TEXT,
    })
  } catch (error) {
    console.error('[visitor] insert failed', error)
    return NextResponse.json(
      { ok: false, errors: { form: 'Something went wrong. Please call or WhatsApp us.' } },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
