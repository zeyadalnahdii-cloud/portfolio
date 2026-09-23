import { describe, expect, it, vi } from 'vitest'

import { LOCALES } from '@/lib/i18n/config'

const ORIGIN = 'https://zeyadalnahdi.test'

const reviewed = vi.hoisted(() => ({ value: new Set<string>(['en', 'tr', 'ar']) }))

vi.mock('@/lib/i18n/messages', async (importOriginal) => {
  // Only the review state is mocked. getMessages stays real, because the
  // breadcrumb names and project descriptions are the copy under test.
  const actual = await importOriginal<typeof import('@/lib/i18n/messages')>()

  return {
    ...actual,
    isReviewed: (locale: string) => reviewed.value.has(locale),
    reviewedLocales: () => ['en', 'tr', 'ar'].filter((l) => reviewed.value.has(l)),
  }
})

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

describe('per-page entities', () => {
  function types(page: Parameters<typeof buildSchema>[1]) {
    return (buildSchema('en', page)['@graph'] as Node[]).map((node) => node['@type'])
  }

  it('gives the home page the site entities and nothing more', () => {
    expect(types('')).toEqual(['Person', 'WebSite'])
  })

  it('adds a breadcrumb trail to every page below home (S-03)', () => {
    for (const page of ['/about', '/projects', '/contact'] as const) {
      expect(types(page)).toContain('BreadcrumbList')
    }
  })

  it('names breadcrumb steps with the labels the visitor clicked', () => {
    const graph = buildSchema('en', '/about')['@graph'] as Node[]
    const trail = graph.find((node) => node['@type'] === 'BreadcrumbList')

    expect(trail?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/en` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${ORIGIN}/en/about` },
    ])
  })

  it('translates the trail with the page', () => {
    const graph = buildSchema('ar', '/contact')['@graph'] as Node[]
    const trail = graph.find((node) => node['@type'] === 'BreadcrumbList') as Node
    const steps = trail.itemListElement as { name: string }[]

    expect(steps[1]?.name).toBe('تواصل معي')
  })

  describe('projects (S-04)', () => {
    it('emits one SoftwareSourceCode per project, and only on the projects page', () => {
      expect(types('/projects').filter((type) => type === 'SoftwareSourceCode')).toHaveLength(2)
      expect(types('/about')).not.toContain('SoftwareSourceCode')
    })

    it('credits the author by @id rather than repeating the person', () => {
      const graph = buildSchema('en', '/projects')['@graph'] as Node[]

      for (const project of graph.filter((node) => node['@type'] === 'SoftwareSourceCode')) {
        expect(project.author).toEqual({ '@id': PERSON_ID })
      }
    })

    it('states the languages each project is written in', () => {
      const graph = buildSchema('en', '/projects')['@graph'] as Node[]
      const projects = graph.filter((node) => node['@type'] === 'SoftwareSourceCode')

      expect(projects[0]?.programmingLanguage).toEqual(['C#', 'Python', 'TypeScript'])
      expect(projects[1]?.programmingLanguage).toEqual(['C#', 'T-SQL'])
    })
  })

  it('marks the contact page and points it at the person by reference (S-05)', () => {
    const graph = buildSchema('en', '/contact')['@graph'] as Node[]
    const page = graph.find((node) => node['@type'] === 'ContactPage')

    expect(page?.['@id']).toBe(`${ORIGIN}/en/contact#contact`)
    expect(page?.about).toEqual({ '@id': PERSON_ID })
    expect(page?.mainEntity).toEqual({ '@id': PERSON_ID })
  })

  /**
   * S-07, and the reason this file has an honesty section at all. Structured
   * data claiming something the page cannot back up is a manual-action risk,
   * and a codeRepository nobody can open is exactly that. D2/D3 resolved on
   * 2026-09-23: both repositories stay private.
   */
  it('claims no repository on any page, in any locale', () => {
    for (const locale of LOCALES) {
      for (const page of ['', '/about', '/projects', '/contact'] as const) {
        const serialised = JSON.stringify(buildSchema(locale, page))

        expect(serialised, `${locale}${page}`).not.toContain('codeRepository')
        expect(serialised, `${locale}${page}`).not.toContain(
          'github.com/zeyadalnahdii-cloud/portfolio',
        )
      }
    }
  })

  it('never repeats an entity that another one references', () => {
    for (const page of ['', '/about', '/projects', '/contact'] as const) {
      const graph = buildSchema('en', page)['@graph'] as Node[]
      const ids = graph.map((node) => node['@id'])

      expect(new Set(ids).size, page).toBe(ids.length)
    }
  })
})
