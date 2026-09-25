import { type Locale } from '@/lib/i18n/config'
import { getMessages, reviewedLocales } from '@/lib/i18n/messages'

import { localeUrl } from './alternates'
import { ORIGIN } from './origin'
import { SITE_NAME } from './metadata'

/**
 * Stable `@id`s. Entities reference each other by these rather than repeating
 * their contents (SRS S-06), so a crawler resolves one Person across every
 * page instead of twelve lookalikes.
 *
 * The fragment form is deliberate: `#person` is a node inside the site's graph,
 * not a page that exists.
 */
export const PERSON_ID = `${ORIGIN}/#person`
export const WEBSITE_ID = `${ORIGIN}/#website`

/**
 * Facts about each project that are not translated copy.
 *
 * The names and descriptions come from the message files, because they are
 * written per locale. The languages a project is written in do not change with
 * the reader, so they live here.
 *
 * There is deliberately no `codeRepository`. D2/D3 resolved on 2026-09-23:
 * both repositories stay private, and S-07 forbids structured data claiming
 * what nobody can open. A link a crawler cannot follow is not evidence, it is
 * a contradiction between the markup and the page.
 */
const PROJECTS = {
  aiWorkspace: {
    id: `${ORIGIN}/#project-ai-workspace`,
    programmingLanguage: ['C#', 'Python', 'TypeScript'],
  },
  restaurant: {
    id: `${ORIGIN}/#project-restaurant-management`,
    programmingLanguage: ['C#', 'T-SQL'],
  },
} as const

/**
 * Everything here must be true and, where it is visible, present on the page
 * (SRS S-07). Structured data contradicting the page is a manual-action risk,
 * and inventing a profile link breaks the entity it is supposed to join.
 *
 * Deliberately absent:
 * - LinkedIn, until the profile URL is known. A guessed URL is worse than none.
 * - Any `codeRepository` field, which belongs to SoftwareSourceCode on the
 *   Projects page (S-04, T-216) and depends on D3 — pointing at a repository
 *   nobody can open is exactly the contradiction S-07 forbids.
 */
/**
 * The canonical professional identity (docs/02-keyword-plan.md §3, T-205).
 *
 * Locale-aware rather than one English string. `Full Stack Developer` is the
 * canonical title in every locale — it is how the role is written in all three
 * markets — and each locale adds the term its own readers actually search for:
 * `software developer` in English (27,100/mo US), `yazılımcı` in Turkish
 * (14,800/mo TR) and `مبرمج` in Arabic (2,400/mo SA). schema.org accepts a list
 * for jobTitle, so this states both rather than choosing.
 *
 * Emitting one English string on all twelve routes described the Arabic and
 * Turkish pages in a language their readers do not search in.
 */
const JOB_TITLE: Record<Locale, readonly string[]> = {
  en: ['Full Stack Developer', 'Software Developer'],
  tr: ['Full Stack Developer', 'Yazılımcı'],
  ar: ['Full Stack Developer', 'مبرمج'],
}

const PERSON = {
  name: 'Zeyad Alnahdi',
  // Transliteration variants, so one entity resolves from any spelling
  // (docs/02-keyword-plan.md §2). The doubled-i handle spelling is not here:
  // it appears in the email address, not as a name.
  alternateName: ['زياد النهدي', 'Ziyad Alnahdi', 'Zeyad Al-Nahdi', 'Zeyad Al Nahdi'],

  email: 'mailto:zeyadalnahdii@gmail.com',
  sameAs: ['https://github.com/zeyadalnahdii-cloud'],
  knowsAbout: [
    'C#',
    'ASP.NET Core',
    '.NET',
    'SQL Server',
    'PostgreSQL',
    'Clean Architecture',
    'TypeScript',
    'Next.js',
    'Python',
    'FastAPI',
    'Docker',
    'Retrieval-Augmented Generation',
    'Artificial Intelligence',
  ],
  addressLocality: 'Aksaray',
  addressCountry: 'TR',
  knowsLanguage: ['ar', 'en', 'tr'],
} as const

export interface SchemaGraph {
  '@context': 'https://schema.org'
  '@graph': unknown[]
}

