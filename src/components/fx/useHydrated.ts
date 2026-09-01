'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * False through the server render and the hydration pass, true immediately
 * after — without a `setState` in an effect, and without a hydration mismatch,
 * because React uses the server snapshot for both.
 *
 * `fx/` uses this to keep scroll-linked transforms out of the server HTML.
 * Motion serialises a motion value's *starting* frame into the markup, so a
 * band whose entry animation begins at 55% opacity and a 9-degree tip would
 * ship exactly that to anyone whose JavaScript never arrives, and stay there.
 * Gated on this flag the markup ships at rest and the motion is layered on.
 */
export default function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
