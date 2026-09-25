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
 * T-220 promoted this into CI and extended it with `lang`/`dir`, hreflang
 * reciprocity, x-default, JSON-LD validity and sitemap agreement
 * (docs/09-cicd.md §2.6).
 *
 * Nothing here is derived from the code it checks. The locale and page lists
 * are written out below, and indexability is read from each page's own robots
 * meta tag rather than from lib/i18n — a check that imported the same source
 * as the page would agree with it while both were wrong.
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

    // I-05, I-06: the attributes a screen reader and a search engine both
    // read. Wrong here, and the Arabic page is announced as English prose.
    const htmlTag = html.match(/<html[^>]*>/)?.[0] ?? ''
    const lang = attr(htmlTag, /\slang="([^"]*)"/i)
    const dir = attr(htmlTag, /\sdir="([^"]*)"/i)
    const expectedDir = locale === 'ar' ? 'rtl' : 'ltr'

    if (lang !== locale) fail(path, `html lang is ${lang ?? '(absent)'}, expected ${locale}`)
    if (dir !== expectedDir) fail(path, `html dir is ${dir ?? '(absent)'}, expected ${expectedDir}`)

    // The indexing gate (SRS I-14). Read from the page, not from the module
    // that wrote it.
    const robots = attr(html, /<meta name="robots" content="([^"]*)"/i) ?? ''
    const indexable = !/noindex/i.test(robots)

    // I-07. React emits the attribute as `hrefLang`; HTML attribute names are
    // case-insensitive, so the match has to be too.
    const alternates = new Map()
    for (const match of html.matchAll(
      /<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/gi,
    )) {
      const [, hreflang, href] = match
      if (alternates.has(hreflang)) fail(path, `duplicate hreflang "${hreflang}"`)
      alternates.set(hreflang, href)
    }

    for (const [hreflang, href] of alternates) {
      if (!href.startsWith(`${ORIGIN}/`)) {
        fail(path, `hreflang "${hreflang}" href is not under ${ORIGIN}: ${href}`)
      }
    }

    // S-01..S-07: structured data that parses is not the same as structured
    // data that is correct. An unresolvable @id reference is silently dropped
    // by consumers, which is the failure worth catching.
    const blocks = [
      ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ]

    if (blocks.length !== 1) {
      fail(path, `${blocks.length} JSON-LD blocks, expected exactly 1`)
    }

    for (const [, raw] of blocks) {
      let graph
      try {
        graph = JSON.parse(raw)
      } catch (error) {
        fail(path, `JSON-LD does not parse: ${error.message}`)
        continue
      }

      if (graph['@context'] !== 'https://schema.org') {
        fail(path, `JSON-LD @context is ${JSON.stringify(graph['@context'])}`)
      }

      const nodes = graph['@graph']
      if (!Array.isArray(nodes) || nodes.length === 0) {
        fail(path, 'JSON-LD has no @graph nodes')
        continue
      }

      const defined = new Set()
      for (const node of nodes) {
        if (!node['@type'])
          fail(path, `JSON-LD node without @type: ${JSON.stringify(node).slice(0, 80)}`)
        if (node['@id']) defined.add(node['@id'])
      }

      // A reference is an object whose only key is @id. Anything it names must
      // be a node in this same graph.
      const walk = (value) => {
        if (Array.isArray(value)) return value.forEach(walk)
        if (value === null || typeof value !== 'object') return
        const keys = Object.keys(value)
        if (keys.length === 1 && keys[0] === '@id') {
          if (!defined.has(value['@id'])) {
            fail(path, `JSON-LD references undefined @id ${value['@id']}`)
          }
          return
        }
        for (const key of keys) if (key !== '@id') walk(value[key])
      }
      nodes.forEach(walk)

      const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList')
      if (crumbs) {
        const positions = (crumbs.itemListElement ?? []).map((item) => item.position)
        const expectedPositions = positions.map((_, index) => index + 1)
        if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
          fail(path, `breadcrumb positions are ${positions.join(',')}, expected sequential from 1`)
        }
      }
    }

    rows.push({
      locale,
      page,
      path,
      indexable,
      alternates,
      title: decode(title ?? ''),
      description: decode(description ?? ''),
    })
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

/**
 * I-07 and docs/05-ia-url-map.md §3 — the hreflang graph.
 *
 * This is the check the whole script exists for. A one-directional set is the
 * most common trilingual SEO defect there is: the page renders perfectly, the
 * links all work, every locale looks correct in a browser, and search engines
 * quietly refuse to cluster the pages because the declaration is not mutual.
 * There is no way to see it by eye, and no way to see it in the build output.
 *
 * Reciprocity is checked page-to-page over what was actually served — not
 * recomputed from the function that emitted it, which would agree with itself.
 */
