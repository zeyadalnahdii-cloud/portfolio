import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config'
import { isReviewed } from '@/lib/i18n/messages'

import { url } from './origin'

/**
 * The shape Next.js expects under `metadata.alternates`.
 *
 * `languages` keys are bare language codes plus `x-default` — not `en-US` or
 * `tr-TR`. The site targets languages, not countries (docs/05-ia-url-map.md
 * §3, decision A3).
 */
export interface Alternates {
  canonical: string
  languages: Record<string, string>
}

/**
 * Normalises the locale-less part of a route to a leading-slash form with no
 * trailing slash: '' and '/' both become '', '/about/' becomes '/about'.
 * The site has exactly one URL form (SRS X-05).
 */
function normalisePath(pathname: string): string {
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`
  const withoutTrailing = withLeading.replace(/\/+$/, '')
  return withoutTrailing === '' ? '' : withoutTrailing
}

/** Absolute URL of `pathname` in `locale`. */
export function localeUrl(locale: Locale, pathname: string): string {
  return url(`/${locale}${normalisePath(pathname)}`)
}

/**
 * Builds the canonical and `hreflang` set for one route (SRS I-07, I-08).
 *
 * **Reciprocity is structural, not a convention to remember.** `languages` is
 * computed from the global reviewed-locale list and the path alone — the
 * asking locale does not influence it. So `/en/about` and `/tr/about` produce
 * the same set by construction, and a one-directional set is not expressible.
 *
 * That matters because the one-directional case renders perfectly, breaks
 * nothing a person would notice, and is the most common defect in trilingual
 * sites. It surfaces as a Search Console error weeks later, if at all.
 *
 * Unreviewed locales are excluded entirely (SRS I-14). Advertising an
 * alternate that is served with `noindex` is a contradictory signal, so the
 * gate has to reach the alternates generator and the robots directive from the
 * same source — `isReviewed`, defined once in lib/i18n/messages.ts.
 *
 * @param locale   the locale of the page being rendered
 * @param pathname the route *without* its locale prefix: '' or '/about'
 */
export function buildAlternates(locale: Locale, pathname: string): Alternates {
  const path = normalisePath(pathname)
  const languages: Record<string, string> = {}

  for (const candidate of LOCALES) {
    if (!isReviewed(candidate)) continue
    languages[candidate] = localeUrl(candidate, path)
  }

  // x-default is the widest-audience entry point, which is the default locale
  // (docs/05-ia-url-map.md §3, decision A6). It is omitted when that locale is
  // unreviewed rather than pointed at a noindex page — the same contradiction
  // the exclusion above exists to avoid.
  if (isReviewed(DEFAULT_LOCALE)) {
    languages['x-default'] = localeUrl(DEFAULT_LOCALE, path)
  }

  return {
    // The canonical is the page's own URL whether or not it is indexable:
    // canonicalisation is about which URL represents the content, which is a
    // separate question from whether the content should be indexed.
    canonical: localeUrl(locale, path),
    languages,
  }
}
