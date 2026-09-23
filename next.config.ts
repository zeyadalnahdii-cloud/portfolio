import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { DEFAULT_LOCALE } from './lib/i18n/config'
import { IS_PRODUCTION_DEPLOY } from './lib/seo/environment'
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
    if (IS_PRODUCTION_DEPLOY) {
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
    return Promise.resolve([
      {
        // SRS I-03. `permanent: true` emits 308, not 307: a temporary redirect
        // would tell search engines `/` is still the canonical URL.
        //
        // Handled here rather than in middleware so the site stays fully static
        // (no edge function) and the status code is exact. Locale is never
        // negotiated from Accept-Language or IP — see SRS I-04.
        source: '/',
        destination: `/${DEFAULT_LOCALE}`,
        permanent: true,
      },
    ])
  },
}

export default createNextIntlPlugin('./i18n/request.ts')(nextConfig)
