import type { Metadata } from 'next'
import { Jost, Prata } from 'next/font/google'
import '../globals.css'

const prata = Prata({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-prata',
})

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: 'Dashboard — Gala Retreat',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Separate root layout: the admin area shares the design language but none
 * of the marketing chrome, and is never tracked by the visitor analytics.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN" className={`${prata.variable} ${jost.variable}`}>
      <body className="antialiased">
        {/* Applies a stored theme choice before first paint, so an explicit
            preference never flashes the other theme. With nothing stored the
            CSS falls through to prefers-color-scheme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gr-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {/* Without JavaScript nothing can reveal itself, so neutralise every
            opacity:0 starting state rather than serve a blank page. */}
        <noscript>
          <style>{`.u-reveal{opacity:1!important;transform:none!important}.u-img img{opacity:1!important}`}</style>
        </noscript>

        {children}
      </body>
    </html>
  )
}
