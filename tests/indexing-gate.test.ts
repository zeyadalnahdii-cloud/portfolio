import { describe, expect, it, vi } from 'vitest'

import { LOCALES, type Locale } from '@/lib/i18n/config'

/**
 * Integration test for the indexing gate (SRS I-14).
 *
 * The seam is `lib/i18n/messages`, and that choice is the point. Every
 * consumer — buildAlternates, buildMetadata, buildSchema and the sitemap route
 * — is real here, and all four run against a single mocked review state. A
 * consumer that re-derived the flag for itself, from the JSON or from anywhere
 * else, would not follow this mock and the suite would fail.
 *
 * The unit suites each mock the same function, which proves a consumer reads
 * *a* flag. This file proves they all read the *same* one, and that their
 * outputs agree. A gate whose effects can disagree is decorative.
 *
 * Whether `isReviewed` reads the right field of the real message files is
 * checked separately at the end, against the files on disk.
 */
const state = vi.hoisted((): { reviewed: Record<string, boolean> } => ({
  reviewed: { en: true, tr: true, ar: true },
}))

vi.mock('@/lib/i18n/messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/i18n/messages')>()

  return {
    ...actual,
    isReviewed: (locale: string) => state.reviewed[locale] ?? false,
    reviewedLocales: () => LOCALES.filter((locale) => state.reviewed[locale]),
  }
})

interface SchemaNode {
  '@type': string
  inLanguage?: string[]
}

/** Sets the review state and re-imports every consumer so it loads fresh. */
async function load(next: Record<Locale, boolean>) {
  state.reviewed = { ...next }
  vi.resetModules()

  const [{ buildAlternates }, { buildMetadata }, { buildSchema }, { default: sitemap }] =
    await Promise.all([
      import('@/lib/seo/alternates'),
      import('@/lib/seo/metadata'),
      import('@/lib/seo/schema'),
      import('@/app/sitemap'),
    ])

  const entries = sitemap()
  const graph = buildSchema('en')['@graph'] as SchemaNode[]
  const website = graph.find((node) => node['@type'] === 'WebSite')

  return {
    /** Does this locale's own page ask to be indexed? */
    indexable: (locale: Locale) =>
      buildMetadata({
        locale,
        pathname: '',
        title: 'title',
        description: 'description',
      }).robots === undefined,

    /** Is it offered as an alternate by any page, including its own? */
    inAnyAlternateSet: (locale: Locale) =>
      LOCALES.some((from) => locale in buildAlternates(from, '').languages),

    inSitemap: (locale: Locale) => entries.some((entry) => entry.url.includes(`/${locale}`)),

    inSchema: (locale: Locale) => website?.inLanguage?.includes(locale) ?? false,
  }
}

const ALL_REVIEWED: Record<Locale, boolean> = { en: true, tr: true, ar: true }

describe('the indexing gate, end to end', () => {
  it('lets every reviewed locale through all four consumers', async () => {
    const site = await load(ALL_REVIEWED)

    for (const locale of LOCALES) {
      expect(site.indexable(locale), `${locale} indexable`).toBe(true)
      expect(site.inAnyAlternateSet(locale), `${locale} in alternates`).toBe(true)
      expect(site.inSitemap(locale), `${locale} in sitemap`).toBe(true)
      expect(site.inSchema(locale), `${locale} in schema`).toBe(true)
    }
  })

  // The acceptance criterion: one flag, every effect, no other edit.
  it('removes tr from metadata, alternates, the sitemap and the schema when its flag flips', async () => {
    const before = await load(ALL_REVIEWED)

    expect(before.indexable('tr')).toBe(true)
    expect(before.inAnyAlternateSet('tr')).toBe(true)
    expect(before.inSitemap('tr')).toBe(true)
    expect(before.inSchema('tr')).toBe(true)

    const after = await load({ ...ALL_REVIEWED, tr: false })

    expect(after.indexable('tr'), 'tr page must be noindex').toBe(false)
    expect(after.inAnyAlternateSet('tr'), 'tr must leave every hreflang set').toBe(false)
    expect(after.inSitemap('tr'), 'tr must leave the sitemap').toBe(false)
    expect(after.inSchema('tr'), 'tr must leave WebSite.inLanguage').toBe(false)
  })

  it('leaves the other locales untouched when one is gated', async () => {
    const site = await load({ ...ALL_REVIEWED, tr: false })

    for (const locale of ['en', 'ar'] as const) {
      expect(site.indexable(locale)).toBe(true)
      expect(site.inAnyAlternateSet(locale)).toBe(true)
      expect(site.inSitemap(locale)).toBe(true)
      expect(site.inSchema(locale)).toBe(true)
    }
  })

  it('keeps nothing when no locale is reviewed', async () => {
    const site = await load({ en: false, tr: false, ar: false })

    for (const locale of LOCALES) {
      expect(site.indexable(locale), `${locale} must be noindex`).toBe(false)
      expect(site.inAnyAlternateSet(locale), `${locale} must leave alternates`).toBe(false)
      expect(site.inSitemap(locale), `${locale} must leave the sitemap`).toBe(false)
      expect(site.inSchema(locale), `${locale} must leave the schema`).toBe(false)
    }
  })

  /**
   * The property the gate exists to guarantee, as an invariant over every
   * combination. Disagreement here is the contradictory state search engines
   * report: hreflang pointing at a noindex page, or a sitemap asking for a
   * page that asks not to be indexed.
   *
   * Each case pins the expected value too, so these cannot pass by all four
   * consumers agreeing on the wrong answer.
   */
  it.each([
    { en: true, tr: true, ar: true },
    { en: true, tr: false, ar: true },
    { en: true, tr: false, ar: false },
    { en: false, tr: true, ar: true },
    { en: false, tr: false, ar: false },
  ])('keeps all four consumers in agreement for %o', async (combination) => {
    const site = await load(combination)

    for (const locale of LOCALES) {
      const expected = combination[locale]

      expect(site.indexable(locale), `metadata wrong for ${locale}`).toBe(expected)
      expect(site.inAnyAlternateSet(locale), `alternates disagree for ${locale}`).toBe(expected)
      expect(site.inSitemap(locale), `sitemap disagrees for ${locale}`).toBe(expected)
      expect(site.inSchema(locale), `schema disagrees for ${locale}`).toBe(expected)
    }
  })
})

describe('isReviewed against the real message files', () => {
  it('reports exactly what _meta.reviewed says on disk', async () => {
    const { isReviewed, reviewedLocales, MESSAGES } =
      await vi.importActual<typeof import('@/lib/i18n/messages')>('@/lib/i18n/messages')

    for (const locale of LOCALES) {
      expect(isReviewed(locale)).toBe(MESSAGES[locale]._meta.reviewed)
    }

    expect(reviewedLocales()).toEqual(LOCALES.filter((locale) => isReviewed(locale)))
  })
})
