import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'

/** Escapes a value for CSV, and defuses spreadsheet formula injection. */
function cell(value: unknown) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return `"${value.toISOString()}"`
  if (typeof value === 'boolean') return value ? '"Yes"' : '"No"'
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

function csv(header: string[], rows: unknown[][]) {
  return [header.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n')
}

export async function GET(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ ok: false }, { status: 503 })

  const set = new URL(request.url).searchParams.get('set')
  const stamp = new Date().toISOString().slice(0, 10)

  let body: string
  let name: string

  if (set === 'visitors') {
    const rows = await db
      .select()
      .from(schema.visitors)
      .orderBy(desc(schema.visitors.createdAt))

    name = `gala-retreat-callbacks-${stamp}.csv`
    body = csv(
      ['ID', 'Received', 'Name', 'Phone', 'Asked from', 'Source', 'Device',
       'City', 'Country', 'Consent given', 'Consent wording'],
      rows.map((r) => [
        r.id, r.createdAt, r.name, r.phone, r.capturedOn, r.source,
        r.device, r.city, r.country, r.consentAt, r.consentText,
      ]),
    )
  } else {
    const rows = await db
      .select()
      .from(schema.enquiries)
      .orderBy(desc(schema.enquiries.createdAt))

    name = `gala-retreat-enquiries-${stamp}.csv`
    body = csv(
      ['ID', 'Received', 'Name', 'Phone', 'Email', 'Occasion', 'Date of interest',
       'Guests', 'Source', 'Message', 'Contact consent', 'Marketing opt-in',
       'Consent given', 'Consent wording'],
      rows.map((r) => [
        r.id, r.createdAt, r.name, r.phone, r.email, r.eventType, r.eventDate,
        r.guests, r.source, r.message, r.contactConsent, r.marketingConsent,
        r.consentAt, r.consentText,
      ]),
    )
  }

  return new NextResponse(`﻿${body}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  })
}
