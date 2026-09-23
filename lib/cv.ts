import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { Locale } from '@/lib/i18n/config'

/**
 * Where a locale's CV lives. The filename carries the canonical name
 * spelling, because it survives into the reader's downloads folder and is
 * what they will search for later (docs/02-keyword-plan.md §2).
 */
export function cvPath(locale: Locale): string {
  return `/cv/Zeyad-Alnahdi-CV-${locale}.pdf`
}

/**
 * Whether that file actually exists.
 *
 * The CVs are written in T-206. Until then the About page offers no download,
 * rather than a button that 404s — the same reasoning as hasRoute: a link the
 * visitor cannot follow is worse than no link. Checked at build time, since
 * every page here is prerendered.
 */
export function hasCv(locale: Locale): boolean {
  return existsSync(join(process.cwd(), 'public', cvPath(locale)))
}
