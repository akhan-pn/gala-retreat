'use client'

import { Fragment, type CSSProperties } from 'react'
import type { Photo } from '@/content/gallery'
import SmartImage from '../SmartImage'
import useReducedMotion from './useReducedMotion'
import styles from './MarqueeRow.module.css'

/**
 * Derived from Aceternity UI's "Infinite Moving Cards".
 *
 * Kept: the two-copy track, the linear translate, the edge mask, pause on
 * hover.
 *
 * Dropped: the original's `useEffect` that clones every child with
 * `cloneNode(true)` and then flips a `start` state flag to switch the
 * animation on. That is a synchronous `setState` in an effect — an error in
 * this repo — and it means the row is inert until React has hydrated. Here the
 * second copy is in the markup and the animation is pure CSS, so the marquee
 * runs on the server-rendered HTML before any script arrives.
 *
 * Also: the speed presets are gone. `secondsPerItem` scales the duration with
 * the number of items, so a row of four and a row of twelve move at the same
 * pace rather than the same period.
 */

export type MarqueeItem =
  | { id: string; kind: 'text'; text: string }
  | { id: string; kind: 'photo'; photo: Photo; caption?: string }

type Props = {
  items: MarqueeItem[]
  /** Accessible name for the row. */
  label?: string
  /** Travel direction. */
  direction?: 'left' | 'right'
  /**
   * Seconds for one item to travel its own width — the pace, not the period.
   * Seven is a slow walk; below four it starts to read as a ticker.
   */
  secondsPerItem?: number
  pauseOnHover?: boolean
  /** Fade the row out at both edges instead of cutting it. */
  fadeEdges?: boolean
  className?: string
}

export default function MarqueeRow({
  items,
  label = 'Gala Retreat in short',
  direction = 'left',
  secondsPerItem = 7,
  pauseOnHover = true,
  fadeEdges = true,
  className = '',
}: Props) {
  // Standing still, the row becomes a plain scroller (see the stylesheet), and
  // a scrollable region has to be reachable by keyboard. Nobody else pays for
  // an extra tab stop on what is otherwise decoration.
  const reduced = useReducedMotion()

  if (items.length === 0) return null

  const root = [
    styles.root,
    fadeEdges ? styles.masked : '',
    pauseOnHover ? styles.paused : '',
    'relative w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const vars = {
    '--marquee-gap': 'clamp(1.75rem, 4vw, 3.5rem)',
    '--marquee-duration': `${Math.max(8, items.length * secondsPerItem)}s`,
    '--marquee-direction': direction === 'right' ? 'reverse' : 'normal',
  } as CSSProperties

  return (
    <div
      className={root}
      style={vars}
      role="group"
      aria-label={label}
      tabIndex={reduced ? 0 : undefined}
    >
      <div className={styles.track}>
        <Row items={items} />
        {/* The second pass is what makes the loop seamless; it is the same
            content again, so it is hidden from assistive technology. */}
        <Row items={items} echo />
      </div>
    </div>
  )
}

function Row({ items, echo = false }: { items: MarqueeItem[]; echo?: boolean }) {
  return (
    <Fragment>
      {items.map((item) => (
        <div
          key={echo ? `echo-${item.id}` : item.id}
          className={`flex shrink-0 items-center ${echo ? styles.echo : ''}`}
          {...(echo ? { 'aria-hidden': true } : {})}
        >
          {item.kind === 'text' ? (
            <p className="u-label flex items-center gap-[clamp(1.75rem,4vw,3.5rem)] whitespace-nowrap text-ink/70">
              <span aria-hidden className="text-accent">
                &#9670;
              </span>
              <span>{item.text}</span>
            </p>
          ) : (
            <figure className="flex items-center gap-4">
              <SmartImage
                src={item.photo.src}
                alt={echo ? '' : item.photo.alt}
                width={item.photo.width}
                height={item.photo.height}
                placeholder={item.photo.placeholder}
                sizes="(max-width: 640px) 30vw, 12rem"
                className="h-full w-full object-cover"
                wrapperClassName="aspect-[3/2] h-[clamp(3.5rem,7vw,5.5rem)]"
              />
              {item.caption ? (
                <figcaption className="u-label whitespace-nowrap text-ink/70">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          )}
        </div>
      ))}
    </Fragment>
  )
}
