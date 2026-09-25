import { beforeEach, describe, expect, it, vi } from 'vitest'

const ORIGIN = 'https://zeyadalnahdi.test'

const reviewed = vi.hoisted(() => ({ value: new Set<string>(['en', 'tr', 'ar']) }))

vi.mock('@/lib/i18n/messages', () => ({
  isReviewed: (locale: string) => reviewed.value.has(locale),
}))

const { buildMetadata, DESCRIPTION_MAX, TITLE_MAX, SITE_NAME } = await import('@/lib/seo/metadata')

function setReviewed(...locales: string[]) {
  reviewed.value = new Set(locales)
}

const INPUT = {
  locale: 'en' as const,
  pathname: '/about',
  title: 'About Zeyad Alnahdi',
  description: 'A short description well within the limit.',
}

beforeEach(() => {
  setReviewed('en', 'tr', 'ar')
})

describe('buildMetadata', () => {
  it('carries the copy it is given', () => {
    const meta = buildMetadata(INPUT)

    expect(meta.title).toBe(INPUT.title)
    expect(meta.description).toBe(INPUT.description)
  })

  it('takes canonical and alternates from buildAlternates rather than composing its own', () => {
    const meta = buildMetadata(INPUT)

    expect(meta.alternates?.canonical).toBe(`${ORIGIN}/en/about`)
    expect(Object.keys(meta.alternates?.languages ?? {}).sort()).toEqual([
      'ar',
      'en',
      'tr',
      'x-default',
    ])
  })

  it('sets metadataBase so relative asset URLs resolve against the real origin', () => {
    expect(buildMetadata(INPUT).metadataBase?.toString()).toBe(`${ORIGIN}/`)
  })

  describe('open graph', () => {
    it('mirrors the copy and points og:url at the canonical', () => {
      const og = buildMetadata(INPUT).openGraph

      expect(og).toMatchObject({
        type: 'website',
        siteName: SITE_NAME,
        title: INPUT.title,
        description: INPUT.description,
        url: `${ORIGIN}/en/about`,
      })
    })

    it('uses language_TERRITORY codes, unlike hreflang', () => {
      const meta = buildMetadata({ ...INPUT, locale: 'ar' })

      expect(meta.openGraph).toMatchObject({ locale: 'ar_AR' })
      expect(Object.keys(meta.alternates?.languages ?? {})).toContain('ar')
    })

    it('lists the other reviewed locales as alternates, never itself', () => {
      const og = buildMetadata({ ...INPUT, locale: 'tr' }).openGraph

      expect(og).toMatchObject({ alternateLocale: ['en_US', 'ar_AR'] })
    })

    it('drops unreviewed locales from alternateLocale', () => {
      setReviewed('en', 'tr')

      const og = buildMetadata({ ...INPUT, locale: 'en' }).openGraph

      expect(og).toMatchObject({ alternateLocale: ['tr_TR'] })
    })
  })

  it('requests a large summary card from twitter', () => {
    expect(buildMetadata(INPUT).twitter).toMatchObject({
      card: 'summary_large_image',
      title: INPUT.title,
      description: INPUT.description,
    })
  })

  describe('the indexing gate', () => {
    it('leaves robots alone for a reviewed locale', () => {
      expect(buildMetadata(INPUT).robots).toBeUndefined()
    })

    it('emits noindex for an unreviewed locale, while still following links', () => {
      setReviewed('en')

      expect(buildMetadata({ ...INPUT, locale: 'tr' }).robots).toEqual({
        index: false,
        follow: true,
      })
    })
  })

  describe('length limits', () => {
    it('throws when the title is over the limit', () => {
      expect(() => buildMetadata({ ...INPUT, title: 'x'.repeat(TITLE_MAX + 1) })).toThrow(
        /title is 61 characters, over the 60 limit/,
      )
    })

    it('throws when the description is over the limit', () => {
      expect(() =>
        buildMetadata({ ...INPUT, description: 'x'.repeat(DESCRIPTION_MAX + 1) }),
      ).toThrow(/description is 156 characters, over the 155 limit/)
    })

    /**
     * Production warns instead of throwing. A title two characters over the
     * limit costs a truncated search result; crashing a live render over it
     * would cost the page. The hard gate for production builds is the CI
     * metadata job in docs/09-cicd.md §2.6.
     */
    it('warns instead of throwing in production, rather than taking the page down', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()

      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const { buildMetadata: production } = await import('@/lib/seo/metadata')

      const meta = production({ ...INPUT, title: 'x'.repeat(TITLE_MAX + 1) })

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('over the 60 limit'))
      expect(meta.title).toHaveLength(TITLE_MAX + 1)

      warn.mockRestore()
      vi.unstubAllEnvs()
      vi.resetModules()
    })

    it('accepts values exactly at the limit', () => {
      expect(() =>
        buildMetadata({
          ...INPUT,
          title: 'x'.repeat(TITLE_MAX),
          description: 'x'.repeat(DESCRIPTION_MAX),
        }),
      ).not.toThrow()
    })
  })
})
