/**
 * The Gala Retreat mark — a tall pointed arch over the ground line.
 * See docs/brand-logo.md.
 *
 * Strokes inherit `currentColor` so the mark works on light, on dark, and over
 * a photograph without needing three files. The dot is the one part that does
 * not: it stays champagne, and disappears entirely below 28px, where a
 * half-rendered dot would read as dirt on the mark.
 */
export default function BrandMark({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const small = size < 28
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth={small ? 9 : 6}
        strokeLinecap="round"
      >
        <path d="M40 92 L40 56 C40 38 46 22 60 14 C74 22 80 38 80 56 L80 92" />
        <path d="M28 99 L92 99" />
      </g>
      {!small && <circle cx="60" cy="70" r="5" fill="var(--color-champagne)" />}
    </svg>
  )
}
