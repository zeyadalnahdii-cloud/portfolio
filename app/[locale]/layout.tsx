import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'

import { LOCALES, LOCALE_DIRECTION, isLocale } from '@/lib/i18n/config'

import '../globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
