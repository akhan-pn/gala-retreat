'use client'

import { useMemo, useState } from 'react'
import { gallery, spaceFilters, type SpaceId } from '@/content/gallery'
import Lightbox from './Lightbox'
import Reveal from './Reveal'
import SmartImage from './SmartImage'

export default function GalleryBrowser() {
  const [filter, setFilter] = useState<SpaceId | 'all'>('all')
  const [open, setOpen] = useState<number | null>(null)

  const photos = useMemo(
    () => (filter === 'all' ? gallery : gallery.filter((p) => p.space === filter)),
    [filter],
  )

  return (
    <>
      {/* Filters as text, not pills — the underline does the work. */}
      <div className="u-grid mb-14">
        <div className="col-span-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-ink/12 pt-6">
          {spaceFilters.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`u-label u-link transition-colors duration-300 ${
                  active ? 'text-accent' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {f.label}
                <span className="ml-2 opacity-50 tabular-nums">
                  {f.id === 'all'
                    ? gallery.length
                    : gallery.filter((p) => p.space === f.id).length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Editorial masonry — uneven by design, not a fixed card grid. */}
      <div className="u-grid">
        <div className="col-span-12 columns-1 gap-[clamp(1rem,2.2vw,2rem)] sm:columns-2 lg:columns-3">
          {photos.map((photo, i) => (
            <Reveal
              key={photo.src}
              delay={(i % 3) * 70}
              className="mb-[clamp(1rem,2.2vw,2rem)] break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full cursor-zoom-in overflow-hidden text-left"
                aria-label={`View larger: ${photo.alt}`}
              >
                <SmartImage
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  placeholder={photo.placeholder}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                  className="w-full transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-nightfall/0 transition-colors duration-700 group-hover:bg-nightfall/30"
                />
                <span className="u-label pointer-events-none absolute bottom-4 left-4 translate-y-2 text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  View
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {open !== null && (
        <Lightbox
          slides={photos}
          startIndex={open}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  )
}
