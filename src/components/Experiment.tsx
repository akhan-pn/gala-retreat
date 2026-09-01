'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { CONSENT_EVENT } from '@/lib/consent'
import {
  EXPERIMENT_CSS,
  experimentByKey,
  recordExperimentGoal,
  reportExposure,
  type ExperimentKey,
  type VariantName,
} from '@/lib/experiments'

/**
 * Renders every arm of one experiment as inert slots, and lets CSS decide.
 *
 * The full reasoning for the no-flash mechanism lives in src/lib/experiments.ts.
 * The short version, from this component's side: it always renders all arms,
 * identically, on the server and on the client. It never reads the assignment
 * during render, so there is no hydration mismatch, no re-render, and no
 * post-hydration swap — the arm was already chosen by an attribute the
 * blocking boot script stamped on <html> before the parser reached this point.
 *
 *   <Experiment
 *     name="hero_cta"
 *     variants={{ control: 'Enquire', check_date: 'Check your date' }}
 *   />
 *
 * The variants map is exhaustive by type: adding an arm to the declaration
 * breaks the build at every call site until copy exists for it.
 */
export default function Experiment<K extends ExperimentKey>({
  name,
  variants,
}: {
  name: K
  variants: Record<VariantName<K>, ReactNode>
}) {
  const declaration = experimentByKey(name)
  const slotRef = useRef<HTMLSpanElement | null>(null)

  // Report the exposure once per document. This is the only place the variant
  // is read, and it is read from the DOM after paint — never during render.
  useEffect(() => {
    if (!declaration) return
    const key = declaration.key
    reportExposure(key)

    // Someone who accepts after the page has loaded is seeded now, and enrols
    // on their next document. Recording them here would be a false exposure:
    // they read control, unassigned, for this whole visit.
    const onConsent = (event: Event) => {
      if ((event as CustomEvent<string>).detail === 'granted') reportExposure(key)
    }
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [declaration])

  // A copy test on a call to action wants to measure presses of that call to
  // action. Binding the goal to the enclosing link here means the page holding
  // the CTA needs no knowledge that a test exists.
  useEffect(() => {
    const goal = declaration?.clickGoal
    const slot = slotRef.current
    if (!goal || !slot) return

    const target =
      slot.closest('a,button,[role="button"]') ?? slot.parentElement ?? slot
    const onClick = () => recordExperimentGoal(goal)
    target.addEventListener('click', onClick)
    return () => target.removeEventListener('click', onClick)
  }, [declaration])

  if (!declaration) return null

  const copy = variants as Record<string, ReactNode>

  return (
    <>
      {/* href + precedence hoist this into <head> and de-duplicate it across
          every Experiment on the page, so the rules are in force before the
          slots below are painted. */}
      <style href="gx-experiments" precedence="high">
        {EXPERIMENT_CSS}
      </style>
      {declaration.variants.map((variant, index) => (
        <span
          key={variant.name}
          ref={index === 0 ? slotRef : undefined}
          data-gx-e={declaration.key}
          data-gx-v={variant.name}
          // Control is the only arm visible without CSS or JavaScript. Nothing
          // is hidden with opacity, so nothing can be left invisible-but-there.
          hidden={index > 0}
        >
          {copy[variant.name]}
        </span>
      ))}
    </>
  )
}

export { Experiment }
