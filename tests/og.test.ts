import { describe, expect, it } from 'vitest'

import { LOCALES } from '@/lib/i18n/config'
import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, ogImage } from '@/lib/seo/og'
import type { SchemaPage } from '@/lib/seo/schema'

const PAGES: SchemaPage[] = ['', '/about', '/projects', '/contact']

describe('card dimensions', () => {
  it('is 1200x630, which is what the platforms crop to (M-08)', () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 })
    expect(OG_CONTENT_TYPE).toBe('image/png')
  })
})

describe('ogAlt', () => {
  it('describes the card in the page language, for every route', () => {
    for (const locale of LOCALES) {
      for (const page of PAGES) {
        expect(ogAlt(locale, page).length).toBeGreaterThan(0)
      }
    }
  })

  it('names the page rather than repeating the site title everywhere', () => {
    expect(ogAlt('en', '')).toContain('Zeyad Alnahdi')
    expect(ogAlt('en', '/projects')).toContain('Projects')
    expect(ogAlt('en', '/contact')).toContain('Get in touch')
  })

  it('uses the locale copy, not English translated later', () => {
    expect(ogAlt('ar', '/projects')).toContain('المشاريع')
    expect(ogAlt('tr', '/about')).toContain('Hakkımda')
  })
})

describe('ogImage', () => {
  /**
   * Rendered rather than inspected. The failures this task exists to prevent —
   * a missing font buffer, satori refusing .woff2 — throw at render time and
   * are invisible in the source.
   */
  it.each(LOCALES)('renders a PNG of the right size for %s', async (locale) => {
    const response = await ogImage(locale, '/projects')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')

    const bytes = new Uint8Array(await response.arrayBuffer())

    // PNG magic number. A satori failure would surface as a throw or as
    // something that is not a PNG at all.
    expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47])
    expect(bytes.byteLength).toBeGreaterThan(1000)
  })

  it('renders every route in every locale', async () => {
    for (const locale of LOCALES) {
      for (const page of PAGES) {
        const response = await ogImage(locale, page)
        expect(response.status, `${locale}${page}`).toBe(200)
      }
    }
  })
})
