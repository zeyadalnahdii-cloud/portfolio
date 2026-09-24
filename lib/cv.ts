import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * **One CV, served for every locale.** Owner decision, 2026-09-26 (T-206).
 *
 * The task originally specified one PDF per locale. It is deliberately not
 * translated: the same English document is offered on the English, Turkish and
 * Arabic About pages. The UI around the download stays localised — only the
 * document itself is English.
 *
 * `hreflang="en"` on the link is what states that to a machine; nothing in the
 * label claims the file is translated, and the documentation no longer claims
 * three CVs exist.
 */
export const CV_PATH = '/cv/Zeyad-Alnahdi-CV.pdf'

/** The language of the document itself, regardless of the page serving it. */
export const CV_LANGUAGE = 'en'

const absolute = () => join(process.cwd(), 'public', CV_PATH)

export function cvPath(): string {
  return CV_PATH
}

/**
 * Whether the file actually exists.
 *
 * Until it does, About offers no download rather than a button that 404s — the
 * same reasoning as hasRoute: a link the visitor cannot follow is worse than no
 * link. Checked at build time, since every page here is prerendered.
 */
export function hasCv(): boolean {
  return existsSync(absolute())
}

/**
 * The file's size in KB, read from the file rather than written down.
 *
 * F-34 asks for the size in the link text. A hardcoded number is wrong the
 * first time the CV is replaced, and nothing would report it — so it is
 * measured at build time from the file being served.
 */
export function cvSizeKb(): number | null {
  if (!hasCv()) return null
  return Math.round(statSync(absolute()).size / 1024)
}
