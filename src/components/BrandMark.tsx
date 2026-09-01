/**
 * The Gala Retreat mark — an ogee arch on a plinth. See docs/brand-logo.md.
 *
 * Filled contours, not a stroked path: the wall is heavy at the shoulders and
 * thins into the tip, so the mark carries the same stress as the Didone
 * wordmark beside it. A uniform stroke is what makes a mark read as clipart.
 *
 * Fills inherit `currentColor`, so one component covers light grounds, dark
 * grounds and type set over a photograph.
 */
const OUTER =
  'M28 94 L28 58 C28 37 35 23 46 15 C53 10 57 8 60 -2 C63 8 67 10 74 15 C85 23 92 37 92 58 L92 94 Z'
const COUNTER =
  'M44 94 L44 58 C44 46 49 36 57 30 C58 28 59 26 60 22 C61 26 62 28 63 30 C71 36 76 46 76 58 L76 94 Z'
/** Optical-size cut: below 26px the counter needs opening up to survive. */
const COUNTER_SM =
  'M42 94 L42 57 C42 45 47 35 56 29 C58 27 59 25 60 21 C61 25 62 27 64 29 C73 35 78 45 78 57 L78 94 Z'
const PLINTH = 'M24 94 L96 94 L96 104 L24 104 Z'

export default function BrandMark({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <g transform="translate(0 8)">
        <path fillRule="evenodd" d={`${OUTER} ${size < 26 ? COUNTER_SM : COUNTER}`} />
        <path d={PLINTH} />
      </g>
    </svg>
  )
}
