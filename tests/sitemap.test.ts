import { beforeEach, describe, expect, it, vi } from 'vitest'

const ORIGIN = 'https://zeyadalnahdi.test'

const reviewed = vi.hoisted(() => ({ value: ['en', 'tr', 'ar'] }))

vi.mock('@/lib/i18n/messages', () => ({
  isReviewed: (locale: string) => reviewed.value.includes(locale),
  reviewedLocales: () => reviewed.value,
}))

// The route list is mocked so these tests state the sitemap's behaviour at the
// full four-page shape, rather than tracking however many pages exist today.
// lib/seo/routes.ts holds the real list and grows in T-211..T-213.
vi.mock('@/lib/seo/routes', () => ({
  ROUTES: ['', '/about', '/projects', '/contact'],
}))

const { default: sitemap } = await import('@/app/sitemap')

function setReviewed(...locales: string[]) {
  reviewed.value = locales
}

beforeEach(() => {
  setReviewed('en', 'tr', 'ar')
})

describe('sitemap', () => {
  it('lists every route in every reviewed locale', () => {
    const entries = sitemap()

    expect(entries).toHaveLength(12)
    expect(entries.map((entry) => entry.url)).toEqual([
      `${ORIGIN}/en`,
      `${ORIGIN}/en/about`,
      `${ORIGIN}/en/projects`,
      `${ORIGIN}/en/contact`,
      `${ORIGIN}/tr`,
      `${ORIGIN}/tr/about`,
      `${ORIGIN}/tr/projects`,
      `${ORIGIN}/tr/contact`,
      `${ORIGIN}/ar`,
      `${ORIGIN}/ar/about`,
      `${ORIGIN}/ar/projects`,
      `${ORIGIN}/ar/contact`,
    ])
  })

  it('drops to 8 entries when one locale is gated off', () => {
    setReviewed('en', 'ar')

    const entries = sitemap()

    expect(entries).toHaveLength(8)
    expect(entries.some((entry) => entry.url.includes('/tr'))).toBe(false)
  })

  it('emits nothing when no locale has been reviewed', () => {
    setReviewed()

    expect(sitemap()).toHaveLength(0)
  })

  it('uses absolute URLs with no trailing slash', () => {
    for (const entry of sitemap()) {
      expect(entry.url.startsWith(`${ORIGIN}/`)).toBe(true)
      expect(entry.url.endsWith('/')).toBe(false)
    }
  })

  it('mirrors the page hreflang set, from the same helper', () => {
    const home = sitemap().find((entry) => entry.url === `${ORIGIN}/en`)

    expect(home?.alternates?.languages).toEqual({
      en: `${ORIGIN}/en`,
      tr: `${ORIGIN}/tr`,
      ar: `${ORIGIN}/ar`,
      'x-default': `${ORIGIN}/en`,
    })
  })

  it('keeps a gated locale out of the alternates too, not only out of the entry list', () => {
    setReviewed('en', 'ar')

    for (const entry of sitemap()) {
      expect(Object.keys(entry.alternates?.languages ?? {})).not.toContain('tr')
    }
  })

  describe('fields deliberately left out', () => {
    it('omits changeFrequency and priority, which Google ignores', () => {
      for (const entry of sitemap()) {
        expect(entry).not.toHaveProperty('changeFrequency')
        expect(entry).not.toHaveProperty('priority')
      }
    })

    it('omits lastModified rather than reporting build time as a content change', () => {
      for (const entry of sitemap()) {
        expect(entry).not.toHaveProperty('lastModified')
      }
    })
  })
})
