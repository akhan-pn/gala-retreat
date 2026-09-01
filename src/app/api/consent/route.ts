import { NextResponse } from 'next/server'

/**
 * Records a consent decision server-side.
 *
 * This endpoint exists for one reason the client cannot handle alone: the
 * visitor id is an httpOnly cookie, so JavaScript is unable to delete it.
 * Withdrawing consent has to clear it from the server.
 */
export async function POST(request: Request) {
  let value: unknown
  try {
    value = (await request.json())?.value
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (value !== 'granted' && value !== 'denied') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true, value })

  if (value === 'denied') {
    // Drop the identifier we previously issued.
    response.cookies.set('gr_vid', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    })
  }

  return response
}
