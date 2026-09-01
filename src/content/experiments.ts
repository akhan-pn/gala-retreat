import type { ExperimentGoal } from '@/lib/db/schema'

/**
 * Live A/B tests.
 *
 * A declaration here is the whole contract: it generates the CSS that hides
 * the losing slots, the assignment table inside the blocking boot script, and
 * the arms the API will accept. Nothing else needs editing to start a test.
 *
 * Keys and variant names end up in three places at once — a `data-gx-*`
 * attribute, a CSS attribute selector, and a varchar(40) column — so both are
 * restricted to the slug shape asserted in src/lib/experiments.ts.
 */

export type VariantDeclaration = {
  readonly name: string
  /** Relative share. Integers; they need not add up to 100. */
  readonly weight: number
  /** What this arm actually says, for the dashboard's legend. */
  readonly note: string
}

export type ExperimentDeclaration = {
  readonly key: string
  readonly hypothesis: string
  /**
   * Metrics to read, primary first. Everything after the first is a guardrail
   * — a variant that lifts clicks while sinking enquiries has not won.
   */
  readonly goals: readonly [ExperimentGoal, ...ExperimentGoal[]]
  /**
   * Recorded when a click lands inside this experiment's slot (or on the
   * link/button wrapping it). Lets a copy test measure its own control
   * without the surrounding page having to know a test exists.
   */
  readonly clickGoal?: ExperimentGoal
  /**
   * Pre-registered stopping rule. Both must pass before the dashboard is
   * allowed to use winner language — declared before the test starts so the
   * threshold cannot be moved to whatever the data happens to have reached.
   */
  readonly minPerArm: number
  readonly minDays: number
  /** ISO date the arms went live. Anything before it is not this test. */
  readonly startedAt: string
  /** variants[0] is always the control — the wording already on the site. */
  readonly variants: readonly [VariantDeclaration, ...VariantDeclaration[]]
}

export const experiments = [
  {
    key: 'hero_cta',
    hypothesis:
      'The hero asks for an enquiry, but the first thing a couple actually ' +
      'wants to know is whether their date is free. Naming that smaller, ' +
      'more concrete question should raise hero CTA clicks without costing ' +
      'enquiries — if it lifts clicks but not enquiries, it only moved ' +
      'curiosity, and control stays.',
    goals: ['hero_cta_click', 'enquiry_submitted'],
    clickGoal: 'hero_cta_click',
    // 1,400 per arm detects roughly a 4pp move on an assumed ~12% hero click
    // rate at 80% power, two-sided α = 0.05. Fourteen days covers a full
    // weekend cycle, which matters for a venue: Sunday browsing behaves
    // nothing like Wednesday's.
    minPerArm: 1400,
    minDays: 14,
    startedAt: '2026-09-02',
    variants: [
      { name: 'control', weight: 50, note: 'Enquire' },
      { name: 'check_date', weight: 50, note: 'Check your date' },
    ],
  },
] as const satisfies readonly ExperimentDeclaration[]
