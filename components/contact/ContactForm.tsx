'use client'

import { useTranslations } from 'next-intl'
import { useId, useRef, useState } from 'react'

import {
  HONEYPOT_FIELD,
  MESSAGE_MAX,
  NAME_MAX,
  isValid,
  validateContact,
  type ContactErrors,
} from '@/lib/contact/validation'

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'rateLimited'

/**
 * The contact form (F-40 … F-45, SRS C-01 … C-08).
 *
 * No CAPTCHA. It costs INP and it costs accessibility, and both are gates
 * (SRS C-03). A honeypot and a rate limit stop the traffic a personal site
 * actually gets.
 */
export function ContactForm() {
  const t = useTranslations('contact.form')
  const ids = useId()
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const statusRef = useRef<HTMLDivElement>(null)

  const fieldId = (name: string) => `${ids}-${name}`
  const errorId = (name: string) => `${ids}-${name}-error`

  /**
   * FormData.get returns string | File | null, so each value is narrowed
   * rather than coerced — String(File) is "[object File]", which would sail
   * through validation as a non-empty name.
   */
  function field(data: FormData, name: string): string {
    const value = data.get(name)
    return typeof value === 'string' ? value : ''
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Captured before the first await. React nulls currentTarget once the
    // handler returns, so reading it after the fetch would throw — the reset
    // below is the only thing that touches the form afterwards.
    const form = event.currentTarget
    const data = new FormData(form)
    const input = {
      name: field(data, 'name'),
      email: field(data, 'email'),
      message: field(data, 'message'),
    }

    // UX only. The server runs the same check and is the one that decides.
    const found = validateContact(input)
    setErrors(found)

    if (!isValid(found)) {
      setStatus('idle')
      return
    }

    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          [HONEYPOT_FIELD]: field(data, HONEYPOT_FIELD),
        }),
      })

      if (response.ok) {
        setStatus('sent')
        form.reset()
        return
      }

      setStatus(response.status === 429 ? 'rateLimited' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  const message =
    status === 'sent'
      ? t('success')
      : status === 'rateLimited'
        ? t('rateLimited')
        : status === 'failed'
          ? t('error')
          : ''

  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
      noValidate
      className="mt-6 max-w-lg"
    >
      <div className="space-y-4">
        <Field
          id={fieldId('name')}
          errorId={errorId('name')}
          name="name"
          label={t('name')}
          error={errors.name && t(errors.name)}
          maxLength={NAME_MAX}
          autoComplete="name"
        />
        <Field
          id={fieldId('email')}
          errorId={errorId('email')}
          name="email"
          type="email"
          label={t('email')}
          error={errors.email && t(errors.email)}
          autoComplete="email"
          dir="ltr"
        />
        <Field
          id={fieldId('message')}
          errorId={errorId('message')}
          name="message"
          label={t('message')}
          error={errors.message && t(errors.message)}
          maxLength={MESSAGE_MAX}
          multiline
        />
      </div>

      {/* The honeypot. Hidden from sight and from assistive technology, and
          out of the tab order, so nobody using the form can reach it. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor={fieldId(HONEYPOT_FIELD)}>Company</label>
        <input
          id={fieldId(HONEYPOT_FIELD)}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        aria-busy={status === 'sending'}
        className="bg-accent hover:bg-accent-hover focus-visible:outline-accent mt-6 rounded-md px-4 py-2 font-medium text-accent-fg disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {status === 'sending' ? t('sending') : t('send')}
      </button>

      {/* Present from first render with a floor under it, so the page does not
          move when a message appears (SRS P-02). aria-live announces the
          result without moving focus (SRS A-08). */}
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        className="mt-4 min-h-12 text-sm"
        data-state={status}
      >
        {message !== '' && (
          <p className={status === 'sent' ? 'text-accent' : undefined}>{message}</p>
        )}
      </div>
    </form>
  )
}

interface FieldProps {
  id: string
  errorId: string
  name: string
  label: string
  error?: string
  type?: string
  maxLength?: number
  multiline?: boolean
  autoComplete?: string
  dir?: 'ltr'
}

/**
 * Every input has a real label element, and its error is tied to it with
 * aria-describedby rather than sitting nearby and hoping (SRS A-07).
 */
function Field({
  id,
  errorId,
  name,
  label,
  error,
  type = 'text',
  maxLength,
  multiline = false,
  autoComplete,
  dir,
}: FieldProps) {
  const shared = {
    id,
    name,
    dir,
    maxLength,
    autoComplete,
    required: true,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className:
      'border-control bg-bg focus-visible:outline-accent mt-1 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 aria-[invalid=true]:border-danger',
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {multiline ? <textarea {...shared} rows={6} /> : <input {...shared} type={type} />}
      {/* Reserved so an error appearing does not push the next field down. */}
      <p id={errorId} className="text-danger min-h-5 text-sm">
        {error}
      </p>
    </div>
  )
}
