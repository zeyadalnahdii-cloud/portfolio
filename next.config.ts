import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // One canonical URL form. See docs/05-ia-url-map.md §2 and SRS X-05.
  trailingSlash: false,
  reactStrictMode: true,
  // Next 16 writes agent instruction files into the project root on every dev
  // run. The repository structure is defined in docs/07-repo-standards.md §1 and
  // does not include them.
  agentRules: false,
}

export default nextConfig
