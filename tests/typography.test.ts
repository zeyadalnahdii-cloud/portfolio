import { describe, expect, it } from 'vitest'

import ar from '@/messages/ar.json'
import en from '@/messages/en.json'
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

/**
 * A locale is only allowed to claim review once its copy is actually its own.
 *
 * T-201 mirrored the English shape into tr.json and ar.json so the build would
 * pass, which means both currently hold English strings in most keys. Setting
 * `_meta.reviewed = true` while that is still the case would drop the noindex
 * and publish English text on an Arabic page — thin content to a crawler and a
 * bug to the visitor. The translations land in T-202 and T-203.
 */
describe('the review flag against untranslated copy', () => {
  function leaves(value: unknown, prefix = ''): [string, string][] {
    if (typeof value === 'string') return [[prefix, value]]
    if (typeof value !== 'object' || value === null) return []
    return Object.entries(value).flatMap(([key, child]) =>
      leaves(child, prefix ? `${prefix}.${key}` : key),
    )
  }

  const english = new Map(leaves(en))

  it.each([
    ['tr', tr],
    ['ar', ar],
  ])('%s is not marked reviewed while it still mirrors English', (_name, messages) => {
    const untranslated = leaves(messages).filter(
      ([key, value]) => !key.startsWith('locale.') && english.get(key) === value,
    )

    if (untranslated.length > 0) {
      expect(messages._meta.reviewed).toBe(false)
    }
  })
})
