import { isLocale, type Locale } from './config'

/**
 * Splits a pathname into its locale prefix and the rest.
 *
 * The first segment is only treated as a locale when it actually is one, so a
 * future route whose first segment happens to be two letters is not mistaken
 * for a locale prefix.
 */
export function splitLocale(pathname: string): { locale: Locale | null; rest: string } {
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`
  const [, first = '', ...others] = withLeading.split('/')

  if (!isLocale(first)) {
    return { locale: null, rest: normalise(withLeading) }
  }

  return { locale: first, rest: normalise(`/${others.join('/')}`) }
}

/** One URL form: leading slash, no trailing slash, '' for the root (SRS X-05). */
function normalise(path: string): string {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed === '/' ? '' : trimmed
}

/**
 * The equivalent of `pathname` in another locale.
 *
 * This is the whole language switcher, and its failure mode is well known:
 * dropping the visitor on the target locale's home page instead of the page
 * they were reading (SRS I-09). Keeping the rest of the path is the entire
 * job, so it lives in a pure function that can be tested against routes that
 * do not exist yet — today the site has one page, which would hide the bug
 * completely.
 */
export function switchLocale(pathname: string, target: Locale): string {
  const { rest } = splitLocale(pathname)
  return `/${target}${rest}`
}
