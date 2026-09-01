'use client'

import * as React from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

/**
 * Accordion — Radix behaviour, this site's clothes.
 *
 * shadcn's stock version is a rounded card with a chunky chevron and
 * `text-muted-foreground`; none of that belongs here. What is left of it is
 * the primitive: roving focus, Home/End keys, correct `aria-expanded` and
 * `aria-controls`, and the `--radix-accordion-content-height` variable the
 * open/close animation measures against.
 *
 * Everything visual is rebuilt on the semantic tokens — `text-ink`,
 * `text-accent`, `border-ink/12` — so it follows the light and dark themes
 * without a single `dark:` utility. Rows are separated by hairlines rather
 * than boxed, and the indicator is a 1px plus that rotates into a minus.
 *
 * Note for anyone regenerating this file with the shadcn CLI: the generated
 * version styles state with `data-open:` / `data-closed:`, which compile to
 * `[data-open]` / `[data-closed]`. Radix 1.2.x emits `data-state="open"`,
 * so those utilities never match and the rows animate not at all. The
 * `data-[state=...]` selectors below are the ones that actually fire.
 */
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col border-t border-ink/12', className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-ink/12', className)}
      {...props}
    />
  )
}

/**
 * The row itself. Children are laid out on a shared baseline so a hung
 * numeral sits level with the question; the indicator opts out with
 * `self-center` and stays centred however many lines the question runs to.
 *
 * Focus is deliberately left to the global `:focus-visible` rule in
 * globals.css — the accent outline the rest of the site uses — rather than
 * shadcn's ring stack.
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger flex flex-1 items-baseline gap-5 py-7 text-left outline-none',
          'transition-colors duration-500 ease-editorial',
          'disabled:pointer-events-none disabled:opacity-60 sm:gap-8 sm:py-8',
          className,
        )}
        {...props}
      >
        {children}

        {/* A 1px plus that becomes a minus: the whole mark turns a quarter
            turn while the bar that is currently horizontal collapses along
            its own length, leaving one stroke lying flat. */}
        <span
          aria-hidden
          data-slot="accordion-trigger-icon"
          className={cn(
            'relative ml-auto block size-3.5 shrink-0 self-center text-ink/60',
            'transition-[transform,color] duration-500 ease-editorial',
            'group-hover/accordion-trigger:text-accent',
            'group-data-[state=open]/accordion-trigger:rotate-90',
            'group-data-[state=open]/accordion-trigger:text-accent',
          )}
        >
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current transition-transform duration-500 ease-editorial group-data-[state=open]/accordion-trigger:scale-x-0" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * The panel. The height keyframes come from tw-animate-css and read their
 * timing from `--tw-duration` / `--tw-ease`, which is why plain `duration-*`
 * and `ease-*` utilities are enough to retime them to the site's easing.
 * The reduced-motion block in globals.css already flattens the animation.
 */
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden duration-[520ms] ease-editorial data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          'u-measure-wide pb-9 text-[0.95rem] leading-relaxed text-ink/72',
          '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4',
          '[&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
