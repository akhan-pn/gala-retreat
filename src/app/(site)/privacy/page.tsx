import type { Metadata } from 'next'
import Reveal from '@/components/Reveal'
import { ConsentReopenLink } from '@/components/ConsentBanner'
import { site } from '@/config/site'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('/privacy')

const sections = [
  {
    n: '01',
    title: 'If you send an enquiry',
    body: [
      'We keep the name, phone number and — if you give one — the email address you type into the enquiry form, along with the occasion, date, guest count and message. That is the whole of it.',
      'We keep it so we can call you back about your date. You have to tick a box before the form will send, and we record which wording you agreed to and when.',
      'Ticking the second, optional box also lets us contact you about dates and seasonal offers. Leaving it unticked changes nothing about your enquiry.',
    ],
  },
  {
    n: '02',
    title: 'If you allow us to measure visits',
    body: [
      'Only if you press Allow: we store two cookies. One holds a random number that stands in for you; the other holds a scrambled copy of that number, which decides the page versions described in 03.',
      'For each page you open we record the page address, roughly what kind of device you are on, which site you arrived from, and the city and country your connection appears to be in. We never store your IP address.',
      'While you are on a page we also record how far down you scrolled, how long the page was open and actually in front of you, and how often you clicked the same spot in frustration.',
      'And we record a short, fixed list of actions: which buttons you pressed, which WhatsApp, phone or map links you followed, and which sections came into view. Only actions from that list are recorded — never anything you type.',
      'The random number lets us tell one visit from ten visits. It is not linked to your name, your enquiry, or anything else. We do not know who you are.',
      'There is no Google Analytics here, no advertising pixel and no third-party script. The figures are only visible to the Gala Retreat team.',
    ],
  },
  {
    n: '03',
    title: 'If we are trying two versions of a page',
    body: [
      'We sometimes write a heading or a button two ways and see which one people find more useful. The scrambled number decides which version you are shown, so it stays the same every time you come back.',
      'Only if you press Allow: we record which version you were shown, and whether you went on to send an enquiry, ask for a callback, or open WhatsApp. Nothing about the version you saw is kept with anything you typed.',
      'Without permission you are never entered into one of these at all — you see the standard version, and nothing is recorded.',
    ],
  },
  {
    n: '04',
    title: 'Changing your mind',
    body: [
      'You can withdraw at any time, and both cookies are deleted from your browser when you do.',
      'To have an enquiry deleted, or to ask what we hold, call or email us using the details on the contact page and we will action it.',
    ],
  },
]

export default function Privacy() {
  return (
    <>
      <section className="pb-[clamp(2rem,5vw,4rem)] pt-[clamp(8rem,16vw,13rem)]">
        <div className="u-grid gap-y-8">
          <Reveal className="col-span-12 lg:col-span-7 lg:col-start-2">
            <p className="u-label text-accent">Privacy</p>
            <h1 className="u-display mt-8 text-[clamp(2.3rem,6vw,4.5rem)] text-ink">
              What we collect, in plain words.
            </h1>
          </Reveal>
          <Reveal delay={140} className="col-span-12 lg:col-span-3 lg:col-start-10 lg:pt-16">
            <p className="text-ink/72">
              Short version: your enquiry, and — only with your permission — an
              anonymous record of how the site is used. Nothing else, and
              nothing shared.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-[clamp(4rem,10vw,8rem)]">
        <div className="u-grid">
          <div className="col-span-12 lg:col-span-9 lg:col-start-2">
            {sections.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="grid grid-cols-12 gap-x-6 border-t border-ink/12 py-10 last:border-b">
                  <span className="u-label col-span-12 mb-4 tabular-nums text-accent sm:col-span-2 sm:mb-0">
                    {s.n}
                  </span>
                  <h2 className="u-display-sm col-span-12 text-[clamp(1.3rem,2.2vw,1.75rem)] text-ink sm:col-span-10 lg:col-span-3">
                    {s.title}
                  </h2>
                  <div className="col-span-12 mt-4 space-y-4 text-[0.95rem] leading-relaxed text-ink/72 sm:col-span-10 sm:col-start-3 lg:col-span-6 lg:col-start-7 lg:mt-0">
                    {s.body.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={280}>
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
                <ConsentReopenLink className="border border-accent px-7 py-3.5 text-accent no-underline transition-colors duration-400 hover:bg-accent hover:text-on-accent" />
                <a href={`mailto:${site.email}`} className="u-link u-label text-ink/72">
                  {site.email}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
