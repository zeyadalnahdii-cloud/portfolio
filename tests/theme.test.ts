// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  THEME_SCRIPT,
  THEME_STORAGE_KEY,
  applyTheme,
  isTheme,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
} from '@/lib/theme'

function mockMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: prefersDark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

/** Replaces localStorage with one that throws, as a privacy mode does. */
function breakStorage() {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    },
    setItem: () => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    },
  })
}

beforeEach(() => {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('isTheme', () => {
  it('accepts only the two real values', () => {
    expect(isTheme('light')).toBe(true)
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('system')).toBe(false)
    expect(isTheme(null)).toBe(false)
    expect(isTheme('')).toBe(false)
  })
})

describe('readStoredTheme', () => {
  it('returns a stored choice', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    expect(readStoredTheme()).toBe('dark')
  })

  it('returns null when nothing has been chosen', () => {
    expect(readStoredTheme()).toBeNull()
  })

  it('ignores a value that is not a theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse')

    expect(readStoredTheme()).toBeNull()
  })

  /**
   * localStorage does not merely come back empty when site data is blocked —
   * accessing it throws. An unguarded read takes the component down with it.
   */
  it('survives storage that throws on access', () => {
    breakStorage()

    expect(() => readStoredTheme()).not.toThrow()
    expect(readStoredTheme()).toBeNull()
  })
})

describe('writeStoredTheme', () => {
  it('persists the choice', () => {
    writeStoredTheme('light')

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('survives storage that throws, so the choice still applies to this page', () => {
    breakStorage()

    expect(() => {
      writeStoredTheme('dark')
    }).not.toThrow()
  })
})

describe('resolveTheme', () => {
  it('prefers an explicit choice on the document', () => {
    mockMatchMedia(true)
    applyTheme('light')

    expect(resolveTheme()).toBe('light')
  })

  it('falls back to the system preference when there is no explicit choice', () => {
    mockMatchMedia(true)

    expect(resolveTheme()).toBe('dark')

    mockMatchMedia(false)

    expect(resolveTheme()).toBe('light')
  })
})

describe('THEME_SCRIPT', () => {
  /**
   * The script is what prevents the flash, so it is executed here rather than
   * only inspected. Applying the theme in an effect instead would paint the
   * wrong colours first and repaint — visible, and a cost to LCP and CLS.
   */
  function run() {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const execute = new Function(THEME_SCRIPT) as () => void
    execute()
  }

  it('applies a stored choice to the document', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    run()

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('sets nothing when there is no stored choice, so the media query decides', () => {
    run()

    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('ignores a stored value that is not a theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dracula')

    run()

    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('does not throw when storage is unavailable', () => {
    breakStorage()

    expect(() => {
      run()
    }).not.toThrow()
  })
})
