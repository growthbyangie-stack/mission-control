#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const enabled = process.env.LINK_PUBLIC_SITE_BUILD === '1'

if (!enabled) {
  process.exit(0)
}

const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
const keep = new Set(['client-offers'])

if (!fs.existsSync(apiDir)) {
  console.log('[public-site-build] No API directory found; skipping prune.')
  process.exit(0)
}

for (const entry of fs.readdirSync(apiDir)) {
  if (keep.has(entry)) continue
  fs.rmSync(path.join(apiDir, entry), { force: true, recursive: true })
}

console.log('[public-site-build] Pruned private API routes; kept /api/client-offers.')
