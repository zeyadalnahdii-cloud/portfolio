import { describe, expect, it, vi } from 'vitest'

import { LOCALES } from '@/lib/i18n/config'

const ORIGIN = 'https://zeyadalnahdi.test'

const reviewed = vi.hoisted(() => ({ value: new Set<string>(['en', 'tr', 'ar']) }))

vi.mock('@/lib/i18n/messages', () => ({
  isReviewed: (locale: string) => reviewed.value.has(locale),
  reviewedLocales: () => ['en', 'tr', 'ar'].filter((l) => reviewed.value.has(l)),
}))

const { buildSchema, serialiseSchema, PERSON_ID, WEBSITE_ID } = await import('@/lib/seo/schema')

interface Node {
  '@type': string
  '@id': string
  [key: string]: unknown
}

function nodes(locale: (typeof LOCALES)[number]) {
  const graph = buildSchema(locale)['@graph'] as Node[]
  const person = graph.find((n) => n['@type'] === 'Person')
  const website = graph.find((n) => n['@type'] === 'WebSite')
  return { graph, person: person as Node, website: website as Node }
}

describe('buildSchema', () => {
  it('emits one graph holding a Person and a WebSite', () => {
    const graph = buildSchema('en')

    expect(graph['@context']).toBe('https://schema.org')
    expect((graph['@graph'] as Node[]).map((n) => n['@type']).sort()).toEqual(['Person', 'WebSite'])
  })

  it('keeps @id stable across locales, so one entity resolves rather than three', () => {
    const ids = LOCALES.map((locale) => nodes(locale).person['@id'])

    expect(new Set(ids).size).toBe(1)
    expect(ids[0]).toBe(PERSON_ID)
  })

  it('links WebSite to Person by @id rather than repeating it', () => {
    const { website } = nodes('en')

    expect(website['@id']).toBe(WEBSITE_ID)
    expect(website.publisher).toEqual({ '@id': PERSON_ID })
    expect(website.author).toEqual({ '@id': PERSON_ID })
  })

  it('points Person.url at the current locale, not always at English', () => {
    expect(nodes('ar').person.url).toBe(`${ORIGIN}/ar`)
    expect(nodes('tr').person.url).toBe(`${ORIGIN}/tr`)
  })

  it('carries the canonical name with its transliteration variants', () => {
    const { person } = nodes('en')

    expect(person.name).toBe('Zeyad Alnahdi')
    expect(person.alternateName).toContain('زياد النهدي')
    expect(person.alternateName).toContain('Ziyad Alnahdi')
  })

  it('states the address recorded in D5', () => {
    expect(nodes('en').person.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Aksaray',
      addressCountry: 'TR',
    })
  })

  // SRS S-07: structured data must not claim what the site cannot back up.
  describe('honesty', () => {
    it('lists only profile links that are known, never a guessed one', () => {
      const sameAs = nodes('en').person.sameAs as string[]

      expect(sameAs).toEqual(['https://github.com/zeyadalnahdii-cloud'])
      expect(sameAs.some((url) => url.includes('linkedin'))).toBe(false)
    })

    it('claims no repository, which belongs to the Projects page and depends on D3', () => {
      const serialised = JSON.stringify(buildSchema('en'))

      expect(serialised).not.toContain('codeRepository')
      expect(serialised).not.toContain('SoftwareSourceCode')
    })

    it('advertises only the locales it actually offers for indexing', () => {
      reviewed.value = new Set(['en', 'ar'])

      expect(nodes('en').website.inLanguage).toEqual(['en', 'ar'])

      reviewed.value = new Set(['en', 'tr', 'ar'])
    })
  })
})

describe('serialiseSchema', () => {
  it('produces parseable JSON', () => {
    expect(() => {
      JSON.parse(serialiseSchema(buildSchema('en')))
    }).not.toThrow()
  })

  it('escapes < so a value can never close the script element early', () => {
    const graph = buildSchema('en')
    const person = (graph['@graph'] as Node[]).find((n) => n['@type'] === 'Person')
    if (!person) throw new Error('Person node missing from the graph')
    person.name = '</script><script>alert(1)</script>'

    const serialised = serialiseSchema(graph)

    expect(serialised).not.toContain('</script>')
    expect(serialised).toContain('\\u003c')
    expect(JSON.parse(serialised)).toBeTruthy()
  })
})
