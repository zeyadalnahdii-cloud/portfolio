/**
 * The site's absolute origin, validated at module load.
 *
 * Every canonical URL, `hreflang` alternate, Open Graph tag and sitemap entry
 * is built from this (SRS M-03, I-08, X-01). All of them must be absolute, so
 * a wrong value here is wrong everywhere at once.
 *
 * There is deliberately **no fallback**. A default of `http://localhost:3000`
 * would let a build succeed with every canonical URL pointing at localhost —
 * deployed, indexed, and invisible until somebody reads the page source.
 * Failing the build is the cheaper outcome by a wide margin.
 *
 * `process.env.NEXT_PUBLIC_SITE_URL` is written out literally because Next
 * only inlines the value when it is; a computed key would read as undefined in
 * the browser bundle.
 */

import { IS_PRODUCTION_DEPLOY } from './environment'

const VAR = 'NEXT_PUBLIC_SITE_URL'
const RAW = process.env.NEXT_PUBLIC_SITE_URL

function fail(problem: string): never {
  throw new Error(
    [
      `${VAR} ${problem}.`,
      ``,
      `It must be the site's absolute origin, with no trailing slash and no path,`,
      `for example: https://zeyadalnahdi.com`,
      ``,
      `Local development: copy .env.example to .env.local and set it there.`,
      `Deployments: set it in the Vercel project's environment variables.`,
      ``,
      `There is no default on purpose. A fallback origin would publish canonical`,
      `URLs pointing at the wrong host rather than failing here.`,
    ].join('\n'),
  )
}

function validate(value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    fail('is not set')
  }

  const trimmed = value.trim()

  if (trimmed.endsWith('/')) {
    fail(`must not end with a trailing slash (got "${trimmed}")`)
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    fail(`must be an absolute URL including the scheme (got "${trimmed}")`)
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    fail(`must use http or https (got "${parsed.protocol}")`)
  }

  const isLoopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'

  if (parsed.protocol === 'http:' && !isLoopback) {
    fail(`must use https for any host other than localhost (got "${trimmed}")`)
  }

  if (IS_PRODUCTION_DEPLOY && (parsed.protocol !== 'https:' || isLoopback)) {
    fail(`must be an https URL on a real host in production (got "${trimmed}")`)
  }

  if (parsed.pathname !== '/') {
    fail(`must be an origin with no path (got path "${parsed.pathname}")`)
  }

  if (parsed.search !== '' || parsed.hash !== '') {
    fail(`must not carry a query string or fragment (got "${trimmed}")`)
  }

  // `new URL('https://x.com').origin` drops the trailing slash for us.
  return parsed.origin
}

/** Absolute origin, no trailing slash. e.g. `https://zeyadalnahdi.com` */
export const ORIGIN: string = validate(RAW)

/**
 * Joins a site-relative path onto {@link ORIGIN}.
 *
 * Accepts a path with or without a leading slash and always produces exactly
 * one separator. The site has no trailing slashes (SRS X-05), so the root is
 * returned as the bare origin rather than `${ORIGIN}/`.
 */
export function url(path = '/'): string {
  const normalised = path.startsWith('/') ? path : `/${path}`
  const withoutTrailing = normalised.length > 1 ? normalised.replace(/\/+$/, '') : normalised
  return withoutTrailing === '/' ? ORIGIN : `${ORIGIN}${withoutTrailing}`
}
