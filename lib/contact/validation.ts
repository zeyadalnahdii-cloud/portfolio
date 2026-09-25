export const NAME_MAX = 100
export const MESSAGE_MAX = 2000

/** The field a person never sees and a bot fills in (C-03). */
export const HONEYPOT_FIELD = 'company'

export type FieldError = 'required' | 'invalidEmail' | 'tooLong'

export interface ContactInput {
  name: string
  email: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactInput, FieldError>>

/**
 * Deliberately permissive. Anything stricter rejects addresses that work —
 * plus-tags, new TLDs, unicode local parts — and the only way to truly
 * validate an address is to send to it.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The same function runs in the browser and on the server, but only the server
 * result is trusted (SRS C-02). Client-side validation is there so the visitor
 * hears about a mistake before a round trip; it is not the boundary, because
 * nothing stops a request being made without it.
 */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {}

  const name = input.name.trim()
  const email = input.email.trim()
  const message = input.message.trim()

  if (name === '') errors.name = 'required'
  else if (name.length > NAME_MAX) errors.name = 'tooLong'

  if (email === '') errors.email = 'required'
  else if (!EMAIL.test(email)) errors.email = 'invalidEmail'

  if (message === '') errors.message = 'required'
  else if (message.length > MESSAGE_MAX) errors.message = 'tooLong'

  return errors
}

export function isValid(errors: ContactErrors): boolean {
  return Object.keys(errors).length === 0
}
