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
  // Which fields the visitor has finished with. Nothing is marked wrong
  // before they have had a go at it.
  const [touched, setTouched] = useState<Record<string, boolean>>({})
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

  /**
   * ui-ux-pro-max `inline-validation`: validate on blur, not on keystroke,
   * and only once the visitor has finished with the field.
   *
   * An untouched empty field stays silent — tabbing through a blank form
   * should not paint it red — so a field speaks up on blur only if something
   * was typed into it, or if a submit has already marked everything touched.
   * The same rule clears an error the moment the value becomes valid.
   */
  function revalidate(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = event.currentTarget
    const form = target.form
    if (!form) return

    const name = target.name
    if (name !== 'name' && name !== 'email' && name !== 'message') return
    if (!touched[name] && target.value === '') return

    setTouched((previous) => ({ ...previous, [name]: true }))

    const data = new FormData(form)
    const found = validateContact({
      name: field(data, 'name'),
      email: field(data, 'email'),
      message: field(data, 'message'),
    })
    setErrors((previous) => ({ ...previous, [name]: found[name] }))
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
    setTouched({ name: true, email: true, message: true })

    if (!isValid(found)) {
      setStatus('idle')
      // ui-ux-pro-max `focus-management`: after a failed submit, focus the
      // error summary — or, where there is none, the first invalid field.
      // There is no summary here because no reviewed copy exists for one
      // (contact.form.errorSummary is the send-failure message, not a list
      // of field problems), so this takes the second branch. Without it a
      // keyboard or screen-reader user is left at the submit button with the
      // errors somewhere above them.
      const firstInvalid = (['name', 'email', 'message'] as const).find((key) => found[key])
      if (firstInvalid) form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
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
      className="w-full"
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
          onBlur={revalidate}
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
          onBlur={revalidate}
        />
        <Field
          id={fieldId('message')}
          errorId={errorId('message')}
          name="message"
          label={t('message')}
          error={errors.message && t(errors.message)}
          maxLength={MESSAGE_MAX}
          multiline
          onBlur={revalidate}
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
        // Not dimmed while submitting. disabled:opacity-60 composited the whole
        // button over the page and dropped the label far under A-03's 4.5
        // when the fill was the accent (2.57:1 light, 2.93:1 dark — T-308).
        // The fill is darker now and the trap is the same: only 95% or more
        // stays legible, which is indistinguishable from none — so the state is
        // signalled by the label changing to "Sending…", aria-busy, the cursor,
        // and the control genuinely being disabled, rather than by dimming the
        // one word the user needs to read.
        className="bg-solid hover:bg-solid-hover text-solid-fg focus-visible:outline-accent mt-7 w-full rounded-lg px-6 py-3 font-medium transition duration-[var(--dur-fast)] active:scale-[0.98] disabled:cursor-not-allowed sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2"
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
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
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
  onBlur,
}: FieldProps) {
  const shared = {
    id,
    name,
    dir,
    maxLength,
    autoComplete,
    onBlur,
    required: true,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className:
      'border-control bg-raised focus-visible:outline-accent focus-visible:border-accent aria-[invalid=true]:border-danger mt-1.5 w-full rounded-lg border px-3.5 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1',
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {multiline ? <textarea {...shared} rows={6} /> : <input {...shared} type={type} />}
      {/* Reserved so an error appearing does not push the next field down. */}
      <p id={errorId} className="text-danger mt-1.5 min-h-5 text-sm">
        {error}
      </p>
    </div>
  )
}
