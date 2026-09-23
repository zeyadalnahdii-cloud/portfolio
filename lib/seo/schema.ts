import { type Locale } from '@/lib/i18n/config'
import { reviewedLocales } from '@/lib/i18n/messages'

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
const PERSON = {
  name: 'Zeyad Alnahdi',
  // Transliteration variants, so one entity resolves from any spelling
  // (docs/02-keyword-plan.md §2). The doubled-i handle spelling is not here:
  // it appears in the email address, not as a name.
  alternateName: ['زياد النهدي', 'Ziyad Alnahdi', 'Zeyad Al-Nahdi', 'Zeyad Al Nahdi'],
  jobTitle: 'Backend & Desktop Application Developer',
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
  ],
  addressLocality: 'Aksaray',
  addressCountry: 'TR',
  knowsLanguage: ['ar', 'en', 'tr'],
} as const

export interface SchemaGraph {
  '@context': 'https://schema.org'
  '@graph': unknown[]
}

/**
 * The site's JSON-LD graph for one locale (SRS S-01, S-02, S-06).
 *
 * `Person.url` points at the current locale's home page so the entity resolves
 * to a page the visitor can actually read, rather than always to English.
 */
export function buildSchema(locale: Locale): SchemaGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: PERSON.name,
        alternateName: [...PERSON.alternateName],
        jobTitle: PERSON.jobTitle,
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
