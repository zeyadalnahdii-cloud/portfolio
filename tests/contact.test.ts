import { beforeEach, describe, expect, it } from 'vitest'

import { rateLimit, resetRateLimit } from '@/lib/contact/rate-limit'
import {
  MESSAGE_MAX,
  NAME_MAX,
  isValid,
  validateContact,
  type ContactInput,
} from '@/lib/contact/validation'

const GOOD: ContactInput = {
  name: 'Zeyad Alnahdi',
  email: 'someone@example.com',
  message: 'Hello, I would like to discuss a project.',
}

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(isValid(validateContact(GOOD))).toBe(true)
  })

  describe('required fields (C-01)', () => {
    it.each(['name', 'email', 'message'] as const)('rejects an empty %s', (field) => {
      expect(validateContact({ ...GOOD, [field]: '' })[field]).toBe('required')
    })

    it('treats whitespace as empty, so a space is not a name', () => {
      expect(validateContact({ ...GOOD, name: '   ' }).name).toBe('required')
    })
  })

  describe('email', () => {
    it.each(['someone@example.com', 'first+tag@sub.example.co.uk', 'a@b.co'])(
      'accepts %s',
      (email) => {
        expect(validateContact({ ...GOOD, email }).email).toBeUndefined()
      },
    )

    it.each(['someone', 'someone@', '@example.com', 'someone@example', 'a b@example.com'])(
      'rejects %s',
      (email) => {
        expect(validateContact({ ...GOOD, email }).email).toBe('invalidEmail')
      },
    )
  })

  describe('length limits', () => {
    it('accepts values exactly at the limit', () => {
      const errors = validateContact({
        ...GOOD,
        name: 'x'.repeat(NAME_MAX),
        message: 'x'.repeat(MESSAGE_MAX),
      })

      expect(isValid(errors)).toBe(true)
    })

    it('rejects a name over the limit', () => {
      expect(validateContact({ ...GOOD, name: 'x'.repeat(NAME_MAX + 1) }).name).toBe('tooLong')
    })

    it('rejects a message over the limit', () => {
      expect(validateContact({ ...GOOD, message: 'x'.repeat(MESSAGE_MAX + 1) }).message).toBe(
        'tooLong',
      )
    })
  })

  it('reports every problem at once, not the first one', () => {
    const errors = validateContact({ name: '', email: 'nope', message: '' })

    expect(errors).toEqual({ name: 'required', email: 'invalidEmail', message: 'required' })
  })
})

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  it('allows the first few requests from an address', () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(rateLimit('203.0.113.1').allowed).toBe(true)
    }
  })

  it('refuses the next one and says how long to wait', () => {
    for (let attempt = 0; attempt < 3; attempt += 1) rateLimit('203.0.113.1')

    const result = rateLimit('203.0.113.1')

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('counts each address separately, so one sender cannot block everyone', () => {
    for (let attempt = 0; attempt < 3; attempt += 1) rateLimit('203.0.113.1')

    expect(rateLimit('203.0.113.2').allowed).toBe(true)
  })

  it('forgets requests once the window has passed', () => {
    const start = Date.now()
    for (let attempt = 0; attempt < 3; attempt += 1) rateLimit('203.0.113.1', start)

    expect(rateLimit('203.0.113.1', start).allowed).toBe(false)
    expect(rateLimit('203.0.113.1', start + 10 * 60 * 1000 + 1).allowed).toBe(true)
  })
})
