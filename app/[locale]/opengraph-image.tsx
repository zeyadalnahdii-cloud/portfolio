import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { LOCALES, LOCALE_DIRECTION, isLocale, type Locale } from '@/lib/i18n/config'

export const alt = 'Zeyad Alnahdi — Backend & Desktop Application Developer'
// SRS M-08: Open Graph cards are 1200x630.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * SPIKE — throwaway (task T-105, deleted in T-106).
 * Proves an Arabic OG card renders real glyphs in the right reading order.
 * Final copy and design land in T-217 against docs/06-mockups.md §4.
 */
const CARD: Record<Locale, { title: string; role: string; stack: string }> = {
  en: {
    title: 'Zeyad Alnahdi',
    role: 'Backend & Desktop Application Developer',
    stack: 'C# · ASP.NET Core · SQL Server',
  },
  tr: {
    title: 'Zeyad Alnahdi',
    role: 'Backend ve Masaüstü Uygulama Geliştirici',
    stack: 'C# · ASP.NET Core · SQL Server',
  },
  ar: {
    title: 'زياد النهدي',
    role: 'مطوّر باك اند وتطبيقات سطح المكتب',
    stack: 'C# · ASP.NET Core · SQL Server',
  },
}

/**
 * next/og does NOT inherit the application's fonts. Without an explicit font
 * buffer the Arabic card renders as tofu boxes and nothing warns you — the
 * failure only surfaces when somebody shares the link.
 *
 * .woff is read rather than .woff2 because satori cannot decode woff2.
 */
async function loadFont(pkg: string, file: string): Promise<ArrayBuffer> {
  const path = join(process.cwd(), 'node_modules', pkg, 'files', file)
  const buffer = await readFile(path)
  return Uint8Array.from(buffer).buffer
}

/**
 * satori shapes Arabic letterforms correctly but does not run the
 * bidirectional algorithm: it lays words out left to right, so
 * "زياد النهدي" renders as "النهدي زياد" — right letters, reversed reading
 * order. Unicode embedding controls (U+202B/U+202C) make it worse: satori
 * draws them as visible boxes and breaks the shaping of the next word.
 *
 * So the reordering is done as layout. Each word is a flex item in a
 * row-reverse container, which puts the first word at the inline-end edge.
 * Source strings stay natural, which is what matters for whoever writes and
 * reviews the translations.
 */
function RtlLine({ text, style }: { text: string; style: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '0.28em', ...style }}>
      {text.split(' ').map((word, index) => (
        <span key={index}>{word}</span>
      ))}
    </div>
  )
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'en'
  const isArabic = locale === 'ar'
  const card = CARD[locale]

  const [latin, arabic] = await Promise.all([
    loadFont('@fontsource/inter', 'inter-latin-700-normal.woff'),
    loadFont('@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-700-normal.woff'),
  ])

  const titleStyle = { fontSize: 64, fontWeight: 700 }
  const roleStyle = { fontSize: 36, color: '#9198a1', marginTop: 16 }

  return new ImageResponse(
    (
      <div
        lang={locale}
        dir={LOCALE_DIRECTION[locale]}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // satori sizes flex children to their content, so `textAlign` has
          // nothing to align inside. Alignment has to come from the container.
          alignItems: isArabic ? 'flex-end' : 'flex-start',
          backgroundColor: '#0d1117',
          color: '#e6edf3',
          padding: '80px',
          fontFamily: isArabic ? 'Plex Arabic' : 'Inter',
        }}
      >
        {isArabic ? (
          <RtlLine text={card.title} style={titleStyle} />
        ) : (
          <div style={titleStyle}>{card.title}</div>
        )}

        {isArabic ? (
          <RtlLine text={card.role} style={roleStyle} />
        ) : (
          <div style={roleStyle}>{card.role}</div>
        )}

        <div style={{ width: 120, height: 6, backgroundColor: '#4493f8', marginTop: 40 }} />

        {/* The stack line is Latin in every locale, so it keeps Inter and ltr
            even inside the Arabic card. */}
        <div dir="ltr" style={{ fontSize: 28, marginTop: 40, fontFamily: 'Inter' }}>
          {card.stack}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: latin, weight: 700, style: 'normal' },
        { name: 'Plex Arabic', data: arabic, weight: 700, style: 'normal' },
      ],
    },
  )
}
