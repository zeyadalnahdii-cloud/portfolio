import type { Metadata } from 'next'

import { LOCALES, type Locale } from '@/lib/i18n/config'
import { isReviewed } from '@/lib/i18n/messages'

import { buildAlternates } from './alternates'
import { ORIGIN } from './origin'

/** SRS M-02. Longer values are not wrong, they are truncated in results. */
export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 155

export const SITE_NAME = 'Zeyad Alnahdi'

/**
 * Open Graph wants a language_TERRITORY code, unlike `hreflang`, which takes a
 * bare language here because the site targets languages rather than countries
 * (docs/05-ia-url-map.md §3, decision A3). The territory is a formality of the
 * og:locale format, not a targeting decision.
 */
const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  tr: 'tr_TR',
  ar: 'ar_AR',
}

export interface BuildMetadataInput {
  locale: Locale
  /** The route without its locale prefix: '' or '/about'. */
  pathname: string
  title: string
  description: string
}

/**
 * Length limits are asserted where it is free to do so — `next dev` and the
 * test run — so the failure lands on the person writing the copy, immediately.
 *
 * Production only warns. A title two characters over the limit costs a
 * truncated search result; crashing a live render over it would cost the page.
 * The hard gate for production builds is the CI metadata job in
 * docs/09-cicd.md §2.6, which is not yet built.
 */
function assertLength(field: string, value: string, max: number): void {
  if (value.length <= max) return

  const message =
    `SEO ${field} is ${value.length} characters, over the ${max} limit (SRS M-02): ` + `"${value}"`

  if (process.env.NODE_ENV === 'production') {
    console.warn(message)
    return
  }

  throw new Error(message)
}

/**
 * The single place route metadata is composed (SRS M-01 … M-08).
 *
 * **No route may write its own `canonical` or `alternates`.** They come from
 * `buildAlternates`, through here, or they drift: one page updated and another
 * not is invisible in the browser and shows up as a Search Console error weeks
 * later. If a route needs something this helper does not produce, the helper
 * grows — the route does not reach around it.
 */
export function buildMetadata({
  locale,
  pathname,
  title,
  description,
}: BuildMetadataInput): Metadata {
  assertLength('title', title, TITLE_MAX)
  assertLength('description', description, DESCRIPTION_MAX)

  const alternates = buildAlternates(locale, pathname)
  const indexable = isReviewed(locale)

  const alternateLocale = LOCALES.filter(
    (candidate) => candidate !== locale && isReviewed(candidate),
  ).map((candidate) => OG_LOCALE[candidate])

  return {
    // Lets Next resolve any relative URL — notably the generated OG image —
    // against the real origin rather than the deploy host.
    metadataBase: new URL(ORIGIN),
    title,
    description,
    alternates,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    // SRS I-14. An unreviewed locale still builds and still serves; it is kept
    // out of the index until someone has read it. `isReviewed` is the same
    // source the alternates generator reads, so the two cannot disagree.
    robots: indexable ? undefined : { index: false, follow: true },
  }
}
