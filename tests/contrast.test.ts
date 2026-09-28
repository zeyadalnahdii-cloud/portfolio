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
  light: block(":root[data-theme='light']"),
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
  // --raised and --tile are the two surfaces most of the site's boxes are
  // actually painted with, and neither was covered here until now.
  ['body text on raised', '--fg', '--raised', 4.5],
  ['muted text on raised', '--fg-muted', '--raised', 4.5],
  ['link on raised', '--accent', '--raised', 4.5],
  ['body text on raised hover', '--fg', '--raised-hover', 4.5],
  ['muted text on raised hover', '--fg-muted', '--raised-hover', 4.5],
  ['link on raised hover', '--accent', '--raised-hover', 4.5],
  ['error text on raised', '--danger', '--raised', 4.5],
  ['body text on tile', '--fg', '--tile', 4.5],
  ['muted text on tile', '--fg-muted', '--tile', 4.5],
  ['link on tile', '--accent', '--tile', 4.5],
  // Hover is a state a reader reads in, so it carries the same floor.
  ['body text on tile hover', '--fg', '--tile-hover', 4.5],
  ['muted text on tile hover', '--fg-muted', '--tile-hover', 4.5],
  ['link on tile hover', '--accent', '--tile-hover', 4.5],
  // The filled buttons, now dark-brown rather than accent-filled.
  ['solid button label', '--solid-fg', '--solid', 4.5],
  ['solid button label on hover', '--solid-fg', '--solid-hover', 4.5],
  // The console panels invert the page, so they get checked on their own.
  ['console text', '--terminal-fg', '--terminal', 4.5],
  ['console accent', '--terminal-accent', '--terminal', 4.5],
  ['console dim text', '--terminal-dim', '--terminal', 4.5],
  ['link hover on page', '--accent-hover', '--bg', 4.5],
  // --accent no longer fills a button — it is links, labels and focus rings —
  // but the pair is kept: anything later painted on the accent inherits it.
  ['label on accent', '--accent-fg', '--accent', 4.5],
  ['label on accent hover', '--accent-fg', '--accent-hover', 4.5],
  ['error text on page', '--danger', '--bg', 4.5],
  ['error text on card', '--danger', '--surface', 4.5],
  // WCAG 1.4.11: an empty input is identifiable only by its border.
  ['form control border on page', '--border-control', '--bg', 3],
  // A-05: the focus ring must be perceivable against what it sits on.
  ['focus ring on page', '--accent', '--bg', 3],
  ['focus ring on card', '--accent', '--surface', 3],
  ['focus ring on raised', '--accent', '--raised', 3],
  ['focus ring on tile', '--accent', '--tile', 3],
  ['invalid field border', '--danger', '--bg', 3],
  // T-308: the submit button while sending. It is no longer dimmed, so the
  // ratio is the token ratio — this pins that it stays that way. It follows
  // the button's actual fill, which is now --solid, not --accent.
  ['submit label while disabled', '--solid-fg', '--solid', 4.5],
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
 * The system preference must not override the chosen default.
 *
 * There used to be two dark blocks — one for `prefers-color-scheme` and one for
 * the explicit choice — and this test kept them in step. The media query is
 * gone by design, so the invariant is now the opposite one: no rule may quietly
 * reintroduce automatic dark mode, because that would hand a visitor a theme
 * the site was not designed to open in.
 */
it('has no automatic dark mode', () => {
  // The rule, not the words — the comment above the palette explains why the
  // media query was removed, and that explanation should not fail the test.
  const withoutComments = CSS.replace(/\/\*[\s\S]*?\*\//g, '')

  expect(withoutComments).not.toMatch(/@media[^{]*prefers-color-scheme/)
  expect(withoutComments).toContain(":root[data-theme='dark']")
})
