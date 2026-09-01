import type { Metadata } from 'next'
import Reveal from '@/components/Reveal'
import SmartImage from '@/components/SmartImage'
import { site, whatsappLink } from '@/config/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Reach Gala Retreat Resort & Convention at ${site.address.line1}, ${site.address.city}. Call ${site.phone.display} or message us on WhatsApp.`,
  alternates: { canonical: '/contact' },
}

const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(
  'Gala Retreat Resort and Convention, Ramdas Pally, Hyderabad',
)}&z=14&output=embed`

export default function Contact() {
  return (
    <>
      <section className="pb-[clamp(3rem,7vw,5rem)] pt-[clamp(8rem,16vw,13rem)]">
        <div className="u-grid gap-y-10">
          <Reveal className="col-span-12 lg:col-span-7">
            <p className="u-label text-accent">Contact</p>
            <h1 className="u-display mt-8 text-[clamp(2.5rem,7vw,5.5rem)] text-ink">
              Ramdas Pally, and someone always picks up.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="pb-[clamp(4rem,9vw,7rem)]">
        <div className="u-grid gap-y-14">
          {/* WhatsApp is the primary action — sized accordingly. */}
          <Reveal className="col-span-12 lg:col-span-5">
            <div className="border-t border-accent/35 pt-9">
              <p className="u-label text-accent">Fastest route</p>
              <h2 className="u-display-sm mt-6 text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
                Message us on WhatsApp.
              </h2>
              <p className="u-measure mt-5 text-[0.95rem] text-ink/72">
                Opens a chat with your message already written. Bookings are
                usually confirmed here rather than by email.
              </p>

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer noopener"
                data-analytics="whatsapp-contact"
                className="group mt-9 inline-flex items-center gap-4 border border-accent px-8 py-4 text-accent transition-colors duration-500 hover:bg-accent hover:text-on-accent"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
                </svg>
                <span className="u-label">{site.whatsapp.display}</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={140} className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-7">
            <div className="border-t border-ink/12 pt-9">
              <p className="u-label text-accent">Call</p>
              <ul className="mt-6 space-y-4 text-ink/72">
                <li>
                  <a href={`tel:${site.phone.number}`} className="u-link block">
                    {site.phone.display}
                  </a>
                  <span className="u-label mt-1.5 block text-ink/60">
                    {site.phone.label}
                  </span>
                </li>
                <li>
                  <a href={`tel:+${site.whatsapp.number}`} className="u-link block">
                    {site.whatsapp.display}
                  </a>
                  <span className="u-label mt-1.5 block text-ink/60">
                    {site.whatsapp.label}
                  </span>
                </li>
                <li className="pt-2">
                  <a href={`mailto:${site.email}`} className="u-link block break-all">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={220} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="border-t border-ink/12 pt-9">
              <p className="u-label text-accent">Visit</p>
              <address className="mt-6 not-italic leading-relaxed text-ink/72">
                {site.legalName}
                <br />
                {site.address.line1}
                <br />
                {site.address.city}, {site.address.state} {site.address.postalCode}
              </address>

              <p className="u-label mt-8 text-accent">Hours</p>
              <ul className="mt-5 space-y-3 text-sm text-ink/72">
                {site.hours.map((h) => (
                  <li key={h.days}>
                    <span className="block text-ink/72">{h.days}</span>
                    {h.time}
                  </li>
                ))}
              </ul>

              <a
                href={site.address.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="u-link u-label mt-8 inline-block text-ink/72"
              >
                Directions →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Map — full-bleed band, muted so it does not fight the palette. */}
      <section className="relative">
        <div className="relative h-[55svh] min-h-[22rem] w-full overflow-hidden bg-surface-2">
          {/* Sits behind the iframe, so the band still reads as a map link if a
              privacy extension or corporate proxy blocks the Google embed. */}
          <a
            href={site.address.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="absolute inset-0 grid place-items-center text-center"
          >
            <span>
              <span className="u-label block text-accent">Find us</span>
              <span className="u-display-sm mt-4 block text-[clamp(1.2rem,2.4vw,1.7rem)] text-ink/72">
                {site.address.line1}, {site.address.city}
              </span>
              <span className="u-label mt-4 block text-ink/60">
                Open in Google Maps →
              </span>
            </span>
          </a>
          <iframe
            src={mapEmbed}
            title={`Map showing ${site.legalName} in ${site.address.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="relative h-full w-full [filter:var(--map-filter)]"
          />
        </div>
      </section>

      <section className="py-[clamp(4rem,10vw,8rem)]">
        <div className="u-grid items-center gap-y-10">
          <Reveal className="col-span-12 lg:col-span-4">
            <SmartImage
              src="/images/hall/hall-01.jpg"
              alt="Convention hall set with chandeliers and floral centrepieces"
              width={1800}
              height={1200}
              placeholder
              sizes="(max-width: 1024px) 92vw, 32vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={140} className="col-span-12 lg:col-span-6 lg:col-start-6">
            <h2 className="u-display text-[clamp(1.9rem,4.2vw,3.2rem)] text-ink">
              Rather put it in writing?
            </h2>
            <p className="u-measure-wide mt-6 text-ink/72">
              The enquiry form takes a minute and gets your date in front of the
              team with everything they need to answer properly.
            </p>
            <a
              href="/enquiry"
              className="u-label mt-10 inline-block border border-accent px-9 py-4 text-accent transition-colors duration-500 hover:bg-accent hover:text-on-accent"
            >
              Send an enquiry
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
