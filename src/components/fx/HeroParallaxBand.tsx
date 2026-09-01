'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Photo } from '@/content/gallery'
import SmartImage from '../SmartImage'
import useHydrated from './useHydrated'
import useReducedMotion from './useReducedMotion'

/**
 * Derived from Aceternity UI's "Hero Parallax", with the theatrics taken out.
 *
 * The original swings rows +/-1000px, tips the stack 15deg and 20deg, drops in
 * from -700px and runs a bouncy spring (stiffness 300, bounce 100) across a
 * 300vh scroll region. That reads as a product launch. Here the same machinery
 * — one scroll progress, one 3D tip on the stack, per-row drift at different
 * rates — is dialled down to a few dozen pixels on a heavily overdamped spring,
 * so the band settles rather than springs, and it animates as it passes the
 * viewport instead of demanding three screens of scroll to itself.
 */

/** Overdamped: damping ratio ~2, so it eases in and never overshoots. */
const SPRING = { stiffness: 60, damping: 26, mass: 0.7, restDelta: 0.001 } as const

/**
 * Horizontal drift per row, in pixels, across one full pass of the viewport.
 * Different magnitudes and opposing signs are what build the sense of depth;
 * the numbers stay small enough that no row ever reads as "sliding".
 */
const DRIFT: number[][] = [
  [110, -110],
  [-170, 170],
  [70, -70],
]

/** Photographs per row before the set starts repeating. */
const MIN_PER_ROW = 5

type Props = {
  /** Photographs to lay across the band. Repeated if there are too few. */
  photos: Photo[]
  /** 1–3. Two reads as a band; three starts to read as a wall. */
  rows?: 1 | 2 | 3
  /** Accessible name for the band. */
  label?: string
  /** Header block, rendered above the rows — usually a `.u-grid` of type. */
  children?: ReactNode
  className?: string
}

type Plate = { photo: Photo; key: string; describe: boolean }

/**
 * Fills `rows` rows of at least `MIN_PER_ROW` plates, striding through the set
 * so neighbouring rows do not line up. Only the first appearance of a given
 * photograph carries its alt text — the repeats are visual filler and would
 * otherwise be read out several times over.
 */
function buildRows(photos: Photo[], rows: number): Plate[][] {
  if (photos.length === 0) return []

  const perRow = Math.max(MIN_PER_ROW, Math.ceil(photos.length / rows))
  const seen = new Set<string>()

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: perRow }, (_, i) => {
      const photo = photos[(r * perRow + i) % photos.length]
      const describe = !seen.has(photo.src)
      seen.add(photo.src)
      return { photo, key: `${r}-${i}-${photo.src}`, describe }
    }),
  )
}

export default function HeroParallaxBand({
  photos,
  rows = 2,
  label = 'Photographs of Gala Retreat',
  children,
  className = '',
}: Props) {
  const band = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const hydrated = useHydrated()

  // "start end" -> "end start": progress runs 0 as the band's top meets the
  // bottom of the viewport, 1 as its bottom leaves the top. No tall spacer.
  const { scrollYProgress } = useScroll({
    target: band,
    offset: ['start end', 'end start'],
  })

  // The stack settles out of its tip over the first half of the pass, then
  // holds flat — so the effect is an arrival, not a permanent skew.
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.45], [9, 0]), SPRING)
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.45], [1.6, 0]), SPRING)
  const y = useSpring(useTransform(scrollYProgress, [0, 0.45], [56, 0]), SPRING)
  // Floors at 0.55, never 0 — the photographs are content, not a reveal.
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.3], [0.55, 1]), SPRING)

  // Three drift values, always created so the hook order never changes; only
  // as many as there are rows get consumed.
  const driftA = useSpring(useTransform(scrollYProgress, [0, 1], DRIFT[0]), SPRING)
  const driftB = useSpring(useTransform(scrollYProgress, [0, 1], DRIFT[1]), SPRING)
  const driftC = useSpring(useTransform(scrollYProgress, [0, 1], DRIFT[2]), SPRING)
  const drifts: MotionValue<number>[] = [driftA, driftB, driftC]

  // Rest until the client is running: see useHydrated.
  const still = reduced || !hydrated

  const built = buildRows(photos, Math.min(3, Math.max(1, rows)))
  if (built.length === 0) return null

  return (
    <section
      ref={band}
      aria-label={label}
      // `overflow-hidden` is the guarantee that nothing here can widen the
      // page: the rows are deliberately wider than the viewport and drift.
      className={`relative isolate overflow-hidden ${className}`}
    >
      {children}

      <motion.div
        style={
          still
            ? undefined
            : { transformPerspective: 1400, rotateX, rotateZ, y, opacity }
        }
        className={still ? '' : 'will-change-transform'}
      >
        {built.map((row, r) => (
          <motion.div
            key={r}
            style={still ? undefined : { x: drifts[r % drifts.length] }}
            className={[
              'flex gap-[clamp(0.75rem,1.6vw,1.75rem)] py-[clamp(0.375rem,0.8vw,0.875rem)]',
              reduced
                ? // No drift means the far ends of a centred row would be
                  // unreachable, so hand the visitor a plain scroller instead.
                  'justify-start overflow-x-auto overscroll-x-contain px-[clamp(1.25rem,5vw,6rem)]'
                : 'justify-center',
              // Only promote a layer for a row that is actually going to move.
              still ? '' : 'will-change-transform',
            ].join(' ')}
          >
            {row.map(({ photo, key, describe }) => (
              <figure
                key={key}
                className="group relative w-[clamp(13rem,24vw,24rem)] shrink-0"
                {...(describe ? {} : { 'aria-hidden': true })}
              >
                <SmartImage
                  src={photo.src}
                  alt={describe ? photo.alt : ''}
                  width={photo.width}
                  height={photo.height}
                  placeholder={photo.placeholder}
                  sizes="(max-width: 768px) 60vw, 24vw"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  wrapperClassName="aspect-[4/3] w-full"
                />
                {/* A whisper of nightfall on hover — depth, not a highlight. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-nightfall/0 transition-colors duration-700 ease-editorial group-hover:bg-nightfall/15 motion-reduce:transition-none"
                />
              </figure>
            ))}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
