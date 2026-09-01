import type { Metadata } from 'next'
import Link from 'next/link'
import Carousel from '@/components/Carousel'
import FaqAccordion from '@/components/FaqAccordion'
import MomentsCarousel from '@/components/fx/MomentsCarousel'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import RevealDepth from '@/components/RevealDepth'
import SmartImage from '@/components/SmartImage'
import SpacesIndex from '@/components/SpacesIndex'
import TiltCard from '@/components/TiltCard'
import { site } from '@/config/site'
import { heroSlides } from '@/content/gallery'
import { packageInclusions, planningSteps } from '@/content/home-sections'
import { moments, occasions } from '@/content/occasions'
import { seasonal } from '@/content/seasonal'
import { graphFor, jsonLdString, pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('/')

/**
 * Titles for the moments rail. Kept here rather than in the content file so the
 * captions stay tied to this section's editing, not to the image manifest.
 * Order matches `moments`.
 */
const MOMENT_CAPTIONS = [
  { eyebrow: 'Before the day', title: 'Mehndi and bangles' },
  { eyebrow: 'The lawn', title: 'Candlelight down the table' },
  { eyebrow: 'Arrival', title: 'Through the flower arch' },
  { eyebrow: 'Convention hall', title: 'The long table' },
  { eyebrow: 'The lawn', title: 'Dinner under the trees' },
  { eyebrow: 'The reception', title: 'The first dance' },
  { eyebrow: 'Tradition', title: 'The threshold ritual' },
  { eyebrow: 'Convention hall', title: 'Set for dinner' },
]

const momentCards = moments.map((m, i) => ({
  photo: { ...m, space: 'events' as const },
  eyebrow: MOMENT_CAPTIONS[i]?.eyebrow,
  title: MOMENT_CAPTIONS[i]?.title ?? 'At Gala Retreat',
  href: '/gallery',
}))

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          Full-bleed slideshow. Type sits low-left against a hairline —
          never centred, never over a gradient blob. */}
      <section className="relative h-[100svh] min-h-[38rem] w-full">
        <Carousel
          slides={heroSlides}
          variant="hero"
          autoPlayMs={6000}
          className="h-full w-full"
          overlay={
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-28 sm:pb-32">
              <div className="u-grid w-full">
                <div className="col-span-12 lg:col-span-7">
                  <div className="pointer-events-auto border-l border-champagne/50 pl-6 sm:pl-8">
                    <p className="u-label text-champagne">
                      Convention · Lawn · Farm Stay · Events
                    </p>
                    <h1 className="u-display mt-7 text-[clamp(2.75rem,8.5vw,6.5rem)] text-ivory">
                      Where luxury
                      <br />
                      meets celebration.
                    </h1>
                    <p className="u-measure mt-8 text-[1.05rem] text-ivory/70">
                      {site.capacity} guests, one evening, on the quiet side of
                      Hyderabad.
                    </p>
                    <Link
                      href="/enquiry"
                      className="u-label mt-10 inline-flex items-center gap-3 border border-champagne px-8 py-4 text-champagne transition-colors duration-500 hover:bg-champagne hover:text-nightfall"
                    >
                      Enquire
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </section>

      {/* ── Statement ────────────────────────────────────────────────── */}
      <section className="py-[clamp(5rem,12vw,10rem)]">
        <div className="u-grid gap-y-12">
          <Reveal className="col-span-12 lg:col-span-1">
            <span className="u-numeral block text-[clamp(3rem,6vw,5rem)] text-accent/35">
              01
            </span>
          </Reveal>

          <Reveal delay={100} className="col-span-12 lg:col-span-6 lg:col-start-3">
            <p className="u-label mb-8 text-accent">The venue</p>
            <h2 className="u-display text-[clamp(2rem,4.6vw,3.6rem)] text-ink">
              A hall, a lawn and a farmhouse — booked together, run by one team.
            </h2>
          </Reveal>

          <Reveal delay={220} className="col-span-12 lg:col-span-3 lg:col-start-10 lg:pt-28">
            <p className="text-ink/72">
              Most venues in the city give you a room and a phone number. Gala
              Retreat gives you {site.acres} acres, an in-house production team,
              and somewhere for the family to actually sleep.
            </p>
            <div className="u-rule mt-10 w-12 text-accent" />
          </Reveal>
        </div>
      </section>

      {/* ── Occasions ────────────────────────────────────────────────
          Six cards on a 3D tilt. Deliberately uneven: the second row is
          pushed right so the grid never reads as a feature-card row. */}
      <section className="pb-[clamp(5rem,12vw,10rem)]">
        <div className="u-grid mb-14">
          <Reveal className="col-span-12 lg:col-span-6 lg:col-start-3">
            <p className="u-label text-accent">02 — What people hold here</p>
            <h2 className="u-display-sm mt-6 text-[clamp(1.5rem,2.8vw,2.1rem)] text-ink">
              One address for the whole occasion, from the haldi to the
              farewell breakfast.
            </h2>
          </Reveal>
        </div>

        <div className="u-grid gap-y-[clamp(1.5rem,3vw,2.5rem)]">
          {occasions.map((o, i) => (
            <RevealDepth
              key={o.id}
              delay={(i % 3) * 90}
              className={`col-span-12 sm:col-span-6 lg:col-span-4 ${
                i >= 3 ? 'lg:col-start-auto' : ''
              }`}
            >
              <div className={i >= 3 ? 'lg:mt-12' : ''}>
                <TiltCard glare max={5}>
                  <article className="group relative overflow-hidden">
                    <SmartImage
                      src={o.image}
                      alt={o.alt}
                      width={o.width}
                      height={o.height}
                      placeholder={o.placeholder}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nightfall/85 via-nightfall/20 to-transparent"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                      <h3 className="u-display-sm text-[1.35rem] text-ivory">{o.name}</h3>
                      <p className="mt-2 text-[0.85rem] leading-relaxed text-ivory/80">
                        {o.blurb}
                      </p>
                    </div>
                  </article>
                </TiltCard>
              </div>
            </RevealDepth>
          ))}
        </div>
      </section>

      {/* ── Spaces ───────────────────────────────────────────────────── */}
      <section className="pb-[clamp(5rem,12vw,10rem)]">
        <div className="u-grid mb-16">
          <Reveal className="col-span-12 lg:col-span-6 lg:col-start-3">
            <p className="u-label text-accent">03 — The spaces</p>
          </Reveal>
        </div>
        <SpacesIndex />
      </section>

      {/* ── The package ──────────────────────────────────────────────
          The commercial heart of the page. Set on the secondary surface so
          it reads as a distinct plate without another full-bleed photo. */}
      <section className="border-y border-ink/10 bg-surface-2 py-[clamp(4.5rem,10vw,8rem)]">
        <div className="u-grid gap-y-14">
          <Reveal className="col-span-12 lg:col-span-4">
            <p className="u-label text-accent">04 — What it costs</p>
            <h2 className="u-display mt-7 text-[clamp(1.9rem,4vw,3rem)] text-ink">
              One number, not a list of extras.
            </h2>
            <p className="u-label mt-10 text-ink/60">Complete package from</p>
            <p className="u-numeral mt-3 text-[clamp(2.6rem,6vw,4.2rem)] text-accent">
              ₹2,99,999
            </p>
            <Link
              href="/enquiry"
              className="u-label mt-10 inline-block border border-accent px-8 py-4 text-accent transition-colors duration-500 hover:bg-accent hover:text-on-accent"
            >
              Ask what your date costs
            </Link>
          </Reveal>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {packageInclusions.map((item, i) => (
                <Reveal as="li" key={item.n} delay={(i % 2) * 80}>
                  <div className="border-t border-ink/12 py-7">
                    <span className="u-label tabular-nums text-accent">{item.n}</span>
                    <h3 className="u-display-sm mt-3 text-[1.15rem] text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink/72">
                      {item.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Full-bleed pull quote, with parallax ─────────────────────── */}
      <section className="relative h-[80svh] min-h-[30rem] w-full overflow-hidden">
        <Parallax factor={0.12} className="absolute inset-0">
          <div className="relative h-[124%] w-full">
            <SmartImage
              src="/images/events/events-01.jpg"
              alt="Floral mandap beneath chandeliers at a Gala Retreat wedding"
              fill
              placeholder
              sizes="100vw"
              className="object-cover"
              wrapperClassName="absolute inset-0"
            />
          </div>
        </Parallax>
        <span aria-hidden className="absolute inset-0 bg-nightfall/62" />

        <div className="relative flex h-full items-center">
          <div className="u-grid w-full">
            <Reveal className="col-span-12 lg:col-span-7 lg:col-start-6">
              <p className="u-label text-champagne">Recently at Gala Retreat</p>
              <blockquote className="u-display mt-8 text-[clamp(1.75rem,4vw,3.1rem)] text-ivory">
                Host venue for Grand Diva International, Season&nbsp;2 — a full
                fashion festival, staged end to end on the lawn.
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Moments ──────────────────────────────────────────────────
          A depth carousel rather than a grid: it reads as a reel of the
          venue in use, and pulls people toward the full gallery. */}
      <section className="py-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid mb-12">
          <Reveal className="col-span-12 lg:col-span-5 lg:col-start-2">
            <p className="u-label text-accent">05 — Moments</p>
            <h2 className="u-display mt-7 text-[clamp(1.9rem,4vw,3rem)] text-ink">
              Evenings that already happened here.
            </h2>
          </Reveal>
          <Reveal delay={140} className="col-span-12 lg:col-span-3 lg:col-start-9 lg:pt-20">
            <p className="text-ink/72">
              Drag, scroll or use the arrow keys. Every frame opens in the
              gallery.
            </p>
            <Link href="/gallery" className="u-link u-label mt-6 inline-block text-accent">
              See the full gallery →
            </Link>
          </Reveal>
        </div>

        <MomentsCarousel
          moments={momentCards}
          label="Moments at Gala Retreat"
        />
      </section>

      {/* ── Seasonal banner slot ─────────────────────────────────────── */}
      {seasonal.active && (
        <section className="bg-invert-surface py-[clamp(4rem,9vw,7rem)] text-invert-ink">
          <div className="u-grid items-center gap-y-10">
            <Reveal className="col-span-12 lg:col-span-5">
              <SmartImage
                src={seasonal.image}
                alt={seasonal.alt}
                width={1800}
                height={2700}
                placeholder
                sizes="(max-width: 1024px) 92vw, 40vw"
                className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
              />
            </Reveal>

            <Reveal delay={140} className="col-span-12 lg:col-span-6 lg:col-start-7">
              <p className="u-label text-invert-accent">{seasonal.eyebrow}</p>
              <h2 className="u-display mt-7 text-[clamp(1.9rem,4.2vw,3.2rem)]">
                {seasonal.headline}
              </h2>
              <p className="u-measure-wide mt-7 text-invert-ink/72">{seasonal.body}</p>
              <Link
                href={seasonal.cta.href}
                className="u-label mt-10 inline-block border border-invert-ink/35 px-8 py-4 transition-colors duration-500 hover:bg-invert-ink hover:text-invert-surface"
              >
                {seasonal.cta.label}
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Planning ─────────────────────────────────────────────────
          Three steps, set as oversized numerals so the section reads as
          typography rather than a process diagram. */}
      <section className="pt-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid mb-14">
          <Reveal className="col-span-12 lg:col-span-6 lg:col-start-2">
            <p className="u-label text-accent">06 — How booking works</p>
            <h2 className="u-display mt-7 text-[clamp(1.9rem,4vw,3rem)] text-ink">
              Three steps, and none of them commit you.
            </h2>
          </Reveal>
        </div>

        <div className="u-grid gap-y-12">
          {planningSteps.map((step, i) => (
            <RevealDepth
              key={step.n}
              delay={i * 110}
              className="col-span-12 lg:col-span-3"

            >
              <div className={i === 0 ? 'lg:ml-[8.333%]' : ''}>
                <span className="u-numeral block text-[clamp(2.8rem,5vw,4rem)] text-accent/35">
                  {step.n}
                </span>
                <h3 className="u-display-sm mt-6 text-[1.3rem] text-ink">{step.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/72">
                  {step.detail}
                </p>
              </div>
            </RevealDepth>
          ))}
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────────
          The things people actually ring up to ask, answered before they
          have to. Set as an accordion so the section stays short. */}
      <section className="py-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid gap-y-10">
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-2">
            <p className="u-label text-accent">07 — Questions</p>
            <h2 className="u-display mt-7 text-[clamp(1.9rem,4vw,3rem)] text-ink">
              Before you ring us.
            </h2>
            <p className="u-measure mt-7 text-ink/72">
              If yours is not here, WhatsApp us — you will get a straight
              answer, not a brochure.
            </p>
          </Reveal>

          <Reveal delay={140} className="col-span-12 lg:col-span-6 lg:col-start-7">
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="py-[clamp(5rem,12vw,10rem)]">
        <div className="u-grid">
          <Reveal className="col-span-12 lg:col-span-8 lg:col-start-3">
            <p className="u-label text-accent">08 — Next step</p>
            <h2 className="u-display mt-8 text-[clamp(2.2rem,5.5vw,4.2rem)] text-ink">
              Tell us the date. We will tell you what is free.
            </h2>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link
                href="/enquiry"
                className="u-label border border-accent px-9 py-4 text-accent transition-colors duration-500 hover:bg-accent hover:text-on-accent"
              >
                Send an enquiry
              </Link>
              <a href={`tel:${site.phone.number}`} className="u-link u-label text-ink/72">
                or call {site.phone.display}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Venue, site and package structured data, plus the FAQ answers
          above. Built in src/lib/seo.ts so it cannot drift from the copy. */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdString(graphFor('/')) }}
      />
    </>
  )
}
