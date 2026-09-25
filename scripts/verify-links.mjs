#!/usr/bin/env node
/**
 * Checks the internal link graph in the prerendered HTML (SRS X-08,
 * docs/05-ia-url-map.md §4).
 *
 * Three things, none of which fails a build or shows up in review:
 *
 *   1. A locale leak — an `/en/...` href in the body of an Arabic page. The
 *      page renders, the link works, and a reader is silently dropped into
 *      another language. Search engines see the Arabic page voting for the
 *      English one. The language switcher is the single legitimate exception
 *      (§4.1); it is marked `data-locale-switcher` and excluded here.
 *   2. A broken reachability promise — every page must link to every other.
 *   3. The inbound distribution — Projects must carry the most inbound
 *      internal links, because it is the page that converts (§4.2).
 *
 * Reads the build output rather than a running server: no port, no flake, and
 * it sees exactly the HTML that ships.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/** Hard-coded, like assert-routes.mjs: deriving these from the code under
 *  test would make the check circular. */
const LOCALES = ['en', 'tr', 'ar']
const ROUTES = ['', '/about', '/projects', '/contact']

const BUILD_DIR = join(process.cwd(), '.next', 'server', 'app')

if (!existsSync(BUILD_DIR)) {
  console.error(`verify-links: no build output at ${BUILD_DIR}. Run \`next build\` first.`)
  process.exit(1)
}

const htmlFor = (locale, route) =>
  join(BUILD_DIR, route === '' ? `${locale}.html` : `${locale}${route}.html`)

/** Drops every `<nav data-locale-switcher …>…</nav>` subtree. The switcher
 *  contains no nested <nav>, so the first close tag is its own. */
function stripSwitcher(html) {
  return html.replace(/<nav[^>]*\sdata-locale-switcher[^>]*>[\s\S]*?<\/nav>/g, '')
}

function anchors(html) {
  const out = []
  for (const [, attrs] of html.matchAll(/<a\s([^>]*)>/g)) {
    const href = /href="([^"]*)"/.exec(attrs)?.[1]
    if (href === undefined) continue
    out.push({ href, rel: /rel="([^"]*)"/.exec(attrs)?.[1] ?? '' })
  }
  return out
}

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`)

const problems = []
/** locale -> route -> inbound count */
const inbound = Object.fromEntries(
  LOCALES.map((l) => [l, Object.fromEntries(ROUTES.map((r) => [r, 0]))]),
)
let switchersSeen = 0
let checked = 0

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    const file = htmlFor(locale, route)
    if (!existsSync(file)) {
      problems.push(`missing prerendered page: /${locale}${route} (${file})`)
      continue
    }
    checked += 1

    const raw = readFileSync(file, 'utf8')
    if (/<nav[^>]*\sdata-locale-switcher/.test(raw)) switchersSeen += 1
    const body = stripSwitcher(raw)

    const targets = new Set()

    for (const { href, rel } of anchors(body)) {
      if (href.startsWith('#') || href === '') continue

      if (/^https?:\/\//.test(href)) {
        // 2. External links carry rel="noopener" (docs/07-repo-standards.md).
        if (!rel.split(/\s+/).includes('noopener')) {
          problems.push(`/${locale}${route}: external link without rel="noopener" -> ${href}`)
        }
        continue
      }
      if (!href.startsWith('/')) continue // mailto:, tel:

      const path = href.split('#')[0].split('?')[0]
      const prefix = LOCALE_PREFIX.exec(path)
      if (prefix === null) continue // locale-agnostic asset, e.g. /cv/*.pdf

      // 1. The leak check.
      if (prefix[1] !== locale) {
        problems.push(
          `LOCALE LEAK on /${locale}${route}: body link to ${href} ` +
            `(locale "${prefix[1]}", expected "${locale}")`,
        )
        continue
      }

      const target = path.slice(prefix[0].length).replace(/\/$/, '')
      if (!ROUTES.includes(target)) {
        problems.push(`/${locale}${route}: link to unknown route ${href}`)
        continue
      }
      targets.add(target)
      if (target !== route) inbound[locale][target] += 1
    }

    // 3. Reachability: every other page linked from this one.
    for (const other of ROUTES) {
      if (other !== route && !targets.has(other)) {
        problems.push(`/${locale}${route} does not link to /${locale}${other}`)
      }
    }
  }
}

if (switchersSeen !== checked && checked > 0) {
  problems.push(
    `expected a data-locale-switcher nav on all ${checked} page(s), found ${switchersSeen}. ` +
      `Without it the leak check silently passes on the one element allowed to leak.`,
  )
}

// 3. Projects strictly ahead.
for (const locale of LOCALES) {
  const counts = inbound[locale]
  const projects = counts['/projects']
  const rivals = ROUTES.filter((r) => r !== '/projects').filter((r) => counts[r] >= projects)
  if (rivals.length > 0) {
    problems.push(
      `[${locale}] /projects has ${projects} inbound internal link(s), not the most: ` +
        rivals.map((r) => `${r || '/'}=${counts[r]}`).join(', '),
    )
  }
}

console.log(`verify-links: ${checked} page(s) checked, switcher excluded on ${switchersSeen}`)
for (const locale of LOCALES) {
  const counts = inbound[locale]
  console.log(
    `verify-links: [${locale}] inbound ->`,
    Object.fromEntries(ROUTES.map((r) => [r || '/', counts[r]])),
  )
}

if (problems.length > 0) {
  console.error('\nverify-links FAILED:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error('\nA cross-locale body link works when you click it. That is why it needs a check.')
  process.exit(1)
}

console.log('verify-links: OK')
