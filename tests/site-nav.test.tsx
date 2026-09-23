// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, describe, expect, it, vi } from 'vitest'

import en from '@/messages/en.json'

const pathname = vi.hoisted(() => ({ value: '/en' }))

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.value,
}))

const { SiteNav } = await import('@/components/layout/SiteNav')

function renderNav() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SiteNav locale="en" />
    </NextIntlClientProvider>,
  )
}

afterEach(() => {
  pathname.value = '/en'
})

describe('SiteNav', () => {
  it('marks the current page for assistive technology', () => {
    renderNav()

    const current = screen.getAllByRole('link', { name: 'Home' })
    expect(current[0]).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark a link that is not the current page', () => {
    pathname.value = '/en/about'
    renderNav()

    for (const link of screen.getAllByRole('link', { name: 'Home' })) {
      expect(link).not.toHaveAttribute('aria-current')
    }
  })

  describe('the mobile disclosure', () => {
    it('starts closed and says so', () => {
      renderNav()

      expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens on click and points at the list it controls', async () => {
      const user = userEvent.setup()
      renderNav()

      const button = screen.getByRole('button', { name: 'Menu' })
      await user.click(button)

      const toggle = screen.getByRole('button', { name: 'Close menu' })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      expect(toggle).toHaveAttribute('aria-controls', expect.any(String))
    })

    /**
     * SRS A-04. A menu that cannot be dismissed from the keyboard fails
     * outright, and returning focus to the trigger is the half people forget —
     * without it the user is dropped at the top of the document.
     */
    it('closes on Escape and returns focus to the button that opened it', async () => {
      const user = userEvent.setup()
      renderNav()

      const button = screen.getByRole('button', { name: 'Menu' })
      await user.click(button)
      expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
        'aria-expanded',
        'true',
      )

      await user.keyboard('{Escape}')

      const reopened = screen.getByRole('button', { name: 'Menu' })
      expect(reopened).toHaveAttribute('aria-expanded', 'false')
      expect(reopened).toHaveFocus()
    })

    /**
     * Tabs until the button has focus rather than assuming how many stops away
     * it is. The first version counted them, and broke the moment /about was
     * added to the navigation — the assertion was about the route count, not
     * about keyboard reachability.
     */
    it('is reachable by keyboard alone', async () => {
      const user = userEvent.setup()
      renderNav()

      const button = screen.getByRole('button', { name: 'Menu' })

      for (let stop = 0; stop < 20 && document.activeElement !== button; stop += 1) {
        await user.tab()
      }

      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
        'aria-expanded',
        'true',
      )
    })

    it('closes when a link inside it is chosen', async () => {
      const user = userEvent.setup()
      renderNav()

      await user.click(screen.getByRole('button', { name: 'Menu' }))
      const links = screen.getAllByRole('link', { name: 'Home' })
      await user.click(links[links.length - 1] as HTMLElement)

      expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
