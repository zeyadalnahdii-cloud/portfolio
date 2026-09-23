import type { MetadataRoute } from 'next'

import { reviewedLocales } from '@/lib/i18n/messages'
import { buildAlternates } from '@/lib/seo/alternates'
import { ROUTES } from '@/lib/seo/routes'

/**
 * The sitemap (SRS X-01, X-02, docs/05-ia-url-map.md §5).
 *
 * Entries are the cross product of the routes that exist and the locales whose
 * copy has been reviewed. An unreviewed locale is served with `noindex`
 * (SRS I-14), so listing it here would ask a crawler to index a page that asks
 * not to be — the contradiction the gate exists to prevent. `reviewedLocales`
 * and `buildAlternates` both read `isReviewed`, so the sitemap and the page's
 * own head cannot disagree.
 *
 * Deliberately omitted:
 *
 * - `changeFrequency` and `priority`. Google ignores both; emitting them is
 *   noise dressed as signal (docs/05-ia-url-map.md §5).
 * - `lastModified`. There is no accurate source for it yet. A timestamp equal
 *   to build time on every page is a claim that the whole site changed on every
 *   deploy — ignored at best, distrusted at worst. It can be added when it can
 *   be derived from the content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = reviewedLocales()

  return locales.flatMap((locale) =>
    ROUTES.map((route) => {
      const { canonical, languages } = buildAlternates(locale, route)

      return {
        url: canonical,
        // Mirrors the page's own hreflang set exactly, from the same helper.
        alternates: { languages },
      }
    }),
  )
}
