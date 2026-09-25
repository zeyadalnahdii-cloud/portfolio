import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { DEFAULT_LOCALE } from './lib/i18n/config'
import { IS_INDEXABLE } from './lib/seo/environment'
import { ROUTES } from './lib/seo/routes'
// Imported for its side effect: the module validates NEXT_PUBLIC_SITE_URL at
// load and throws if it is missing or malformed. next.config is evaluated
// before anything is compiled, so a bad origin fails the build immediately
// rather than after a full compile — or, worse, not at all.
import './lib/seo/origin'

const nextConfig: NextConfig = {
  // One canonical URL form. See docs/05-ia-url-map.md §2 and SRS X-05.
  trailingSlash: false,
  reactStrictMode: true,
  // Next 16 writes agent instruction files into the project root on every dev
  // run. The repository structure is defined in docs/07-repo-standards.md §1 and
  // does not include them.
  agentRules: false,
  headers() {
    // SRS X-06. An indexed preview is a full duplicate of the site competing
    // with the canonical domain, and nothing reports it.
    //
    // This header is the protection that actually works. robots.txt asks a
    // crawler not to fetch a URL; it does not stop a URL discovered through a
    // link from being indexed unfetched. Only noindex does that — and it has to
    // be a header rather than a meta tag, so it covers the sitemap and every
    // other non-HTML response too.
    if (IS_INDEXABLE) {
      return Promise.resolve([])
    }

    return Promise.resolve([
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ])
  },
  redirects() {
    // The redirect map in docs/05-ia-url-map.md §8.
    //
    // `permanent: true` emits 308 throughout. That is the whole point of the
    // map: a 302 or 307 tells search engines the old URL is still the
    // canonical one, so the locale-less form would keep its ranking and the
    // real URL would never accumulate any.
    //
    // Handled here rather than in middleware so the site stays fully static
    // and the status code is exact. Locale is never negotiated from
    // Accept-Language or IP (SRS I-04).
    //
    // Derived from ROUTES, the same list the sitemap and the navigation read,
    // so a locale-less redirect appears the moment its page does — and never
    // before. `/about` → `/en/about` while /en/about is a 404 would turn one
    // dead end into a redirect chain ending in the same dead end.
    const localeless = ROUTES.map((route) => ({
      source: route === '' ? '/' : route,
      destination: `/${DEFAULT_LOCALE}${route}`,
      permanent: true,
    }))

    return Promise.resolve([
      ...localeless,
      {
        // www to apex (SRS X-07). Written against a host pattern rather than a
        // literal domain, so it is correct before D1 is resolved and stays
        // correct if the domain changes. HTTP to HTTPS is not expressible here
        // and is configured at the platform in T-311.
        source: '/:path*',
        has: [{ type: 'host' as const, value: 'www\\.(?<host>.*)' }],
        destination: 'https://:host/:path*',
        permanent: true,
      },
    ])
  },
}

export default createNextIntlPlugin('./i18n/request.ts')(nextConfig)
