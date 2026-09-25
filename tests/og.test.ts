import { describe, expect, it } from 'vitest'

import { LOCALES } from '@/lib/i18n/config'
import { Line, OG_CONTENT_TYPE, OG_SIZE, bidiRuns, ogAlt, ogImage } from '@/lib/seo/og'
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

/**
 * satori has no bidi algorithm, so the Arabic card reverses word order as
 * layout. T-205 made that line mixed-direction — the canonical job title is
 * `Full Stack Developer`, in Latin, inside Arabic copy — and reversing per
 * word would render the English phrase backwards while looking perfectly
 * polished to anyone who does not read it.
 */
describe('bidiRuns', () => {
  it('keeps one item per word in pure Arabic', () => {
    expect(bidiRuns('زياد النهدي')).toEqual(['زياد', 'النهدي'])
  })

  it('keeps a Latin run together so it does not reverse word by word', () => {
    expect(bidiRuns('زياد النهدي — Full Stack Developer')).toEqual([
      'زياد',
      'النهدي',
      '— Full Stack Developer',
    ])
  })

  /**
   * The regression this exists to prevent: three separate items would be laid
   * out right-to-left and read "Developer Stack Full".
   */
  it('never splits the canonical job title across items', () => {
    const runs = bidiRuns('مبرمج Full Stack Developer يبني أنظمة')
    expect(runs).toContain('Full Stack Developer')
    expect(runs).not.toContain('Full')
    expect(runs).not.toContain('Developer')
  })

  it('groups adjacent Latin tokens into a single run, per run', () => {
    expect(bidiRuns('ASP.NET Core و SQL Server')).toEqual(['ASP.NET Core', 'و', 'SQL Server'])
  })

  it('passes a pure Latin line through as one run', () => {
    expect(bidiRuns('Full Stack Developer')).toEqual(['Full Stack Developer'])
  })

  it('ignores repeated and trailing spaces rather than emitting empty items', () => {
    expect(bidiRuns('  زياد   Full  Stack  ')).toEqual(['زياد', 'Full Stack'])
  })
})

/**
 * bidiRuns being correct is not the same as Line using it. Testing the helper
 * alone passes even when the component still splits per word — so this asserts
 * the wiring, on the element Line actually returns.
 */
describe('Line uses the runs, not raw words', () => {
  type Span = { props: { children: string } }

  const children = (text: string, rtl: boolean): Span[] | string[] => {
    const element = Line({ text, rtl, style: {} }) as { props: { children: unknown } }
    const kids = element.props.children
    return (Array.isArray(kids) ? kids : [kids]) as Span[] | string[]
  }

  it('renders one span per bidi run for a mixed Arabic line', () => {
    const text = 'زياد النهدي — Full Stack Developer'
    const rendered = children(text, true) as Span[]

    expect(rendered.map((child) => child.props.children)).toEqual(bidiRuns(text))
    // Six words, but four items — the Latin run is one of them.
    expect(rendered).toHaveLength(3)
    expect(rendered.map((child) => child.props.children)).toContain('— Full Stack Developer')
  })

  it('leaves a left-to-right line as a single text node', () => {
    expect(children('Full Stack Developer', false)).toEqual(['Full Stack Developer'])
  })
})
