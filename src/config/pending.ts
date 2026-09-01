/**
 * Values that are still assumptions, not confirmed by the client.
 * `npm run check:config` reads this list and refuses a production build
 * while anything here is unresolved. Delete an entry once it is confirmed.
 */
export const pending: { key: string; current: string; needed: string }[] = [
  {
    key: 'site.url',
    current: 'https://galaretreat.in',
    needed: 'Confirm the registered domain (Kickoff checklist §4).',
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
