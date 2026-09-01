import type { MetadataRoute } from 'next'
import { gallery, heroSlides } from '@/content/gallery'
import { moments, occasions } from '@/content/occasions'
import { seasonal } from '@/content/seasonal'
import { absoluteUrl, siteUrl } from '@/lib/seo'

/**
 * `lastmod` has to be a claim, not a clock. The previous version used
 * `new Date()`, so every crawl saw six pages modified the instant it asked —
 * which Google treats as noise and then ignores, taking the honest signals
 * with it. These are content-freeze dates: bump the one whose copy you
 * actually changed.
 */
const LAST_MODIFIED: Record<string, string> = {
  '/': '2026-09-02',
  '/about': '2026-09-01',
  '/gallery': '2026-09-01',
  '/enquiry': '2026-09-01',
  '/contact': '2026-09-01',
  '/privacy': '2026-09-01',
}

/**
 * The photographs each page genuinely renders, as absolute URLs. Image search
 * is a real entry point for a venue — people shop mandaps and lawns visually —
 * and the crawler will not find these behind a carousel or a filter tab.
 */
const IMAGES: Record<string, string[]> = {
  '/': [
    ...new Set([
      ...heroSlides.map((p) => p.src),
      ...occasions.map((o) => o.image),
      ...moments.map((m) => m.src),
      seasonal.image,
      '/images/events/events-01.jpg',
    ]),
  ],
  '/about': ['/images/lawn/lawn-01.jpg'],
  '/gallery': gallery.map((p) => p.src),
  '/enquiry': ['/images/farmstay/farmstay-01.jpg'],
  '/contact': ['/images/hall/hall-01.jpg'],
  '/privacy': [],
}

const ROUTES: {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/enquiry', changeFrequency: 'yearly', priority: 0.9 },
  { path: '/gallery', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/about', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changeFrequency, priority }) => {
    const images = (IMAGES[path] ?? []).map((src) => `${siteUrl}${src}`)

    return {
      url: absoluteUrl(path),
      lastModified: LAST_MODIFIED[path],
      changeFrequency,
      priority,
      // An empty <image:image> block helps nobody.
      ...(images.length > 0 ? { images } : {}),
    }
  })
}
