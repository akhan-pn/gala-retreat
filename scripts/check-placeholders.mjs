#!/usr/bin/env node
/**
 * Fails while any image on the site is still a licensed stand-in rather than
 * real Gala Retreat photography. Wired into `npm run check` so a production
 * deploy cannot quietly ship someone else's venue.
 *
 * Pass --warn to report without failing (useful on preview deploys).
 */
import { readFileSync } from 'node:fs'

const warnOnly = process.argv.includes('--warn')
// Every manifest that can carry stand-in photography. Add new ones here.
const manifests = [
  '../src/content/gallery.ts',
  '../src/content/occasions.ts',
]

const stale = manifests.flatMap((rel) => {
  const source = readFileSync(new URL(rel, import.meta.url), 'utf8')
  return [
    ...source.matchAll(/(?:src|image):\s*'([^']+)'[^}]*?placeholder:\s*true/gs),
  ].map((m) => m[1])
})

if (stale.length === 0) {
  console.log('✓ All imagery is real venue photography.')
  process.exit(0)
}

console.log(
  `${warnOnly ? '!' : '✗'} ${stale.length} image${stale.length === 1 ? '' : 's'} still a licensed stand-in:\n`,
)
for (const src of stale) console.log(`    ${src}`)
console.log(`
  Replace the file in public/ with the real photograph, then remove
  \`placeholder: true\` from that entry in src/content/gallery.ts.
  Shot list: docs/shot-list.md
`)

process.exit(warnOnly ? 0 : 1)
