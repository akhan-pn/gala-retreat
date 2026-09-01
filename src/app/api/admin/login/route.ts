import { NextResponse } from 'next/server'
import { checkPassword, createSession, isConfigured } from '@/lib/auth'

/** Very small in-memory throttle — enough to blunt casual guessing. */
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW = 10 * 60 * 1000
const MAX = 8

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Admin access is not configured on this deployment.' },
      { status: 503 },
    )
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  const record = attempts.get(ip)

  if (record && now - record.first < WINDOW) {
    if (record.count >= MAX) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts. Try again in a few minutes.' },
        { status: 429 },
      )
    }
    record.count += 1
  } else {
    attempts.set(ip, { count: 1, first: now })
  }

  let password = ''
  try {
    password = String(((await request.json()) as { password?: string }).password ?? '')
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 })
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 })
  }

  attempts.delete(ip)
  await createSession()
  return NextResponse.json({ ok: true })
}
