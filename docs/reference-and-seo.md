# Reference websites & search strategy — Gala Retreat Resort & Convention

Research notes for the Gala Retreat site. Part A is design reference; Part B is the search strategy, whose machine-readable form is `src/content/seo.ts`.

**Method and honesty note.** Every site below was actually fetched — HTML converted to markdown, and in several cases the raw markup grepped for `@font-face`, `font-family` and colour tokens, so typeface and hex claims come from the source rather than from impression. Where a fetch failed it says so and the site is not described. **No search-volume figures appear anywhere in this document**: I had no keyword tool with real `.in` market data, and inventing numbers would be worse than having none.

---

# Part A — Reference websites

## A1. International benchmarks

### Aman — [aman.com](https://www.aman.com) · [/celebrations-events](https://www.aman.com/celebrations-events)

**Well.** Self-hosted three-tier type system pulled from the markup: `LyonDisplay-Light` for display, `LyonText-Regular` for reading, `Whitney SSm` at 300/400 for nav and labels. One warm off-white ground, `#f3eee7`, and nothing else — the photography is the palette. The navigation is organised by *desire* rather than by asset class (Destinations / Experiences / Exclusive Offers / Residences), with Celebrations & Events sitting inside Experiences next to Journeys, Wellness and Dining, so a wedding reads as one of the things Aman *does* rather than a revenue department bolted on. Capacity appears in prose where it matters — Amanbagh "up to 100 guests", Amanpulo "up to 200 guests if booked in its entirety" — phrased as possibility, not as a spec sheet.

**The best enquiry form in the whole set**, and the pattern most worth copying: it sits **inline at the foot of the celebrations page**, not behind a click to /contact. It requires Destination, **Occasion** (Wedding / Celebration / Corporate / Other) and **Number of guests** alongside name and email, and the button says `Request a Full Proposal` — framing the output as something you receive rather than something you beg for. Two clicks from the homepage to a submittable form.

**Badly.** No pricing, not even a band. The celebrations page gives each destination **one 366 × 366 px image** with thin alt text — no gallery, no lightbox, nothing. For a page selling a wedding that is starvation rations. And a CAPTCHA sits on the most valuable action on the site.

### Soho House — [sohohouse.com](https://www.sohohouse.com) · [/event-spaces](https://www.sohohouse.com/event-spaces) · [/event-space-hire](https://www.sohohouse.com/event-space-hire)

**Well — this is the capacity benchmark.** `HK Grotesk` for UI and `Cardo` for editorial voice, both self-hosted with `font-display:swap` and `unicode-range` subsetting. Every house card carries a two-number summary in the markup: `Spaces: 3 Capacity: 12 to 150`. **Printing the number of separate spaces alongside the guest range is the smart part** — it says "we can run your multi-room event" without a floorplan PDF. Cards also flag eligibility (`Member-only booking` vs `Member and non-member booking`), one line that prevents the commonest wasted enquiry.

The enquiry form is a genuine two-step with a confirmation screen, and it asks **event format, event date, event start time in 30-minute increments, and guest count**. Asking start time is a detail nobody else asks and it materially changes what can be offered.

**Badly.** The `/event-spaces` document is **1.3 MB of HTML** — the page ships its content twice, once as DOM and once as an inline serialized JS state blob full of `<b>Capacity</b>` escapes. And **there is no filtering at all**: capacity is printed on every card but you cannot filter by it, by city, or by event type, so you scroll a geographic list hunting for a number. Printing the data and then refusing to let anyone query it is the page's central failure. Capacity is also one undifferentiated range with no seated/standing split.

### Belmond — [belmond.com](https://www.belmond.com) · [/en/celebrations](https://www.belmond.com/en/celebrations)

**Well.** Celebrations is a top-level nav item rather than something buried, and the page segments by **occasion** rather than by property — Weddings, Honeymoons, Birthdays, Family, then a second row of Bachelor/Bachelorette, Anniversaries, Corporate, Exclusive Takeovers. Letting a visitor self-identify by occasion first is a sound information-architecture instinct for a venue with several products.

**Badly — the worst conversion path in the set.** No capacity, no pricing, no enquiry form, no wedding-specific contact. The only actionable element on a page dedicated to celebrations is a banner sending you to `belmondpro.com`, **a separate B2B portal for travel trade**. A couple planning their own wedding hits a dead end and is handed a professional-partners site.

### Villa Lena — [villa-lena.it](https://villa-lena.it) · [/celebrate-with-us/weddings/](https://www.villa-lena.it/celebrate-with-us/weddings/)

**Well.** `Outfit`, a geometric sans — not the serif you would guess; the CSS says so. Type scale exposed as custom properties at a restrained `13 / 20 / 36 / 42 px`, so nothing shouts and the photography carries the page. The palette is the loudest here and deliberately so: `--color-active: #FF7560` hot coral, `#685044` warm brown, `#84BF8B` and `#3a7041` greens, `#FDF1E6` cream, `#FFFFAB` acid yellow. It is the only site in the set brave enough to have an actual colour identity instead of the beige-and-serif consensus, and it is instantly recognisable for it.

**Best navigation labelling of any site here**: every section is a verb phrase in the second person — Stay With Us / Eat With Us / Experience With Us / **Celebrate With Us** / About Us. Weddings, Parties and Retreats all live under Celebrate With Us, which reads like an invitation instead of a sitemap. The wedding CTA is `TAILOR YOUR PROPOSAL`, and a named team's email sits beside it for people who hate forms.

**Badly.** The weddings page has **30+ carousel slots that served placeholder GIFs on fetch** — the gallery is entirely dependent on lazy-load JS firing, so on a slow connection the page is thirty grey rectangles. **No capacity figures for any space**, which is strange for a venue whose whole proposition is exclusive use. And four competing conversion points (hero date widget, per-room Book Now, third-party restaurant booking, persistent nav button) means the wedding path fights the room-booking path on every screen.

### Heckfield Place — [heckfieldplace.com](https://www.heckfieldplace.com) · [/plan-an-event/](https://www.heckfieldplace.com/plan-an-event/) · [/events-enquiry/](https://www.heckfieldplace.com/events-enquiry/)

**Well.** `Johnston ITC Std` in Light and Medium — **no serif at all**. A Georgian country estate running its entire brand on the humanist sans of the London Underground lineage, in two weights, is the most confident typographic decision in this research set, and it looks more expensive than the sites drowning in display serifs. Palette from the markup: `#e3ded7` warm stone, `#d5dcd8` and `#aebabc` pale sage, `#a2acba` blue-grey, with `#75101b` claret as the accent. Spaces get real names — The Assembly Room, The Glass House, Hearth, The Long Room — not Hall A.

**The single best small idea I found anywhere:** the enquiry form's Subject dropdown is **pre-scoped per room**. Its options are literally `Enquiry about The Assembly Room`, `Enquiry about the Glass House`, `Enquiry about Hearth`, … and each space's page deep-links into the form with its own room preselected. Context carries from the browsing page into the form.

**Badly.** **Zero capacity numbers** — seven named spaces, not one guest figure, seated or standing. And the pre-scoped form then **asks no date and no guest count**: Title, First Name, Last Name, Email, Phone, Subject, Message, and that is all. Every submission needs a round-trip email just to establish the two facts that decide whether the booking is possible. The real information is pushed into **two downloadable PDF brochures**, which are unreadable on a phone, invisible to search, and impossible to update seasonally. Also seven Title options before anyone has typed their name.

