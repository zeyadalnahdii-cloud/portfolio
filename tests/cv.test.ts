import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CV_LANGUAGE, CV_PATH, cvPath, cvSizeKb, hasCv } from '@/lib/cv'
import { LOCALES } from '@/lib/i18n/config'

/**
 * One English CV is served on all three locales — an owner decision recorded in
 * T-206, not an oversight. These tests pin that decision so a later change to
 * "one per locale" is a deliberate act rather than a silent drift.
 */
describe('the CV', () => {
  it('is one file, the same for every locale', () => {
    const served = new Set(LOCALES.map(() => cvPath()))
    expect(served.size).toBe(1)
    expect(cvPath()).toBe(CV_PATH)
  })

  it('is declared English, whatever page serves it', () => {
    expect(CV_LANGUAGE).toBe('en')
  })

  it('exists, so About renders the download rather than hiding it', () => {
    expect(hasCv()).toBe(true)
  })

  /**
   * F-34 puts the size in the link text. Reading it from the file rather than
   * writing it down is the point: a hardcoded number is wrong the first time
   * the CV is replaced, and nothing would report it.
   */
  it('reports a size measured from the file on disk', () => {
    const bytes = readFileSync(join(process.cwd(), 'public', CV_PATH)).byteLength
    expect(cvSizeKb()).toBe(Math.round(bytes / 1024))
    expect(cvSizeKb()).toBeGreaterThan(0)
  })

  it('is a real PDF, not a placeholder or an HTML error page', () => {
    const head = readFileSync(join(process.cwd(), 'public', CV_PATH))
      .subarray(0, 5)
      .toString()
    expect(head).toBe('%PDF-')
  })
})
