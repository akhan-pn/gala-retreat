export type SpaceId = 'hall' | 'lawn' | 'farmstay' | 'events'

export type Photo = {
  src: string
  alt: string
  space: SpaceId
  width: number
  height: number
  /** True while this is a licensed stand-in, not real venue photography. */
  placeholder?: boolean
}

/** Filter tabs for the gallery — order matters. */
export const spaceFilters: { id: SpaceId | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'hall', label: 'Convention Hall' },
  { id: 'lawn', label: 'The Lawn' },
  { id: 'farmstay', label: 'Farm Stay' },
  { id: 'events', label: 'Events' },
]

export const heroSlides: Photo[] = [
  {
    src: '/images/hero/hero-01.jpg',
    alt: 'Wedding mandap dressed in red and gold florals under a lit canopy at Gala Retreat',
    space: 'events',
    width: 3200,
    height: 2133,
    placeholder: true,
  },
  {
    src: '/images/hero/hero-02.jpg',
    alt: 'Sandstone courtyard at dusk, laid out for an evening reception',
    space: 'lawn',
    width: 3200,
    height: 2133,
    placeholder: true,
  },
  {
    src: '/images/hero/hero-03.jpg',
    alt: 'Poolside ceremony setup framed by floral arrangements at Gala Retreat',
    space: 'farmstay',
    width: 3200,
    height: 2133,
    placeholder: true,
  },
  {
    src: '/images/hero/hero-04.jpg',
    alt: 'Guests dancing under warm evening lighting at a Gala Retreat celebration',
    space: 'events',
    width: 3200,
    height: 2133,
    placeholder: true,
  },
]

export const gallery: Photo[] = [
  // Convention Hall
  { src: '/images/hall/hall-01.jpg', alt: 'Convention hall set with chandeliers and floral centrepieces', space: 'hall', width: 1800, height: 1200, placeholder: true },
  { src: '/images/hall/hall-02.jpg', alt: 'Ballroom stage lighting and crystal chandeliers before an event', space: 'hall', width: 1800, height: 1200, placeholder: true },
  { src: '/images/hall/hall-03.jpg', alt: 'Grand banquet hall interior with gold drape and chandelier detail', space: 'hall', width: 1800, height: 2700, placeholder: true },
  { src: '/images/hall/hall-04.jpg', alt: 'Indoor wedding reception in full flow under warm ornate lighting', space: 'hall', width: 1800, height: 1200, placeholder: true },
  { src: '/images/hall/hall-05.jpg', alt: 'Round tables laid across the convention hall for a seated dinner', space: 'hall', width: 1800, height: 1202, placeholder: true },
  { src: '/images/hall/hall-06.jpg', alt: 'The convention hall in its clear-floor configuration', space: 'hall', width: 1800, height: 1200, placeholder: true },

  // The Lawn
  { src: '/images/lawn/lawn-01.jpg', alt: 'Open lawn courtyard arranged for a daytime ceremony', space: 'lawn', width: 3200, height: 2133, placeholder: true },
  { src: '/images/lawn/lawn-02.jpg', alt: 'White chairs and pastel drapes set out across the lawn', space: 'lawn', width: 1800, height: 1200, placeholder: true },
  { src: '/images/lawn/lawn-03.jpg', alt: 'Ornate open-air mandap built on the lawn', space: 'lawn', width: 1800, height: 2700, placeholder: true },
  { src: '/images/lawn/lawn-04.jpg', alt: 'Marigold garland archway at the lawn entrance', space: 'lawn', width: 1800, height: 2700, placeholder: true },
  { src: '/images/lawn/lawn-05.jpg', alt: 'Pink floral decor and traditional hand fans on the lawn', space: 'lawn', width: 1800, height: 1200, placeholder: true },
  { src: '/images/lawn/lawn-06.jpg', alt: 'Overhead view of the lawn dressed for a wedding', space: 'lawn', width: 1800, height: 1200, placeholder: true },

  // Farm Stay
  { src: '/images/farmstay/farmstay-01.jpg', alt: 'Lantern-lit pool and sandstone courtyard at the farm stay after dark', space: 'farmstay', width: 1800, height: 1200, placeholder: true },
  { src: '/images/farmstay/farmstay-02.jpg', alt: 'Pool and garden at dusk on the farm stay grounds', space: 'farmstay', width: 1800, height: 1200, placeholder: true },
  { src: '/images/farmstay/farmstay-03.jpg', alt: 'Warm poolside lighting after dark at the farm stay', space: 'farmstay', width: 1800, height: 2400, placeholder: true },
  { src: '/images/farmstay/farmstay-04.jpg', alt: 'Couple in the garden grounds surrounding the farm stay', space: 'farmstay', width: 1800, height: 2700, placeholder: true },

  // Events
  { src: '/images/events/events-01.jpg', alt: 'Floral mandap beneath chandeliers at a Gala Retreat wedding', space: 'events', width: 3200, height: 2133, placeholder: true },
  { src: '/images/events/events-02.jpg', alt: 'Marigold garlands being hung at the venue entrance', space: 'events', width: 1800, height: 1200, placeholder: true },
  { src: '/images/events/events-03.jpg', alt: 'Reception tables dressed with floral centrepieces', space: 'events', width: 1800, height: 1200, placeholder: true },
  { src: '/images/events/events-04.jpg', alt: 'Detail of the floral styling at an evening celebration', space: 'events', width: 1800, height: 2700, placeholder: true },
  { src: '/images/events/events-05.jpg', alt: 'Grand floral arrangements framing the ceremony stage', space: 'events', width: 1800, height: 1200, placeholder: true },
  { src: '/images/events/events-06.jpg', alt: 'Bride in a red lehenga crossing the dressed venue floor', space: 'events', width: 1800, height: 1200, placeholder: true },
]
