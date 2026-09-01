'use client'

import { useState } from 'react'

export type Day = { day: string; views: number; visitors: number }

/**
 * Fourteen days of traffic. One series, one hue, one axis — magnitude over
 * time, so bars. No legend: the heading names the series.
 */
export default function TrafficBars({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...days.map((d) => d.views))

  return (
    <div>
      <div className="relative flex h-44 items-end gap-[2px]">
        {days.map((d, i) => {
          const pct = (d.views / max) * 100
          return (
            <div
              key={d.day}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
            >
              {/* Full-height hit target, larger than the mark itself. */}
              <span aria-hidden className="absolute inset-0" />
              <span
                aria-hidden
                className={`w-full rounded-t-[4px] transition-opacity duration-200 ${
                  d.views > 0 ? 'bg-accent' : 'bg-ink/15'
                }`}
                style={{
                  height: `${Math.max(pct, d.views > 0 ? 2 : 0.6)}%`,
                  opacity: hover === null || hover === i ? 1 : 0.4,
                }}
              />
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap border border-ink/15 bg-surface-3 px-3 py-2 text-xs text-ink shadow-lg">
                  <span className="u-label block text-ink/60">{d.day}</span>
                  <span className="mt-1 block tabular-nums">
                    {d.views} views · {d.visitors} visitors
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex justify-between">
        <span className="u-label text-ink/60">{days[0]?.day}</span>
        <span className="u-label text-ink/60">{days[days.length - 1]?.day}</span>
      </div>
    </div>
  )
}
