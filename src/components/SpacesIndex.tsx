'use client'

import Link from 'next/link'
import { useState } from 'react'
import { spaces } from '@/content/spaces'
import Reveal from './Reveal'
import SmartImage from './SmartImage'

/**
 * The venue's four spaces as an editorial index list.
 * On desktop the imagery lives in one panel that swaps on hover; on mobile
 * each row carries its own image. Deliberately not a three-column card grid.
 */
export default function SpacesIndex() {
  const [active, setActive] = useState(0)

  return (
    <div className="u-grid items-start gap-y-14">
      <div className="col-span-12 lg:col-span-7">
        <ul>
          {spaces.map((space, i) => (
            <Reveal as="li" key={space.id} delay={i * 80}>
              <div
                className="group border-t border-ink/12 py-9 transition-colors duration-500 last:border-b hover:border-accent/40"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <div className="flex items-baseline gap-5 sm:gap-8">
                  <span className="u-label text-accent tabular-nums">
                    {space.index}
                  </span>
                  <div className="flex-1">
                    <h3 className="u-display-sm text-[clamp(1.6rem,3.2vw,2.35rem)] text-ink transition-colors duration-500 group-hover:text-accent">
                      {space.name}
                    </h3>
                    <p className="u-label mt-3 text-ink/60">{space.capacity}</p>
                    <p className="u-measure-wide mt-5 text-[0.95rem] leading-relaxed text-ink/72">
                      {space.blurb}
                    </p>

                    {/* Mobile carries its own image; the desktop panel is hidden
                        below lg. Each variant asks for a 1px candidate at the
                        breakpoint where it is display:none, so neither layout
                        pays for the other's photograph. */}
                    <div className="mt-7 lg:hidden">
                      <SmartImage
                        src={space.image}
                        alt={space.alt}
                        width={1800}
                        height={1200}
                        placeholder
                        sizes="(min-width: 1024px) 1px, 92vw"
                        className="w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* Sticky image panel — offset from the list, hanging past the grid. */}
      <div className="col-span-12 hidden lg:col-span-4 lg:col-start-9 lg:block">
        <div className="sticky top-32 aspect-[3/4] overflow-hidden">
          {spaces.map((space, i) => (
            <div
              key={space.id}
              aria-hidden={i !== active}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <SmartImage
                src={space.image}
                alt=""
                fill
                placeholder
                sizes="(max-width: 1023px) 1px, 33vw"
                className="object-cover"
                wrapperClassName="absolute inset-0"
              />
            </div>
          ))}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nightfall/55 to-transparent"
          />
          <Link
            href="/gallery"
            className="u-label absolute bottom-6 left-6 text-ivory transition-colors duration-300 hover:text-champagne"
          >
            See the gallery →
          </Link>
        </div>
      </div>
    </div>
  )
}
