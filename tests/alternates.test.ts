import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LOCALES } from '@/lib/i18n/config'

// Pinned in vitest.config.mts so the suite does not depend on the ambient
// NEXT_PUBLIC_SITE_URL. A .test TLD makes it obvious this is never a real host.
const ORIGIN = 'https://zeyadalnahdi.test'

// isReviewed is mocked so the review state can be varied per test. The point
// of the gate is what happens when a locale is NOT reviewed, and the real
// message files cannot express both states at once.
const reviewed = vi.hoisted(() => ({ value: new Set<string>(['en', 'tr', 'ar']) }))

vi.mock('@/lib/i18n/messages', () => ({
  isReviewed: (locale: string) => reviewed.value.has(locale),
}))

const { buildAlternates } = await import('@/lib/seo/alternates')

function setReviewed(...locales: string[]) {
  reviewed.value = new Set(locales)
}

const PATHS = ['', '/about', '/projects', '/contact']

beforeEach(() => {
  setReviewed('en', 'tr', 'ar')
})

describe('buildAlternates', () => {
  it('emits one entry per reviewed locale plus x-default', () => {
    const { languages } = buildAlternates('en', '/about')

    expect(Object.keys(languages).sort()).toEqual(['ar', 'en', 'tr', 'x-default'])
  })

  it('points every entry at the same page in the other locale', () => {
    const { languages } = buildAlternates('tr', '/projects')

    expect(languages).toEqual({
      en: `${ORIGIN}/en/projects`,
      tr: `${ORIGIN}/tr/projects`,
      ar: `${ORIGIN}/ar/projects`,
      'x-default': `${ORIGIN}/en/projects`,
    })
  })

  it('includes the page itself in its own set', () => {
    for (const locale of LOCALES) {
      const { canonical, languages } = buildAlternates(locale, '/about')
      expect(languages[locale]).toBe(canonical)
    }
  })

  it('sets canonical to the page own URL, absolute and without a trailing slash', () => {
    expect(buildAlternates('ar', '/contact').canonical).toBe(`${ORIGIN}/ar/contact`)
    expect(buildAlternates('en', '').canonical).toBe(`${ORIGIN}/en`)
  })

  it('normalises the path it is given', () => {
    const expected = `${ORIGIN}/en/about`

    expect(buildAlternates('en', '/about').canonical).toBe(expected)
    expect(buildAlternates('en', 'about').canonical).toBe(expected)
    expect(buildAlternates('en', '/about/').canonical).toBe(expected)
    expect(buildAlternates('en', '/').canonical).toBe(`${ORIGIN}/en`)
  })

  it('produces only absolute URLs with no trailing slash', () => {
    for (const locale of LOCALES) {
      for (const path of PATHS) {
        const { canonical, languages } = buildAlternates(locale, path)

        for (const value of [canonical, ...Object.values(languages)]) {
          expect(value.startsWith(`${ORIGIN}/`)).toBe(true)
          expect(value.endsWith('/')).toBe(false)
        }
      }
    }
  })

  describe('x-default', () => {
    it('always points at the en equivalent of the same page', () => {
      for (const locale of LOCALES) {
        for (const path of PATHS) {
          const { languages } = buildAlternates(locale, path)
          expect(languages['x-default']).toBe(languages.en)
        }
      }
    })

    it('is omitted when the default locale is unreviewed, rather than pointing at a noindex page', () => {
      setReviewed('tr', 'ar')

      const { languages } = buildAlternates('tr', '/about')

      expect(languages).not.toHaveProperty('x-default')
      expect(languages).not.toHaveProperty('en')
    })
  })

  describe('the indexing gate', () => {
    it('drops an unreviewed locale from every set, including its own page', () => {
      setReviewed('en', 'ar')

      for (const locale of LOCALES) {
        for (const path of PATHS) {
          expect(buildAlternates(locale, path).languages).not.toHaveProperty('tr')
        }
      }
    })

    it('still gives an unreviewed page a canonical of its own', () => {
      setReviewed('en', 'ar')

      // The page is noindex, but canonicalisation answers a different question
      // from indexability: which URL represents this content.
      expect(buildAlternates('tr', '/about').canonical).toBe(`${ORIGIN}/tr/about`)
    })

    it('leaves only the reviewed locales and x-default', () => {
      setReviewed('en')

      const { languages } = buildAlternates('en', '/contact')

      expect(Object.keys(languages).sort()).toEqual(['en', 'x-default'])
    })
  })

  // The defect this whole module is shaped to prevent. A one-directional set
  // renders perfectly and breaks nothing visible; it surfaces as a Search
  // Console error weeks later, if at all.
  describe('reciprocity', () => {
    const cases: string[][] = [['en', 'tr', 'ar'], ['en', 'ar'], ['tr', 'ar'], ['en']]

    for (const group of cases) {
      it(`is symmetric when reviewed = [${group.join(', ')}]`, () => {
        setReviewed(...group)

        for (const path of PATHS) {
          for (const from of LOCALES) {
            const declared = buildAlternates(from, path).languages

            for (const to of LOCALES) {
              if (!(to in declared)) continue

              // If A declares B, B must declare A, at the same URL.
              const back = buildAlternates(to, path).languages
              expect(back[from]).toBe(declared[from])
              expect(back).toHaveProperty(to)
            }
          }
        }
      })
    }

    it('produces an identical set regardless of which locale asks', () => {
      for (const path of PATHS) {
        const sets = LOCALES.map((locale) => buildAlternates(locale, path).languages)

        for (const set of sets) {
          expect(set).toEqual(sets[0])
        }
      }
    })
  })
})
