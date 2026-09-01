/**
 * Home-page copy: the package breakdown, the three-step planning strip,
 * and the FAQ block.
 *
 * Drafted from the client’s Instagram (@gala_retreat) and the signed project
 * documents. Anything not stated in those sources is listed in `assumptions`
 * below and MUST be confirmed or corrected by the client before launch —
 * no testimonial, rating, statistic or award appears anywhere in this file
 * because none has been supplied.
 */

export type NumberedItem = {
  n: string
  title: string
  detail: string
}

/**
 * The advertised ₹2,99,999 complete package, broken out so the price reads as
 * a list of things rather than a number. LED screen, DJ and security are the
 * three inclusions the client advertises; the rest describe how the in-house
 * team works and are flagged in `assumptions`.
 */
export const packageInclusions: NumberedItem[] = [
  {
    n: '01',
    title: 'The space itself',
    detail:
      'The hall, the lawn, or both together for your event day — the venue hire is inside the package price, not quoted on top of it.',
  },
  {
    n: '02',
    title: 'LED screen',
    detail:
      'A full LED screen for the entry video, the live feed and the photo montage, rigged and run by our own crew.',
  },
  {
    n: '03',
    title: 'DJ and sound',
    detail:
      'A DJ with the sound system for the sangeet and the reception, so you are not hiring and briefing an outside audio vendor.',
  },
  {
    n: '04',
    title: 'Security on site',
    detail:
      'Uniformed security through the event, covering the gate, the car park and the farm stay side of the property.',
  },
  {
    n: '05',
    title: 'Stage and decor',
    detail:
      'Stage build, draping and floral decor handled by the in-house production team to a brief you approve beforehand.',
  },
  {
    n: '06',
    title: 'One team, one quote',
    detail:
      'You brief one coordinator rather than seven separate vendors, and the ₹2,99,999 is a single package figure rather than a low hall rate with a long list of extras.',
  },
]

/**
 * The enquiry-to-hold sequence, kept to three steps because that is genuinely
 * all it is. Mirrors the `seasonal` banner promise of holding a date.
 */
export const planningSteps: NumberedItem[] = [
  {
    n: '01',
    title: 'Send us your date',
    detail:
      'Message us on WhatsApp or fill in the enquiry form with your date, your event and a rough guest count, and we will tell you the same day whether the date is open.',
  },
  {
    n: '02',
    title: 'Come and walk the site',
    detail:
      'Visit the property, see the hall and the lawn at the time of day your event will actually happen, and meet the team who will run it.',
  },
  {
    n: '03',
    title: 'We hold the date',
    detail:
      'After the visit we hold your date while you talk it over at home, so you are not deciding on the spot to keep the muhurtham.',
  },
]

export type Faq = {
  q: string
  a: string
}

/**
 * Six questions people actually ask on the phone before booking. Several
 * answers contain operational detail we could not verify — each of those is
 * listed in `assumptions`.
 */
export const faqs: Faq[] = [
  {
    q: 'How many guests can you take?',
    a: 'Up to 600. The convention hall seats 600 and the lawn takes about the same number standing, so most weddings book the pair — ceremony on the lawn, dinner in the hall, or the other way round if it rains.',
  },
  {
    q: 'Can we bring our own caterer or decorator?',
    a: 'The package is built around the in-house team, which is why it is priced the way it is. If there is a caterer or decorator your family has always used, tell us at the enquiry stage and we will talk it through rather than rule it out.',
  },
  {
    q: 'Is there parking?',
    a: 'Yes — parking is on the property, so guests are not leaving cars on the approach road. It is on our own land across roughly 11 acres rather than a shared lot, and security covers it through the event.',
  },
  {
    q: 'Can we book the farm stay without an event?',
    a: 'Yes. The farmhouse — two premium bedrooms, the pool, the garden and the children’s play area — can be booked on its own for a family weekend, with no hall or lawn booking attached. Rates for a stay-only booking are separate from the event package.',
  },
  {
    q: 'How far is it from the city?',
    a: 'We are at Ramdas Pally, on the western side of Hyderabad. Most guests coming from the Gachibowli and Financial District side are with us inside an hour, and we will send a pinned location with the invitation so nobody is calling for directions.',
  },
  {
    q: 'How far ahead should we book for wedding season?',
    a: 'For the November to February muhurtham dates, as early as you can — those dates go first and the hall and lawn are usually taken as a pair. Off-season dates are far easier, and we can often hold one at short notice.',
  },
]

export type Assumption = {
  key: string
  claim: string
  why: string
}

