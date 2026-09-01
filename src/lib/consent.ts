/**
 * Analytics consent.
 *
 * Nothing about a visitor is recorded until they accept: no visitor id
 * cookie, no pageview row. The choice is kept in a readable first-party
 * cookie so the API can verify it server-side as well, and mirrored into
 * localStorage so the banner does not reappear if cookies are cleared
 * per-session.
 */
export type Consent = 'granted' | 'denied'

export const CONSENT_COOKIE = 'gr_consent'
export const CONSENT_KEY = 'gr-consent'
/**
 * Bump when the wording materially changes, to re-ask.
 * 2: the banner and privacy notice now disclose engagement, event and
 * experiment collection, so a `granted:1` answer no longer covers what is
 * recorded and has to be asked again.
 */
export const CONSENT_VERSION = '2'

export const CONSENT_TEXT =
  'I agree to Gala Retreat holding these details in order to respond to this enquiry.'

export const MARKETING_TEXT =
  'You may also contact me about dates, offers and seasonal announcements.'

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Reads the stored choice, or null when the visitor has not answered yet. */
export function readConsent(): Consent | null {
  const raw = parseCookie(CONSENT_COOKIE) ?? safeLocal()
  if (raw === `granted:${CONSENT_VERSION}` || raw === 'granted') return 'granted'
  if (raw === `denied:${CONSENT_VERSION}` || raw === 'denied') return 'denied'
  return null
}

function safeLocal() {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

export function writeConsent(value: Consent) {
  const encoded = `${value}:${CONSENT_VERSION}`
  const year = 60 * 60 * 24 * 365
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encoded}; Max-Age=${year}; Path=/; SameSite=Lax${secure}`
  try {
    localStorage.setItem(CONSENT_KEY, encoded)
  } catch {}

  // Withdrawing must also drop the identifier already issued. That cookie is
  // httpOnly, so only the server can clear it.
  if (value === 'denied') {
    void fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => {
      // Nothing further is recorded either way — the client gate already holds.
    })
  }
}

/* ------------------------------------------------------------------
   A tiny external store, so components can read consent during render
   without a synchronous setState in an effect.
   ------------------------------------------------------------------ */

export const CONSENT_EVENT = 'gr:consent-changed'

export type ConsentSnapshot = Consent | 'unanswered' | 'unknown'

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange)
  return () => window.removeEventListener(CONSENT_EVENT, onChange)
}

export function getConsentSnapshot(): ConsentSnapshot {
  return readConsent() ?? 'unanswered'
}

/** The server cannot read the visitor's cookie, so it renders nothing. */
export function getConsentServerSnapshot(): ConsentSnapshot {
  return 'unknown'
}

export function notifyConsent(value: Consent) {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

export function clearConsent() {
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {}
}

/** Server-side check against the raw cookie header value. */
export function consentGrantedFromCookie(value: string | undefined) {
  return value === `granted:${CONSENT_VERSION}` || value === 'granted'
}
