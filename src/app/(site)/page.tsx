import Link from 'next/link'
import Carousel from '@/components/Carousel'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import SmartImage from '@/components/SmartImage'
import SpacesIndex from '@/components/SpacesIndex'
import { site } from '@/config/site'
import { heroSlides } from '@/content/gallery'
import { seasonal } from '@/content/seasonal'

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

      {/* ── Spaces ───────────────────────────────────────────────────── */}
      <section className="pb-[clamp(5rem,12vw,10rem)]">
        <div className="u-grid mb-16">
          <Reveal className="col-span-12 lg:col-span-6 lg:col-start-3">
            <p className="u-label text-accent">02 — The spaces</p>
          </Reveal>
        </div>
        <SpacesIndex />
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

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="py-[clamp(5rem,12vw,10rem)]">
        <div className="u-grid">
          <Reveal className="col-span-12 lg:col-span-8 lg:col-start-3">
            <p className="u-label text-accent">03 — Next step</p>
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
    </>
  )
}
