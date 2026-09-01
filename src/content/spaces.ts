import type { SpaceId } from './gallery'

export type Space = {
  id: SpaceId
  index: string
  name: string
  capacity: string
  blurb: string
  image: string
  alt: string
}

/**
 * Presented as an editorial index list with hover-revealed imagery —
 * deliberately not a three-column card grid.
 */
export const spaces: Space[] = [
  {
    id: 'hall',
    index: '01',
    name: 'The Convention Hall',
    capacity: 'Up to 600 seated',
    blurb:
      'A pillarless, air-conditioned hall that takes a full wedding reception or a corporate conference without rearranging the building around it. LED wall, sound and stage lighting are already rigged.',
    image: '/images/hall/hall-01.jpg',
    alt: 'Convention hall set with chandeliers and floral centrepieces',
  },
  {
    id: 'lawn',
    index: '02',
    name: 'The Open Lawn',
    capacity: 'Up to 600 standing',
    blurb:
      'Level, walled and dark enough at night that string lighting actually reads. Mandap, sangeet stage or a long banquet down the centre — the lawn takes the shape you give it.',
    image: '/images/lawn/lawn-01.jpg',
    alt: 'Open lawn courtyard arranged for a daytime ceremony',
  },
  {
    id: 'farmstay',
    index: '03',
    name: 'The Farm Stay',
    capacity: 'Two premium bedrooms',
    blurb:
      'A private farmhouse with a swimming pool, garden and children’s play area. Families use it to get ready in the morning and to disappear from the party at midnight.',
    image: '/images/farmstay/farmstay-01.jpg',
    alt: 'Lantern-lit pool and sandstone courtyard at the farm stay after dark',
  },
  {
    id: 'events',
    index: '04',
    name: 'Full Event Production',
    capacity: 'Packages from ₹2,99,999',
    blurb:
      'LED screen, DJ, security, decor and catering coordinated in-house, so you brief one team rather than seven vendors. Recently host venue for Grand Diva International, Season 2.',
    image: '/images/events/events-01.jpg',
    alt: 'Floral mandap beneath chandeliers at a Gala Retreat wedding',
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
