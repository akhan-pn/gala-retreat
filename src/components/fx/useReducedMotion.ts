'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(QUERY).matches
}

/**
 * The visitor's motion preference, live.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` on purpose: this
 * repo treats a synchronous `setState` inside an effect as an error, and the
 * store form is also correct across hydration — the server snapshot is
 * "motion is fine", React re-renders on its own if the client disagrees.
 *
 * Every component in `fx/` reads this and renders a genuinely static tree when
 * it is true, rather than animating to the same place more slowly.
 */
export default function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
