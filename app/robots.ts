import type { MetadataRoute } from 'next'

import { IS_PRODUCTION_DEPLOY } from '@/lib/seo/environment'
import { url } from '@/lib/seo/origin'

/**
 * robots.txt (SRS X-03, docs/05-ia-url-map.md §6).
 *
 * Production allows everything. There is nothing on this site to hide from a
 * crawler, and a `Disallow` that exists "just in case" is how a page ends up
 * unindexed for a reason nobody remembers.
 *
 * Anywhere else — previews, local builds — disallows everything. That is a
 * request, not a guarantee: `robots.txt` tells a crawler not to *fetch* a URL,
 * but a URL discovered through a link can still be indexed without being
 * fetched. The `X-Robots-Tag: noindex` header in next.config.ts is what
 * actually prevents it (SRS X-06). Both are set, because they fail in
 * different ways.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_DEPLOY) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: url('/sitemap.xml'),
  }
}
