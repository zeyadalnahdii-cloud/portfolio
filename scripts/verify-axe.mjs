#!/usr/bin/env node
/**
 * axe-core across every route (docs/09-cicd.md §2.5, SRS A-01: zero
 * violations).
 *
 * Usage: node scripts/verify-axe.mjs [baseUrl]
 *
 * Both themes, not just the default. T-219 found two contrast failures that
 * existed *only* in dark mode — white on the accent fill at 3.10:1 on both
 * buttons on the site, and error text at 3.96:1 — because the palette had no
 * token for either and the light theme happened to be fine. A light-only run
 * is green while half the users of the site cannot read the primary button.
 *
 * Doubling the pass costs a few seconds; missing a theme costs a launch.
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = process.argv[2] ?? 'http://localhost:3000'

/** Written out rather than imported, so a locale dropped from the code is a
 *  failure here rather than a silently smaller run (same reasoning as
 *  scripts/assert-routes.mjs). */
const LOCALES = ['en', 'tr', 'ar']
const PAGES = ['', '/about', '/projects', '/contact']
const THEMES = ['light', 'dark']

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const browser = await chromium.launch()
const problems = []
let checked = 0

for (const theme of THEMES) {
  const context = await browser.newContext({ colorScheme: theme })
  const page = await context.newPage()

  for (const locale of LOCALES) {
    for (const path of PAGES) {
      const route = `/${locale}${path}`
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })

      if (!response || !response.ok()) {
        problems.push(`${route} [${theme}]: responded ${response?.status() ?? 'nothing'}`)
        continue
      }

      // The toggle writes data-theme; setting it here covers the explicit
      // choice as well as the media query.
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value
      }, theme)

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      checked += 1

      for (const violation of violations) {
        for (const node of violation.nodes) {
          problems.push(
            `${route} [${theme}] ${violation.id} (${violation.impact}): ` +
              `${violation.help} — ${node.target.join(' ')}`,
          )
        }
      }
    }
  }

  await context.close()
}

await browser.close()

console.log(
  `verify-axe: ${checked} page(s) scanned (${LOCALES.length * PAGES.length} routes x ${THEMES.length} themes)`,
)
console.log(`verify-axe: tags ${TAGS.join(', ')}`)

if (problems.length > 0) {
  console.error(`\nverify-axe FAILED: ${problems.length} violation(s)`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log('verify-axe: OK')
