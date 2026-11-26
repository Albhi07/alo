// Bundle budget: JS needed for first load (entry + its static imports) must stay under 250 KB gzipped.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const BUDGET = 250 * 1024
const dist = 'dist'
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const files = new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]))
let total = 0
for (const f of files) {
  const gz = gzipSync(readFileSync(join(dist, f))).length
  total += gz
  console.log(`${(gz / 1024).toFixed(1).padStart(7)} KB  ${f}`)
}
console.log(`${(total / 1024).toFixed(1).padStart(7)} KB  first-load JS (gzip), budget ${BUDGET / 1024} KB`)
if (total > BUDGET) { console.error('Over budget'); process.exit(1) }
