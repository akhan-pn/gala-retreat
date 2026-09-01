import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { VISITOR_CONSENT_TEXT } from '@/components/VisitorCapture'
import { CONSENT_COOKIE, consentGrantedFromCookie } from '@/lib/consent'
import { getDb, schema } from '@/lib/db'
import { resolveGeo } from '@/lib/geo'
import { resolveDevice, resolveSource } from '@/lib/source'

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
  const geo = resolveGeo(head)

  try {
    await db.insert(schema.visitors).values({
      name,
      phone,
      capturedOn,
      source: resolveSource(referrer),
      referrer: referrer?.slice(0, 500) ?? null,
      device: resolveDevice(head.get('user-agent')),
      city: geo.city,
      country: geo.country,
      // Only tie these details to the anonymous visit log if that log was
      // itself consented to; otherwise the two stay unlinked.
      visitorId: consentGrantedFromCookie(jar.get(CONSENT_COOKIE)?.value)
        ? (jar.get('gr_vid')?.value ?? null)
        : null,
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
