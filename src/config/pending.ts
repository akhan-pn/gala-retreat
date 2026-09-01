/**
 * Values that are still assumptions, not confirmed by the client.
 * `npm run check:config` reads this list and refuses a production build
 * while anything here is unresolved. Delete an entry once it is confirmed.
 */
export const pending: { key: string; current: string; needed: string }[] = [
  {
    key: 'site.url',
    current: 'https://galaretreat.in',
    needed:
      'This domain DOES NOT RESOLVE — it was an assumption, not a fact. Register it or ' +
      'confirm the real one before launch. Currently live at gala-retreat.vercel.app.',
  },
  {
    key: 'geography',
    current: 'Copy claimed the venue is on the WESTERN side of Hyderabad, near Gachibowli',
    needed:
      'WRONG, and corrected. Ramdas Pally at 501510 is in Ibrahimpatnam mandal — ' +
      'SOUTH-EAST Hyderabad, near Ramoji Film City and Hayathnagar. Gachibowli and the ' +
      'Financial District are 45-60km away across the whole city. Confirm the exact ' +
      'address and get a real measured drive time from the client before restating any.',
  },
  {
    key: 'about.h1',
    current: '"Eleven acres, forty minutes from the noise."',
    needed:
      'The forty-minute figure was never measured. Confirm a real drive time, from a ' +
      'named starting point, or drop the number.',
  },
  {
    key: 'site.email',
    current: 'bookings@galaretreat.in',
    needed: 'Client has not published an email address; confirm before launch.',
  },
  {
    key: 'site.address.mapsUrl',
    current: 'Google Maps search query',
    needed: 'Replace with the Google Business Profile share link from their IG bio.',
  },
  {
    key: 'site.hours',
    current: 'Assumed 10:00–19:00 site visits',
    needed: 'Confirm real visiting hours with the client.',
  },
  {
    key: 'images/*',
    current: 'Licensed Pexels stand-ins',
    needed: 'Swap for real venue photography — see docs/shot-list.md.',
  },
]
