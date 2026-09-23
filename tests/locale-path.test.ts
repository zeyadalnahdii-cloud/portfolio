import { describe, expect, it } from 'vitest'

import { LOCALES } from '@/lib/i18n/config'
import { splitLocale, switchLocale } from '@/lib/i18n/path'

/**
 * These run against routes that do not exist yet on purpose.
 *
 * With one page live, a switcher that drops the visitor on the locale home
 * page and one that keeps their place produce the same URL. The bug SRS I-09
 * exists to prevent is invisible until /about and /projects are built, so the
 * path arithmetic is tested here rather than waiting for Sprint 2.
 */
const PATHS = ['', '/about', '/projects', '/contact', '/projects/ai-workspace']

describe('splitLocale', () => {
  it('separates a locale prefix from the rest', () => {
    expect(splitLocale('/tr/projects')).toEqual({ locale: 'tr', rest: '/projects' })
  })

  it('reports an empty rest for a locale root', () => {
    expect(splitLocale('/en')).toEqual({ locale: 'en', rest: '' })
  })

  it('treats a first segment that is not a locale as part of the path', () => {
    expect(splitLocale('/de/projects')).toEqual({ locale: null, rest: '/de/projects' })
    expect(splitLocale('/projects')).toEqual({ locale: null, rest: '/projects' })
  })

  it('normalises trailing slashes and the bare root', () => {
    expect(splitLocale('/ar/')).toEqual({ locale: 'ar', rest: '' })
    expect(splitLocale('/ar/about/')).toEqual({ locale: 'ar', rest: '/about' })
    expect(splitLocale('/')).toEqual({ locale: null, rest: '' })
  })
})

describe('switchLocale', () => {
  // The acceptance criterion, stated directly.
  it('lands on the same page in the target locale', () => {
    expect(switchLocale('/tr/projects', 'ar')).toBe('/ar/projects')
  })

  it('keeps the path for every route and every direction', () => {
    for (const path of PATHS) {
      for (const from of LOCALES) {
        for (const to of LOCALES) {
          expect(switchLocale(`/${from}${path}`, to)).toBe(`/${to}${path}`)
        }
      }
    }
  })

  it('never drops the visitor on the locale home page when they were deeper', () => {
    for (const from of LOCALES) {
      for (const to of LOCALES) {
        const result = switchLocale(`/${from}/projects`, to)

        expect(result).not.toBe(`/${to}`)
        expect(result).toBe(`/${to}/projects`)
      }
    }
  })

  it('round-trips: switching away and back returns the original URL', () => {
    for (const path of PATHS) {
      for (const from of LOCALES) {
        for (const to of LOCALES) {
          const there = switchLocale(`/${from}${path}`, to)
          expect(switchLocale(there, from)).toBe(`/${from}${path}`)
        }
      }
    }
  })

  it('handles a path that carries no locale yet', () => {
    expect(switchLocale('/', 'tr')).toBe('/tr')
    expect(switchLocale('/about', 'ar')).toBe('/ar/about')
  })

  it('produces one URL form, with no trailing slash', () => {
    for (const to of LOCALES) {
      expect(switchLocale('/en/about/', to)).toBe(`/${to}/about`)
      expect(switchLocale('/en/', to)).toBe(`/${to}`)
    }
  })
})
