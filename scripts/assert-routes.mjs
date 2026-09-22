#!/usr/bin/env node
/**
 * Asserts that `next build` prerendered every route it should have.
 *
 * The point is the failure mode in docs/10-task-breakdown.md T-111: a change
 * to `generateStaticParams` or to the locale union can silently drop a locale.
 * The build still succeeds, pages vanish, and nothing reports it.
 *
 * So the expected count must NOT be derived from the code under test — reading
 * LOCALES from lib/i18n/config.ts would make the check circular: drop a locale
 * and both sides of the comparison fall together.
 *
 * Instead:
 *   expected = EXPECTED_LOCALES (hard-coded here) × page routes found on disk
 *
 * The locale count is the invariant this guards. The page count comes from the
 * filesystem so the number rises on its own as T-211..T-213 add about,
 * projects and contact — no edit needed here, and no false red in Sprint 1.
 */
import { readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** SRS I-01. Changing this is a deliberate act, which is the whole point. */
const EXPECTED_LOCALES = 3

const APP_DIR = join(process.cwd(), 'app', '[locale]')
const BUILD_DIR = join(process.cwd(), '.next', 'server', 'app')

function countPageRoutes(dir) {
  let count = existsSync(join(dir, 'page.tsx')) ? 1 : 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    count += countPageRoutes(join(dir, entry.name))
  }
  return count
}

function countPrerenderedHtml(dir) {
  // A locale's own page is emitted as <locale>.html beside the directory; its
  // sub-pages go inside <locale>/. With only one page route the directory does
  // not exist at all, so locales are discovered from the html files.
  // _global-error, _not-found, 404 and 500 are not page routes.
  const locales = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && /^[a-z]{2}\.html$/.test(e.name))
    .map((e) => e.name.replace(/\.html$/, ''))

  const walk = (d) => {
    let n = 0
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name)
      if (entry.isDirectory()) n += walk(full)
      else if (entry.name.endsWith('.html')) n += 1
    }
    return n
  }

  let total = 0
  const perLocale = {}
  for (const locale of locales) {
    const nestedDir = join(dir, locale)
    const nested = existsSync(nestedDir) && statSync(nestedDir).isDirectory() ? walk(nestedDir) : 0
    perLocale[locale] = 1 + nested
    total += perLocale[locale]
  }
  return { total, perLocale, locales }
}

if (!existsSync(BUILD_DIR)) {
  console.error(`assert-routes: no build output at ${BUILD_DIR}. Run \`next build\` first.`)
  process.exit(1)
}

const pages = countPageRoutes(APP_DIR)
const expected = EXPECTED_LOCALES * pages
const { total, perLocale, locales } = countPrerenderedHtml(BUILD_DIR)

console.log(`assert-routes: ${pages} page route(s) x ${EXPECTED_LOCALES} locale(s) = ${expected}`)
console.log(`assert-routes: prerendered ${total} ->`, perLocale)

const problems = []

if (locales.length !== EXPECTED_LOCALES) {
  problems.push(
    `expected ${EXPECTED_LOCALES} locales in the build output, found ${locales.length}: ${locales.join(', ') || '(none)'}`,
  )
}

for (const locale of locales) {
  if (perLocale[locale] !== pages) {
    problems.push(
      `locale "${locale}" has ${perLocale[locale]} prerendered page(s), expected ${pages}`,
    )
  }
}

if (total !== expected) {
  problems.push(`expected ${expected} prerendered pages, found ${total}`)
}

if (problems.length > 0) {
  console.error('\nassert-routes FAILED:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error('\nA dropped locale does not fail the build on its own. That is what this guards.')
  process.exit(1)
}

console.log('assert-routes: OK')
