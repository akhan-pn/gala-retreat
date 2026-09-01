'use client'

import * as React from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

/**
 * Tabs — Radix behaviour, this site's clothes.
 *
 * The stock shadcn version is a grey pill rail with a shadowed active chip.
 * This is the opposite: a single hairline rule with the labels sitting on
 * it, and the active one marked by the rule turning accent-coloured under
 * that label alone. Nothing is boxed, nothing is rounded, nothing casts a
 * shadow.
 *
 * Labels use `.u-label` — the site's third type register — so a tab rail
 * reads as the same kind of object as a section eyebrow. Colours come from
 * the semantic tokens, so both themes are handled with no `dark:` utilities.
 *
 * `data-[state=active]` rather than shadcn's `data-active:`: Radix 1.1.x
 * emits `data-state="active"`, and `data-active:` compiles to `[data-active]`,
 * which never matches. Same trap as in accordion.tsx.
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        'flex flex-col gap-10',
        'data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-12',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The rail. It carries the hairline; each trigger pulls itself one pixel
 * over that line so its own border can replace it when active.
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-ink/12 sm:gap-x-10',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start',
        'data-[orientation=vertical]:gap-y-0 data-[orientation=vertical]:border-b-0',
        'data-[orientation=vertical]:border-l data-[orientation=vertical]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'u-label group/tabs-trigger relative -mb-px inline-flex items-center gap-2.5',
        'border-b border-transparent pb-4 whitespace-nowrap outline-none',
        'text-ink/60 transition-colors duration-500 ease-editorial',
        'hover:text-ink',
        'data-[state=active]:border-accent data-[state=active]:text-accent',
        'disabled:pointer-events-none disabled:opacity-60',
        // Vertical rails hang the marker on the left rule instead.
        'data-[orientation=vertical]:mb-0 data-[orientation=vertical]:-ml-px',
        'data-[orientation=vertical]:w-full data-[orientation=vertical]:border-b-0',
        'data-[orientation=vertical]:border-l data-[orientation=vertical]:py-3.5',
        'data-[orientation=vertical]:pb-3.5 data-[orientation=vertical]:pl-5',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Radix unmounts the inactive panels, so the enter animation runs on every
 * switch. It is a 4px lift and a fade, on the site's easing — the same move
 * `.u-reveal` makes, at panel scale.
 */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        'animate-in fade-in slide-in-from-bottom-1 duration-500 ease-editorial',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
