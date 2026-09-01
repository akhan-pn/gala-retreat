import Link from 'next/link'
import { ConsentReopenLink } from './ConsentBanner'
import { site } from '@/config/site'

export default function Footer() {
  return (
    <footer className="border-t border-ivory/10 bg-lawn-2 pb-10 pt-20">
      <div className="u-grid gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="u-display-sm text-[clamp(1.75rem,3.2vw,2.5rem)] text-ivory">
            {site.tagline}.
          </p>
          <div className="u-rule mt-8 w-16 text-champagne" />
        </div>

        <div className="col-span-6 lg:col-span-3 lg:col-start-7">
          <p className="u-label mb-5 text-champagne/70">Visit</p>
          <address className="not-italic text-sm leading-relaxed text-ivory/65">
            {site.address.line1}
            <br />
            {site.address.city}, {site.address.state} {site.address.postalCode}
          </address>
          <a
            href={site.address.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="u-link u-label mt-4 inline-block text-ivory/80"
          >
            Open in Maps
          </a>
        </div>

        <div className="col-span-6 lg:col-span-3">
          <p className="u-label mb-5 text-champagne/70">Reach us</p>
          <ul className="space-y-2.5 text-sm text-ivory/65">
            <li>
              <a href={`tel:${site.phone.number}`} className="u-link">
                {site.phone.display}
              </a>{' '}
              <span className="opacity-50">{site.phone.label}</span>
            </li>
            <li>
              <a href={`tel:+${site.whatsapp.number}`} className="u-link">
                {site.whatsapp.display}
              </a>{' '}
              <span className="opacity-50">{site.whatsapp.label}</span>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="u-link">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="u-link"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-12 mt-6 flex flex-col gap-4 border-t border-ivory/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="u-label text-ivory/70">
            © {new Date().getFullYear()} {site.legalName}
          </p>
          <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Footer">
            <Link href="/gallery" className="u-link u-label text-ivory/70">
              Gallery
            </Link>
            <Link href="/enquiry" className="u-link u-label text-ivory/70">
              Enquire
            </Link>
            <Link href="/privacy" className="u-link u-label text-ivory/70">
              Privacy
            </Link>
            <ConsentReopenLink className="text-ivory/70" />
          </nav>
        </div>
      </div>
    </footer>
  )
}
