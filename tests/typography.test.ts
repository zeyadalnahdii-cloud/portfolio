import { describe, expect, it } from 'vitest'

import ar from '@/messages/ar.json'
import tr from '@/messages/tr.json'

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value !== 'object' || value === null) return []
  return Object.values(value).flatMap(allStrings)
}

/**
 * Guards the character ranges the font subsets are chosen for.
 *
 * Turkish copy is the fragile one. `ı ğ ş ç ö ü` live in `latin-ext`, not in
 * the plain `latin` subset, so stripping them does not merely look wrong — it
 * changes the word. `yazilim` and `yazılım` are different strings to a search
 * engine (docs/02-keyword-plan.md §3.2), and the second is the one people type.
 */
describe('Turkish copy', () => {
  const strings = allStrings(tr)

  it('keeps its diacritics rather than falling back to ASCII', () => {
    const turkishSpecific = /[ıİğĞşŞçÇöÖüÜ]/

    expect(strings.some((value) => turkishSpecific.test(value))).toBe(true)
  })

  it('does not write the dotless i as a plain i in words that need it', () => {
    // 'Karanlık', 'Hakkımda' — the words themselves are the assertion.
    expect(strings).toContain('Karanlık mod')
    expect(strings).toContain('Hakkımda')
  })
})

describe('Arabic copy', () => {
  const strings = allStrings(ar)

  it('is written in Arabic script, which is what the Arabic subset covers', () => {
    const arabicScript = /[؀-ۿ]/

    expect(strings.some((value) => arabicScript.test(value))).toBe(true)
  })
})
