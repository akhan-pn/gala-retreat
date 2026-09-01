'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { Photo } from '@/content/gallery'
import SmartImage from '../SmartImage'
import useReducedMotion from './useReducedMotion'
import styles from './MomentsCarousel.module.css'

/**
 * Derived from Aceternity UI's "Apple Cards Carousel".
 *
 * Kept: the horizontal rail of tall photographic cards, the drag, the paired
 * arrows, the sense that the row continues past the edge of the screen.
 *
 * Dropped: the staggered `opacity: 0` mount (0.2s per card, so the ninth card
 * arrives nearly two seconds late and never arrives at all without JS), the
 * fixed pixel scroll steps, and the modal that the original opens on click —
 * this site already has a lightbox, so the carousel reports selection upward
 * instead of growing a second one.
 *
 * Added: real keyboard behaviour. The track is a focusable scroll region;
 * arrows, Home and End move between cards and centre them, arrow keys with the
 * track itself focused page the rail.
 */

export type Moment = {
  photo: Photo
  /** Small all-caps line above the title. */
  eyebrow?: string
  title: string
  /** Optional destination. Given `href` the card is a link, given `onSelect` a
      button, given neither a plain figure and the track carries the keyboard. */
  href?: string
}

type Props = {
  moments: Moment[]
  /** Accessible name for the carousel. */
  label?: string
  onSelect?: (moment: Moment, index: number) => void
  className?: string
}

/** Matches `.u-grid`'s padding, so the first card sits on the page's margin. */
const EDGE = 'clamp(1.25rem, 5vw, 6rem)'

/** Past this many pixels a pointer gesture is a drag, and the click is eaten. */
const DRAG_SLOP = 5

export default function MomentsCarousel({
  moments,
  label = 'Moments at Gala Retreat',
  onSelect,
  className = '',
}: Props) {
  const track = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const ateClick = useRef(false)

  const reduced = useReducedMotion()
  const [ends, setEnds] = useState({ start: true, end: false })

  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth'

  /** Reads the track and repaints the rail. Never called from an effect body. */
  const measure = useCallback(() => {
    const el = track.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    const slack = scrollWidth - clientWidth

    setEnds((prev) => {
      const next = { start: scrollLeft <= 1, end: slack <= 1 || scrollLeft >= slack - 1 }
      return prev.start === next.start && prev.end === next.end ? prev : next
    })

    const bar = thumb.current
    if (bar && scrollWidth > 0) {
      bar.style.width = `${Math.min(100, (clientWidth / scrollWidth) * 100)}%`
      bar.style.left = `${(scrollLeft / scrollWidth) * 100}%`
    }
  }, [])

  // Only observers and listeners are registered here; the state writes all
  // happen later, from their callbacks. ResizeObserver fires once on observe,
  // which is what gives us the first measurement.
  useEffect(() => {
    const el = track.current
    if (!el) return

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    for (const child of Array.from(el.children)) ro.observe(child)

    el.addEventListener('scroll', measure, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', measure)
    }
    // Re-observed when the set changes, so newly added cards are watched too.
  }, [measure, moments.length])

  /** Width of one card plus the gap, read live so it survives a resize. */
  const step = useCallback(() => {
    const el = track.current
    if (!el) return 0
    const first = el.firstElementChild
    if (!(first instanceof HTMLElement)) return el.clientWidth * 0.8
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    return first.offsetWidth + gap
  }, [])

  const page = useCallback(
    (dir: -1 | 1) => {
      track.current?.scrollBy({ left: dir * step(), behavior })
    },
    [step, behavior],
  )

  const cards = () =>
    Array.from(track.current?.querySelectorAll<HTMLElement>('[data-moment-face]') ?? [])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const { key } = event
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') {
      return
    }

    const faces = cards()
    const from = faces.indexOf(document.activeElement as HTMLElement)

    event.preventDefault()

    // Nothing focusable inside — the track itself has focus, so page the rail.
    if (faces.length === 0 || from < 0) {
      const el = track.current
      if (!el) return
      if (key === 'Home') el.scrollTo({ left: 0, behavior })
      else if (key === 'End') el.scrollTo({ left: el.scrollWidth, behavior })
      else page(key === 'ArrowRight' ? 1 : -1)
      return
    }

    const to =
      key === 'Home'
        ? 0
        : key === 'End'
          ? faces.length - 1
          : Math.min(faces.length - 1, Math.max(0, from + (key === 'ArrowRight' ? 1 : -1)))

    faces[to].focus({ preventScroll: true })
    // `start` rather than `center`: the cards are `snap-start`, so centring
    // would only be undone by the snap that follows.
    faces[to].scrollIntoView({ inline: 'start', block: 'nearest', behavior })
  }

  // Drag to pan. Mouse only: touch already scrolls natively with momentum, and
  // capturing the pointer would replace that with something worse.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = track.current
    if (!el || event.pointerType !== 'mouse' || event.button !== 0) return

    drag.current = { x: event.clientX, left: el.scrollLeft, moved: false }
    el.setPointerCapture(event.pointerId)
    // Snap points fight a drag in progress; they come back on release, which
    // is exactly when the rail should settle onto a card.
    el.style.scrollSnapType = 'none'
    el.style.cursor = 'grabbing'
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = track.current
    const state = drag.current
    if (!el || !state) return

    const dx = event.clientX - state.x
    if (Math.abs(dx) > DRAG_SLOP) state.moved = true
    el.scrollLeft = state.left - dx
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = track.current
    const state = drag.current
    if (!el || !state) return

    drag.current = null
    ateClick.current = state.moved
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
    el.style.scrollSnapType = ''
    el.style.cursor = ''
  }

  /** A drag that ends over a card must not also open it. */
  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!ateClick.current) return
    ateClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  if (moments.length === 0) return null

  return (
    <section className={`relative ${className}`}>
      <div
        ref={track}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        // A scrollable region must be reachable by keyboard even when nothing
        // inside it is focusable.
        tabIndex={0}
        className={`${styles.track} flex snap-x snap-mandatory gap-[clamp(0.75rem,1.8vw,1.5rem)] overflow-x-auto overscroll-x-contain py-2 focus-visible:outline-accent`}
        style={
          {
            paddingInline: EDGE,
            scrollPaddingInline: EDGE,
            touchAction: 'pan-x pan-y',
          } as CSSProperties
        }
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {moments.map((moment, i) => (
          <MomentCard
            key={`${moment.photo.src}-${i}`}
            moment={moment}
            onSelect={onSelect ? () => onSelect(moment, i) : undefined}
          />
        ))}
      </div>

      {/* Controls sit on the page's margin, aligned with the first card. */}
      <div
        className="mt-6 flex items-center gap-5"
        style={{ paddingInline: EDGE }}
      >
        <div className="relative h-px flex-1 bg-ink/20">
          <span
            ref={thumb}
            aria-hidden
            className="absolute inset-y-0 left-0 block bg-accent"
            style={{ width: '0%' }}
          />
        </div>

        <p className="u-label tabular-nums text-ink/60">
          {String(moments.length).padStart(2, '0')} moments
        </p>

        <div className="flex items-center gap-2">
          <RailButton
            direction="previous"
            disabled={ends.start}
            onClick={() => page(-1)}
          />
          <RailButton direction="next" disabled={ends.end} onClick={() => page(1)} />
        </div>
      </div>
    </section>
  )
}

function RailButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const back = direction === 'previous'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={back ? 'Previous moments' : 'Next moments'}
      className="grid h-10 w-10 place-items-center text-ink/60 transition-colors duration-500 ease-editorial hover:text-accent disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
    >
      <svg width="20" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
        <path
          d={back ? 'M17 5H1m0 0 4-4M1 5l4 4' : 'M1 5h16m0 0-4-4m4 4-4 4'}
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </button>
  )
}

function MomentCard({
  moment,
  onSelect,
}: {
  moment: Moment
  onSelect?: () => void
}) {
  const { photo, eyebrow, title, href } = moment

  const face = (
    <>
      <SmartImage
        src={photo.src}
        alt=""
        width={photo.width}
        height={photo.height}
        placeholder={photo.placeholder}
        sizes="(max-width: 640px) 74vw, (max-width: 1024px) 42vw, 24rem"
        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        wrapperClassName="absolute inset-0"
      />
      {/* The card face is a photograph in both themes, so the type on it uses
          the fixed palette rather than the flipping one. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nightfall via-nightfall/35 to-nightfall/5"
      />
      <span className="relative z-10 flex h-full flex-col justify-end p-[clamp(1.25rem,2vw,1.75rem)] text-left">
        {eyebrow ? <span className="u-label block text-champagne">{eyebrow}</span> : null}
        <span className="u-display-sm mt-3 block text-[clamp(1.15rem,1.9vw,1.6rem)] text-ivory">
          {title}
        </span>
      </span>
    </>
  )

  // The photograph's own description and the card's title both belong in the
  // accessible name; an explicit label keeps them in that order and stops the
  // alt text being announced a second time as an image.
  const name = `${title} — ${photo.alt}`

  const shell =
    'group relative block aspect-[3/4] w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne'

  return (
    <figure className="w-[clamp(15rem,74vw,24rem)] shrink-0 snap-start">
      {href ? (
        <a data-moment-face href={href} aria-label={name} className={shell}>
          {face}
        </a>
      ) : onSelect ? (
        <button
          data-moment-face
          type="button"
          onClick={onSelect}
          aria-label={name}
          className={`${shell} cursor-pointer`}
        >
          {face}
        </button>
      ) : (
        <span role="img" aria-label={name} className={shell}>
          {face}
        </span>
      )}
    </figure>
  )
}
