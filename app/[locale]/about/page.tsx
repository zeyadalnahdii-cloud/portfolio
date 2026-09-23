import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { cvPath, hasCv } from '@/lib/cv'
import { LOCALES, isLocale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  setRequestLocale(locale)
  const t = await getTranslations('meta.about')

  return buildMetadata({
    locale,
    pathname: '/about',
    title: t('title'),
    description: t('description'),
  })
}

/**
 * About (F-30 … F-34, docs/06-mockups.md §2.4).
 *
 * The psychology section is one concrete example, not a career-change story
 * (docs/01-project-proposal.md §2). The headline of this site is the
 * engineering; the degree is an added capability and reads as one only if it
 * is tied to something specific.
 */
export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('about')

  return (
    <main id="content" className="mx-auto w-full max-w-3xl px-4 py-16 text-start">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heading')}</h1>
      <p className="mt-6 leading-relaxed">{t('intro')}</p>

      <section aria-labelledby="learning-heading" className="mt-12">
        <h2 id="learning-heading" className="text-lg font-semibold">
          {t('learningHeading')}
        </h2>
        <p className="mt-3 leading-relaxed">{t('learning')}</p>
      </section>

      <section aria-labelledby="psychology-heading" className="mt-10">
        <h2 id="psychology-heading" className="text-lg font-semibold">
          {t('psychologyHeading')}
        </h2>
        <p className="mt-3 leading-relaxed">{t('psychology')}</p>
      </section>

      <section aria-labelledby="looking-heading" className="mt-10">
        <h2 id="looking-heading" className="text-lg font-semibold">
          {t('lookingHeading')}
        </h2>
        <p className="mt-3 leading-relaxed">{t('looking')}</p>
      </section>

      {/* Rendered only once the file exists (T-206). */}
      {hasCv(locale) && (
        <section aria-labelledby="cv-heading" className="mt-10">
          <h2 id="cv-heading" className="text-lg font-semibold">
            {t('cvHeading')}
          </h2>
          <p className="mt-3">
            <a
              href={cvPath(locale)}
              download
              className="border-subtle hover:border-accent hover:text-accent focus-visible:outline-accent inline-block rounded-md border px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t('cvDownload')}
            </a>
          </p>
        </section>
      )}
    </main>
  )
}
