import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * SRS A-03 — text contrast >= 4.5:1 in **both** themes — checked against the
 * tokens as they are written in app/globals.css.
 *
 * T-219 found two failures here that review had not: white on the accent fill
 * measured 3.10:1 in dark mode (both buttons on the site), and the error text
 * 3.96:1. Both themes were "checked" when the tokens were written; only the
 * dark half regressed, which is the failure mode docs/06-mockups.md §1.1 warns
 * about in so many words.
 *
 * Parsing the stylesheet rather than restating the hex values here is the
 * point: a test holding its own copy of the palette passes while the site
 * fails.
 */
const CSS = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8')

function block(selector: string): Record<string, string> {
  const start = CSS.indexOf(selector)
  if (start === -1) throw new Error(`no such selector in globals.css: ${selector}`)
  const open = CSS.indexOf('{', start)
  const close = CSS.indexOf('}', open)
  const tokens: Record<string, string> = {}
  for (const match of CSS.slice(open, close).matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})/gi)) {
    const [, name, value] = match
    if (name !== undefined && value !== undefined) tokens[name] = value
  }
  return tokens
}

const THEMES = {
  light: block(':root {'),
  dark: block(":root[data-theme='dark']"),
}

function luminance(hex: string): number {
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const n = parseInt(hex.slice(1), 16)
  return (
    0.2126 * channel((n >> 16) & 0xff) +
    0.7152 * channel((n >> 8) & 0xff) +
    0.0722 * channel(n & 0xff)
  )
}

function ratio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Absent is a failure, not `undefined` quietly flowing into the maths. */
function token(tokens: Record<string, string>, name: string): string {
  const value = tokens[name]
  if (value === undefined) throw new Error(`globals.css does not define ${name}`)
  return value
}

/** [label, foreground token, background token, minimum]. */
const PAIRS: ReadonlyArray<readonly [string, string, string, number]> = [
  ['body text on page', '--fg', '--bg', 4.5],
  ['body text on card', '--fg', '--surface', 4.5],
  ['muted text on page', '--fg-muted', '--bg', 4.5],
  ['muted text on card', '--fg-muted', '--surface', 4.5],
  ['link on page', '--accent', '--bg', 4.5],
  ['link on card', '--accent', '--surface', 4.5],
  ['link hover on page', '--accent-hover', '--bg', 4.5],
  // The two accent-filled buttons: the Home CTA and the form submit.
  ['button label on accent', '--accent-fg', '--accent', 4.5],
  ['button label on accent hover', '--accent-fg', '--accent-hover', 4.5],
  ['error text on page', '--danger', '--bg', 4.5],
  ['error text on card', '--danger', '--surface', 4.5],
  // WCAG 1.4.11: an empty input is identifiable only by its border.
  ['form control border on page', '--border-control', '--bg', 3],
  // A-05: the focus ring must be perceivable against what it sits on.
  ['focus ring on page', '--accent', '--bg', 3],
  ['focus ring on card', '--accent', '--surface', 3],
  ['invalid field border', '--danger', '--bg', 3],
  // T-308: the submit button while sending. It is no longer dimmed, so the
  // ratio is the token ratio — this pins that it stays that way.
  ['submit label while disabled', '--accent-fg', '--accent', 4.5],
]

describe.each(Object.entries(THEMES))('%s theme', (themeName, tokens) => {
  it('defines every token the pairs reference', () => {
    const missing = [...new Set(PAIRS.flatMap(([, fg, bg]) => [fg, bg]))].filter(
      (t) => !(t in tokens),
    )
    expect(missing, `${themeName} is missing tokens`).toEqual([])
  })

  it.each(PAIRS)('%s meets %s/%s at >= %f:1', (label, fg, bg, min) => {
    const from = token(tokens, fg)
    const on = token(tokens, bg)
    expect(
      Number(ratio(from, on).toFixed(2)),
      `${themeName}: ${label} — ${from} on ${on}`,
    ).toBeGreaterThanOrEqual(min)
  })
})

/**
 * The media-query dark block and the explicit [data-theme='dark'] block are
 * separate rules; a value fixed in one and not the other gives a site that is
 * accessible only to whoever toggled the theme by hand.
 */
it('keeps both dark blocks identical', () => {
  expect(block(":root:not([data-theme='light'])")).toEqual(block(":root[data-theme='dark']"))
})
