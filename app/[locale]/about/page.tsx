import type { Metadata } from 'next'
import Image from 'next/image'

import portrait from '@/assets/zeyad-alnahdi.webp'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CV_LANGUAGE, cvPath, cvSizeKb, hasCv } from '@/lib/cv'
import { LOCALES, isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/seo/JsonLd'
import { ScrollReveal } from '@/components/home/ScrollReveal'
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
      <ScrollReveal />
      <main
        id="content"
        className="mx-auto w-full max-w-[1280px] px-6 py-16 text-start sm:px-10 lg:py-24"
      >
        <header className="max-w-3xl" data-reveal>
          <h1 className="text-[length:var(--text-title)] font-bold tracking-[-0.025em]">
            {t('heading')}
          </h1>
          <p className="text-muted mt-5 text-[length:var(--text-lead)] leading-relaxed">
            {t('intro')}
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
          {/*
            The portrait comes first in the DOM and is then placed into the
            second column explicitly. Both halves of that matter:

            - first in the DOM, so the single-column layout reads heading →
              lead → portrait → prose rather than burying the photograph under
              every section;
            - `col-start-2`, so on wide screens it sits at the *end* of the
              inline axis. That is the right-hand side in English and Turkish
              and the left-hand side in Arabic, which is the requested layout
              in both directions from one set of classes — no duplicated
              markup and no direction hardcoded anywhere.
          */}
          <div className="lg:col-start-2 lg:row-start-1">
            {/* Sticky inside its own grid column, not fixed to the viewport:
              the column is as tall as the prose beside it, so the portrait
              travels with the reader and stops on its own when the row ends.
              top-20 is the 62px header plus breathing room, the same offset
              as the page's scroll-padding, so it never slides underneath. */}
            <div className="lg:sticky lg:top-20">
              <div className="border-subtle bg-raised shadow-card rounded-2xl border p-2">
                {/*
                  The aspect ratio reserves the box before the file arrives, so
                  the portrait cannot shift the page as it loads (SRS P-02).
                  The source is a phone portrait, far taller than any frame
                  worth giving it, so it is cropped by object-fit rather than
                  squashed. The vertical bias is tuned to the photograph: it
                  trims the canopy above and keeps the face near the frame's
                  optical centre.

                  Imported rather than referenced by path from /public. Both
                  serve the same bytes, but an import makes the filename a
                  content hash, so replacing the photograph changes the URL.
                  Under the old /public path the URL was fixed and the
                  optimiser's `max-age=14400` meant a swapped photo kept
                  showing the previous one for four hours — which is exactly
                  what happened the first time this image was replaced.
                */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={portrait}
                    /* The person the page is about. Their name is the whole
                       description a portrait needs; anything longer here
                       would be keyword padding in an attribute no reader
                       sees. */
                    alt="Zeyad Alnahdi"
                    fill
                    sizes="(min-width: 1024px) 20rem, 100vw"
                    /* Measured, not assumed: with the portrait at this size
                      it *is* the LCP element on /about — every locale, both
                      1440x900 and 390x844. An LCP image that the browser
                      discovers late is the worst case for the metric, so it
                      is preloaded rather than lazy. See the note to the owner
                      about T-302, which recorded LCP as text on every route
                      and is no longer true for this one. */
                    priority
                    className="object-cover object-[50%_40%]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-1">
            <section aria-labelledby="learning-heading" data-reveal>
              <h2
                id="learning-heading"
                className="text-muted font-mono text-[0.8125rem] font-medium tracking-[0.12em] uppercase"
              >
                {t('learningHeading')}
              </h2>
              {learning.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>

            <section
              aria-labelledby="since-heading"
              className="border-subtle mt-12 border-t pt-12"
              data-reveal
            >
              <h2
                id="since-heading"
                className="text-muted font-mono text-[0.8125rem] font-medium tracking-[0.12em] uppercase"
              >
                {t('sinceHeading')}
              </h2>
              {since.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>

            <section
              aria-labelledby="looking-heading"
              className="border-subtle mt-12 border-t pt-12"
              data-reveal
            >
              <h2
                id="looking-heading"
                className="text-muted font-mono text-[0.8125rem] font-medium tracking-[0.12em] uppercase"
              >
                {t('lookingHeading')}
              </h2>
              <p className="mt-4 leading-relaxed">{t('looking')}</p>
            </section>

            {/* docs/05-ia-url-map.md §4.2. About is where a reader decides
            whether to keep going; the only thing worth offering them next is
            the work itself. */}
            {hasRoute('/projects') && (
              <p className="mt-12">
                <Link
                  href={`/${locale}/projects`}
                  className="text-accent hover:text-accent-hover focus-visible:outline-accent decoration-accent/40 hover:decoration-accent rounded-xs font-medium underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t('seeProjects')}
                </Link>
              </p>
            )}

            {/* Rendered only once the file exists (T-206). */}
            {hasCv() && (
              <section
                aria-labelledby="cv-heading"
                className="border-subtle mt-12 border-t pt-12"
                data-reveal
              >
                <h2
                  id="cv-heading"
                  className="text-muted font-mono text-[0.8125rem] font-medium tracking-[0.12em] uppercase"
                >
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
                    className="border-subtle bg-raised shadow-card hover:border-accent hover:text-accent hover:shadow-lift focus-visible:outline-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-[box-shadow,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {t('cvDownload')} · <span dir="ltr">{cvSizeKb()} KB</span>
                  </a>
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
