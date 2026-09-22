import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { DEFAULT_LOCALE } from './lib/i18n/config'

const nextConfig: NextConfig = {
  // One canonical URL form. See docs/05-ia-url-map.md §2 and SRS X-05.
  trailingSlash: false,
  reactStrictMode: true,
  // Next 16 writes agent instruction files into the project root on every dev
  // run. The repository structure is defined in docs/07-repo-standards.md §1 and
  // does not include them.
  agentRules: false,
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
