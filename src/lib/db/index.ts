import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export type Db = ReturnType<typeof drizzle<typeof schema>>

let cached: Db | null = null

/**
 * Point the driver at a local Neon HTTP proxy when DATABASE_URL is a local
 * host, so the full stack can run offline against plain Postgres.
 * See README → "Running the database locally". No effect in production.
 */
function configureLocalProxy(url: string) {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return
  }

  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localtest.me')
  if (!isLocal) return

  const port = process.env.NEON_LOCAL_PROXY_PORT ?? '4444'
  neonConfig.fetchEndpoint = `http://${hostname}:${port}/sql`
  neonConfig.useSecureWebSocket = false
  neonConfig.poolQueryViaFetch = true
}

/**
 * Returns the database, or null when DATABASE_URL is not set.
 *
 * Null is a supported state on purpose: the site must still build and render
 * on a fresh clone with no credentials. Callers surface a clear "not
 * configured" message rather than pretending a write succeeded.
 */
export function getDb(): Db | null {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) return null
  configureLocalProxy(url)
  cached = drizzle(neon(url), { schema })
  return cached
}

export { schema }
