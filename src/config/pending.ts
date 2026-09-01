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
    current:
      'Corrected: the copy now places the venue SOUTH-EAST of Hyderabad, off the ' +
      'Nagarjuna Sagar road past Ramoji Film City, nearest LB Nagar and Dilsukhnagar.',
    needed:
      'Confirm the exact address and which ORR exit guests should use. The earlier ' +
      'copy wrongly claimed the western side near Gachibowli, which is 45-60km away ' +
      'across the whole city; the correction is built from pincode research, not from ' +
      'the client, so it still needs their sign-off.',
  },
  {
    key: 'drive-time',
    current: 'No drive time is quoted anywhere. The about H1 no longer claims forty minutes.',
    needed:
      'Measure the real drive from two named origins — LB Nagar and Dilsukhnagar are ' +
      'the honest ones — and put a real number on the page. Distance is this venue\u2019s ' +
      'primary objection, and a measured figure is worth more than the hedge standing ' +
      'in for it.',
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
