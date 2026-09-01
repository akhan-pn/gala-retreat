export type Occasion = {
  id: string
  name: string
  blurb: string
  image: string
  alt: string
  width: number
  height: number
  /** True while this is a licensed stand-in, not real venue photography. */
  placeholder: true
  /**
   * Six cards with nothing to click is six dead ends. Every card carries its
   * own way into the enquiry, worded for the occasion it sits on.
   */
  cta: { label: string; href: string }
}

/** The occasions strip on the home page — order matters. */
export const occasions: Occasion[] = [
  {
    id: 'wedding',
    name: 'Weddings',
    blurb:
      'Mandap ceremonies on the walled lawn or inside the pillarless hall, for up to 600 guests, from ₹2,99,999.',
    image: '/images/occasions/wedding.jpg',
    alt: 'Hands joined over a brass pot ringed with marigold garlands and copper vessels during a Hindu wedding ritual',
    width: 1800,
    height: 1200,
    placeholder: true,
    cta: { label: 'Check a wedding date', href: '/enquiry' },
  },
  {
    id: 'reception',
    name: 'Receptions',
    blurb:
      'Seated dinners for up to 600 in the air-conditioned hall, or under the open sky with the hall held in reserve.',
    image: '/images/occasions/reception.jpg',
    alt: 'Long tables and wooden chairs set beneath a timber pavilion strung with warm overhead lights at dusk',
    width: 1800,
    height: 1200,
    placeholder: true,
    cta: { label: 'Plan a reception', href: '/enquiry' },
  },
  {
    id: 'sangeet',
    name: 'Sangeet & Haldi',
    blurb:
      'Lawn and stage for the sangeet, haldi and mehndi, with the DJ, the sound and the LED screen already inside the package.',
    image: '/images/occasions/sangeet.jpg',
    alt: 'Guests in yellow outfits dancing outdoors in front of a floral archway at a haldi celebration',
    width: 1800,
    height: 1200,
    placeholder: true,
    cta: { label: 'Book the lawn for a sangeet', href: '/enquiry' },
  },
  {
    id: 'corporate',
    name: 'Corporate Events',
    blurb:
      'Conferences, annual meetings and launches in theatre, classroom or banquet layouts — tell us the format and we will confirm the seated number for it.',
    image: '/images/occasions/corporate.jpg',
    alt: 'Rows of banquet chairs arranged theatre-style facing a stage in a wood-panelled hall',
    width: 1800,
    height: 1200,
    placeholder: true,
    cta: { label: 'Enquire for a conference', href: '/enquiry' },
  },
  {
    id: 'birthday',
    name: 'Birthdays & Milestones',
    blurb:
      'Birthdays, anniversaries and naming ceremonies, indoors or on the lawn, with the same in-house team running the stage, the sound and the decor.',
    image: '/images/occasions/birthday.jpg',
    alt: 'Tiered cake on a mirrored table flanked by gold urns of pink and white flowers beneath a chandelier',
    width: 1800,
    height: 1200,
    placeholder: true,
    cta: { label: 'Enquire about a celebration', href: '/enquiry' },
  },
  {
    id: 'farmstay',
    name: 'Farm Stay',
    blurb:
      'Two premium bedrooms with a pool, garden and play area, in the 11 acres — bookable on its own, with no event attached.',
    image: '/images/occasions/farmstay.jpg',
    alt: 'Wooden bistro tables on a lawn beneath trees hung with warm string lights at twilight',
    width: 1800,
    height: 1200,
    placeholder: true,
    cta: { label: 'Ask about a stay', href: '/enquiry' },
  },
]

export type Moment = {
  src: string
  alt: string
  width: number
  height: number
  /** True while this is a licensed stand-in, not real venue photography. */
  placeholder: true
}

/** Mixed-orientation mosaic on the home page — order matters. */
export const moments: Moment[] = [
  { src: '/images/moments/moment-01.jpg', alt: 'Close view of mehndi-covered hands and red glass bangles against a red and gold embroidered saree', width: 1800, height: 1200, placeholder: true },
  { src: '/images/moments/moment-02.jpg', alt: 'Candles, wine glasses and small posies of gypsophila glowing along a warmly lit dinner table', width: 1800, height: 2700, placeholder: true },
  { src: '/images/moments/moment-03.jpg', alt: 'A deep red floral archway framing the entrance to a sandstone courtyard set with low cushioned seating', width: 1800, height: 2700, placeholder: true },
  { src: '/images/moments/moment-04.jpg', alt: 'A long white banquet table running into the distance, dressed with tapered candles and a trailing greenery runner', width: 1800, height: 1200, placeholder: true },
  { src: '/images/moments/moment-05.jpg', alt: 'A long outdoor table on a lawn under trees, lined with terracotta chairs and white flowers', width: 1800, height: 1200, placeholder: true },
  { src: '/images/moments/moment-06.jpg', alt: 'A couple dancing on the floor under warm amber stage lighting at an evening reception', width: 1800, height: 2700, placeholder: true },
  { src: '/images/moments/moment-07.jpg', alt: 'Rice spilling from a toppled brass vessel across a floor strewn with marigold petals during a threshold ritual', width: 1800, height: 1200, placeholder: true },
  { src: '/images/moments/moment-08.jpg', alt: 'A long wooden table set for dinner in a brick-walled hall lit by warm uplighting', width: 1800, height: 1202, placeholder: true },
]