### The Newt in Somerset — [thenewtinsomerset.com](https://thenewtinsomerset.com) · [/private-events](https://thenewtinsomerset.com/private-events)

**Well.** `Nunito Sans` as a variable font from Google Fonts with the full optical-size and weight axes — the only site here not self-hosting. Nav is four verbs: **Stay / Visit / Taste / Shop**, covering a hotel, a garden attraction, five restaurants and a retail business.

**A live five-day weather forecast in the hero.** For an estate whose product is gardens and outdoor space this is the most venue-appropriate piece of UI I found anywhere: it says *this is a real place, outdoors, today*. And **capacity is stated in warm prose, bound to a format** — Garden Café "up to 100 people … for formal or informal dinners", Winter Garden "up to 50 people for drinks and canapés", Perfect Pitch "up to 40 in our secret spot" or "up to 130 people" for after-hours garden events. Fifty *for canapés* is far more useful than a bare range.

**Badly.** **There is no enquiry form at all** — the entire private-events path is `mailto:` links and a phone number. On mobile a mailto often opens nothing usable and it captures no structured data whatsoever. No gallery on the private events page, and the Farmyard section gives room counts but no guest capacity, inconsistent with the four sections that do.

### Euridge Manor — [euridge.uk/weddings](https://www.euridge.uk/weddings)

**Well — the capacity benchmark for a single estate.** Capacity is given per space *and per format*: The Boathouse "up to 20 guests"; **The Orangery "up to 120 guests" for ceremonies but "up to 50 guests" for dinners**; The Ballroom "up to 150". Same room, two numbers, two formats. That is exactly the honesty that prevents a wasted site visit. The page is structured as an argument — Our Approach → Exclusive Use & Hire → Ceremonies → Receptions → Experiences — answering *what is this place, can I have it to myself, where do I marry, where do I party, what else*. And the CTA is **"Book a viewing"**, which names the actual next step in a wedding-venue sale rather than the abstraction "Enquire".

**Badly.** No pricing. About six images and no gallery or lightbox, thin for a venue selling six licensed ceremony locations across 450 acres. And no form on the weddings page — you are routed to `/contact`, so nothing is captured in context.

### Elmore Court — [elmorecourt.com](https://elmorecourt.com/)

**Well. The best copy voice of any site here.** "We're not a Hotel. We are a home." The CTA button is literally **"Oh, yes please"**. For a wedding venue, where the emotional register *is* the product, that is worth more than any animation. Photography carries **named photographer credits**, which quietly signals the quality of imagery a couple can expect from their own day. There is a **Suppliers** page — genuinely useful, and it makes the venue the hub of a local ecosystem rather than a room for hire.

**Badly.** No pricing and no capacity anywhere on the homepage, so the chatty transparent tone promises an openness the information architecture does not deliver. And **the gallery is six Instagram tiles that link out to Instagram** — offloading the most persuasive asset a wedding venue owns to a third-party app, losing control of quality and ordering, and sending the visitor *away* at the moment of peak interest.

### Son Daven — [sondaven.com/en](https://sondaven.com/en) *(Awwwards Site of the Day, June 2026)*

Worth reading as a warning as much as an inspiration. **Well:** poetic restrained hero copy that establishes premium positioning before a single feature is mentioned; earthy palette; WebP throughout; numbered unit sections that expand progressively; sticky section nav.

**Badly, and these are the awards-circuit clichés in pure form:** a **full-screen "Loading the website / Please wait" gate with a 0% progress bar**; **hamburger-only navigation on a 1440 px desktop**; and a **"Rotate your phone for better experience"** message — instructing the user to change posture rather than being responsive. The lead form captures name and phone only: no date, no guest count, no event type.

### Sites I could not read, stated plainly

