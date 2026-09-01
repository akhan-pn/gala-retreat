'use client'

import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Maximum rotation on either axis, in degrees. Six is about the ceiling
      before the card stops reading as a photograph and starts reading as a toy. */
  max?: number
  /** A faint ivory sheen that tracks the pointer across the face. */
  glare?: boolean
}

/** rx / ry in degrees, gx / gy as percentages, a is the sheen's opacity. */
const REST = { rx: 0, ry: 0, gx: 50, gy: 50, a: 0 }
const AXES = ['rx', 'ry', 'gx', 'gy', 'a'] as const

/**
 * Tilts its child a few degrees towards the pointer.
 *
 * The pointer handler only ever writes a target; a single rAF loop chases it
 * and stops once it arrives. A CSS transition on the transform would either
 * lag behind the pointer or snap on release — this does neither, and costs
 * nothing while the pointer is elsewhere.
 *
 * Touch pointers and prefers-reduced-motion are no-ops: the loop never runs,
 * so the card simply renders flat.
 */
export default function TiltCard({
  children,
  className = '',
  max = 6,
  glare = false,
}: Props) {
  const plane = useRef<HTMLDivElement>(null)
  const sheen = useRef<HTMLSpanElement>(null)
  const want = useRef({ ...REST })
  const reduced = useRef(false)
  const start = useRef<() => void>(() => {})

  useEffect(() => {
    const el = plane.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const now = { ...REST }
    let frame = 0

    function tick() {
      frame = 0
      // Re-read rather than close over: a function declaration is hoisted, so
      // the guard above does not narrow for TypeScript in here.
      const node = plane.current
      if (!node) return

      const target = want.current
      let moving = false

      // A fixed fraction of the remaining distance per frame gives the ease-out
      // for free, and settles identically whether the pointer stopped or left.
      for (const axis of AXES) {
        const delta = target[axis] - now[axis]
        if (Math.abs(delta) > 0.01) {
          now[axis] += delta * 0.1
          moving = true
        } else {
          now[axis] = target[axis]
        }
      }

      node.style.transform = `rotateX(${now.rx.toFixed(3)}deg) rotateY(${now.ry.toFixed(3)}deg)`

      const s = sheen.current
      if (s) {
        s.style.setProperty('--tilt-x', `${now.gx.toFixed(2)}%`)
        s.style.setProperty('--tilt-y', `${now.gy.toFixed(2)}%`)
        s.style.opacity = now.a.toFixed(3)
      }

      if (moving) frame = requestAnimationFrame(tick)
    }

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    start.current = kick

    const sync = () => {
      reduced.current = mq.matches
      // A preference switched on mid-hover must unwind the card, not freeze it.
      if (mq.matches) {
        want.current = { ...REST }
        kick()
      }
    }

    sync()
    mq.addEventListener('change', sync)

    return () => {
      mq.removeEventListener('change', sync)
      if (frame) cancelAnimationFrame(frame)
      start.current = () => {}
    }
  }, [])

  const rest = () => {
    want.current = { ...REST }
    start.current()
  }

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Tilting under a finger is guesswork — the finger is on top of the card.
    if (reduced.current || event.pointerType !== 'mouse') return

    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width || !box.height) return

    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height

    want.current = {
      rx: -(y - 0.5) * 2 * max,
      ry: (x - 0.5) * 2 * max,
      gx: x * 100,
      gy: y * 100,
      a: 1,
    }
    start.current()
  }

  return (
    <div
      className={className}
      style={{ perspective: '900px' }}
      onPointerMove={onMove}
      onPointerLeave={rest}
      onPointerCancel={rest}
    >
      <div
        ref={plane}
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {children}

        {glare && (
          <span
            ref={sheen}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={
              {
                opacity: 0,
                background:
                  'radial-gradient(55% 55% at var(--tilt-x, 50%) var(--tilt-y, 50%), color-mix(in srgb, var(--color-ivory) 34%, transparent) 0%, transparent 72%)',
              } as CSSProperties
            }
          />
        )}
      </div>
    </div>
  )
}
