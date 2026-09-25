// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import en from '@/messages/en.json'
import { THEME_STORAGE_KEY } from '@/lib/theme'

import { ThemeToggle } from '@/components/layout/ThemeToggle'

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

function renderToggle() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ThemeToggle />
    </NextIntlClientProvider>,
  )
}

const button = () => screen.getByRole('button', { name: 'Dark mode' })

beforeEach(() => {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ThemeToggle', () => {
  describe('aria-pressed', () => {
    it('reports the system preference when nothing has been chosen', () => {
      mockMatchMedia(true)
      renderToggle()

      expect(button()).toHaveAttribute('aria-pressed', 'true')
    })

    it('reports light when the system prefers light', () => {
      renderToggle()

      expect(button()).toHaveAttribute('aria-pressed', 'false')
    })

    it('reports the explicit choice over the system preference', () => {
      mockMatchMedia(true)
      document.documentElement.dataset.theme = 'light'
      renderToggle()

      expect(button()).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('toggling', () => {
    it('switches the document and the reported state together', async () => {
      const user = userEvent.setup()
      renderToggle()

      await user.click(button())

      expect(document.documentElement.dataset.theme).toBe('dark')
      expect(button()).toHaveAttribute('aria-pressed', 'true')

      await user.click(button())

      expect(document.documentElement.dataset.theme).toBe('light')
      expect(button()).toHaveAttribute('aria-pressed', 'false')
    })

    it('persists the choice so it survives a reload', async () => {
      const user = userEvent.setup()
      renderToggle()

      await user.click(button())

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('still applies the choice when storage is unavailable', async () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new DOMException('blocked', 'SecurityError')
        },
        setItem: () => {
          throw new DOMException('blocked', 'SecurityError')
        },
      })

      const user = userEvent.setup()
      renderToggle()

      await user.click(button())

      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('is operable from the keyboard', async () => {
      const user = userEvent.setup()
      renderToggle()

      await user.tab()
      expect(button()).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  /**
   * The label is deliberately constant. A button whose text changes between
   * server render and hydration flickers, and a flicker in the header is a
   * layout shift (SRS P-02). State is carried by aria-pressed, which is what
   * A-12 asks for anyway.
   */
  it('keeps the same label in both states', async () => {
    const user = userEvent.setup()
    renderToggle()

    const before = button().textContent
    await user.click(button())

    expect(button().textContent).toBe(before)
  })
})
