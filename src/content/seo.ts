/**
 * Search strategy, expressed as data so page metadata can import it rather
 * than restate it. The reasoning behind every entry — competitor titles,
 * locality checks, schema recommendations — lives in `docs/reference-and-seo.md`.
 *
 * Two things to know before wiring this in:
 *
 * 1. `title` is the FULL rendered title. The site layout sets a
 *    `%s — Gala Retreat` template, so applying these values needs
 *    `title: { absolute: pageSeo.find(...)!.title }`, not a bare string,
 *    or the brand ends up in the tag twice.
 * 2. `keywords` is not for the `<meta name="keywords">` tag, which Google
 *    has ignored since 2009. It is the brief for the page's copy, headings
 *    and image alt text — the terms the page should be able to answer to.
 */

export type PageSeo = {
  path: string
  /** Full rendered <title>. Kept under 60 characters. */
  title: string
  /** Full meta description. Kept under 155 characters. */
  description: string
  /** One per page, and only one. */
  h1: string
  /** The terms this page is written to satisfy — copy brief, not a meta tag. */
  keywords: string[]
}

/**
 * One entry per route in `src/app/sitemap.ts`.
 *
 * Where the recommended `h1` differs from the line currently on the page,
 * the difference is deliberate and argued in the reference doc. The two
 * that matter: the home H1 currently carries no search term at all, and the
 * about H1 asserts a drive time nobody has measured.
 */
