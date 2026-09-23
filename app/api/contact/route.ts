import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import { rateLimit } from '@/lib/contact/rate-limit'
import { HONEYPOT_FIELD, isValid, validateContact } from '@/lib/contact/validation'

/**
 * The contact handler (SRS C-01 … C-08).
 *
 * Deliberately a route handler rather than logic inside the page. This is the
 * one part of the site that cannot be static, and keeping it here means the
 * twelve pages stay prerendered — if the contact *page* went dynamic, the
 * performance budget would go with it.
 */
export const runtime = 'nodejs'

interface Payload {
  name?: unknown
  email?: unknown
  message?: unknown
  [HONEYPOT_FIELD]?: unknown
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/**
 * Vercel puts the client address in x-forwarded-for; the first entry is the
 * client, the rest are proxies. Falls back to a constant so a missing header
 * shares one bucket rather than bypassing the limit entirely.
 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: Payload

  try {
    payload = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 })
  }

  // Honeypot. A person never sees this field, so anything in it came from
  // something filling the form by shape rather than by reading it. Answering
  // 200 rather than an error keeps the bot from learning it was detected.
  if (asString(payload[HONEYPOT_FIELD]).trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const { allowed, retryAfter } = rateLimit(clientIp(request))

  if (!allowed) {
    return NextResponse.json(
      { ok: false, reason: 'rateLimited' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const input = {
    name: asString(payload.name),
    email: asString(payload.email),
    message: asString(payload.message),
  }

  // The boundary. The browser runs the same check, but nothing obliges a
  // request to have come from the browser (SRS C-02).
  const errors = validateContact(input)

  if (!isValid(errors)) {
    return NextResponse.json({ ok: false, reason: 'invalid', errors }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  // Credentials never live in the repository (SRS C-05). Missing configuration
  // is reported as a server error rather than silently dropping the message,
  // so a misconfigured deploy is visible instead of quietly losing mail.
  if (!apiKey || !to || !from) {
    console.error(
      'Contact form is not configured: RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is missing',
    )
    return NextResponse.json({ ok: false, reason: 'unconfigured' }, { status: 500 })
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: input.email.trim(),
      subject: `Portfolio contact — ${input.name.trim()}`,
      text: `From: ${input.name.trim()} <${input.email.trim()}>\n\n${input.message.trim()}`,
    })

    if (error) {
      console.error('Resend rejected the message:', error)
      return NextResponse.json({ ok: false, reason: 'send' }, { status: 502 })
    }
  } catch (cause) {
    console.error('Sending the message threw:', cause)
    return NextResponse.json({ ok: false, reason: 'send' }, { status: 502 })
  }

  // Nothing is persisted beyond delivery (SRS C-08).
  return NextResponse.json({ ok: true })
}
