/**
 * Coarse location from edge headers. City-level at best, and only read on
 * requests the visitor has already consented to. The IP itself is never
 * stored or logged.
 */
export function resolveGeo(headers: Headers) {
  const city =
    headers.get('x-vercel-ip-city') ?? headers.get('cf-ipcity') ?? null
  const country =
    headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry') ?? null

  return {
    // Vercel percent-encodes city names such as "New%20Delhi".
    city: city ? safeDecode(city).slice(0, 80) : null,
    country: country && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null,
  }
}

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}
