import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from 'next/font/google'

import { LOCALES, LOCALE_DIRECTION, isLocale } from '@/lib/i18n/config'
import { buildSchema, serialiseSchema } from '@/lib/seo/schema'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { THEME_SCRIPT } from '@/lib/theme'

import '../globals.css'

/**
 * Fonts per docs/06-mockups.md §1.2, self-hosted by next/font with
 * `display: swap` (SRS P-08).
 *
 * The two sans faces deliberately share one CSS variable name. Only the
 * className for the active locale is applied, so exactly one definition ever
 * lands and the rest of the stylesheet does not care which.
 *
 * `latin-ext` is not optional for Turkish: the plain `latin` subset has no
 * `ı ğ ş ç ö ü`, so "Hakkımda" and "İletişim" would render those letters from
 * a fallback face — visible to a Turkish reader and to nobody else.
 *
 * `preload: false` is what implements SRS P-09. next/font preloads at module
 * scope, which cannot be made conditional per request, so preloading both
 * faces would fetch the whole Arabic glyph range for every English visitor —
 * the expensive mistake 06 §1.2 names. Without it the browser fetches a face
 * only when something on the page actually uses it.
 */
const latinSans = Inter({
  variable: '--font-app-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: false,
})

const arabicSans = IBM_Plex_Sans_Arabic({
  variable: '--font-app-sans',
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: false,
})

const mono = JetBrains_Mono({
  variable: '--font-app-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

/**
 * SRS I-01/I-02: exactly these three locales, each a real static route.
 * With `dynamicParams = false`, anything else is a genuine 404 rather than a
 * fallback render.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const dynamicParams = false

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  // Required for static rendering: without it every route opts into dynamic.
  setRequestLocale(locale)

  return (
    // SRS I-05, I-06
    <html
      lang={locale}
      dir={LOCALE_DIRECTION[locale]}
      className={`${locale === 'ar' ? arabicSans.variable : latinSans.variable} ${mono.variable} h-full antialiased`}
      // The inline script below sets data-theme before React hydrates, so the
      // server markup and the live DOM legitimately differ on this element.
      suppressHydrationWarning
    >
      <head>
        {/* Blocking and inline on purpose: applying the stored theme in an
            effect paints the wrong colours first and repaints, which costs
            LCP and CLS as well as looking broken (SRS P-02). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* SRS S-01, S-02. Rendered in the layout so the Person and WebSite
            entities appear on every route with the same @id, which is what
            lets a crawler resolve one entity rather than one per page. */}
        <script
          type="application/ld+json"
          // The payload is escaped in serialiseSchema.
          dangerouslySetInnerHTML={{ __html: serialiseSchema(buildSchema(locale)) }}
        />
        <NextIntlClientProvider>
          <SkipLink />
          <SiteHeader locale={locale} />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
