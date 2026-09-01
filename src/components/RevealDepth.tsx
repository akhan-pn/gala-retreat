'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

/**
 * Rides on `.u-reveal` so the layout's <noscript> block and the global
 * reduced-motion rules already cover this component. The paired selectors
 * outrank the base ones on specificity alone, so the order these two
 * stylesheets land in the head does not matter.
 */
const CSS = `
.u-reveal.gr-depth {
  transform: perspective(1200px) translate3d(0, 16px, -80px) rotateX(6deg);
  transform-origin: 50% 100%;
  transition-duration: 1000ms;
}
.u-reveal.gr-depth[data-visible="true"] {
  transform: perspective(1200px) translate3d(0, 0, 0) rotateX(0deg);
}
@media (prefers-reduced-motion: reduce) {
  .u-reveal.gr-depth,
  .u-reveal.gr-depth[data-visible="true"] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
`

/**
 * Reveal's sibling: instead of lifting off the page, the content rotates up
 * out of Z and settles flat, as though it were being laid down.
 */
export default function RevealDepth({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: ReactNode
  as?: ElementType
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const inView = () => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    }

    if (typeof IntersectionObserver === 'undefined') {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    io.observe(el)

    // Safety net: content already on screen must never stay hidden because
    // an observer callback did not arrive.
    const failsafe = window.setTimeout(() => {
      if (inView()) setVisible(true)
    }, 1200)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <>
      <style href="gr-reveal-depth" precedence="default">
        {CSS}
      </style>
      <Tag
        ref={ref}
        className={`u-reveal gr-depth ${className}`}
        data-visible={visible}
        style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
      >
        {children}
      </Tag>
    </>
  )
}
