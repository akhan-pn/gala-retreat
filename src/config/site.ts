/**
 * Single source of truth for every client-specific value on the site.
 * Anything here that is still a guess is registered in `./pending.ts`
 * so `npm run check:config` can fail the build before it reaches production.
 */

export const site = {
  name: 'Gala Retreat',
  legalName: 'Gala Retreat Resort & Convention',
  tagline: 'Where luxury meets celebration',

  /** Update once the real domain is registered (Agreement cl. 8). */
  url: 'https://galaretreat.in',

  description:
    'Gala Retreat Resort & Convention in Ramdas Pally, Hyderabad — a convention hall, open lawn and private farm stay for weddings, receptions and corporate events of up to 600 guests.',

  address: {
    line1: 'Ramdas Pally',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '501510',
    country: 'IN',
    /** Honest search link until the client shares their Google Business URL. */
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Gala+Retreat+Resort+and+Convention+Ramdas+Pally+Hyderabad',
  },

  /** WhatsApp enquiries — digits only, country code, no `+`. */
  whatsapp: {
    number: '919848819444',
    display: '+91 98488 19444',
    label: 'Bookings',
  },

  /** Call-now — reception line. */
  phone: {
    number: '+919032807333',
    display: '+91 90328 07333',
    label: 'Reception',
  },

  email: 'bookings@galaretreat.in',

  social: {
    instagram: 'https://www.instagram.com/gala_retreat/',
  },

  hours: [
    { days: 'Monday — Sunday', time: 'Site visits 10:00 — 19:00' },
    { days: 'Events', time: 'By appointment, day and evening' },
  ],

  capacity: 600,
  acres: 11,
} as const

/** Pre-filled WhatsApp deep link. */
export function whatsappLink(
  message = `Hi ${site.name}, I'd like to enquire about hosting an event at your venue.`,
) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`
}
