import type { Metadata } from 'next'
import EnquiryForm from '@/components/EnquiryForm'
import Reveal from '@/components/Reveal'
import SmartImage from '@/components/SmartImage'
import { site } from '@/config/site'

export const metadata: Metadata = {
  title: 'Enquiry',
  description:
    'Check a date at Gala Retreat Resort & Convention, Hyderabad. Tell us your occasion, date and guest count and we will come back with availability.',
  alternates: { canonical: '/enquiry' },
}

export default function Enquiry() {
  return (
    <section className="pb-[clamp(5rem,12vw,9rem)] pt-[clamp(8rem,16vw,12rem)]">
      <div className="u-grid gap-y-16">
        {/* Image column — sticky, and deliberately narrower than the form. */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="u-label text-accent">Enquiry</p>
              <h1 className="u-display mt-7 text-[clamp(2.2rem,5vw,3.4rem)] text-ink">
                Check a date.
              </h1>
              <p className="u-measure mt-7 text-ink/72">
                Tell us roughly what you are planning. We will come back with
                what is free, what it costs, and what we would suggest.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <SmartImage
                src="/images/farmstay/farmstay-01.jpg"
                alt="Lantern-lit pool and sandstone courtyard at the farm stay after dark"
                width={1800}
                height={1200}
                placeholder
                sizes="(max-width: 1024px) 92vw, 30vw"
                className="mt-12 aspect-[4/3] w-full object-cover"
              />
              <div className="mt-8 space-y-1.5">
                <p className="u-label text-ink/60">Prefer to talk?</p>
                <p className="text-sm text-ink/72">
                  <a href={`tel:${site.phone.number}`} className="u-link">
                    {site.phone.display}
                  </a>
                  <span className="text-ink/60"> — {site.phone.label}</span>
                </p>
                <p className="text-sm text-ink/72">
                  <a href={`tel:+${site.whatsapp.number}`} className="u-link">
                    {site.whatsapp.display}
                  </a>
                  <span className="text-ink/60"> — {site.whatsapp.label}</span>
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <Reveal delay={100}>
            <EnquiryForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
