import type { Metadata, Viewport } from 'next'
import { Jost, Prata } from 'next/font/google'
import BehaviourTracker from '@/components/BehaviourTracker'
import ConsentBanner from '@/components/ConsentBanner'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import PageViewTracker from '@/components/PageViewTracker'
import VisitorCapture from '@/components/VisitorCapture'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import { site } from '@/config/site'
import { EXPERIMENT_BOOT_SCRIPT } from '@/lib/experiments'
import '../globals.css'

const prata = Prata({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-prata',
})

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} — Wedding & Convention Venue in Hyderabad`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    'wedding venue Hyderabad',
    'convention centre Hyderabad',
    'farm stay Hyderabad',
    'banquet hall Ramdas Pally',
    'reception venue Telangana',
    'corporate event venue Hyderabad',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.legalName,
    title: `${site.legalName} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: '/images/hero/hero-01.jpg',
        width: 2400,
        height: 1600,
        alt: 'Wedding mandap dressed in florals at Gala Retreat, Hyderabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.legalName} — ${site.tagline}`,
    description: site.description,
    images: ['/images/hero/hero-01.jpg'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  // The site is light by default whatever the device asks for, so the browser
  // chrome should be too. Dark is reachable, hence `light dark` below.
  themeColor: '#f5f1e8',
  colorScheme: 'light dark',
}

/** Local-business structured data, so the venue can win a Google map pack slot. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EventVenue',
  name: site.legalName,
  description: site.description,
  url: site.url,
  telephone: site.phone.number,
  email: site.email,
  maximumAttendeeCapacity: site.capacity,
  image: [`${site.url}/images/hero/hero-01.jpg`],
  sameAs: [site.social.instagram],
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.line1,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  amenityFeature: [
    'Convention hall',
    'Open lawn',
    'Farm stay',
    'Swimming pool',
    'Parking',
  ].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${prata.variable} ${jost.variable}`}>
      <body className="antialiased">
        {/* Applies a stored theme choice before first paint, so an explicit
            preference never flashes the other theme. With nothing stored the
            CSS falls through to prefers-color-scheme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gr-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {/* Stamps the assigned arm on <html> before the parser reaches the
            hero, so the first paint already shows it and no variant can
            flicker. Must stay blocking and in this slot. */}
        <script dangerouslySetInnerHTML={{ __html: EXPERIMENT_BOOT_SCRIPT }} />
        {/* Without JavaScript nothing can reveal itself, so neutralise every
            opacity:0 starting state rather than serve a blank page. */}
        <noscript>
          <style>{`.u-reveal{opacity:1!important;transform:none!important}.u-img img{opacity:1!important}`}</style>
        </noscript>

        <a
          href="#main"
          className="u-label sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-200 focus:bg-accent focus:px-5 focus:py-3 focus:text-on-accent"
        >
          Skip to content
        </a>

        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <ConsentBanner />
        <VisitorCapture />
        <PageViewTracker />
        <BehaviourTracker />

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
