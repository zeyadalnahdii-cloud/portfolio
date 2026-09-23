// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { ThemeToggle } from '@/components/layout/ThemeToggle'
import en from '@/messages/en.json'

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ThemeToggle accessibility', () => {
  it('reports no axe violations', async () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ThemeToggle />
      </NextIntlClientProvider>,
    )

    const results = await axe(container)

    expect(results.violations).toEqual([])
  })
})