export const pageSeo: PageSeo[] = [
  {
    path: '/',
    title: 'Wedding & Convention Venue in Hyderabad | Gala Retreat',
    description:
      'Pillarless convention hall, open lawn and private farm stay on 11 acres near Hyderabad. Up to 600 guests, packages from ₹2,99,999.',
    h1: 'A wedding and convention venue on eleven quiet acres.',
    keywords: [
      'wedding venues in Hyderabad',
      'convention centre Hyderabad',
      'function halls in Hyderabad',
      'banquet hall with lawn Hyderabad',
      'wedding venue for 600 guests Hyderabad',
    ],
  },
  {
    path: '/about',
    title: 'About Gala Retreat — Venue in Ramdas Pally, Hyderabad',
    description:
      'Eleven acres at Ramdas Pally: how the convention hall, the open lawn and the farm stay work, and why one in-house team runs the whole day.',
    h1: 'Eleven acres on the quiet side of Hyderabad.',
    keywords: [
      'resort with convention hall Hyderabad',
      'pillarless convention hall Hyderabad',
      'farm stay near Hyderabad',
      '11 acre wedding venue Hyderabad',
      'wedding venue Ramdas Pally',
    ],
  },
  {
    path: '/gallery',
    title: 'Gallery — Hall, Lawn & Farm Stay | Gala Retreat',
    description:
      'Photographs of the convention hall, the open lawn, the farm stay and past weddings at Gala Retreat Resort & Convention, Hyderabad.',
    h1: 'Photographs of the hall, the lawn and the farm stay.',
    keywords: [
      'convention hall photos Hyderabad',
      'outdoor wedding venue Hyderabad',
      'wedding lawn Hyderabad',
      'farmhouse wedding venue Hyderabad',
      'mandap setup Hyderabad',
    ],
  },
  {
    path: '/enquiry',
    title: 'Check Availability & Pricing | Gala Retreat Hyderabad',
    description:
      'Tell us your date, occasion and guest count. We come back with what is free and what it costs — packages from ₹2,99,999 for up to 600 guests.',
    h1: 'Check a date and get a price.',
    keywords: [
      'wedding venue Hyderabad price',
      'convention hall booking Hyderabad',
      'all inclusive wedding package Hyderabad',
      'banquet hall availability Hyderabad',
      'wedding venue enquiry Hyderabad',
    ],
  },
  {
    path: '/contact',
    title: 'Contact & Directions | Gala Retreat, Ramdas Pally',
    description:
      'Gala Retreat Resort & Convention, Ramdas Pally, Hyderabad 501510. Call, message on WhatsApp, or open the map for directions to the venue.',
    h1: 'Ramdas Pally, and someone always picks up.',
    keywords: [
      'Gala Retreat Ramdas Pally',
      'wedding venue near Ramoji Film City',
      'function hall Nagarjuna Sagar Road',
      'convention hall near ORR Bongulur exit',
      'marriage hall Ibrahimpatnam',
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Gala Retreat',
    description:
      'What Gala Retreat Resort & Convention collects when you use this website, why it is kept, and how to change your mind about it.',
    h1: 'What we collect, in plain words.',
    // Deliberately thin. This page exists for trust and for the consent
    // banner to link to; it should not be optimised for anything.
    keywords: ['Gala Retreat privacy policy'],
  },
]

/** Convenience lookup, so callers do not repeat the `.find()` every time. */
export function seoFor(path: string): PageSeo | undefined {
  return pageSeo.find((p) => p.path === path)
}

export type KeywordIntent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'local'

/**
 * The demand map. Terms are grouped by the job the searcher is doing, not by
 * page, because several clusters are served by more than one page.
 *
 * No search volumes are recorded anywhere in this file. Nothing here was run
 * through a keyword tool with real data, and inventing numbers would be worse
 * than having none. Ordering inside each cluster is a judgement about
 * relevance to this venue, not measured demand.
 */
export const keywordClusters: {
  cluster: string
  terms: string[]
  intent: KeywordIntent
}[] = [
  {
    cluster: 'Head terms',
    intent: 'commercial',
    terms: [
      'wedding venues in Hyderabad',
      'convention centre Hyderabad',
      'convention hall Hyderabad',
      'function halls in Hyderabad',
      'banquet hall Hyderabad',
      'marriage hall Hyderabad',
      'kalyana mandapam Hyderabad',
      'wedding halls in Hyderabad',
    ],
  },
  {
    cluster: 'Space and capacity',
    intent: 'commercial',
    terms: [
      'pillarless convention hall Hyderabad',
      'banquet hall with lawn Hyderabad',
      'convention hall and lawn Hyderabad',
      'outdoor wedding venue Hyderabad 500 guests',
      'wedding venue for 600 guests Hyderabad',
      'AC function hall Hyderabad',
      'open lawn wedding venue Hyderabad',
      'wedding venue with rooms Hyderabad',
    ],
  },
  {
    cluster: 'Farm, resort and destination',
    intent: 'commercial',
    terms: [
      'farm house for wedding near Hyderabad',
      'farmhouse wedding venue Hyderabad',
      'resort wedding near Hyderabad',
      'destination wedding near Hyderabad',
      'resort with convention hall Hyderabad',
      'farm stay near Hyderabad',
      'farmhouse with swimming pool near Hyderabad',
    ],
  },
  {
    cluster: 'Locality — south-east Hyderabad',
    intent: 'local',
    terms: [
      'function halls Nagarjuna Sagar Road',
      'convention hall LB Nagar',
      'function hall Hayathnagar',
      'marriage hall Ibrahimpatnam',
      'banquet hall Turkayamjal',
      'wedding venue near Ramoji Film City',
      'function hall near Sanghi Temple',
      'convention hall near ORR Bongulur exit',
      'wedding venue Adibatla',
      'function hall Ramdas Pally',
    ],
  },
  {
    cluster: 'Occasion',
    intent: 'commercial',
    terms: [
      'sangeet venue Hyderabad',
      'reception hall Hyderabad',
      'engagement venue Hyderabad',
      'haldi and mehendi venue Hyderabad',
      'birthday party hall Hyderabad',
      'corporate offsite venue Hyderabad',
      'conference hall Hyderabad',
      'team outing resort near Hyderabad',
      'muhurtham hall Hyderabad',
    ],
  },
  {
    cluster: 'Price and package',
    intent: 'transactional',
    terms: [
      'wedding venue Hyderabad price',
      'convention hall cost Hyderabad',
      'all inclusive wedding package Hyderabad',
      'wedding package Hyderabad 3 lakhs',
      'banquet hall booking Hyderabad',
      'convention hall rent per day Hyderabad',
      'resort wedding near Hyderabad price',
    ],
  },
  {
    cluster: 'Research and planning',
    intent: 'informational',
    terms: [
      'how much does a wedding venue cost in Hyderabad',
      'how far in advance to book a wedding venue Hyderabad',
      'indoor or outdoor wedding Hyderabad weather',
      'what is a pillarless hall',
      'wedding venue checklist India',
      'muhurtham dates wedding venue booking',
    ],
  },
  {
    cluster: 'Brand',
    intent: 'local',
    terms: [
      'Gala Retreat Hyderabad',
      'Gala Retreat Resort & Convention',
      'Gala Retreat Ramdas Pally',
      'Gala Retreat convention hall',
    ],
  },
]

/**
 * Questions worth answering in full sentences on the page.
 *
 * Google restricted FAQ rich results to government and health sites in 2023,
 * so `FAQPage` markup here will not win a SERP accordion. It is still worth
 * doing: these are the passages that get lifted into AI Overviews, assistant
 * answers and People Also Ask, and answering them plainly shortens the
 * phone call that follows.
 *
 * Six of these are already answered in `src/content/home-sections.ts`. The
 * rest are gaps.
 */
export const faqTargets: { question: string; why: string }[] = [
  {
    question: 'How many guests can Gala Retreat hold?',
    why: 'Capacity is the first filter every enquirer applies, and "600" is a number the aggregator listings expose as a facet. Answering it in one sentence near the top of the page is the single highest-value snippet on the site. Already answered in home-sections.',
  },
  {
    question: 'How much does a wedding at Gala Retreat cost?',
    why: 'Price is the second filter and almost every Hyderabad venue hides it behind a form. Publishing the ₹2,99,999 starting figure with what it includes is a real differentiator and matches the "resort wedding near Hyderabad price" query directly.',
  },
  {
    question: 'How far is Gala Retreat from Hyderabad, and how do we get there?',
    why: 'The venue is on the south-east edge, off the Nagarjuna Sagar road near the ORR Bongulur exit. Guests search drive time before they search anything else. This answer needs a measured figure, not an estimate.',
  },
  {
    question: 'Is the convention hall pillarless and air-conditioned?',
    why: '"Pillarless convention hall" is a venue-type label the listing sites use as a filter, and it decides whether a 600-seat dinner actually works. Naming it explicitly matches how the market shops.',
  },
  {
    question: 'Can we book the hall and the lawn together?',
    why: 'Most 600-guest weddings need both — ceremony outside, dinner inside, and a rain plan. "Convention hall and lawn" is a distinct search, and the pairing is this venue\'s actual product.',
  },
  {
    question: 'Can we bring our own caterer or decorator?',
    why: 'The commonest objection to an all-inclusive package, and the one most likely to end an enquiry silently. Answering it honestly on the page saves the call. Already answered in home-sections.',
  },
  {
    question: 'Is there parking, and how many cars?',
    why: 'A 600-guest event in outer Hyderabad lives or dies on parking. The current answer says parking is on the property but gives no car count — a number here would beat every competitor who says "ample parking".',
  },
  {
    question: 'Can the farm stay be booked without an event?',
    why: 'A separate audience with separate seasonality — weekend family stays fill dates that weddings never would. It also opens the "farmhouse with swimming pool near Hyderabad" cluster, which the event pages cannot reach. Already answered in home-sections.',
  },
  {
    question: 'Do you host corporate offsites and conferences?',
    why: 'An LED wall, rigged sound and 11 acres is a conference product as much as a wedding one, and Adibatla, Pocharam and Uppal put large employers on this side of the ORR. Weekday demand against weekend demand.',
  },
  {
    question: 'How far ahead should we book for the wedding season?',
    why: 'Creates urgency without a countdown timer, and captures the November-to-February muhurtham planning searches that run months ahead of the booking. Already answered in home-sections.',
  },
]
