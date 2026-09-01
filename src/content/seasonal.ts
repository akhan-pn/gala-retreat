/**
 * Seasonal banner slot (Agreement cl. 1).
 * The client swaps these three strings — or sets `active: false` — without
 * touching any other file. Post-launch refreshes are the cl. 9 retainer.
 */
export const seasonal = {
  active: true,
  eyebrow: 'Wedding season 2026—27',
  headline: 'Dates from November are opening now.',
  body: 'Muhurtham dates go first, and the lawn and hall are usually booked as a pair — packages start at ₹2,99,999, with the LED screen, the DJ and security inside that figure. Send us the date and a guest count and we will hold it while you decide.',
  cta: { label: 'Check your date', href: '/enquiry' },
  image: '/images/lawn/lawn-04.jpg',
  alt: 'Marigold garland archway at the lawn entrance',
} as const