- **Six Senses** — [sixsenses.com](https://www.sixsenses.com) returned **HTTP 403** from the Akamai edge on every attempt. Not described.
- **Borgo Egnazia** — [borgoegnazia.com](https://www.borgoegnazia.com) loads, but every URL returns the same ~37 KB shell with all content injected by JS, so I read its chrome and its CSS, not its wedding content. What the markup does reveal is a cautionary tale worth recording: `/table/events/weddings` **302-redirects to `/?section=table&t=events&rn=weddings`**, so deep links collapse into homepage query parameters and the weddings page cannot be linked to; there is a **fixed-position fullscreen autoplay video** (`#myVideo { position: fixed; min-width:100%; min-height:100% }`) with an empty `#videoBtn` control rule; and a **full-viewport Lottie splash gate** whose logo animation runs `40s infinite` — a preloader animation that is never intended to complete.

## A2. Indian wedding-venue and resort sites

Six Hyderabad venue sites, two out-of-market Indian benchmarks, and the aggregators that currently outrank all of them. Quoted strings are verbatim from the fetched markup; measurements are measured, not estimated.

**Fetches that failed, recorded so nothing is claimed about them:** Taj Hotels weddings, Alila Fort Bishangarh and WeddingWire India all returned **HTTP 403**; SUJÁN, The Postcard, Roseate and Rajmahal Palace timed out; `leoniaresorts.com` returned 200 with a 114-byte empty body; `celebrityresorts.in` refused the connection.

### Dream Valley Resorts — [dreamvalleyresorts.com](https://dreamvalleyresorts.com/) · [/wedding](https://dreamvalleyresorts.com/wedding)

**The best capacity communication in the market, and the only competitor with real lead plumbing.** Hero stat chips read `20-3000 Guests`, `20 Acres`, `Outdoor & Indoor Venues`, `30 Years in the Industry`, and the wedding page puts a big numeric badge under every venue photo — `800 PAX` for the banquet hall, `3000 PAX` for the lawns. Prose backs it up: `"across 15 indoor and outdoor venues accommodating 20 to 3000 guests"`, `"86 rooms"`. The enquiry form carries **seven hidden UTM fields** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_device`, `utm_network`) into LeadSquared — nobody else in this set attributes a lead to a campaign. Richest schema of any Hyderabad site here: `LocalBusiness`, `LodgingBusiness`, `AggregateRating`, `GeoCoordinates`.

**Badly.** A **1,292 KB `temp_closed.jpg`** ships on the homepage to announce a water-park renovation — a 1.3 MB photograph doing the job of a sentence. Ninety `<img>` tags and **zero `srcset`**, so a phone downloads desktop-sized art; sampled image payload ~2.2 MB. And the nine-item nav puts "Day Outing" and "Stay" ahead of "Wedding".

### Pragati Resorts — [pragatiresorts.com](https://www.pragatiresorts.com/)

**Well.** The cleanest build in the set by a distance — Webflow, 75 KB of HTML, one stylesheet, seven scripts, 24 images with proper `srcset`. Best-written meta description of the six.

**Badly, and instructively.** **Not one capacity number anywhere on the site.** The `/venues` page — for a resort whose product is event space — is 41 KB containing `"Outdoor Indoor Best quality of services and facilities for all your vacation and place needs Enquire Now!"` and nothing else. The H1 ships as `<h1 style="opacity:0">`, so the primary heading and probable LCP element is invisible until JS runs. No canonical, no JSON-LD, no enquiry form in the markup, and "Events" appears twice in the same page's section list. A beautiful shell with nothing where the buyer needs it.

### Dhara Resort and Convention — [dhararesortandconvention.com](https://dhararesortandconvention.com/)

**Well.** The best copy voice of the six — `"More Than a Venue. A Place That Listens"`, `"From Table to Texture"`, `"Stories That Stay"`. And the enquiry form has a **"Select Services" dropdown** whose options are the actual spaces: `Convention Centre, Resort Rooms, Lake View Lawn, Mini Conference Room, Party Lawn`. That segments the lead at capture.

**Badly.** **No meta description at all**, no `og:title`, no `og:description`, no JSON-LD — a WhatsApp share of this URL renders bare. The `<title>` is three words: `Dhara Resort and Convention`. No guest numbers anywhere, including on the page that names five spaces. **Zero WhatsApp** — no `wa.me`, no mention. And **61 stylesheets plus 41 external scripts**, the worst render-blocking profile measured here.

### Brown Town Resort — [browntownresort.com](https://browntownresort.com/) · [/wedding/](https://browntownresort.com/wedding/)

**The single smartest content play in the competitive set.** Their `/wedding/` URL is not a venue page — it is an article titled `Wedding Resort vs Banquet Hall in Hyderabad | What Costs More in 2026?`, which answers the comparison question the buyer actually types, in their own favour: `"Resorts often offer better overall value, especially for weddings with 150–500 guests"`. They are also the only site in either audit using `EventVenue` **and** `FAQPage` schema together, alongside `ContactPoint`, `BreadcrumbList`, `City` and `AdministrativeArea`. Best image discipline of the WordPress builds (62 WebP refs, 24 `srcset`), and a "Partnered With" logo wall.

**Badly.** `og:title` is the literal string `Home` — every social share says "Home". 299 KB of HTML, 55 stylesheets. The pricing CTA reads `Get Wedding Package Pricing` and **links to a phone number**, which kills anyone comparing venues at 11pm. Capacity is buried in body prose (`"1000+ guests"`) and the 165-guest villa figure is more prominent than the event capacity.

### Serene Resort & Convention — [sereneresort.in](https://sereneresort.in/) · [/events](https://sereneresort.in/events)

**The closest analogue to Gala Retreat's brief, and the right pattern executed badly.** Its events page lists named halls with square footage *and* guest count: `"VIVAHA MANDAPAM — A magnificent 9,000 sq. ft. indoor hall with a 6,000 sq. ft. verandah … seating for 600 guests"`; `"Kamalika (40,000 sq. ft.) … hosting up to 1,000 guests"`; `"CHANDRA TEERTHAM — a 2,250 sq. ft. poolside oasis … for 100 distinguished guests"`. **Vivaha Mandapam at 600 seated is the direct capacity twin of Gala Retreat's hall.** The Sanskrit hall names give real regional character that the beige competition lacks.

**Badly, and this is the site to out-execute.** **Zero `<h1>` elements** on the homepage (measured: `h1: 0`, `h2: 29`). The nav misspells `Accomodations`. **Samvada Vedika is listed twice on one page with two different capacities — 200 guests and 250 guests.** The form placeholders leak unrendered Elementor template code (`${ parent.decodeEntities(...) }`) into the live page. The phone numbers are plain text with **no `tel:` links**, so tapping them on a phone does nothing. Zero WebP against 123 JPEG/PNG references; 14 sampled images totalled 2,471 KB with a single 540 KB hero.

### Aura Retreat — [auraretreat.in](https://auraretreat.in/)

The weakest site audited, with one genuinely good idea. Its meta description is the only one in the market that names the **sub-events** and a **micro-locality**: `"Celebrate weddings, birthdays, haldi, sangeet, tilak, sagan & more at the best private and party resorts in Dabilguda, Hyderabad"`. That instinct is worth copying.

Everything else is a warning: **zero `<h1>`**, only four `<h2>` on the whole page, no capacity figures, no pricing, **two competing form plugins shipping simultaneously** (Forminator *and* Contact Form 7), a rendered label reading `Phone *0 / 10` where a character counter has bled into the text, a `@gmail.com` contact address on a self-described luxury venue, and a "WhatsApp" link that is a **social share button, not an enquiry channel**. 41 external scripts and 33 stylesheets to render 13 images.

### Fort Grand and Aalankrita — the scale players

[fortgrand.com](https://fortgrand.com/) claims `"sprawled across 18 acres"` and `"a capacity of 10,000 guests"` from a 25 KB brochure page with **no contact form at all**. Its one stealable idea is the **Google Virtual Tour** link in the footer — a 360° walkthrough answers "will 600 people fit in there" better than any paragraph can.

[aalankrita.com/convention](https://www.aalankrita.com/convention) is the keyword-stuffing cautionary tale: a **~235-character `<title>`** of five pipe-separated keyword blocks (`Convention & Conference Booking | Aalankrita 4 Star Resort & Convention - Hyderabad's 4 Star Resort | Resorts in Hyderabad | Spa Hyderabad | …`), the same meta description on the homepage, the convention page **and the 404 page**, fourteen named halls with **no capacities at all**, and a measured **11.78 seconds** to complete over `curl`.

### Two positive Indian benchmarks

**[Suryagarh, Jaisalmer](https://suryagarhcollection.com/suryagarh/)** — a **three-item navigation** (`Collection`, a phone number, `Reserve`) against the nine-item menus every Hyderabad competitor runs, and an H1 that sells a feeling rather than a keyword: `"Experience the Thar Desert's soul-stirring tranquility and charm"`. The exact opposite of `"Best Resorts in Hyderabad"`.

**[Evolve Back](https://www.evolveback.com/)** — two section headings worth stealing wholesale: **`WHY BOOK DIRECT WITH US?`** and **`EVOLVE BACK IS NOW JUST A STEP AWAY`**, the latter a connectivity section. For a venue at Ramdas Pally, distance *is* the primary objection, and not one Hyderabad competitor addresses it on the page.

### The aggregators, which outrank all of them

This is where the buyer actually starts, and their facet labels are free keyword research.

- **[WedMeGood — convention halls, Hyderabad](https://www.wedmegood.com/vendors/hyderabad/wedding-venues/all/convention-halls/)** · title `Best Function Halls / Convention Centres for Weddings in Hyderabad`, H1 `Convention / Function Halls in Hyderabad`. Capacity in `pax` ranges (`400-600 pax`, `500-8000 pax`); per-plate prices from `₹699` to `₹2,250`. Venue descriptors, verbatim: **`Convention Hall & Lawn`**, **`Resort w/ Lawn & Banquet`**, **`Pillarless Convention Hall`**, `Large Lawn with Banquet`, `Glasshouse & Ballroom`.
- **[Weddingz — Hayathnagar](https://weddingz.in/wedding-venues/hyderabad/hayathnagar/)** · title `Wedding Venues, Convention & Event Halls in Hayathnagar, Hyderabad | AC Wedding Hall Hayathnagar…`. This is the pricing floor on Gala Retreat's side of the city: `SVS Gardens | 800-1500 Guests | ₹400-500/Plate`, `Srinivasa Kalyana Mandapam | 800-1200 Guests | ₹300/Plate`, `Balaji Party Lawns | 600-900 Guests | ₹350-400/Plate`.
- **[Weddingz — kalyana mantapas](https://weddingz.in/mantapa-convention-hall/hyderabad/all/)** · H1 `Kalyana Mantapa and Convention Hall in Hyderabad`. Guest filter buckets: `Less than 100` / `100-200` / `200-300` / `300-400` / `400-500` / **`Greater than 500`**. Budget buckets: `Less than 1 Lakh` … `Greater than 5 Lakhs`. Facilities facets worth answering on-page: `Food provided by venue`, `Outside food allowed`, `Alcohol allowed`, `Music allowed late`.
- **[mandap.com — Ibrahimpatnam](https://www.mandap.com/hyderabad/wedding-venues-in-ibrahimpatnam)** · **Gala Retreat's literal competitor set, with prices.** `Veda Convention Lawn — ₹6,00,000 per day | 1,200 capacity`; **`KMR Function Hall — ₹1,00,000 per day | 600 capacity`**; `YLR Gardens — ₹65,000 per day | 1,000`; `MM Garden Function Hall - Lawn — ₹45,000 per day | 1,500`; `Shastha Gardens — ₹75,000 per day | 1,500`; `SS Gardens And Function Hall — ₹65,000 per day | 3,000`.
- **[venuebookingz — Ibrahimpatnam](https://www.venuebookingz.com/venues/hyderabad/ibrahimpatnam/wedding-venues/7831)** · capacity brackets `50-100` / `100-250` / `200-500` / **`500-1000`**, and twenty venue-type categories including `Convention Centres`, `Wedding Lawns/Outdoor Venues`, `Farmhouses`, `Poolside Venues`, `Kids Play Area` — the last two both describe Gala Retreat's farm stay.
- **[VenueLook — Hyderabad](https://www.venuelook.com/marriage-venues-in-hyderabad)** · title `Best Marriage Venues in Hyderabad with Price & Packages | 2 September 2026` — **the current date injected into the title tag**, a crude freshness trick worth noting but not copying.

**What the aggregators prove.** Two of them run dedicated **Ibrahimpatnam** venue pages and one runs a **Hayathnagar** page; none of the six venue sites audited targets either locality. The facet vocabulary — `Convention Hall & Lawn`, `Resort w/ Lawn & Banquet`, `Pillarless Convention Hall`, `pax`, `per plate`, `Kalyana Mantapa` — is how this market is indexed, and it is almost entirely absent from the venues' own copy.

## A3. Synthesis — patterns worth stealing

Ranked by what they are worth to Gala Retreat specifically.

### The 8 patterns worth stealing

**1. Publish capacity per space *and* per format.**
Euridge does it best — The Orangery is "up to 120 guests" for a ceremony and "up to 50" for a dinner: same room, two numbers. The Newt binds every figure to a format ("up to 50 people for drinks and canapés"). Soho House prints `Spaces: 3 Capacity: 12 to 150` on every card. In Hyderabad only Serene attempts it, and it contradicts itself — Samvada Vedika appears twice on one page at 200 guests and at 250. Pragati, Dhara, Aura and Aalankrita publish **no capacity numbers at all**. `src/content/spaces.ts` already does half of this ("Up to 600 seated", "Up to 600 standing") and it is the strongest thing on the site. Finish it: seated dinner, theatre style, standing reception, and the honest combined figure when hall and lawn are taken together. Measure them once; never guess. Note also where 600 lands in the aggregator brackets — weddingz's top bucket is `Greater than 500`, venuebookingz's is `500-1000`, WedMeGood tags venues `400-600 pax`. Six hundred is the bottom of the top bracket, so the number has to be stated precisely or it reads as the smallest option in its class.

**2. Publish a real price, itemised — because nobody else will.**
Not one of the eleven international sites shows a figure, and not one of the six Hyderabad venue sites does either. Brown Town's CTA literally reads `Get Wedding Package Pricing` and **links to a phone number**. Meanwhile the aggregators publish everything: a buyer arrives already knowing that Hayathnagar halls run `₹300–500 per plate` and that **KMR Function Hall in Ibrahimpatnam is ₹1,00,000 a day for the same 600 capacity**. Gala Retreat's ₹2,99,999 is already public. Put it on the page as an itemised list — hall, lawn, LED wall, DJ, security, decor — against the plain observation that ₹1 lakh buys a hall and nothing else. Hiding it does not make the comparison go away; it just means you lose it while the buyer is on someone else's site.

**3. Put the enquiry form at the foot of the page being read, pre-scoped to the space.**
Aman's celebrations page carries its own form — two clicks from the homepage, requiring occasion, destination and guest count. Heckfield goes further and pre-scopes it: the Subject dropdown reads `Enquiry about The Glass House`, `Enquiry about Hearth`, and each space deep-links in with its own room selected — then asks **no date and no guest count**, so every submission needs a round-trip email to establish the only two facts that matter. Dhara and Brown Town both get the segmentation right (`Convention Centre / Resort Rooms / Lake View Lawn / Party Lawn`). Steal the deep-link, fix the omission: `/enquiry?space=lawn` should arrive with the lawn ticked, and date and guest count must be required. Belmond, Euridge, Elmore, Fort Grand and Pragati all route to a generic contact page or nothing and lose the context entirely.

**4. Answer "how far is it?" on the page, with real numbers.**
Evolve Back runs a section headed `EVOLVE BACK IS NOW JUST A STEP AWAY`. Not one Hyderabad venue site has an equivalent, and for a property at Ramdas Pally distance is *the* objection — Part B opens with why. A "Getting here" block with a measured drive time from two named origins (LB Nagar and Dilsukhnagar, say), the ORR exit, the landmark (Ramoji Film City is the neighbour), and a pinned map does double duty: it converts, and it is the honest way to rank for the locality cluster. Fort Grand's **Google Virtual Tour** belongs alongside it — a 360° walkthrough answers "will 600 people fit in there" better than any paragraph.

**5. Write the comparison article the buyer actually types.**
Brown Town's `/wedding/` URL is not a venue page. It is `Wedding Resort vs Banquet Hall in Hyderabad | What Costs More in 2026?`, and it answers the decision question in their own favour: *"Resorts often offer better overall value, especially for weddings with 150–500 guests."* It is the only competitor asset in either audit aimed at a real query rather than at a category label. The equivalents here write themselves: convention hall versus farm stay, what 600 guests actually costs in south-east Hyderabad, hall-only rate versus all-inclusive package.

**6. Build the filterable, hosted gallery that every site in this research failed to build.**
Aman gives one 366 × 366 px image per destination. Heckfield and Euridge embed a handful with no lightbox. Villa Lena has thirty carousel slots that render as grey rectangles without JS. Elmore Court outsources its gallery to six Instagram tiles that send the visitor *away* at the moment of peak interest. `src/components/GalleryBrowser.tsx` already filters by space, which puts this site ahead of all of them. Add a second axis — **by function**: sangeet, baraat, reception, mehendi, haldi, corporate — and show real events as complete sets, captioned with the month and the guest count.

**7. Let the typography be confident rather than ornate, and give the spaces names.**
Heckfield runs an entire Georgian estate on **two weights of one humanist sans** and looks more expensive than every site drowning in display serifs. Villa Lena's whole type scale is `13 / 20 / 36 / 42 px`. Suryagarh ships a **three-item navigation** — `Collection`, a phone number, `Reserve` — against the nine-item menus every Hyderabad competitor runs. Gala Retreat's Prata + Jost pairing is already on the right side of this; the discipline to protect is restraint. And named spaces are worth real money: Serene's Sanskrit hall names (Vivaha Mandapam, Chandra Teertham, Kamalika) give it more character than its execution deserves, while Aalankrita lists fourteen halls with no capacities and no personality. `spaces.ts` already names all four.

**8. Steal The Newt's weather widget, because the lawn is a weather product.**
A live Hyderabad forecast plus an honest seasonal band — outdoor lawn season, evening-only months, monsoon means the hall with covered lawn access — turns the biggest objection into a demonstration of competence. No competitor in either audit does anything like it, and it is the kind of detail that makes a venue feel run by people rather than let by an agent.

*Four more worth keeping in the back pocket:* Dream Valley's **hidden UTM fields** on the enquiry form (`utm_source`, `utm_campaign`, `utm_device`…), the only lead attribution in the Hyderabad set and trivial to add to `EnquiryForm.tsx`; Elmore Court's **named photographer credits** on every gallery set, which cost nothing and signal the standard of imagery a couple can expect; Euridge's CTA wording — **"Book a viewing"** rather than "Enquire" — which names the actual next step in a venue sale; and a **stable, server-rendered URL for every space and every real wedding**, against Borgo Egnazia's failure, where `/table/events/weddings` 302s into `/?section=table&t=events&rn=weddings` so the one page a couple most wants to paste into a family WhatsApp group cannot be linked at all. An Indian wedding is a committee decision — everything must be shareable.

### The 5 clichés to avoid

1. **The splash gate.** Borgo Egnazia holds you behind a full-viewport Lottie animating on a `40s infinite` loop; Son Daven shows "Loading the website / Please wait" over a 0% progress bar. Both won budget or awards; both cost real enquiries. A mother-in-law checking your lawn on a mid-range Android over 4G will simply leave. First contentful paint should be a photograph of the lawn and nothing else.

2. **Hamburger-only navigation on desktop, and "rotate your phone for a better experience".** Son Daven does both. This audience researches in *groups* — the couple and both sets of parents — usually on phones, usually in portrait, often older eyes. Hide nothing, and design portrait-first.

3. **The fullscreen autoplay hero video with no controls.** Borgo Egnazia's `#myVideo` is `position: fixed` at `min-width: 100%; min-height: 100%` with an empty `#videoBtn` rule. On a metered Indian mobile plan an autoplaying hero video is a bill. Use a sharp still with an explicit "Watch the film" button.

4. **The PDF brochure as the place the real information lives.** Heckfield hides its events detail in two downloads. A PDF is unreadable on a phone, invisible to search, and impossible to update seasonally. Everything a brochure would say — capacity, inclusions, rates, the seasonal calendar — belongs on the page as HTML. Offer the PDF *after* the enquiry, as the follow-up.

5. **The Indian venue default, visual and verbal.** Gold-on-maroon, the rotating-diamond divider and the stock couple silhouette on one side; on the other, `Best Resorts in Hyderabad` as an H1 and Aalankrita's **235-character pipe-stuffed `<title>`** repeating "Hyderabad" five times — with the same meta description on the homepage, the convention page and the 404. Both are the same mistake: shouting the category instead of being a specific place. Suryagarh's `"Experience the Thar Desert's soul-stirring tranquility and charm"` and Villa Lena's coral-and-acid-yellow palette prove the opposite works better. The site's existing warm-ivory and deep-ink scheme is already the right instinct; the discipline is keeping the ornament out when it is asked for.

# Part B — Search strategy

## B0. A geography correction, first, because everything else depends on it

The brief suggested testing proximity to Moinabad, Chevella, Shankarpally, Shamshabad, the Financial District and Gachibowli. **Most of those are on the wrong side of the city.** Checked before writing a word of keyword copy:

| Source | Finding |
| --- | --- |
| [pincodes.info — Ramdas Pally, 501510](https://pincodes.info/in/Andhra-Pradesh/K-V-Rangareddy/Seriguda/Ramdas-Pally-Hyderabad/) | Pincode **501510**, delivered by **Seriguda B.O**, under **Ragannaguda X Roads S.O**, **Ibrahimpatnam taluk**, K.V. Rangareddy district |
| [villageinfo.in — pincode 501510](https://villageinfo.in/pincode/501510/) | 501510 covers Adibatla and Turkayamjal municipalities plus ~15 villages across the **Ibrahimpatnam, Abdullapurmet, Hayathnagar, Maheshwaram and Saroornagar** sub-districts |
| [NoBroker — Ramdas Pally locality](https://www.nobroker.in/locality-iq/ramdas-pally-hyderabad-liqlt) | Adjacent localities listed as **Bongloor, Manneguda, Tarur, Omerkhan Daira, Mangalpalle**. Nearby landmarks: **Sanghi Temple, Ramoji Film City, Ibrahimpatnam Lake**. Civic services: **Turkayamjal Municipality**, **Hayathnagar police and fire station** |

So Ramdas Pally sits on the **south-east edge** of Hyderabad, off the Nagarjuna Sagar road, near the ORR's Bongulur exit — the Ramoji Film City / Sanghi Temple corridor.

**Consequences:**

1. **Do not claim proximity to Gachibowli, the Financial District, Moinabad, Chevella or Shankarpally.** Those are 45–60 km away across the whole city. Targeting them would rank the site for searchers who will abandon the moment they open the map, which costs more than the traffic is worth.
2. **`src/content/home-sections.ts` currently says the wrong thing.** The FAQ "How far is it from the city?" answers *"We are at Ramdas Pally, on the western side of Hyderabad. Most guests coming from the Gachibowli and Financial District side are with us inside an hour…"*. That is the eastern side, and Gachibowli is not the relevant catchment. I have not edited that file — other agents are in it — but it needs fixing before launch, and it needs fixing for accuracy, not just SEO.
3. **The about-page H1 "Eleven acres, forty minutes from the noise" asserts a drive time nobody has measured.** Forty minutes from LB Nagar is plausible; forty minutes from HITEC City is not. Measure it from a named origin, or drop the number.
4. **Shamshabad / RGIA is genuinely reachable** — the ORR connects the Bongulur exit to the airport exit without going through the city — but I could not verify the drive time from a source, so no figure appears in any recommended copy. Measure it, then use it; it is a strong differentiator for a destination wedding with out-of-town guests.

The real catchment, and therefore the real locality keyword set: **LB Nagar, Hayathnagar, Nagarjuna Sagar Road, Turkayamjal, Ibrahimpatnam, Adibatla, Pedda Amberpet, Bongulur, Uppal, Nagole, Vanasthalipuram, Dilsukhnagar.**

Two landmark terms are worth more than any of them: **Ramoji Film City** and **Sanghi Temple**. Ramoji is ~6 km from Sanghi Temple ([alldistancebetween](https://alldistancebetween.com/in/distance-between/sanghi-temple-ramoji-film-city-5ca1fa5e871bf434eb6e4a585675ca31/)) and both are in Gala Retreat's immediate neighbourhood. Ramoji Film City also [sells weddings itself](https://www.ramojifilmcity.com/wedding/wedding-venues-hyderabad), which makes it simultaneously the strongest local landmark and a direct competitor — "wedding venue near Ramoji Film City" is a query with commercial intent that Ramoji's own site cannot satisfy for a couple who wants somewhere quieter.

## B1. How this market actually phrases things

Verified vocabulary, taken from live category pages rather than guessed:

- **"Function hall" is the dominant regional term**, not "banquet hall". [mandap.com runs a `/hyderabad/function-halls-in-nagarjuna sagar road` category](https://www.mandap.com/hyderabad/function-halls-in-nagarjuna%20sagar%20road) and [weddingz.in has `/marriage-halls/hyderabad/hayathnagar/`](https://weddingz.in/marriage-halls/hyderabad/hayathnagar/). Both localities are Gala Retreat's actual neighbourhood.
- **WedMeGood's convention-hall category** ([wedmegood.com/vendors/hyderabad/wedding-venues/all/convention-halls/](https://www.wedmegood.com/vendors/hyderabad/wedding-venues/all/convention-halls/)) uses H1 *"Convention / Function Halls in Hyderabad"* and labels venues with types quoted verbatim from the page: **"Convention Hall & Lawn"**, **"Pillarless Convention Hall"**, **"Large Lawn with Banquet"**, **"Resort w/ Lawn & Banquet"**, **"Large Banquet Hall & Lawns"**. Capacity is shown as **"200-4000 pax"**; price as per-plate and per-day rental ranges.
- **"Pillarless" is a filter label, not a flourish.** `src/content/spaces.ts` already describes the hall as pillarless. That word belongs in the H2 of the hall section, in the gallery alt text, and in the enquiry page. It is the cheapest differentiator on the site.
- **"pax"** is how capacity is written in listings. Use "600 guests" in prose for humans, but make sure "600" appears as a bare numeral so it matches capacity-bracket queries.
- **Vernacular terms worth a mention in body copy**: *kalyana mandapam*, *muhurtham*, *sangeet*, *haldi*, *mehendi*. `home-sections.ts` already uses "muhurtham" — good instinct, keep it.
- **Price is hidden by the venues and published by the aggregators**, which is the whole opportunity. Not one of the six Hyderabad venue sites audited in A2 shows a rupee figure for an event. Meanwhile the listing sites publish rates for Gala Retreat's own neighbourhood, and every buyer sees them first:

  | Source | Locality | Rates shown |
  | --- | --- | --- |
  | [mandap.com — Ibrahimpatnam](https://www.mandap.com/hyderabad/wedding-venues-in-ibrahimpatnam) | **Ibrahimpatnam** — the venue's own mandal | `KMR Function Hall ₹1,00,000/day, 600 capacity` · `YLR Gardens ₹65,000/day, 1,000` · `Shastha Gardens ₹75,000/day, 1,500` · `Veda Convention Lawn ₹6,00,000/day, 1,200` |
  | [weddingz.in — Hayathnagar](https://weddingz.in/wedding-venues/hyderabad/hayathnagar/) | Hayathnagar | `₹300–500 per plate` across ten halls at 450–1,500 guests |
  | [WedMeGood — convention halls](https://www.wedmegood.com/vendors/hyderabad/wedding-venues/all/convention-halls/) | city-wide | `₹699` to `₹2,250 per plate` |

  **Read the middle row carefully before pricing anything.** Gala Retreat's immediate neighbourhood is a **₹300–500 per plate** market. The ₹2,99,999 package is a premium position *for this locality*, and the site has to earn it on the farm stay, the pillarless hall, the in-house team and the 11 acres — not assume it. The single most useful competitor on that list is **KMR Function Hall at ₹1,00,000/day for the same 600 capacity**: that is the number a buyer will hold up. The answer is that ₹1 lakh buys a hall and nothing else, while ₹2,99,999 buys the hall, the lawn, the LED wall, the DJ, security and decor — but the site has to *say* so, itemised, or the comparison is lost by default.

  *(For wider context: third-party guides quote ₹1.5–4 lakh/day for standard function halls and ₹5–15 lakh/day for premium convention centres — [prashastaevents.com](https://prashastaevents.com/blogs/convention-hall-cost-in-hyderabad/). Those are blog figures, not audited data; they are directional only and should never be republished as fact on the site.)*

## B2. Keyword map

Grouped by the job the searcher is doing. The machine-readable version is `src/content/seo.ts` → `keywordClusters`.

**No search-volume figures appear anywhere in this document.** I did not have access to a keyword tool with real data for the `.in` market, and fabricated numbers would be worse than none. Ordering within each cluster is my judgement of relevance to this venue.

### Head terms — commercial
`wedding venues in Hyderabad` · `convention centre Hyderabad` · `convention hall Hyderabad` · `function halls in Hyderabad` · `banquet hall Hyderabad` · `marriage hall Hyderabad` · `kalyana mantapam Hyderabad` · `kalyana mandapam Hyderabad` · `wedding halls in Hyderabad`

Brutally competitive — aggregators (WedMeGood, WeddingWire India, Weddingz, VenueLook, mandap.com) own page one and a single venue site rarely displaces them. Target these on the home page for brand-adjacent and long-tail spillover, but do not build the strategy on them.

### Space and capacity — commercial
`pillarless convention hall Hyderabad` · `banquet hall with lawn Hyderabad` · `convention hall and lawn Hyderabad` · `outdoor wedding venue Hyderabad 500 guests` · `wedding venue for 600 guests Hyderabad` · `AC function hall Hyderabad` · `open lawn wedding venue Hyderabad` · `wedding venue with rooms Hyderabad`

**This is the winnable cluster.** Every term describes something Gala Retreat verifiably has, the aggregators serve them with generic filter pages, and the intent is specific enough that a single venue page can out-answer a list.

### Farm, resort and destination — commercial
`farm house for wedding near Hyderabad` · `farmhouse wedding venue Hyderabad` · `resort wedding near Hyderabad` · `destination wedding near Hyderabad` · `resort with convention hall Hyderabad` · `farm stay near Hyderabad` · `farmhouse with swimming pool near Hyderabad`

The farm stay is the most under-exploited asset on the property. It is a separate audience with separate seasonality — weekend family stays fill dates weddings never would — and it reaches queries the event pages cannot.

### Locality — local
`wedding venues in Ibrahimpatnam` · `function halls Nagarjuna Sagar Road` · `convention hall LB Nagar` · `function hall Hayathnagar` · `marriage hall Ibrahimpatnam` · `banquet hall Turkayamjal` · **`wedding venue near Ramoji Film City`** · `function hall near Sanghi Temple` · `convention hall near ORR Bongulur exit` · `wedding venue Adibatla` · `function hall Ramdas Pally`

**Two of these are proven categories, not guesses.** [mandap.com](https://www.mandap.com/hyderabad/wedding-venues-in-ibrahimpatnam) and [venuebookingz](https://www.venuebookingz.com/venues/hyderabad/ibrahimpatnam/wedding-venues/7831) both run dedicated **Ibrahimpatnam** venue pages, and weddingz runs a **Hayathnagar** one. None of the six venue sites audited in A2 targets either. Note too that `Manneguda` — a direct neighbour of Ramdas Pally per the NoBroker locality data — appears in weddingz's own Hyderabad locality list.

Low competition, high conversion, and every one of them is geographically honest.

### Occasion — commercial
`sangeet venue Hyderabad` · `reception hall Hyderabad` · `engagement venue Hyderabad` · `haldi and mehendi venue Hyderabad` · `tilak and sagan venue Hyderabad` · `birthday party hall Hyderabad` · `corporate offsite venue Hyderabad` · `conference hall Hyderabad` · `team outing resort near Hyderabad` · `muhurtham hall Hyderabad`

Naming the individual rituals is a trick borrowed from the weakest site in the A2 audit: Aura Retreat's meta description is the only one in the market that lists `haldi, sangeet, tilak, sagan` explicitly. Bad site, good instinct — a multi-day Indian wedding is searched one function at a time.

The corporate half matters more than it looks. An LED wall, rigged sound and 11 acres is a conference product, and Adibatla (TCS, Tata Advanced Systems), Pocharam and Uppal put large employers on *this* side of the ORR — unlike the wedding competition, which clusters west. Corporate demand is weekday demand; wedding demand is weekend and seasonal. They do not cannibalise each other.

### Price and package — transactional
`wedding venue Hyderabad price` · `convention hall cost Hyderabad` · `all inclusive wedding package Hyderabad` · `wedding package Hyderabad 3 lakhs` · `banquet hall booking Hyderabad` · `convention hall rent per day Hyderabad` · `resort wedding near Hyderabad price`

The highest-intent cluster on the list and the one competitors deliberately abandon by hiding pricing behind a form.

### Research and planning — informational
`how much does a wedding venue cost in Hyderabad` · `how far in advance to book a wedding venue Hyderabad` · `indoor or outdoor wedding Hyderabad weather` · `what is a pillarless hall` · `wedding venue checklist India` · `muhurtham dates wedding venue booking`

Top-of-funnel. Only worth chasing once the commercial pages are landed, and only as genuinely useful writing.

### Brand — local
`Gala Retreat Hyderabad` · `Gala Retreat Resort & Convention` · `Gala Retreat Ramdas Pally` · `Gala Retreat convention hall`

Currently near-invisible: a search for `"Gala Retreat" Resort Convention Ramdas Pally Hyderabad` returned no result for the venue itself, only competitors and a Justdial category page for [resorts in Ramdas Pally](https://www.justdial.com/Rangareddy/Resorts-in-Ramdas-Pally/nct-10406930). **Owning the brand name is job zero** — an Instagram account and a website that has not been indexed is not a brand presence. Note also that "Aura Retreat" (auraretreat.in) is a live Hyderabad resort with a confusably similar name.

## B3. Page-by-page metadata

Machine-readable in `src/content/seo.ts` → `pageSeo`. Every title is under 60 characters and every description under 155; verified by script, not by eye.

**One implementation note.** `src/app/(site)/layout.tsx` sets `title.template = '%s — Gala Retreat'`. The titles below are **full rendered titles**, so applying them needs `title: { absolute: … }`. If they are dropped in as bare strings the brand appears twice and every title blows past 60 characters.

### `/` — home
- **Title** (54): `Wedding & Convention Venue in Hyderabad | Gala Retreat`
- **Description** (130): `Pillarless convention hall, open lawn and private farm stay on 11 acres near Hyderabad. Up to 600 guests, packages from ₹2,99,999.`
- **H1**: `A wedding and convention venue on eleven quiet acres.`
- **Keywords**: wedding venues in Hyderabad · convention centre Hyderabad · function halls in Hyderabad · banquet hall with lawn Hyderabad · wedding venue for 600 guests Hyderabad

The H1 is a change and I want to argue for it. The page currently opens with `Where luxury meets celebration.` — a strong line that contains not one word anyone searches for, on the single most important heading on the site. The fix is not to bolt keywords onto it; it is to demote the tagline to the kicker above the H1 (where the `u-label` treatment already exists and where it reads better anyway) and let the H1 say what the place is. `A wedding and convention venue on eleven quiet acres.` sets in two lines at `8.5vw` exactly like the current line, and carries both head terms without sounding optimised. If the tagline must stay as the H1, then the very next heading has to be an H2 carrying "wedding and convention venue in Hyderabad" — but that is the weaker version.

The description leads with the three spaces rather than the venue name because the venue name means nothing to a stranger yet, and closes with the price because no competitor's snippet does.

### `/about`
- **Title** (53): `About Gala Retreat — Venue in Ramdas Pally, Hyderabad`
- **Description** (138): `Eleven acres at Ramdas Pally: how the convention hall, the open lawn and the farm stay work, and why one in-house team runs the whole day.`
- **H1**: `Eleven acres on the quiet side of Hyderabad.`
- **Keywords**: resort with convention hall Hyderabad · pillarless convention hall Hyderabad · farm stay near Hyderabad · 11 acre wedding venue Hyderabad · wedding venue Ramdas Pally

H1 changed only to remove the unverified "forty minutes". Restore the number the moment someone measures it from a named origin — a real drive time is worth more than the phrase it replaces.

### `/gallery`
- **Title** (47): `Gallery — Hall, Lawn & Farm Stay | Gala Retreat`
- **Description** (130): `Photographs of the convention hall, the open lawn, the farm stay and past weddings at Gala Retreat Resort & Convention, Hyderabad.`
- **H1**: `Photographs of the hall, the lawn and the farm stay.`
- **Keywords**: convention hall photos Hyderabad · outdoor wedding venue Hyderabad · wedding lawn Hyderabad · farmhouse wedding venue Hyderabad · mandap setup Hyderabad

Gallery pages earn their traffic through **image search and alt text**, not headings. The alt text in `src/content/gallery.ts` is the real SEO surface here: every alt should name the space and the city once, describe what is actually in the frame, and never repeat a formula. Filenames should follow (`convention-hall-600-seated-hyderabad.jpg` beats `hall-01.jpg`) — worth doing at the next image drop, not worth a rename migration now.

### `/enquiry`
- **Title** (53): `Check Availability & Pricing | Gala Retreat Hyderabad`
- **Description** (141): `Tell us your date, occasion and guest count. We come back with what is free and what it costs — packages from ₹2,99,999 for up to 600 guests.`
- **H1**: `Check a date and get a price.`
- **Keywords**: wedding venue Hyderabad price · convention hall booking Hyderabad · all inclusive wedding package Hyderabad · banquet hall availability Hyderabad · wedding venue enquiry Hyderabad

"and get a price" is a four-word addition that answers the objection every other venue creates. The title says "Pricing" for the same reason: it is the word that separates this SERP snippet from the row of "Contact Us" results around it.

### `/contact`
- **Title** (49): `Contact & Directions | Gala Retreat, Ramdas Pally`
- **Description** (137): `Gala Retreat Resort & Convention, Ramdas Pally, Hyderabad 501510. Call, message on WhatsApp, or open the map for directions to the venue.`
- **H1**: `Ramdas Pally, and someone always picks up.` *(unchanged — it is the best line on the site)*
- **Keywords**: Gala Retreat Ramdas Pally · wedding venue near Ramoji Film City · function hall Nagarjuna Sagar Road · convention hall near ORR Bongulur exit · marriage hall Ibrahimpatnam

The contact page is where "near Ramoji Film City" and "off the Nagarjuna Sagar road" belong, as a genuinely useful *Getting here* paragraph — landmark, ORR exit, and a measured drive time from two named origins. Written as directions rather than as keywords it ranks and it helps, which is the only combination worth having.

### `/privacy`
- **Title** (29): `Privacy Policy | Gala Retreat`
- **Description** (127): `What Gala Retreat Resort & Convention collects when you use this website, why it is kept, and how to change your mind about it.`
- **H1**: `What we collect, in plain words.` *(unchanged)*
- **Keywords**: deliberately thin — one brand term. Leave it indexable at low priority; do not optimise it.

## B4. Local SEO — the part that will actually move bookings

For a venue on the outer edge of an Indian city, the local pack and the aggregator listings will out-deliver organic blue links for at least the first year. Ranked by return:

**1. Google Business Profile.** The single highest-leverage asset, and it must be a *verified physical location* — not a service area — because the searcher is coming to you.
- Primary category **Wedding venue**. Secondaries: **Convention center**, **Banquet hall**, **Resort hotel**, **Event venue**. The primary category is the biggest single ranking lever in the pack; do not waste it on something generic.
- 40+ photos, geotagged where possible, refreshed after every event. Hall set for dinner, lawn at night with the string lighting on, the pool, the approach road, the parking, the LED wall lit.
- Use **Products** to publish the ₹2,99,999 package with its inclusions. Almost nobody in this market does, and it renders directly in the profile.
- **Posts** weekly during season. **Q&A** seeded with the same questions as `faqTargets` — you are allowed to ask and answer your own.
- Booking/appointment link pointed at `/enquiry`, and the WhatsApp number wired into messaging.
- **Reviews are the whole game.** Ask the family the week after the event, when they are still grateful, with a short link. Reply to every one. Never buy any.

**2. NAP consistency — and there is a decision to make first.** `src/config/site.ts` exposes two numbers: WhatsApp `+91 98488 19444` (Bookings) and phone `+91 90328 07333` (Reception). **Pick one as the canonical citation number** and use it identically everywhere — GBP, every directory, the footer, the schema. The other stays on the site as a secondary. Two numbers scattered across citations is exactly the inconsistency that dilutes local authority. Fix the canonical address string once, in writing, and never retype it from memory:

> Gala Retreat Resort & Convention, Ramdas Pally, Hyderabad, Telangana 501510, India

**3. Directories that matter in this market**, roughly in order:
- **Wedding-specific**: [WedMeGood](https://www.wedmegood.com/), [WeddingWire India](https://www.weddingwire.in/), [Weddingz.in](https://weddingz.in/) (OYO), [VenueLook](https://www.venuelook.com/), [mandap.com](https://www.mandap.com/), [wedding.net](https://hyderabad.wedding.net/), ShaadiSaga, Sloshout, VenueBookingz, PartyKaro. These are simultaneously your competitors for the head terms and your best referral channel — the listing outranks you, so be *in* it. Several are pay-to-feature; the free listing is still worth claiming.
- **General Indian citations**: Justdial (highest local citation authority in India), Sulekha, Bing Places, Apple Business Connect, Facebook Page, Mappls/MapmyIndia.
- Note the [Justdial "Resorts in Ramdas Pally" category page](https://www.justdial.com/Rangareddy/Resorts-in-Ramdas-Pally/nct-10406930) already exists and reports 23 resorts in the locality — that page is a live local SERP competitor and a listing on it is free.

**4. Language.** The site is correctly `lang="en-IN"`. A full Telugu translation is over-investment for now, but the GBP description and a line of body copy can carry *kalyana mandapam* and *muhurtham* naturally, because that is how a share of this market types.

**5. The one link-building asset the venue already owns.** `src/content/spaces.ts` records that Gala Retreat was the host venue for **Grand Diva International, Season 2**. A hosted event with its own organisers, press and social presence is a source of genuine editorial mentions and links — the only kind that still counts. Ask the organisers for a credit and a link, and do the same after every notable event. That is worth more than any number of directory submissions.

**6. Instagram → website.** [@gala_retreat](https://www.instagram.com/gala_retreat/) is the venue's existing audience. It should link to `/enquiry`, not the home page, and the site should be listed in `sameAs` alongside the GBP URL once it exists.

## B5. Schema.org beyond `EventVenue`

The current JSON-LD in `src/app/(site)/layout.tsx` is a single `EventVenue` node. Two problems with that, both verified against schema.org:

- **`EventVenue` is not a business.** Its hierarchy is `Thing > Place > CivicStructure > EventVenue` ([schema.org/EventVenue](https://schema.org/EventVenue)). It inherits `maximumAttendeeCapacity`, `amenityFeature`, `geo`, `hasMap`, `openingHoursSpecification`, `aggregateRating`, `photo` and `telephone` from `Place` — but it is not a `LocalBusiness`, so `priceRange`, `currenciesAccepted` and `paymentAccepted` do not belong to it.
- **`email` is not a valid property of `Place`/`EventVenue`** — it belongs to `Organization` / `ContactPoint`. The current node sets it. Harmless, but it is invalid markup and it is the sort of thing that makes a validator report look untrustworthy.

The fix is a single `@graph` with cross-referenced `@id`s rather than one overloaded node:

| Type | Where | Why |
| --- | --- | --- |
| **`Resort`** *(`Thing > Organization > LocalBusiness > LodgingBusiness > Resort`, [schema.org/Resort](https://schema.org/Resort))* | site-wide, `@id: #venue` | The business node. Carries `priceRange`, `openingHoursSpecification`, `geo`, `hasMap`, `numberOfRooms: 2` for the farm stay, `amenityFeature`, `telephone`, `sameAs`. This is what a local pack understands. |
| **`EventVenue`** | site-wide, `@id: #eventvenue`, `containedInPlace: #venue` | Keep it — it is the correct home for `maximumAttendeeCapacity: 600`. Just stop making it do the business's job. |
| **`Organization`** | site-wide, `@id: #org` | `legalName`, `logo`, and a `ContactPoint` with `contactType: "reservations"`, `areaServed: "IN"`, `availableLanguage: ["en", "te", "hi"]`. This is where `email` legitimately lives. |
| **`WebSite`** | site-wide | `publisher: #org`. Cheap, and it is how the brand name gets associated with the domain. |
| **`BreadcrumbList`** | every non-home page | Renders in mobile SERPs and costs nothing. |
| **`Offer`** *(or `AggregateOffer`)* | home, attached to a `Service` node | `price: 299999`, `priceCurrency: "INR"`. **Only publish it if ₹2,99,999 is current and honest** — note `src/content/home-sections.ts` already flags several package inclusions as unconfirmed assumptions. Wrong price markup is worse than none. |
| **`Service`** | home | The event-production offering — wedding, reception, corporate — with `areaServed` and `provider: #org`. Gives the occasion cluster something to attach to. |
| **`ImageGallery`** + `ImageObject` | `/gallery` | Feeds image search, which is where a venue gallery earns its traffic. |
| **`ContactPage`** / **`AboutPage`** | `/contact`, `/about` | Page-type disambiguation. Trivial to add. |
| **`FAQPage`** | home | See below. |
| **`AggregateRating`** / **`Review`** | — | **Do not add until real reviews exist.** Fabricated review markup is a manual-action risk and there is currently nothing to mark up. |
| **`GeoCoordinates`** | on `#venue` | Needs a real lat/lng from the Google Business Profile pin. Until the profile exists this stays out — a guessed coordinate on the wrong side of the city is worse than no coordinate. |

**On `FAQPage`:** Google [restricted FAQ rich results to well-known authoritative government and health sites in August 2023](https://www.searchenginejournal.com/google-downgrades-visibility-of-howto-and-faq-rich-results/493522/), so this markup will **not** produce a SERP accordion for a wedding venue. Add it anyway, but for the right reason: those passages are what get lifted into AI Overviews, assistant answers and People Also Ask. Write the answers to be liftable — one direct sentence first, detail after. The ten questions in `faqTargets` are chosen on exactly that basis, and six of them are already answered in `home-sections.ts`.

**Also worth doing, and not schema:**
- `sitemap.ts` and `robots.ts` already exist and are correct. Leave them.
- `site.url` is still `https://galaretreat.in`, registered as a guess in `src/config/pending.ts`. **I checked: that hostname does not resolve** — `curl` returns `Could not resolve host` for both the apex and `www`. Nothing above works until the real domain is registered and pointed, because every canonical, every OG URL, every sitemap entry and every schema `@id` derives from it.
- The hero image is the LCP element on the highest-value page. It is the one performance number worth watching.
