import { cookies } from 'next/headers'

const COOKIE = 'gr_admin'
const MAX_AGE = 60 * 60 * 12 // 12 hours

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? ''
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return Buffer.from(b).toString('base64url')
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  )
  return b64url(mac)
}

/** Constant-time string compare, so a wrong password leaks no timing signal. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function isConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret())
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(input, expected)
}

export async function createSession() {
  const expires = Date.now() + MAX_AGE * 1000
  const payload = String(expires)
  const token = `${payload}.${await sign(payload)}`
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function isAuthed() {
  if (!isConfigured()) return false
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return false
  const [payload, mac] = token.split('.')
  if (!payload || !mac) return false
  if (!safeEqual(mac, await sign(payload))) return false
  return Number(payload) > Date.now()
}
