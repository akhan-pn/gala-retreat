'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Translates its child against the scroll direction at `factor` of the
 * distance travelled. Deliberately subtle — 0.12 is roughly "you notice
 * it only if you look for it".
 */
export default function Parallax({
  children,
  factor = 0.12,
  className = '',
}: {
  children: ReactNode
  factor?: number
  className?: string
}) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = outer.current
    const target = inner.current
    if (!wrap || !target) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    let frame = 0
    let visible = false

    const update = () => {
      frame = 0
      const rect = wrap.getBoundingClientRect()
      // Distance of the element's centre from the viewport centre.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2
      target.style.transform = `translate3d(0, ${(-offset * factor).toFixed(2)}px, 0)`
    }

    const onScroll = () => {
      if (!visible || frame) return
      frame = requestAnimationFrame(update)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) update()
    })

    io.observe(wrap)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [factor])

  return (
    <div ref={outer} className={`overflow-hidden ${className}`}>
      <div ref={inner} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  )
}
