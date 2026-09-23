// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LOCALES, LOCALE_NATIVE_NAME, type Locale } from '@/lib/i18n/config'
import en from '@/messages/en.json'

const pathname = vi.hoisted(() => ({ value: '/en' }))

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.value,
}))

const { LanguageSwitcher } = await import('@/components/layout/LanguageSwitcher')

function renderSwitcher(locale: Locale, at: string) {
  pathname.value = at
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <LanguageSwitcher locale={locale} />
    </NextIntlClientProvider>,
  )
}

function linkFor(locale: Locale) {
  return screen.getByRole('link', { name: LOCALE_NATIVE_NAME[locale] })
}

afterEach(() => {
  pathname.value = '/en'
})

describe('LanguageSwitcher', () => {
  it('offers every locale', () => {
    renderSwitcher('en', '/en')

    for (const locale of LOCALES) {
      expect(linkFor(locale)).toBeInTheDocument()
    }
  })

  // The acceptance criterion, through the rendered component.
  it('keeps the visitor on the same page when switching', () => {
    renderSwitcher('tr', '/tr/projects')

    expect(linkFor('ar')).toHaveAttribute('href', '/ar/projects')
    expect(linkFor('en')).toHaveAttribute('href', '/en/projects')
  })

  it('does not send a deep page to the target locale home page', () => {
    renderSwitcher('en', '/en/about')

    for (const locale of LOCALES) {
      expect(linkFor(locale)).not.toHaveAttribute('href', `/${locale}`)
    }
  })

  describe('announcement', () => {
    /**
     * SRS A-11. Without `lang`, a screen reader reads "Türkçe" with English
     * phonetics — the one word a Turkish visitor is scanning for becomes the
     * hardest to recognise.
     */
    it('marks each option with the language of its own label', () => {
      renderSwitcher('en', '/en')

      for (const locale of LOCALES) {
        expect(linkFor(locale)).toHaveAttribute('lang', locale)
      }
    })

    it('declares the language of the page each option leads to', () => {
      renderSwitcher('en', '/en')

      for (const locale of LOCALES) {
        expect(linkFor(locale)).toHaveAttribute('hreflang', locale)
      }
    })

    it('names each option in its own language, not in the page language', () => {
      renderSwitcher('en', '/en')

      expect(linkFor('ar')).toHaveAccessibleName('العربية')
      expect(linkFor('tr')).toHaveAccessibleName('Türkçe')
    })
  })

  describe('current locale', () => {
    it('is marked, and only it', () => {
      renderSwitcher('ar', '/ar/about')

      expect(linkFor('ar')).toHaveAttribute('aria-current', 'true')
      expect(linkFor('en')).not.toHaveAttribute('aria-current')
      expect(linkFor('tr')).not.toHaveAttribute('aria-current')
    })
  })

  it('is reachable by keyboard alone', async () => {
    const user = userEvent.setup()
    renderSwitcher('en', '/en')

    await user.tab()

    expect(linkFor('en')).toHaveFocus()
  })
})
