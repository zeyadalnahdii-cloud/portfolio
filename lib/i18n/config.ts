/**
 * The single source of truth for which locales exist.
 *
 * Typed as a union rather than `string` on purpose (docs/07-repo-standards.md §2):
 * a locale typed as `string` is how an unhandled fourth locale reaches production.
 */
export const LOCALES = ['en', 'tr', 'ar'] as const

export type Locale = (typeof LOCALES)[number]

/** SRS I-03: the default locale still carries its prefix. `/` redirects to `/en`. */
export const DEFAULT_LOCALE: Locale = 'en'

/** SRS I-06: text direction per locale. */
export const LOCALE_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  tr: 'ltr',
  ar: 'rtl',
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
