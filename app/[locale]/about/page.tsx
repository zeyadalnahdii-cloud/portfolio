import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CV_LANGUAGE, cvPath, cvSizeKb, hasCv } from '@/lib/cv'
import { LOCALES, isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata } from '@/lib/seo/metadata'
import { hasRoute } from '@/lib/seo/routes'

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
 * The page is the engineering path and nothing else: how the work was learned,
 * what has been built since, and what is being looked for. Sections take their
 * paragraphs from arrays, so a locale writes as many as its copy needs.
 */
export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('about')

  // Paragraph arrays come from the typed registry rather than t.raw(), which
  // returns unknown. Each locale sets its own paragraph count: the Arabic copy
  // runs to two where the English runs to one, and neither is padded to match
  // the other.
  const { learning, since } = getMessages(locale).about

  return (
    <>
      <JsonLd locale={locale} page={'/about'} />
      <main id="content" className="mx-auto w-full max-w-3xl px-4 py-16 text-start">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heading')}</h1>
        <p className="mt-6 leading-relaxed">{t('intro')}</p>

        <section aria-labelledby="learning-heading" className="mt-12">
          <h2 id="learning-heading" className="text-lg font-semibold">
            {t('learningHeading')}
          </h2>
          {learning.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>

        <section aria-labelledby="since-heading" className="mt-10">
          <h2 id="since-heading" className="text-lg font-semibold">
            {t('sinceHeading')}
          </h2>
          {since.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>

        <section aria-labelledby="looking-heading" className="mt-10">
          <h2 id="looking-heading" className="text-lg font-semibold">
            {t('lookingHeading')}
          </h2>
          <p className="mt-3 leading-relaxed">{t('looking')}</p>
        </section>

        {/* docs/05-ia-url-map.md §4.2. About is where a reader decides
          whether to keep going; the only thing worth offering them next is
          the work itself. */}
        {hasRoute('/projects') && (
          <p className="mt-10">
            <Link
              href={`/${locale}/projects`}
              className="text-accent hover:text-accent-hover focus-visible:outline-accent rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t('seeProjects')}
            </Link>
          </p>
        )}

        {/* Rendered only once the file exists (T-206). */}
        {hasCv() && (
          <section aria-labelledby="cv-heading" className="mt-10">
            <h2 id="cv-heading" className="text-lg font-semibold">
              {t('cvHeading')}
            </h2>
            <p className="mt-3">
              {/* F-34 wants the format and size in the link text, so nobody
                clicks a download blind. The format is in the localised label;
                the size is measured from the file at build time.

                hreflang says the document is English whatever the page
                language is — one CV serves all three locales by decision
                (T-206), and this is where that is stated to a machine. The
                size stays in Western numerals even in Arabic
                (docs/06-mockups.md §3). */}
              <a
                href={cvPath()}
                download
                hrefLang={CV_LANGUAGE}
                type="application/pdf"
                className="border-subtle hover:border-accent hover:text-accent focus-visible:outline-accent inline-block rounded-md border px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t('cvDownload')} · <span dir="ltr">{cvSizeKb()} KB</span>
              </a>
            </p>
          </section>
        )}
      </main>
    </>
  )
}
