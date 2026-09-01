#!/usr/bin/env node
/**
 * Lists every client value still carrying an assumption.
 * Pass --warn to report without failing.
 */
import { readFileSync } from 'node:fs'

const warnOnly = process.argv.includes('--warn')
const source = readFileSync(new URL('../src/config/pending.ts', import.meta.url), 'utf8')

// Entries may span lines and concatenate strings with +, so match the block
// between `key:` markers rather than a fixed three-line shape.
const blocks = source.split(/\n\s*\{\s*\n\s*key:\s*'/).slice(1)
const items = blocks.map((b) => {
  const key = b.slice(0, b.indexOf("'"))
  const text = (label) => {
    const at = b.indexOf(`${label}:`)
    if (at === -1) return ''
    const seg = b.slice(at, b.indexOf('\n  },', at) + 1 || undefined)
    return [...seg.matchAll(/'((?:[^'\\]|\\.)*)'/g)]
      .map((m) => m[1])
      .join('')
      .replace(/\\u2019/g, '\u2019')
      .trim()
  }
  return [null, key, text('current'), text('needed')]
})

// A launch gate that silently skips an entry it cannot parse is worse than no
// gate at all, so cross-check the count against the raw `key:` occurrences.
const declared = (source.match(/^\s*key:\s*'/gm) || []).length
if (declared !== items.length) {
  console.log(`\u2717 pending.ts has ${declared} entries but only ${items.length} parsed.`)
  console.log('  The parser is out of step with the file — fix it before trusting this gate.\n')
  process.exit(1)
}

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
