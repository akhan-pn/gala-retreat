'use client'

import { useSyncExternalStore } from 'react'

type Mode = 'light' | 'dark'

export const THEME_KEY = 'gr-theme'

const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  // Re-read when the device flips; the snapshot ignores it if the visitor
  // has already made an explicit choice.
  mq.addEventListener('change', onChange)
  return () => {
    listeners.delete(onChange)
    mq.removeEventListener('change', onChange)
  }
}

function getSnapshot(): Mode {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Private mode or blocked storage — fall through to the device setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** The server cannot know the visitor's theme, so it renders the neutral mark. */
function getServerSnapshot(): Mode | null {
  return null
}

/**
 * Light/dark switch.
 *
 * With no stored choice the site follows the device, and keeps following it if
 * the device setting changes mid-session. The first click writes an explicit
 * choice, which then wins for good. The matching no-flash script lives at the
 * top of the layout's <body>.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {}
    for (const l of listeners) l()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        mode ? `Switch to the ${mode === 'dark' ? 'light' : 'dark'} theme` : 'Switch theme'
      }
      title={mode === 'dark' ? 'Light theme' : 'Dark theme'}
      className={`grid h-9 w-9 place-items-center transition-colors duration-300 ${className}`}
    >
      {/* A half-filled circle — the contrast mark. The filled half swaps sides
          with the theme, so the control reads as a state, not a switch. */}
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
        {mode && (
          <path
            d={mode === 'dark' ? 'M8 1 A7 7 0 0 1 8 15 Z' : 'M8 1 A7 7 0 0 0 8 15 Z'}
            fill="currentColor"
          />
        )}
      </svg>
    </button>
  )
}
