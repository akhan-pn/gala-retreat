'use client'

import { useEffect, useRef } from 'react'
import type { Photo } from '@/content/gallery'
import Carousel from './Carousel'

/**
 * Modal wrapper around the same Carousel the hero uses.
 * Locks scroll, traps focus, and restores focus to the trigger on close.
 */
export default function Lightbox({
  slides,
  startIndex,
  onClose,
}: {
  slides: Photo[]
  startIndex: number
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null

    const { overflow, paddingRight } = document.body.style
    // Compensate for the vanishing scrollbar so the page doesn't jump.
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`

    panel.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusables = panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      restoreTo.current?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-100 bg-nightfall/97 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div ref={panel} tabIndex={-1} className="flex h-full flex-col outline-none">
        <div className="flex items-center justify-between px-[clamp(1.25rem,5vw,4rem)] py-6">
          <p className="u-label text-ivory/50">Gala Retreat — Gallery</p>
          <button
            type="button"
            onClick={onClose}
            className="u-label flex items-center gap-2 text-ivory/70 transition-colors duration-300 hover:text-champagne"
          >
            Close
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1">
          <Carousel
            slides={slides}
            variant="lightbox"
            initialIndex={startIndex}
            autoPlayMs={null}
            keyboardScope="document"
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}
