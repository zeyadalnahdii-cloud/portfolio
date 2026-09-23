import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  setRequestLocale(locale)
  const t = await getTranslations('meta.home')

  // Everything else — canonical, hreflang, Open Graph, Twitter, robots — is
  // composed by buildMetadata. Routes pass copy and nothing more; a route that
  // writes its own canonical or alternates is how the set drifts.
  return buildMetadata({
    locale,
    pathname: '',
    title: t('title'),
    description: t('description'),
  })
}

/**
 * Placeholder. The real Home page is built in T-210 against
 * docs/06-mockups.md §2.2.
 */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)

  return (
    <main id="content" className="mx-auto max-w-3xl px-4 py-16 text-start">
      <h1 className="text-3xl font-bold">{locale}</h1>
    </main>
  )
}
