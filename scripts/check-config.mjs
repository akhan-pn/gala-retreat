#!/usr/bin/env node
/**
 * Lists every client value still carrying an assumption.
 * Pass --warn to report without failing.
 */
import { readFileSync } from 'node:fs'

const warnOnly = process.argv.includes('--warn')
const source = readFileSync(new URL('../src/config/pending.ts', import.meta.url), 'utf8')

const items = [...source.matchAll(/key:\s*'([^']+)',\s*\n\s*current:\s*'([^']*)',\s*\n\s*needed:\s*\n?\s*'([^']*)'/g)]

if (items.length === 0) {
  console.log('✓ Every client value is confirmed.')
  process.exit(0)
}

console.log(
  `${warnOnly ? '!' : '✗'} ${items.length} value${items.length === 1 ? '' : 's'} not yet confirmed by the client:\n`,
)
for (const [, key, current, needed] of items) {
  console.log(`    ${key}`)
  console.log(`      now:    ${current}`)
  console.log(`      needed: ${needed}\n`)
}
console.log('  Confirm each, update src/config/site.ts, then delete its entry from src/config/pending.ts.\n')

process.exit(warnOnly ? 0 : 1)
