import type { Metadata } from 'next'
import Link from 'next/link'
import GalleryBrowser from '@/components/GalleryBrowser'
import Reveal from '@/components/Reveal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('/gallery')

export default function Gallery() {
  return (
    <>
      <section className="pb-[clamp(2.5rem,6vw,4.5rem)] pt-[clamp(8rem,16vw,13rem)]">
        <div className="u-grid gap-y-8">
          <Reveal className="col-span-12 lg:col-span-7">
            <p className="u-label text-accent">Gallery</p>
            <h1 className="u-display mt-8 text-[clamp(2.5rem,7vw,5.5rem)] text-ink">
              The rooms, the lawn, and what people have made of them.
            </h1>
          </Reveal>

          <Reveal delay={140} className="col-span-12 lg:col-span-3 lg:col-start-10 lg:pt-16">
            <p className="text-ink/72">
              Filter by space, or open any photograph to move through the set
              full-screen.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-[clamp(5rem,12vw,9rem)]">
        <GalleryBrowser />
      </section>

      <section className="pb-[clamp(5rem,12vw,9rem)]">
        <div className="u-grid">
          <Reveal className="col-span-12 lg:col-span-7 lg:col-start-3">
            <div className="border-t border-ink/12 pt-12">
              <h2 className="u-display text-[clamp(1.8rem,4vw,3rem)] text-ink">
                Photographs only go so far. The lawn is better in person.
              </h2>
              <Link
                href="/enquiry"
                className="u-label mt-10 inline-block border border-accent px-9 py-4 text-accent transition-colors duration-500 hover:bg-accent hover:text-on-accent"
              >
                Arrange a visit
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
