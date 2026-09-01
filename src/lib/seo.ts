import type { Metadata } from 'next'
import { site } from '@/config/site'
import { gallery, heroSlides, type Photo } from '@/content/gallery'
import { faqs } from '@/content/home-sections'
import { seoFor } from '@/content/seo'

/**
 * Metadata and JSON-LD, built once from `src/content/seo.ts` so a page never
 * restates its own title.
 *
 * Why the origin is resolved here rather than read from `site.url`:
 * `src/config/pending.ts` records that `galaretreat.in` does not resolve — it
 * was an assumption. Every canonical, `og:url`, sitemap `<loc>` and schema
 * `url` built from it points at a dead host, which is the one thing on this
 * site actively costing indexing. Until the domain is registered the origin
 * comes from the environment, falling back to the host the site is actually
 * reachable on. `site.url` stays untouched for the config check to keep
 * failing against.
 */

/** The host the site is genuinely served from today. */
const LIVE_HOST = 'gala-retreat.vercel.app'

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function resolveOrigin(): string {
  // Set this the day the real domain resolves; nothing else needs changing.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return stripTrailingSlash(explicit)

  // Vercel exposes the *production* alias even on preview builds, which is
  // what a canonical should point at — never the per-deployment URL.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) return `https://${production}`

  return `https://${LIVE_HOST}`
}

/** Absolute origin, no trailing slash. */
export const siteUrl = resolveOrigin()

/**
 * Preview and development builds must never be indexed — they serve the same
 * copy on a different host, which is duplicate content pointed at a canonical
 * they do not own.
 */
export const isIndexableEnvironment: boolean = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production'

/** `/about` → `https://host/about`; `/` → `https://host/`. */
export function absoluteUrl(path: string): string {
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`
}

/* ────────────────────────────────────────────────────────────────────────
   Imagery
   ──────────────────────────────────────────────────────────────────────── */

const PHOTOS: readonly Photo[] = [...heroSlides, ...gallery]

/**
 * The share image for each route, chosen from a photograph the page actually
 * shows, so the card is not a stranger to the page behind it.
 */
const SHARE_IMAGE: Record<string, string> = {
  '/': '/images/hero/hero-01.jpg',
  '/about': '/images/lawn/lawn-01.jpg',
  '/gallery': '/images/hall/hall-01.jpg',
  '/enquiry': '/images/farmstay/farmstay-01.jpg',
  '/contact': '/images/hall/hall-01.jpg',
  '/privacy': '/images/hero/hero-01.jpg',
}

function photoFor(path: string): Photo {
  const src = SHARE_IMAGE[path] ?? SHARE_IMAGE['/']
  const found = PHOTOS.find((p) => p.src === src)
  if (!found) {
    throw new Error(`No photo manifest entry for ${src} — check src/content/gallery.ts`)
  }
  return found
}

/* ────────────────────────────────────────────────────────────────────────
   Page metadata
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Everything a route's `metadata` export needs.
 *
 * Titles come back as `title.absolute` because the layout sets a
 * `%s — Gala Retreat` template and the researched titles already carry the
 * brand; a bare string would print it twice. Canonical and `og:url` are
 * absolute rather than relative so they resolve against this file's origin
 * and not the layout's `metadataBase`.
 */
export function pageMetadata(path: string): Metadata {
  const entry = seoFor(path)
  if (!entry) {
    throw new Error(`No SEO entry for ${path} — add one to src/content/seo.ts`)
  }

  const url = absoluteUrl(path)
  const photo = photoFor(path)
  const image = `${siteUrl}${photo.src}`

  return {
    title: { absolute: entry.title },
    description: entry.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url,
      siteName: site.legalName,
      title: entry.title,
      description: entry.description,
      images: [
        { url: image, width: photo.width, height: photo.height, alt: photo.alt },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: entry.description,
      images: [image],
    },
    robots: isIndexableEnvironment
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}

/* ────────────────────────────────────────────────────────────────────────
   JSON-LD
   ──────────────────────────────────────────────────────────────────────── */

export type JsonLd = Record<string, unknown>

const ORGANIZATION_ID = `${siteUrl}/#organization`
const VENUE_ID = `${siteUrl}/#venue`
const WEBSITE_ID = `${siteUrl}/#website`
const PACKAGE_ID = `${siteUrl}/#package`

const postalAddress: JsonLd = {
  '@type': 'PostalAddress',
  streetAddress: site.address.line1,
  addressLocality: site.address.city,
  addressRegion: site.address.state,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
}

/**
 * Only features the site actually claims in copy. No opening hours and no
 * coordinates: `pending.ts` has the hours down as an assumption and nobody
 * has supplied a lat/long, and an invented one on a local business listing is
 * worse than a missing one.
 */
const AMENITIES: string[] = [
  'Pillarless air-conditioned convention hall',
  'Open lawn',
  'Farm stay with two premium bedrooms',
  'Swimming pool',
  'On-site parking',
  'LED screen, DJ and stage lighting',
]

function venueNode(): JsonLd {
  return {
    '@type': ['Resort', 'EventVenue'],
    '@id': VENUE_ID,
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: `${siteUrl}/`,
    telephone: site.phone.number,
    email: site.email,
    address: postalAddress,
    hasMap: site.address.mapsUrl,
    sameAs: [site.social.instagram],
    maximumAttendeeCapacity: site.capacity,
    image: [
      `${siteUrl}/images/hero/hero-01.jpg`,
      `${siteUrl}/images/hall/hall-01.jpg`,
      `${siteUrl}/images/lawn/lawn-01.jpg`,
      `${siteUrl}/images/farmstay/farmstay-01.jpg`,
    ],
    amenityFeature: AMENITIES.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
  }
}

function organizationNode(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.legalName,
    alternateName: site.name,
    url: `${siteUrl}/`,
    sameAs: [site.social.instagram],
    location: { '@id': VENUE_ID },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'reservations',
        telephone: site.phone.number,
        email: site.email,
        areaServed: site.address.country,
      },
    ],
  }
}

