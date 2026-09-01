'use client'

import { useSyncExternalStore } from 'react'

type Mode = 'light' | 'dark'

export const THEME_KEY = 'gr-theme'

const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

function getSnapshot(): Mode {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Private mode or blocked storage — fall through to the default.
  }
  // Light is the brand default, regardless of what the device asks for.
  return 'light'
}

/** The server renders the default, which is also what an unchosen client gets. */
function getServerSnapshot(): Mode {
  return 'light'
}

/**
 * Light/dark switch.
 *
 * The site is light by default for everyone. A click writes an explicit choice
 * to localStorage, which then wins for good; the matching no-flash script at the
 * top of the layout's <body> applies it before first paint.
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
