import type { SpaceId } from './gallery'

export type Space = {
  id: SpaceId
  index: string
  name: string
  capacity: string
  blurb: string
  image: string
  alt: string
  /**
   * Every row needs somewhere to go. On mobile the only link in this section
   * used to be the gallery link inside the desktop-only image panel, so the
   * whole block was a dead end on a phone.
   */
  cta: { label: string; href: string }
}

/**
 * Presented as an editorial index list with hover-revealed imagery —
 * deliberately not a three-column card grid.
 *
 * The package leads the list on purpose: the price is the one thing no
 * competitor in the audit publishes, and burying it below three rows of
 * description gives that advantage away.
 */
export const spaces: Space[] = [
  {
    id: 'events',
    index: '01',
    name: 'The Complete Package',
    capacity: 'From ₹2,99,999',
    blurb:
      'One figure covering the space, the LED screen, the DJ and sound, security, and the stage and decor — briefed to one team rather than seven vendors. Catering is the only line quoted on top, per plate, because the rate follows your menu. Host venue for Grand Diva International, Season 2.',
    image: '/images/events/events-01.jpg',
    alt: 'Floral mandap beneath chandeliers at a Gala Retreat wedding',
    cta: { label: 'Ask what your date costs', href: '/enquiry' },
  },
  {
    id: 'hall',
    index: '02',
    name: 'The Convention Hall',
    capacity: 'Up to 600 seated',
    blurb:
      'Pillarless and air-conditioned, so a 600-seat dinner, a theatre-style conference and a sangeet stage all fit the same room with nothing standing in the sightline. LED wall, sound and stage lighting are already rigged.',
    image: '/images/hall/hall-01.jpg',
    alt: 'Convention hall set with chandeliers and floral centrepieces',
    cta: { label: 'Enquire about the hall', href: '/enquiry' },
  },
  {
    id: 'lawn',
    index: '03',
    name: 'The Open Lawn',
    capacity: 'Up to 600 standing',
    blurb:
      'Level, walled and dark enough at night that string lighting actually reads. Mandap, sangeet stage or a long banquet down the centre — the lawn takes the shape you give it, and the hall is next door when it rains.',
    image: '/images/lawn/lawn-01.jpg',
    alt: 'Open lawn courtyard arranged for a daytime ceremony',
    cta: { label: 'Enquire about the lawn', href: '/enquiry' },
  },
  {
    id: 'farmstay',
    index: '04',
    name: 'The Farm Stay',
    capacity: 'Two premium bedrooms',
    blurb:
      'A private farmhouse with a swimming pool, garden and children’s play area, set in the 11 acres. Families use it to get ready in the morning and to disappear from the party at midnight. Two bedrooms is what there is — a house, not a room block.',
    image: '/images/farmstay/farmstay-01.jpg',
    alt: 'Lantern-lit pool and sandstone courtyard at the farm stay after dark',
    cta: { label: 'Enquire about the farm stay', href: '/enquiry' },
  },
]

export const eventTypes = [
  'Wedding',
  'Reception',
  'Engagement / Sangeet',
  'Corporate / Conference',
  'Birthday / Anniversary',
  'Farm stay booking',
  'Something else',
] as const
