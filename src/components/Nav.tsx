'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import BrandMark from './BrandMark'
import { site } from '@/config/site'
import ThemeToggle from './ThemeToggle'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock scroll while the mobile menu is open. The menu closes from the
  // link handlers below rather than from a pathname effect.
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menu])

  const solid = scrolled || menu
  /**
   * At the top of the home page the bar sits over the hero photograph, so it
   * uses the fixed light palette regardless of theme — the same way type over
   * any photograph does. Everywhere else it follows the active theme.
   */
  const onHero = pathname === '/' && !solid

  const shell = solid
    ? 'bg-surface/92 backdrop-blur-md'
    : onHero
      ? 'bg-gradient-to-b from-nightfall/70 to-transparent'
      : 'bg-transparent'

  const brand = onHero ? 'text-ivory' : 'text-ink'
  const brandSub = onHero ? 'text-champagne/80' : 'text-accent'
  const idle = onHero ? 'text-ivory/75 hover:text-ivory' : 'text-ink/72 hover:text-ink'
  const current = onHero ? 'text-champagne' : 'text-accent'
  const cta = onHero
    ? 'border-champagne/60 text-champagne hover:bg-champagne hover:text-nightfall'
    : 'border-accent text-accent hover:bg-accent hover:text-on-accent'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${shell}`}
    >
      <div className="u-grid items-center py-5 sm:py-6">
        <Link
          href="/"
          className="col-span-8 flex items-center gap-3.5 leading-none sm:col-span-4"
          aria-label={`${site.legalName} — home`}
        >
          <BrandMark size={34} className={`shrink-0 ${brand}`} />
          <span>
            <span className={`u-display-sm block text-[1.35rem] sm:text-[1.5rem] ${brand}`}>
              Gala Retreat
            </span>
            <span className={`u-label mt-1.5 block text-[0.5625rem] ${brandSub}`}>
              Resort &amp; Convention
            </span>
          </span>
        </Link>

        <nav
          className="col-span-8 hidden items-center justify-end gap-8 sm:flex"
          aria-label="Primary"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              className={`u-link u-label transition-colors duration-300 ${
                pathname === l.href ? current : idle
              }`}
            >
              {l.label}
            </Link>
          ))}

          <ThemeToggle className={onHero ? 'text-ivory/70 hover:text-champagne' : 'text-ink/60 hover:text-accent'} />

          <Link
            href="/enquiry"
            className={`u-label border px-5 py-3 transition-colors duration-400 ${cta}`}
          >
            Enquire
          </Link>
        </nav>

        <div className="col-span-4 flex items-center justify-end gap-1 sm:hidden">
          <ThemeToggle className={onHero ? 'text-ivory/70' : 'text-ink/60'} />
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? 'Close menu' : 'Open menu'}
            className={`grid h-11 w-11 place-items-center ${onHero ? 'text-ivory' : 'text-ink'}`}
          >
            {/* Two hairlines that cross into an X — thin strokes to match the
                rest of the chrome, not a chunky three-bar hamburger. */}
            <span aria-hidden className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
                  menu ? 'top-1/2 rotate-45' : 'top-1'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
                  menu ? 'top-1/2 -rotate-45' : 'bottom-1'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu — full-bleed, type-led, left-aligned. */}
      <div
        id="mobile-menu"
        hidden={!menu}
        className="h-[calc(100dvh-5.5rem)] overflow-y-auto border-t border-ink/10 sm:hidden"
      >
        <nav className="u-grid py-10" aria-label="Primary, mobile">
          <ul className="col-span-12 space-y-1">
            {[...links, { href: '/enquiry', label: 'Enquire' }].map((l, i) => (
              <li key={l.href} className="border-b border-ink/10">
                <Link
                  href={l.href}
                  onClick={() => setMenu(false)}
                  aria-current={pathname === l.href ? 'page' : undefined}
                  className="flex items-baseline gap-5 py-5"
                >
                  <span className="u-label tabular-nums text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`u-display-sm text-[2rem] ${
                      pathname === l.href ? 'text-accent' : 'text-ink'
                    }`}
                  >
                    {l.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="col-span-12 mt-10 space-y-2">
            <a href={`tel:${site.phone.number}`} className="u-label block text-ink/72">
              {site.phone.display} — {site.phone.label}
            </a>
            <a href={`tel:+${site.whatsapp.number}`} className="u-label block text-ink/72">
              {site.whatsapp.display} — {site.whatsapp.label}
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