/**
 * Client sign-off list. Every statement in this file that is NOT in the
 * Instagram profile or the project documents appears here. If the client
 * corrects an item, fix the copy above and delete the row.
 */
export const assumptions: Assumption[] = [
  {
    key: 'package-venue-hire',
    claim:
      'Item 01 says venue hire of the hall and/or lawn is included in the ₹2,99,999 package.',
    why: 'The advertised inclusions we have are the LED screen, DJ and security only. Whether the space itself is inside that figure — and whether it covers one space or both — is unconfirmed.',
  },
  {
    key: 'package-sound-system',
    claim:
      'Item 03 says the sound system comes with the DJ, and that the crew is in-house.',
    why: 'The advertised inclusion is “DJ”. Whether the PA and the operator are the client’s own staff or a regular subcontractor is unconfirmed.',
  },
  {
    key: 'package-security-scope',
    claim:
      'Item 04 says security covers the gate, the car park and the farm stay side of the property.',
    why: 'Security is an advertised inclusion, but its posts, headcount and hours are not stated anywhere.',
  },
  {
    key: 'package-decor-included',
    claim:
      'Item 05 says stage build, draping and floral decor are part of the package.',
    why: 'Decor is described as an in-house capability, but it is not listed among the advertised package inclusions. Confirm whether it sits inside ₹2,99,999 or is quoted separately.',
  },
  {
    key: 'package-catering-status',
    claim:
      'No item states whether catering is inside the package price, and the FAQ answer avoids the question.',
    why: 'Catering is the single largest line in most wedding budgets. Confirm whether it is included, quoted per plate on top, or excluded — the copy needs a straight answer here before launch.',
  },
  {
    key: 'single-coordinator',
    claim:
      'Item 06 and step 02 promise one named coordinator who runs the booking end to end.',
    why: 'The one-team-not-seven-vendors positioning is established, but a single point of contact per booking is an operational commitment the client has to be willing to keep.',
  },
  {
    key: 'same-day-availability-reply',
    claim: 'Step 01 promises a same-day reply on whether a date is open.',
    why: 'A response-time promise the reception team has to be able to meet on a busy Saturday. Change to “within 24 hours” if that is safer.',
  },
  {
    key: 'date-hold-policy',
    claim:
      'Step 03 says we hold the date while the family decides, with no mention of a deposit or a time limit.',
    why: 'The seasonal banner already makes this promise, so it is on the site either way — but the actual hold period and whether a token amount is required both need confirming.',
  },
  {
    key: 'outside-vendors-negotiable',
    claim:
      'The FAQ says an outside caterer or decorator will be talked through rather than refused.',
    why: 'A real commercial policy decision. If outside vendors are simply not permitted, or permitted only against a fee, the answer must change.',
  },
  {
    key: 'on-site-parking',
    claim: 'The FAQ states parking is on the property and is not a shared lot.',
    why: 'Reasonable for an 11-acre site, but neither the parking arrangement nor a vehicle count is documented. A capacity figure would strengthen this answer if the client can give one.',
  },
  {
    key: 'farmstay-standalone-booking',
    claim:
      'The FAQ says the farm stay can be booked on its own, with rates separate from the event package.',
    why: 'The farm stay is a listed offering and the Instagram bio treats it as its own line, but stay-only booking has not been confirmed and no rate exists for it.',
  },
  {
    key: 'drive-time-from-city',
    claim:
      'The FAQ says guests from the Gachibowli and Financial District side arrive within about an hour.',
    why: 'Estimated from the Ramdas Pally location, not measured, and Hyderabad traffic makes any such figure soft. Please confirm the drive time you are comfortable quoting.',
  },
  {
    key: 'pinned-location-sent',
    claim: 'The FAQ says a pinned location is sent with the invitation.',
    why: 'A small service promise that someone at reception has to actually do.',
  },
  {
    key: 'wedding-season-window',
    claim:
      'The FAQ names November to February as the muhurtham booking rush and says off-season dates can be held at short notice.',
    why: 'The seasonal banner already says dates from November open first. The February end of the window and the short-notice off-season claim are both our inference.',
  },
  {
    key: 'hall-lawn-booked-as-pair',
    claim:
      'Two answers assume most weddings book the hall and lawn together and use the hall as the wet-weather fallback.',
    why: 'Consistent with the seasonal copy, but confirm it matches how bookings actually come in — and that the hall can absorb a lawn event at short notice.',
  },
  {
    key: 'whatsapp-enquiry-channel',
    claim: 'Step 01 directs enquiries to WhatsApp as well as the form.',
    why: 'The bookings number is given as a WhatsApp line, so this is a light inference — confirm the line is monitored for web enquiries, not only for calls.',
  },
]
