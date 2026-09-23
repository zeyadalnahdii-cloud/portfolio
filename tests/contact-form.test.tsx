// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ContactForm } from '@/components/contact/ContactForm'
import en from '@/messages/en.json'

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ContactForm />
    </NextIntlClientProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Zeyad')
  await user.type(screen.getByLabelText('Email'), 'a@b.co')
  await user.type(screen.getByLabelText('Message'), 'Hello there')
}

describe('ContactForm', () => {
  it('reserves the status region before anything is submitted (P-02)', () => {
    renderForm()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('announces errors and ties them to their field (A-07, A-08)', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Send' }))

    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('This field is required.')
  })

  it('does not call the server when the client already knows it is invalid', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends a valid message and reports success without moving focus', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderForm()

    await fill(user)
    const button = screen.getByRole('button', { name: 'Send' })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('your message has arrived')
    })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  /** The bug the lint rule surfaced: currentTarget is null after the await. */
  it('clears the form after a successful send', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
    const user = userEvent.setup()
    renderForm()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('')
    })
  })

  it('reports a rate limit differently from a failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    const user = userEvent.setup()
    renderForm()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Too many messages')
    })
  })

  it('reports a network failure rather than appearing to succeed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const user = userEvent.setup()
    renderForm()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Something went wrong')
    })
  })
})
