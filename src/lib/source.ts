/**
 * Collapses a referrer URL (or explicit utm_source) into one of a handful of
 * traffic sources the client will actually recognise on the dashboard.
 */
export function resolveSource(referrer: string | null, utm?: string | null) {
  if (utm) return utm.toLowerCase().slice(0, 60)
  if (!referrer) return 'direct'

  let host: string
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return 'direct'
  }

  if (host.includes('instagram')) return 'instagram'
  if (host.includes('whatsapp') || host === 'wa.me') return 'whatsapp'
  if (host.includes('facebook') || host === 'fb.com') return 'facebook'
  if (host.includes('google')) return 'google'
  if (host.includes('bing') || host.includes('duckduckgo')) return 'search'
  if (host.includes('youtube')) return 'youtube'
  if (host.includes('justdial') || host.includes('weddingwire') || host.includes('wedmegood'))
    return 'listings'
  return host.slice(0, 60)
}

export function resolveDevice(ua: string | null) {
  if (!ua) return 'unknown'
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile'
  return 'desktop'
}

export const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct / typed in',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  google: 'Google',
  search: 'Other search',
  youtube: 'YouTube',
  listings: 'Wedding listings',
}

/** Long enough for any origin plus a real path, which is all we keep. */
const MAX_REFERRER_LENGTH = 500

/**
 * Reduces a referrer to origin and path before it is stored.
 *
 * Same reasoning as parsePath in lib/behaviour: a query string or fragment
 * carries search terms, campaign identifiers and — on a same-site hop —
 * whatever was in the previous page's URL, none of which we asked for.
 */
export function sanitiseReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return null

  let url: URL
  try {
    url = new URL(referrer)
  } catch {
    // Not a URL, so nothing in it can be shown to be free of typed text.
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  // url.origin also drops any credentials the referring URL carried.
  return `${url.origin}${url.pathname}`.slice(0, MAX_REFERRER_LENGTH)
}