/** The routes that carry their own structured data. */
export type SchemaPage = '' | '/about' | '/projects' | '/contact'

/**
 * A breadcrumb trail from the locale home to this page (SRS S-03).
 *
 * Two items is the whole depth of this site, which is the point of the flat
 * structure in docs/05-ia-url-map.md §1. The names are the navigation labels,
 * so what a crawler reads matches what a visitor clicked.
 */
function breadcrumbs(locale: Locale, page: Exclude<SchemaPage, ''>): unknown {
  const nav = getMessages(locale).nav
  const label = { '/about': nav.about, '/projects': nav.projects, '/contact': nav.contact }[page]

  return {
    '@type': 'BreadcrumbList',
    '@id': `${localeUrl(locale, page)}#breadcrumbs`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: nav.home, item: localeUrl(locale, '') },
      { '@type': 'ListItem', position: 2, name: label, item: localeUrl(locale, page) },
    ],
  }
}

/**
 * One SoftwareSourceCode per project (SRS S-04), authored by the Person and
 * referenced by `@id` rather than repeating them.
 */
function projectEntities(locale: Locale): unknown[] {
  const { projects } = getMessages(locale)

  return [
    { copy: projects.aiWorkspace, facts: PROJECTS.aiWorkspace },
    { copy: projects.restaurant, facts: PROJECTS.restaurant },
  ].map(({ copy, facts }) => ({
    '@type': 'SoftwareSourceCode',
    '@id': facts.id,
    name: copy.name,
    description: copy.problem,
    programmingLanguage: [...facts.programmingLanguage],
    author: { '@id': PERSON_ID },
    inLanguage: locale,
  }))
}

/**
 * The site's JSON-LD graph for one locale and page (SRS S-01 … S-06).
 *
 * One graph per page rather than a base graph in the layout plus a second
 * block per route: a single `@graph` is what keeps every `@id` resolvable in
 * one pass, and it is why this lives here instead of in the pages.
 *
 * `Person.url` points at the current locale's home page so the entity resolves
 * to a page the visitor can actually read, rather than always to English.
 */
export function buildSchema(locale: Locale, page: SchemaPage = ''): SchemaGraph {
  const pageEntities: unknown[] = []

  if (page !== '') {
    pageEntities.push(breadcrumbs(locale, page))
  }

  if (page === '/projects') {
    pageEntities.push(...projectEntities(locale))
  }

  if (page === '/contact') {
    pageEntities.push({
      '@type': 'ContactPage',
      '@id': `${localeUrl(locale, page)}#contact`,
      url: localeUrl(locale, page),
      name: getMessages(locale).contact.heading,
      inLanguage: locale,
      // The page is about reaching the Person, by reference (S-06).
      about: { '@id': PERSON_ID },
      mainEntity: { '@id': PERSON_ID },
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: PERSON.name,
        alternateName: [...PERSON.alternateName],
        jobTitle: [...JOB_TITLE[locale]],
        url: localeUrl(locale, ''),
        email: PERSON.email,
        sameAs: [...PERSON.sameAs],
        knowsAbout: [...PERSON.knowsAbout],
        knowsLanguage: [...PERSON.knowsLanguage],
        address: {
          '@type': 'PostalAddress',
          addressLocality: PERSON.addressLocality,
          addressCountry: PERSON.addressCountry,
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: ORIGIN,
        name: SITE_NAME,
        // The locales the site actually offers for indexing. An unreviewed
        // locale is served but kept out of the index (SRS I-14), so listing it
        // here would contradict its own robots directive.
        inLanguage: reviewedLocales(),
        // By @id, not by repeating the Person (S-06).
        publisher: { '@id': PERSON_ID },
        author: { '@id': PERSON_ID },
      },
      ...pageEntities,
    ],
  }
}

/**
 * Serialises the graph for a `<script type="application/ld+json">` body.
 *
 * `<` is escaped so a value can never close the script element early. The data
 * here is static, but the helper is the wrong place to rely on that.
 */
export function serialiseSchema(graph: SchemaGraph): string {
  return JSON.stringify(graph).replace(/</g, '\\u003c')
}
