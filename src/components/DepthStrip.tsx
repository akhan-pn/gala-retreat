'use client'

import { useCallback, useEffect, useRef, type CSSProperties } from 'react'
import type { Photo } from '@/content/gallery'
import SmartImage from './SmartImage'

type Props = {
  photos: Photo[]
  className?: string
}

const LABELS: Record<Photo['space'], string> = {
  hall: 'Convention Hall',
  lawn: 'The Lawn',
  farmstay: 'Farm Stay',
  events: 'Events',
}

/** Half the item width, as a CSS length — the row is padded by this so the
    first and last photographs can still reach the centre of the strip. */
const HALF = 'clamp(6.75rem, 13vw, 10.5rem)'

const MAX_TURN = 24
const MAX_DEPTH = 150

/**
 * A row of photographs standing in one shared perspective: the plate at the
 * centre faces the reader square on, its neighbours turn away and fall back
 * into Z. Position is driven by the scroll offset, so the same gesture works
 * for a trackpad, a drag, a scrollbar and the arrow keys.
 *
 * The 3D is applied by script only, so reduced motion and a failed hydration
 * both land on a plain horizontal scroller rather than a broken one.
 */
export default function DepthStrip({ photos, className = '' }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const paint = useCallback(() => {
    frame.current = 0
    const box = scroller.current
    if (!box) return

    const mid = box.clientWidth / 2
    if (!mid) return

    for (const item of box.querySelectorAll<HTMLElement>('[data-depth-item]')) {
      const face = item.firstElementChild
      if (!(face instanceof HTMLElement)) continue

      // offsetLeft rather than a rect: rects report the *transformed* box, so
      // reading one back would feed the previous frame's rotation into this one.
      const centre = item.offsetLeft - box.scrollLeft + item.offsetWidth / 2
      const t = Math.max(-1, Math.min(1, (centre - mid) / mid))

      face.style.transform = `rotateY(${(-t * MAX_TURN).toFixed(2)}deg) translateZ(${(-Math.abs(t) * MAX_DEPTH).toFixed(1)}px)`
      face.style.opacity = (1 - Math.abs(t) * 0.3).toFixed(3)
    }
  }, [])

  useEffect(() => {
    const box = scroller.current
    if (!box) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const flatten = () => {
      for (const item of box.querySelectorAll<HTMLElement>('[data-depth-item]')) {
        const face = item.firstElementChild
        if (face instanceof HTMLElement) {
          face.style.transform = ''
          face.style.opacity = ''
        }
      }
    }

    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(paint)
    }

    let attached = false

    const apply = () => {
      if (mq.matches) {
        if (attached) {
          box.removeEventListener('scroll', schedule)
          window.removeEventListener('resize', schedule)
          attached = false
        }
        if (frame.current) {
          cancelAnimationFrame(frame.current)
          frame.current = 0
        }
        flatten()
        return
      }

      if (!attached) {
        box.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule, { passive: true })
        attached = true
      }
      schedule()
    }

    apply()
    mq.addEventListener('change', apply)

    return () => {
      mq.removeEventListener('change', apply)
      box.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [paint])

  const centreOn = useCallback((el: HTMLElement) => {
    el.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const box = scroller.current
    if (!box) return

    const buttons = Array.from(box.querySelectorAll<HTMLButtonElement>('[data-depth-face]'))
    if (!buttons.length) return

    const from = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const to =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? buttons.length - 1
          : Math.min(
              buttons.length - 1,
              Math.max(0, (from < 0 ? 0 : from) + (event.key === 'ArrowRight' ? 1 : -1)),
            )

    event.preventDefault()
    buttons[to].focus({ preventScroll: true })
    centreOn(buttons[to])
  }

  return (
    <div
      ref={scroller}
      onKeyDown={onKeyDown}
      role="group"
      aria-label="Photographs of the venue"
      className={`relative overflow-x-auto overflow-y-hidden ${className}`}
      style={{
        perspective: '1100px',
        perspectiveOrigin: '50% 50%',
        scrollSnapType: 'x proximity',
        // The strip is its own scroll context, so nothing here can widen the page.
        overscrollBehaviorX: 'contain',
      }}
    >
      <ul
        className="flex list-none items-center gap-[clamp(1rem,2.4vw,2.25rem)] py-10"
        style={{
          transformStyle: 'preserve-3d',
          paddingInline: `calc(50% - ${HALF})`,
        }}
      >
        {photos.map((photo) => (
          <li
            key={photo.src}
            data-depth-item
            className="shrink-0"
            style={{ width: `calc(${HALF} * 2)`, scrollSnapAlign: 'center' }}
          >
            <button
              type="button"
              data-depth-face
              onClick={(e) => centreOn(e.currentTarget)}
              className="block w-full cursor-pointer"
              style={
                {
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                } as CSSProperties
              }
            >
              <SmartImage
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                placeholder={photo.placeholder}
                sizes="(max-width: 640px) 60vw, 28vw"
                className="h-full w-full object-cover"
                wrapperClassName="aspect-[3/4] w-full"
              />
            </button>

            <p className="u-label mt-4 text-center text-ink/60">{LABELS[photo.space]}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
