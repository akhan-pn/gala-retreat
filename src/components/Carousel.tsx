'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Photo } from '@/content/gallery'
import SmartImage from './SmartImage'

type Props = {
  slides: Photo[]
  /** `hero` fills its container edge-to-edge; `lightbox` letterboxes the photo. */
  variant?: 'hero' | 'lightbox'
  initialIndex?: number
  /** Milliseconds between slides, or null to disable autoplay. */
  autoPlayMs?: number | null
  /** Rendered over the hero — the tagline block. */
  overlay?: ReactNode
  onIndexChange?: (index: number) => void
  /**
   * `element` (default) only responds to arrows while focus is inside the
   * carousel, so the hero never hijacks the page's arrow keys. `document`
   * is for the lightbox, where focus sits on the modal panel above us.
   */
  keyboardScope?: 'element' | 'document'
  className?: string
}

/**
 * The single slideshow used by both the home hero and the gallery lightbox.
 *
 * Autoplay pauses on hover, on focus within, and whenever the tab is hidden,
 * so a backgrounded tab is not silently burning through slides.
 */
export default function Carousel({
  slides,
  variant = 'hero',
  initialIndex = 0,
  autoPlayMs = 6000,
  overlay,
  onIndexChange,
  keyboardScope = 'element',
  className = '',
}: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [paused, setPaused] = useState(false)
  /**
   * Which slides have been mounted. Every slide sits in the viewport, so
   * `loading="lazy"` would not hold any of them back — without this the hero
   * downloads four full-screen photographs before the first paint.
   */
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([initialIndex]))
  const root = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const count = slides.length

  /** Adds `i` and its immediate neighbours to the mounted set. */
  const markLoaded = useCallback(
    (i: number) => {
      setLoaded((prev) => {
        const next = new Set(prev)
        next.add(i)
        next.add((i + 1) % count)
        next.add((i - 1 + count) % count)
        return next.size === prev.size ? prev : next
      })
    },
    [count],
  )

  const go = useCallback(
    (next: number) => {
      const target = ((next % count) + count) % count
      setIndex(target)
      markLoaded(target)
    },
    [count, markLoaded],
  )

  const prev = useCallback(() => go(index - 1), [go, index])
  const next = useCallback(() => go(index + 1), [go, index])

  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  // Warm the neighbouring slides once the page itself has settled, so the
  // first paint only pays for the slide actually on screen.
  useEffect(() => {
    if (count < 2) return
    const id = window.setTimeout(() => markLoaded(initialIndex), 1500)
    return () => window.clearTimeout(id)
  }, [initialIndex, count, markLoaded])

  // Autoplay, re-armed per slide so every slide gets the full interval.
  useEffect(() => {
    if (!autoPlayMs || paused || count < 2) return
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = window.setTimeout(() => go(index + 1), autoPlayMs)
    return () => window.clearTimeout(id)
  }, [autoPlayMs, paused, count, index, go])

  // Pause while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Keyboard navigation. Scope decides what has to be focused for arrows to count.
  useEffect(() => {
    const el = root.current
    if (!el) return

    const target: HTMLElement | Document =
      keyboardScope === 'document' ? document : el

    const onKey = (event: Event) => {
      const e = event as KeyboardEvent
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

      // Never steal arrows from a field the visitor is typing in.
      const active = document.activeElement
      if (
        active instanceof HTMLElement &&
        (active.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName))
      )
        return

      e.preventDefault()
      if (e.key === 'ArrowLeft') prev()
      else next()
    }

    target.addEventListener('keydown', onKey)
    return () => target.removeEventListener('keydown', onKey)
  }, [prev, next, keyboardScope])

  const isHero = variant === 'hero'

  return (
    <div
      ref={root}
      className={`relative isolate ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={isHero ? 'Gala Retreat venue highlights' : 'Gallery photographs'}
      tabIndex={-1}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        const start = pointerStart.current
        pointerStart.current = null
        if (!start) return
        const dx = e.clientX - start.x
        const dy = e.clientY - start.y
        // Only treat it as a swipe if it is clearly horizontal.
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx < 0) next()
          else prev()
        }
      }}
    >
      {slides.map((slide, i) => (
        <figure
          key={slide.src}
          className={`u-slide ${
            isHero ? 'absolute inset-0' : 'absolute inset-0 flex items-center justify-center'
          }`}
          data-active={i === index}
          aria-hidden={i !== index}
          // Inactive slides must not be reachable by tab or screen reader.
          {...(i !== index ? { inert: '' as unknown as boolean } : {})}
        >
          {loaded.has(i) && (
          <SmartImage
            src={slide.src}
            alt={slide.alt}
            placeholder={slide.placeholder}
            {...(isHero
              ? {
                  fill: true,
                  sizes: '100vw',
                  className: 'object-cover',
                  wrapperClassName: 'absolute inset-0',
                }
              : {
                  width: slide.width,
                  height: slide.height,
                  sizes: '(max-width: 1024px) 92vw, 78vw',
                  className: 'max-h-[78vh] w-auto object-contain',
                  wrapperClassName: 'flex items-center justify-center',
                })}
            priority={isHero && i === index}
          />
          )}
          {isHero && (
            // Two stacked scrims: a vertical one for legibility at the foot,
            // and a left-weighted one because the type sits low-left.
            <>
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-nightfall via-nightfall/45 to-nightfall/10"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-nightfall/75 via-nightfall/15 to-transparent"
              />
            </>
          )}
          {!isHero && (
            <figcaption className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-10 text-center text-sm text-ivory/70 bg-gradient-to-t from-nightfall to-transparent">
              {slide.alt}
            </figcaption>
          )}
        </figure>
      ))}

      {overlay}

      {/* Slide index rail — bottom right, deliberately off the centre axis. */}
      {count > 1 && (
        <div
          className={`absolute z-20 flex items-center gap-3 ${
            isHero
              ? 'bottom-8 right-[clamp(1.25rem,5vw,6rem)] sm:bottom-12'
              : 'bottom-4 right-6'
          }`}
        >
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="grid h-9 w-9 place-items-center text-ivory/60 transition-colors duration-300 hover:text-champagne"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
              <path d="M17 5H1m0 0 4-4M1 5l4 4" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>

          <p className="u-label tabular-nums text-ivory/60">
            <span className="text-champagne">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="px-1.5 opacity-40">—</span>
            {String(count).padStart(2, '0')}
          </p>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="grid h-9 w-9 place-items-center text-ivory/60 transition-colors duration-300 hover:text-champagne"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
              <path d="M1 5h16m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      )}

      {/* Progress hairlines, hero only. */}
      {isHero && count > 1 && (
        <div className="absolute bottom-0 left-0 z-20 flex w-full gap-px">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="group h-8 flex-1"
            >
              <span
                className={`block h-px w-full transition-colors duration-500 ${
                  i === index
                    ? 'bg-champagne'
                    : 'bg-ivory/20 group-hover:bg-ivory/50'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {count}. {slides[index]?.alt}
      </p>
    </div>
  )
}
