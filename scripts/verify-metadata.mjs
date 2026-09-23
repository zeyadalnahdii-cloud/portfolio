#!/usr/bin/env node
/**
 * Verifies the metadata of every route against SRS M-01 … M-04, M-09 and M-10.
 *
 * Written as a script rather than a checklist because everything it looks at is
 * invisible in a browser. A duplicated description renders perfectly; a
 * canonical pointing at the wrong route renders perfectly; a heading level
 * skipped from h2 to h4 renders perfectly. None of it fails a build, and the
 * first sign of trouble is a Search Console report weeks later.
 *
 * Usage: node scripts/verify-metadata.mjs [fetchBase] [expectedOrigin]
 *
 * The two are separate on purpose. Pages are fetched from wherever the server
 * happens to be listening, but their canonicals must name the origin the site
 * is published at — and those differ in every environment that matters: a
 * preview deployment, CI, and a local production build all serve from one host
 * while claiming another. Comparing a canonical against the host it was
 * fetched from would pass everywhere and prove nothing.
 *
 * T-220 promotes this into CI and extends it with hreflang reciprocity,
 * JSON-LD validity and sitemap agreement (docs/09-cicd.md §2.6).
 */
const FETCH_BASE = process.argv[2] ?? 'http://localhost:3000'
const ORIGIN = process.argv[3] ?? process.env.NEXT_PUBLIC_SITE_URL ?? FETCH_BASE
const LOCALES = ['en', 'tr', 'ar']
const PAGES = ['', '/about', '/projects', '/contact']

const TITLE_MAX = 60
const DESCRIPTION_MAX = 155

const problems = []
const rows = []

function fail(route, message) {
  problems.push(`${route}: ${message}`)
}

function attr(html, pattern) {
  return html.match(pattern)?.[1]?.trim()
}

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
}

for (const locale of LOCALES) {
  for (const page of PAGES) {
    const path = `/${locale}${page}`
    const response = await fetch(`${FETCH_BASE}${path}`)

    if (!response.ok) {
      fail(path, `responded ${response.status}`)
      continue
    }

    const html = await response.text()

    // M-01: every route has a title and a description.
    const title = attr(html, /<title>([^<]*)<\/title>/)
    const description = attr(html, /<meta name="description" content="([^"]*)"/)

    if (!title) fail(path, 'no title')
    if (!description) fail(path, 'no description')

    // M-02: within the limits that decide whether they survive a search result.
    if (title && title.length > TITLE_MAX) {
      fail(path, `title is ${title.length} characters, over ${TITLE_MAX}`)
    }
    if (description && description.length > DESCRIPTION_MAX) {
      fail(path, `description is ${description.length} characters, over ${DESCRIPTION_MAX}`)
    }

    // M-03: canonical absolute, and pointing at this route rather than another.
    const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/)
    const expected = `${ORIGIN}${path}`

    if (!canonical) fail(path, 'no canonical')
    else if (!/^https?:\/\//.test(canonical)) fail(path, `canonical is not absolute: ${canonical}`)
    else if (canonical !== expected) fail(path, `canonical is ${canonical}, expected ${expected}`)

    // M-09, M-10: one h1, and no level skipped on the way down.
    const levels = [...html.matchAll(/<h([1-6])[^>]*>/g)].map((match) => Number(match[1]))
    const h1s = levels.filter((level) => level === 1).length

    if (h1s !== 1) fail(path, `${h1s} h1 elements, expected exactly 1`)

    let previous = 1
    for (const level of levels) {
      if (level > previous + 1) fail(path, `heading jumps from h${previous} to h${level}`)
      previous = level
    }

    rows.push({ locale, path, title: decode(title ?? ''), description: decode(description ?? '') })
  }
}

// M-04: unique within a locale. Across locales a repeat is expected — the same
// page in two languages — so comparing globally would report false problems.
for (const locale of LOCALES) {
  const inLocale = rows.filter((row) => row.locale === locale)

  for (const field of ['title', 'description']) {
    const seen = new Map()

    for (const row of inLocale) {
      const value = row[field]
      if (seen.has(value)) fail(row.path, `${field} duplicates ${seen.get(value)}`)
      else seen.set(value, row.path)
    }
  }
}

console.log(`verify-metadata: ${rows.length} routes fetched from ${FETCH_BASE}`)
console.log(`verify-metadata: canonicals expected under ${ORIGIN}\n`)
console.log('  route'.padEnd(20) + 'title'.padStart(6) + 'desc'.padStart(7))
for (const row of rows) {
  console.log(
    `  ${row.path}`.padEnd(20) +
      String(row.title.length).padStart(6) +
      String(row.description.length).padStart(7),
  )
}

if (problems.length > 0) {
  console.error(`\nverify-metadata FAILED: ${problems.length} problem(s)`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log('\nverify-metadata: OK')
