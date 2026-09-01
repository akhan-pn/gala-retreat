import type { MetadataRoute } from 'next'
import { isIndexableEnvironment, siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // Preview and local builds serve the same copy on a different host. Letting
  // one be indexed puts a duplicate of the whole site in the index, pointed at
  // a canonical it does not own.
  if (!isIndexableEnvironment) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
