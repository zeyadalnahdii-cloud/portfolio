import ar from '@/messages/ar.json'
import en from '@/messages/en.json'
import tr from '@/messages/tr.json'

import { LOCALES, type Locale } from './config'

/**
 * The message shape, derived from `en.json`.
 *
 * English is the reference because it is the default locale (SRS I-01). Adding
 * a key means adding it to `en.json` first; the registry below then refuses to
 * compile until every other locale has it too.
 */
export type Messages = typeof en

/**
 * Every locale's messages, checked against {@link Messages} at compile time.
 *
 * `satisfies` is doing the work: a locale missing a key that `en.json` has
 * fails `tsc`, which fails `next build` (SRS I-11). There is no runtime
 * fallback to English — a silently missing translation ships as English text
 * on an Arabic page, which reads as a bug to the visitor and as thin content
 * to a crawler.
 */
export const MESSAGES = { en, tr, ar } satisfies Record<Locale, Messages>

/**
 * Whether a locale's copy has been reviewed by a competent speaker.
 *
 * **This is the single source of truth for the indexing gate (SRS I-14).**
 * Two consumers read it: the robots directive, and the alternates generator in
 * T-114. Duplicating the check is how the two drift apart and produce the
 * contradiction where `hreflang` points at a `noindex` page — a signal search
 * engines report as an error, and one nobody notices by looking at the site.
 *
 * Unreviewed locales still build and still serve; they are simply kept out of
 * the index until someone has read them.
 */
export function isReviewed(locale: Locale): boolean {
  return MESSAGES[locale]._meta.reviewed
}

/** The locales whose copy is reviewed, in the order declared in config. */
export function reviewedLocales(): Locale[] {
  return LOCALES.filter(isReviewed)
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale]
}
