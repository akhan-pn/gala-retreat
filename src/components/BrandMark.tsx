/**
 * The Gala Retreat mark — a marigold rosette. See docs/brand-logo.md.
 *
 * Eight discs on a ring, unioned with a centre disc, with the eye punched out.
 * Built from circles rather than drawn petals so the geometry is exact.
 *
 * Winding matters: the petals and the centre disc wind the same way so the
 * default non-zero fill rule unions them, and the eye is wound the opposite
 * way, which is what punches the hole. Even-odd would cancel every overlap.
 */
function circle(cx: number, cy: number, r: number, reverse = false) {
  const s = reverse ? 1 : 0
  return `M${(cx - r).toFixed(2)} ${cy} a${r} ${r} 0 1 ${s} ${(2 * r).toFixed(2)} 0 a${r} ${r} 0 1 ${s} ${(-2 * r).toFixed(2)} 0 Z`
}

function rosette(petalR: number, ringR: number, coreR: number, eyeR: number) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    return circle(60 + ringR * Math.cos(a), 60 + ringR * Math.sin(a), petalR)
  })
  return [...petals, circle(60, 60, coreR), circle(60, 60, eyeR, true)].join(' ')
}

const PRIMARY = rosette(16, 26, 26, 11)
/** Optical cut for 24px and under: the eye is opened so it survives. */
const SMALL = rosette(16.5, 25, 26, 13.5)

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
      <path d={size < 26 ? SMALL : PRIMARY} />
    </svg>
  )
}
