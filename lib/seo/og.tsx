import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { LOCALE_DIRECTION, type Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'

import { ORIGIN } from './origin'
import type { SchemaPage } from './schema'

/** SRS M-08. */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/** Design tokens from docs/06-mockups.md §1.1, dark surface. */
const BG = '#0d1117'
const FG = '#e6edf3'
const MUTED = '#9198a1'
const ACCENT = '#4493f8'

/**
 * next/og does NOT inherit the application's fonts. Without an explicit font
 * buffer the Arabic card renders as tofu boxes and nothing warns you — the
 * failure surfaces only when somebody shares the link.
 *
 * `.woff`, not `.woff2`: satori cannot decode the latter, which is the format
 * font packages ship first (docs/11-spike-findings.md §2.1).
 */
async function loadFont(pkg: string, file: string): Promise<ArrayBuffer> {
  const buffer = await readFile(join(process.cwd(), 'node_modules', pkg, 'files', file))
  return Uint8Array.from(buffer).buffer
}

/**
 * satori shapes Arabic letterforms correctly but does not run the
 * bidirectional algorithm: it lays words out left to right, so
 * "زياد النهدي" renders as "النهدي زياد" — right letters, reversed reading
 * order. Unicode embedding controls (U+202B/U+202C) make it worse, drawing as
 * visible boxes and breaking the shaping of the next word.
 *
 * So the reordering is done as layout: one flex item per word in a row-reverse
 * container. Source strings stay natural, which is what matters for whoever
 * writes and reviews the translations (docs/11-spike-findings.md §2.3).
 *
 * This is the dangerous failure of the three. A card with the words reversed
 * looks polished to anyone who does not read Arabic — the script is beautiful
 * and correctly joined, and only the order is wrong.
 */
function Line({ text, rtl, style }: { text: string; rtl: boolean; style: React.CSSProperties }) {
  if (!rtl) {
    return <div style={style}>{text}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '0.28em', ...style }}>
      {text.split(' ').map((word, index) => (
        <span key={index}>{word}</span>
      ))}
    </div>
  )
}

interface Card {
  headline: string
  sub: string
}

/** What each route's card says. Real copy, from the message files. */
function card(locale: Locale, page: SchemaPage): Card {
  const m = getMessages(locale)

  switch (page) {
    case '/about':
      return { headline: m.about.heading, sub: `${m.home.name} — ${m.home.role}` }
    case '/projects':
      return { headline: m.projects.heading, sub: `${m.home.name} — ${m.home.role}` }
    case '/contact':
      return { headline: m.contact.heading, sub: `${m.home.name} — ${m.home.role}` }
    default:
      return { headline: m.home.name, sub: m.home.role }
  }
}

export function ogAlt(locale: Locale, page: SchemaPage): string {
  const { headline, sub } = card(locale, page)
  return `${headline} — ${sub}`
}

/**
 * The Open Graph card for one route (SRS M-08, docs/06-mockups.md §4).
 *
 * Alignment comes from the container's `alignItems`. `textAlign` does nothing
 * here: satori sizes flex children to their content, so there is no space
 * inside the element for text to align within (§2.2).
 */
export async function ogImage(locale: Locale, page: SchemaPage): Promise<ImageResponse> {
  const rtl = LOCALE_DIRECTION[locale] === 'rtl'
  const { headline, sub } = card(locale, page)
  const stack = 'C# · ASP.NET Core · SQL Server'
  const host = new URL(ORIGIN).host

  const [latin, arabic] = await Promise.all([
    loadFont('@fontsource/inter', 'inter-latin-700-normal.woff'),
    loadFont('@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-700-normal.woff'),
  ])

  return new ImageResponse(
    <div
      lang={locale}
      dir={LOCALE_DIRECTION[locale]}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: rtl ? 'flex-end' : 'flex-start',
        backgroundColor: BG,
        color: FG,
        padding: '80px',
        fontFamily: rtl ? 'Plex Arabic' : 'Inter',
      }}
    >
      <Line text={headline} rtl={rtl} style={{ fontSize: 64, fontWeight: 700 }} />
      <Line text={sub} rtl={rtl} style={{ fontSize: 34, color: MUTED, marginTop: 16 }} />

      <div style={{ width: 120, height: 6, backgroundColor: ACCENT, marginTop: 40 }} />

      {/* Latin in every locale, so it keeps Inter and ltr even on the
            Arabic card. */}
      <div dir="ltr" style={{ fontSize: 28, marginTop: 40, fontFamily: 'Inter' }}>
        {stack}
      </div>
      <div dir="ltr" style={{ fontSize: 22, marginTop: 12, color: MUTED, fontFamily: 'Inter' }}>
        {host}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Inter', data: latin, weight: 700, style: 'normal' },
        { name: 'Plex Arabic', data: arabic, weight: 700, style: 'normal' },
      ],
    },
  )
}