function webSiteNode(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${siteUrl}/`,
    name: site.legalName,
    description: site.description,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANIZATION_ID },
  }
}

/**
 * The advertised package, as the one commercial claim the home page makes in
 * public. `minPrice` rather than `price` because the page says "from" — an
 * exact `price` would promise a figure nobody quoted.
 */
function serviceNode(): JsonLd {
  return {
    '@type': 'Service',
    '@id': PACKAGE_ID,
    name: 'Complete event package',
    serviceType: 'Wedding and event venue package',
    description:
      'The hall, the lawn or both, with LED screen, DJ and sound, security through the event, and stage and floral decor from the in-house team. Catering is quoted separately, per plate.',
    provider: { '@id': VENUE_ID },
    areaServed: { '@type': 'City', name: site.address.city },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl('/enquiry'),
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: 299999,
        priceCurrency: 'INR',
      },
    },
  }
}

/** Nav labels, so a crumb never disagrees with the link that produced it. */
const CRUMB_LABEL: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/gallery': 'Gallery',
  '/enquiry': 'Enquiry',
  '/contact': 'Contact',
  '/privacy': 'Privacy',
}

function breadcrumbNode(path: string): JsonLd {
  const trail = path === '/' ? ['/'] : ['/', path]

  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: trail.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: CRUMB_LABEL[p] ?? site.name,
      item: absoluteUrl(p),
    })),
  }
}

/**
 * Verbatim from `src/content/home-sections.ts`, never re-worded here — the
 * whole point of FAQ markup is that the answer a machine lifts is the answer
 * a visitor reads.
 */
function faqQuestions(): JsonLd[] {
  return faqs.map((faq) => ({
    '@type': 'Question',
    '@id': `${absoluteUrl('/')}#faq-${slug(faq.q)}`,
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  }))
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Every photograph the gallery browser actually renders. */
function galleryImages(): JsonLd[] {
  return gallery.map((photo) => ({
    '@type': 'ImageObject',
    '@id': `${siteUrl}${photo.src}#image`,
    contentUrl: `${siteUrl}${photo.src}`,
    url: `${siteUrl}${photo.src}`,
    width: photo.width,
    height: photo.height,
    caption: photo.alt,
    representativeOfPage: false,
  }))
}

/**
 * The most specific WebPage subtype each route honestly is. `/` is also a
 * FAQPage rather than carrying a second node for the same URL, which is how
 * the dual type is meant to be used.
 */
function pageTypes(path: string): string | string[] {
  switch (path) {
    case '/':
      return ['WebPage', 'FAQPage']
    case '/about':
      return 'AboutPage'
    case '/gallery':
      return 'ImageGallery'
    case '/enquiry':
    case '/contact':
      return 'ContactPage'
    default:
      return 'WebPage'
  }
}

/**
 * The `@graph` for one route: the shared business and site nodes, then the
 * page node and whatever that page genuinely carries.
 *
 * Every node here has to be true of the rendered page. Nothing invents an
 * aggregateRating, a review, a drive time or an opening hour, because the
 * site makes none of those claims and structured data that outruns the page
 * is a manual action waiting to happen.
 */
export function graphFor(path: string): JsonLd {
  const entry = seoFor(path)
  if (!entry) {
    throw new Error(`No SEO entry for ${path} — add one to src/content/seo.ts`)
  }

  const url = absoluteUrl(path)
  const photo = photoFor(path)
  const image = `${siteUrl}${photo.src}`

  const primaryImage: JsonLd = {
    '@type': 'ImageObject',
    '@id': `${url}#primaryimage`,
    contentUrl: image,
    url: image,
    width: photo.width,
    height: photo.height,
    caption: photo.alt,
  }

  const page: JsonLd = {
    '@type': pageTypes(path),
    '@id': `${url}#webpage`,
    url,
    name: entry.title,
    description: entry.description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': VENUE_ID },
    primaryImageOfPage: { '@id': `${url}#primaryimage` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
  }

  if (path === '/') {
    page.mainEntity = faqQuestions()
  }

  if (path === '/gallery') {
    page.associatedMedia = galleryImages()
  }

  const graph: JsonLd[] = [
    organizationNode(),
    venueNode(),
    webSiteNode(),
    page,
    primaryImage,
    breadcrumbNode(path),
  ]

  // The ₹2,99,999 figure is printed on the home page and nowhere else, so it
  // is only claimed there.
  if (path === '/') graph.push(serviceNode())

  return { '@context': 'https://schema.org', '@graph': graph }
}

/**
 * Serialised for `dangerouslySetInnerHTML`. `<` is escaped so a stray angle
 * bracket in copy can never close the script tag early.
 */
export function jsonLdString(value: JsonLd): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
