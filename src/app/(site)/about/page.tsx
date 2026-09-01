import type { Metadata } from 'next'
import Link from 'next/link'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import SmartImage from '@/components/SmartImage'
import { site } from '@/config/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Gala Retreat is a convention hall, open lawn and private farm stay on the quiet side of Hyderabad — one team, one address, up to 600 guests.',
  alternates: { canonical: '/about' },
}

const principles = [
  {
    n: '01',
    title: 'One team, not seven vendors',
    body: 'Decor, catering, sound, LED, security and housekeeping are coordinated in-house. You brief one person and they carry it. Most of what goes wrong at a wedding goes wrong in the gaps between suppliers — we removed the gaps.',
  },
  {
    n: '02',
    title: 'The family stays on site',
    body: 'The farm stay has two premium bedrooms, a pool, a garden and a play area for the children. Getting ready in the morning and disappearing at midnight happen at the same address as the function.',
  },
  {
    n: '03',
    title: 'Built for evenings',
    body: 'The lawn is walled and genuinely dark after sunset, which is the only way string lighting and projection actually read on camera. The hall is pillarless, so no guest sits behind a column.',
  },
  {
    n: '04',
    title: 'Priced as a package',
    body: 'Venue, production and staffing quoted as one number from ₹2,99,999, rather than a low hall rate followed by a long list of extras. You know the figure before you commit the date.',
  },
]

export default function About() {
  return (
    <>
      <section className="pb-[clamp(3rem,7vw,6rem)] pt-[clamp(8rem,16vw,13rem)]">
        <div className="u-grid gap-y-10">
          <Reveal className="col-span-12 lg:col-span-7 lg:col-start-2">
            <p className="u-label text-accent">About the venue</p>
            <h1 className="u-display mt-8 text-[clamp(2.5rem,7vw,5.5rem)] text-ink">
              Eleven acres, forty minutes from the noise.
            </h1>
          </Reveal>

          <Reveal delay={160} className="col-span-12 lg:col-span-3 lg:col-start-10 lg:pt-20">
            <p className="text-ink/72">
              Gala Retreat sits at Ramdas Pally, far enough out that the lawn is
              quiet and close enough that your guests are not making a journey
              of it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Full-bleed, parallaxed — the page's visual anchor. */}
      <section className="relative h-[70svh] min-h-[26rem] overflow-hidden">
        <Parallax factor={0.1} className="absolute inset-0">
          <div className="relative h-[122%] w-full">
            <SmartImage
              src="/images/lawn/lawn-01.jpg"
              alt="The open lawn at Gala Retreat arranged for a daytime ceremony"
              fill
              placeholder
              sizes="100vw"
              className="object-cover"
              wrapperClassName="absolute inset-0"
            />
          </div>
        </Parallax>
        {/* Two scrims, both keyed to the active theme's ground: a flat one to
            pull the photograph toward the surface colour, and a vertical one so
            the band is seated in the page rather than pasted onto it. Keeps
            bright daylight photography inside the palette in either theme. */}
        <span aria-hidden className="absolute inset-0 bg-surface/45" />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface opacity-75"
        />
      </section>

      {/* Story — two offset columns, the second dropped down the page. */}
      <section className="py-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid gap-y-12">
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-2">
            <p className="u-label mb-8 text-accent">The story</p>
            <p className="u-display-sm text-[clamp(1.4rem,2.4vw,1.9rem)] text-ink">
              We started as a farmhouse that kept being asked to host weddings.
            </p>
          </Reveal>

          <Reveal delay={140} className="col-span-12 lg:col-span-5 lg:col-start-7 lg:pt-16">
            <div className="space-y-6 text-ink/72">
              <p>
                The pool, the garden and the two bedrooms came first. Families
                would book the farmhouse for a weekend, and then ask whether the
                lawn could take a hundred and fifty people for a reception. Then
                three hundred. Then the hall was built.
              </p>
              <p>
                What we learned in between is the thing the site is really
                about: a celebration is not a room you rent. It is a day that
                has to hold together from the morning haldi to the last car
                leaving at two in the morning — and that only works when the
                same people are responsible for all of it.
              </p>
              <p>
                So Gala Retreat is deliberately not a hall for hire. It is a
                venue with a production team attached, and somewhere for the
                family to sleep at the end of it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles — numbered, hung off-grid, not a feature card row. */}
      <section className="pb-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid">
          <div className="col-span-12 lg:col-span-9 lg:col-start-3">
            <p className="u-label mb-14 text-accent">What is different</p>
            <ul>
              {principles.map((p, i) => (
                <Reveal as="li" key={p.n} delay={i * 90}>
                  <div className="grid grid-cols-12 gap-x-6 border-t border-ink/12 py-10 last:border-b">
                    <span className="u-label col-span-12 mb-4 text-accent tabular-nums sm:col-span-2 sm:mb-0">
                      {p.n}
                    </span>
                    <h2 className="u-display-sm col-span-12 text-[clamp(1.3rem,2.2vw,1.75rem)] text-ink sm:col-span-10 lg:col-span-4">
                      {p.title}
                    </h2>
                    <p className="col-span-12 mt-4 text-[0.95rem] leading-relaxed text-ink/72 sm:col-span-10 sm:col-start-3 lg:col-span-6 lg:col-start-7 lg:mt-0">
                      {p.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Figures — set in the display face, treated as typography. */}
      <section className="border-y border-ink/10 bg-lawn py-[clamp(3.5rem,7vw,5.5rem)]">
        <div className="u-grid gap-y-10">
          {[
            { v: String(site.capacity), l: 'Guests, seated' },
            { v: String(site.acres), l: 'Acres of grounds' },
            { v: '02', l: 'Premium bedrooms' },
            { v: '04', l: 'Bookable spaces' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 80} className="col-span-6 lg:col-span-3">
              <p className="u-numeral text-[clamp(2.8rem,6vw,4.5rem)] text-champagne">
                {s.v}
              </p>
              <p className="u-label mt-4 text-ivory/70">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid">
          <Reveal className="col-span-12 lg:col-span-7 lg:col-start-3">
            <h2 className="u-display text-[clamp(2rem,4.8vw,3.6rem)] text-ink">
              Come and walk the lawn before you decide.
            </h2>
            <div className="mt-11 flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link
                href="/enquiry"
                className="u-label border border-accent px-9 py-4 text-accent transition-colors duration-500 hover:bg-accent hover:text-on-accent"
              >
                Book a site visit
              </Link>
              <Link href="/gallery" className="u-link u-label text-ink/72">
                or see the gallery
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