const byPath = new Map(rows.map((row) => [row.path, row]))

for (const page of PAGES) {
  const group = rows.filter((row) => row.page === page)
  const indexable = group.filter((row) => row.indexable)
  const excluded = group.filter((row) => !row.indexable)

  for (const row of indexable) {
    // Self-reference: an indexable page must name itself in its own set.
    const own = row.alternates.get(row.locale)
    if (own !== `${ORIGIN}${row.path}`) {
      fail(row.path, `does not declare itself: hreflang "${row.locale}" is ${own ?? '(absent)'}`)
    }

    // Every other indexable translation must be declared...
    for (const other of indexable) {
      const declared = row.alternates.get(other.locale)
      if (declared !== `${ORIGIN}${other.path}`) {
        fail(
          row.path,
          `hreflang "${other.locale}" is ${declared ?? '(absent)'}, expected ${ORIGIN}${other.path}`,
        )
        continue
      }

      // ...and must declare this page back. This is the reciprocity itself.
      const back = other.alternates.get(row.locale)
      if (back !== `${ORIGIN}${row.path}`) {
        fail(
          row.path,
          `hreflang to ${other.path} is not reciprocal: that page's "${row.locale}" is ` +
            `${back ?? '(absent)'}, expected ${ORIGIN}${row.path}`,
        )
      }
    }

    // A locale held back by the indexing gate must not be advertised anywhere
    // (SRS I-14). Advertising a noindex page as an alternate asks a crawler to
    // cluster a page it has been told to ignore.
    for (const held of excluded) {
      if (row.alternates.has(held.locale)) {
        fail(row.path, `declares hreflang "${held.locale}", which is noindex`)
      }
    }

    // docs/05 §3: x-default resolves to the English equivalent of this page.
    const xDefault = row.alternates.get('x-default')
    const english = group.find((candidate) => candidate.locale === 'en')
    if (!english) fail(row.path, 'no en page in this group to anchor x-default')
    else if (xDefault !== `${ORIGIN}${english.path}`) {
      fail(row.path, `x-default is ${xDefault ?? '(absent)'}, expected ${ORIGIN}${english.path}`)
    }
  }

  // Every alternate must point at a route this run actually fetched.
  for (const row of group) {
    for (const [hreflang, href] of row.alternates) {
      const target = href.startsWith(ORIGIN) ? href.slice(ORIGIN.length) : null
      if (target !== null && !byPath.has(target)) {
        fail(row.path, `hreflang "${hreflang}" points at ${href}, which is not a known route`)
      }
    }
  }
}

/**
 * X-01, X-02 — the sitemap lists exactly the indexable routes.
 *
 * Both directions matter and they fail differently. A missing entry is a page
 * nobody is told about; an extra entry submits a noindex page for indexing,
 * which is a contradiction Search Console reports as an error against the
 * whole sitemap.
 */
const sitemapResponse = await fetch(`${FETCH_BASE}/sitemap.xml`)

if (!sitemapResponse.ok) {
  fail('/sitemap.xml', `responded ${sitemapResponse.status}`)
} else {
  const xml = await sitemapResponse.text()
  const listed = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, loc]) => decode(loc.trim()))
  const expected = rows.filter((row) => row.indexable).map((row) => `${ORIGIN}${row.path}`)

  for (const duplicate of listed.filter((loc, index) => listed.indexOf(loc) !== index)) {
    fail('/sitemap.xml', `lists ${duplicate} more than once`)
  }
  for (const missing of expected.filter((loc) => !listed.includes(loc))) {
    fail('/sitemap.xml', `does not list indexable route ${missing}`)
  }
  for (const extra of listed.filter((loc) => !expected.includes(loc))) {
    fail('/sitemap.xml', `lists ${extra}, which is not an indexable route`)
  }
  console.log(
    `verify-metadata: sitemap lists ${listed.length} of ${expected.length} indexable routes`,
  )
}

console.log(`verify-metadata: ${rows.length} routes fetched from ${FETCH_BASE}`)
console.log(`verify-metadata: canonicals expected under ${ORIGIN}\n`)
console.log('  route'.padEnd(20) + 'title'.padStart(6) + 'desc'.padStart(7) + '  indexed  hreflang')
for (const row of rows) {
  console.log(
    `  ${row.path}`.padEnd(20) +
      String(row.title.length).padStart(6) +
      String(row.description.length).padStart(7) +
      (row.indexable ? '      yes' : '       no') +
      '  ' +
      [...row.alternates.keys()].join(','),
  )
}

if (problems.length > 0) {
  console.error(`\nverify-metadata FAILED: ${problems.length} problem(s)`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log('\nverify-metadata: OK')
