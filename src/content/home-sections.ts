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
 *
 * Item 06 exists because the old list said nothing about food while the
 * spaces copy claimed catering was in-house — a buyer comparing quotes reads
 * that silence as a hidden line. It is now answered in one place, honestly.
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
    title: 'Catering, quoted per plate',
    detail:
      'Food is cooked and served by the in-house kitchen. It is the one line that sits outside the ₹2,99,999, because the rate follows your menu and your final head count — ask for the per-plate range with your date and you will get a figure.',
  },
  {
    n: '07',
    title: 'One team, one quote',
    detail:
      'You brief one coordinator rather than seven separate vendors, and ₹2,99,999 is a single package figure with catering as the only line added to it — not a low hall rate with a long list of extras behind it.',
  },
]

/**
 * The enquiry-to-hold sequence, kept to three steps because that is genuinely
 * all it is. Mirrors the `seasonal` banner promise of holding a date.
 *
 * Step 01 asks for the date and the guest count by name: every answer we can
 * give — availability, layout, per-plate rate — depends on those two facts,
 * which is why the enquiry form should not treat them as optional.
 */
export const planningSteps: NumberedItem[] = [
  {
    n: '01',
    title: 'Send us your date and guest count',
    detail:
      'WhatsApp us or fill in the enquiry form. Those two facts are what every answer hangs on — with them we can tell you whether the date is open and what the day costs. You will hear back within a working day, and faster on WhatsApp if the date is close.',
  },
  {
    n: '02',
    title: 'Come and walk the site',
    detail:
      'Site visits run 10:00 to 19:00, any day of the week. Come at the hour your event will actually happen, see the hall and the lawn in that light, and meet the team who will run it.',
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
 * The questions people actually ask on the phone before booking, in the order
 * they ask them — price first, because that is the call. Several answers
 * contain operational detail we could not verify; each of those is listed in
 * `assumptions`.
 */
export const faqs: Faq[] = [
  {
    q: 'What does ₹2,99,999 actually cover?',
    a: 'The space — hall, lawn or both — with the LED screen, the DJ and sound, security through the event, and the stage and decor built to a brief you approve. Catering is the one line quoted on top of it, per plate, because the rate follows your menu and your head count. A hall on its own is quoted by the day in this part of the city, with the screen, the DJ, the security and the decor all still to buy.',
  },
  {
    q: 'How many guests can you take, and in what layout?',
    a: 'Up to 600. The hall seats 600 across a pillarless span and the lawn takes about the same number standing, so most weddings book the pair — ceremony on the lawn, dinner in the hall, or the other way round if it rains. Theatre, classroom and round-table layouts each change the number: tell us the format and we will give you the figure for that setup rather than the headline one.',
  },
  {
    q: 'Where exactly are you, and how do we get there?',
    a: 'Ramdas Pally, on the south-east side of Hyderabad — off the Nagarjuna Sagar road, in the stretch out past Ramoji Film City and Sanghi Temple, and reached from the Outer Ring Road. That puts us closest to LB Nagar, Dilsukhnagar, Hayathnagar, Vanasthalipuram and Adibatla, and the ORR runs to the airport without taking you back through the city. We would rather send the pin than quote a drive time nobody has measured, so a pinned location goes out with your invitation and we will talk the route through on the call.',
  },
  {
    q: 'Is there parking, and how many cars?',
    a: 'Parking is on our own land inside the gate, not on the approach road, and security covers it for the whole event. The number of cars depends on how the day is laid out across the 11 acres, so ask with your guest count and we will give you the figure for your date rather than a round number.',
  },
  {
    q: 'Can we bring our own caterer or decorator?',
    a: 'The package is built around the in-house kitchen and production team, which is why it prices the way it does, and outside food is not the default. If there is a caterer or decorator your family has always used, or one dish that has to be made by a particular hand, say so at the enquiry stage — we would rather talk it through than rule it out on a form.',
  },
  {
    q: 'Can we serve alcohol, and how late can the music run?',
    a: 'Both have straight answers, but not ones worth giving in the abstract. Alcohol at a private function is arranged on the usual event permit, and the music has to stop at the hour the sound rules set for the night. Tell us what you have in mind and we will confirm both for your date before you plan around them.',
  },
  {
    q: 'Can we book the farm stay on its own, and how many does it sleep?',
    a: 'Yes. The farmhouse — two premium bedrooms, the pool, the garden and the children’s play area — can be booked for a family weekend with no hall or lawn attached, and the stay-only rate is separate from the event package. Two bedrooms is what there is: it is a family house rather than a room block, so if a large out-of-town party needs beds, tell us early and we will say what is workable.',
  },
  {
    q: 'How far ahead should we book for wedding season?',
    a: 'For the November to February muhurtham dates, as early as you can — those go first and the hall and lawn are usually taken as a pair. Off-season dates are far easier, and we can often hold one at short notice. Either way, send the date and a guest count and you will know where you stand within a working day.',
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
    key: 'package-catering-position',
    claim:
      'Item 06, the first FAQ and the spaces copy now all say the same thing: catering is cooked in-house and quoted per plate ON TOP of ₹2,99,999.',
    why: 'THE SINGLE MOST IMPORTANT ROW HERE. The site previously claimed in-house catering in one place, omitted it from the package list, and dodged it in the FAQ — so the copy now takes one position, because catering is the largest line in most wedding budgets and silence reads as a hidden cost. Confirm the position and give us the per-plate range: the sentences are written so a real figure drops straight in.',
  },
  {
    key: 'single-coordinator',
    claim:
      'Item 07 and step 02 promise one named coordinator who runs the booking end to end.',
    why: 'The one-team-not-seven-vendors positioning is established, but a single point of contact per booking is an operational commitment the client has to be willing to keep.',
  },
  {
    key: 'competitor-price-comparison',
    claim:
      'The first FAQ says a hall on its own in this part of the city is quoted by the day, with the screen, DJ, security and decor still to buy.',
    why: 'Taken from the competitor pricing gathered in docs/reference-and-seo.md (Ibrahimpatnam halls listed publicly by the aggregators), not from the client. No competitor is named and no rival figure is quoted. Confirm the client is comfortable drawing the comparison at all.',
  },
  {
    key: 'availability-reply-time',
    claim:
      'Step 01 and the last FAQ promise a reply within a working day, with WhatsApp faster.',
    why: 'Changed from the old “same day”, which contradicted the enquiry confirmation screen’s “usually within a working day”. One phrase now, in both places — confirm reception can meet it on a busy Saturday.',
  },
  {
    key: 'site-visit-hours',
    claim: 'Step 02 states site visits run 10:00 to 19:00, any day of the week.',
    why: 'These hours come from src/config/site.ts, where they are already registered in pending.ts as assumed. Confirm the real visiting hours — and note the contact page H1, “someone always picks up”, promises more than a 10:00–19:00 line can deliver.',
  },
  {
    key: 'hall-format-capacities',
    claim:
      'The capacity FAQ says theatre, classroom and round-table layouts each change the seated number, without giving those numbers.',
    why: '600 seated is the only capacity figure we have. Corporate buyers compare by format, so give us the theatre, classroom and round-table figures for the hall and they go straight into that answer and into the corporate occasion card.',
  },
  {
    key: 'date-hold-policy',
    claim:
      'Step 03 says we hold the date while the family decides, with no mention of a deposit or a time limit.',
    why: 'The seasonal banner already makes this promise, so it is on the site either way — but the actual hold period and whether a token amount is required both need confirming.',
  },
  {
    key: 'outside-vendors-and-food',
    claim:
      'The FAQ says outside food is not the default, and that an outside caterer or decorator will be talked through rather than refused.',
    why: 'A real commercial policy decision. If outside vendors are simply not permitted, or permitted only against a fee, the answer must change — and if there is a fee, publish it.',
  },
  {
    key: 'on-site-parking',
    claim:
      'The FAQ states parking is on our own land inside the gate, is not a shared lot, and that a car count depends on the layout.',
    why: 'Reasonable for an 11-acre site, but neither the arrangement nor a vehicle count is documented. A car count is the number a family with 600 guests actually wants — give us one and the answer stops hedging.',
  },
  {
    key: 'alcohol-and-music-policy',
    claim:
      'A new FAQ says alcohol is arranged on the usual event permit and that music stops at the hour the sound rules set.',
    why: 'Neither policy is documented anywhere. Deliberately written without naming a permit or a cut-off time, because getting either wrong is a legal problem, not a copy problem. Give us the actual permit route and the actual music cut-off and both drop into the sentence.',
  },
  {
    key: 'farmstay-standalone-booking',
    claim:
      'The FAQ says the farm stay can be booked on its own, with rates separate from the event package, and that we will advise on beds for a larger party.',
    why: 'The farm stay is a listed offering and the Instagram bio treats it as its own line, but stay-only booking has not been confirmed and no rate exists for it. Two premium bedrooms is the verified figure — how many people that sleeps, and what we can suggest for an overflow party, both need an answer.',
  },
  {
    key: 'venue-location-and-route',
    claim:
      'The location FAQ places us on the SOUTH-EAST side of Hyderabad — off the Nagarjuna Sagar road, past Ramoji Film City and Sanghi Temple, reached from the ORR, nearest to LB Nagar, Dilsukhnagar, Hayathnagar, Vanasthalipuram and Adibatla.',
    why: 'CORRECTION, NOT AN ADDITION. The old answer said “western side of Hyderabad” and named Gachibowli and the Financial District, which are 45–60 km away across the whole city — see the geography row in src/config/pending.ts. The replacement is built from the pincode and locality research in docs/reference-and-seo.md, not from the client: confirm the exact address and the ORR exit guests should use.',
  },
  {
    key: 'drive-time-not-quoted',
    claim:
      'No drive time appears anywhere in this file, and the FAQ says so in as many words.',
    why: 'The old “inside an hour from Gachibowli” was never measured and was measured from the wrong side of the city. The about-page H1’s “forty minutes” has the same problem. Measure the drive from two named origins — LB Nagar and Dilsukhnagar are the honest ones — and a real number replaces the hedge. Distance is this venue’s primary objection; a measured figure is worth more than the sentence standing in for it.',
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
      'Two answers, the lawn blurb and the seasonal banner assume most weddings book the hall and lawn together and use the hall as the wet-weather fallback.',
    why: 'Consistent with the seasonal copy, but confirm it matches how bookings actually come in — and that the hall can absorb a lawn event at short notice.',
  },
  {
    key: 'whatsapp-enquiry-channel',
    claim: 'Step 01 directs enquiries to WhatsApp as well as the form.',
    why: 'The bookings number is given as a WhatsApp line, so this is a light inference — confirm the line is monitored for web enquiries, not only for calls.',
  },
]
