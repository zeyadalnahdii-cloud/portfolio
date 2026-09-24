import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LOCALES, isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata } from '@/lib/seo/metadata'
import { hasRoute, projectAnchor } from '@/lib/seo/routes'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/projects'>): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  setRequestLocale(locale)
  const t = await getTranslations('meta.projects')

  return buildMetadata({
    locale,
    pathname: '/projects',
    title: t('title'),
    description: t('description'),
  })
}

/**
 * Projects (F-20 … F-23, docs/06-mockups.md §2.3).
 *
 * Every project renders the same rows in the same order, so a reader comparing
 * two entries finds scale where scale was last time. Consistency is the design
 * here: a recruiter scans rather than reads, and a card that rearranges itself
 * costs them the comparison.
 *
 * No repository links. D2/D3 resolved on 2026-09-23: both repositories stay
 * private, so there is nothing to link to. A link to a private repository is a
 * 404, which is worse than no link — it spends the visitor's click and returns
 * nothing.
 */
export default async function ProjectsPage({ params }: PageProps<'/[locale]/projects'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('projects')
  const { projects } = getMessages(locale)

  // The fixed row order. A project omits a row it has nothing to say for, but
  // never reorders the ones it has.
  const entries = [
    {
      ...projects.aiWorkspace,
      rows: [
        ['problem', projects.aiWorkspace.problem],
        ['architecture', projects.aiWorkspace.architecture],
        ['scale', projects.aiWorkspace.scale],
        ['result', projects.aiWorkspace.result],
        ['scope', projects.aiWorkspace.scope],
      ] as const,
    },
    {
      ...projects.restaurant,
      rows: [
        ['problem', projects.restaurant.problem],
        ['architecture', projects.restaurant.architecture],
        ['scale', projects.restaurant.scale],
        ['notable', projects.restaurant.notable],
      ] as const,
    },
  ]

  return (
    <>
      <JsonLd locale={locale} page={'/projects'} />
      <main id="content" className="mx-auto w-full max-w-3xl px-4 py-16 text-start">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heading')}</h1>
        <p className="mt-6 leading-relaxed">{t('intro')}</p>

        {entries.map((project) => (
          <article
            key={project.name}
            aria-labelledby={projectAnchor(project.name)}
            className="border-subtle mt-12 border-t pt-8"
          >
            {/* dir="ltr" on the heading itself would left-align it on the
              Arabic page: on a block element the attribute sets alignment, not
              just character order, and the title would detach from its
              right-aligned section. <bdi> isolates the Latin run's direction
              and leaves the block following the page (docs/06-mockups.md §3). */}
            <h2 id={projectAnchor(project.name)} className="text-xl font-semibold">
              <bdi>{project.name}</bdi>
            </h2>
            <p className="text-muted mt-1 text-sm">{project.status}</p>

            <dl className="mt-6 space-y-4">
              {project.rows.map(([label, value]) => (
                <div key={label} className="sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt className="text-muted text-sm font-medium">{t(`labels.${label}`)}</dt>
                  <dd className="mt-1 text-sm leading-relaxed sm:mt-0">{value}</dd>
                </div>
              ))}

              <div className="sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
                <dt className="text-muted text-sm font-medium">{t('labels.stack')}</dt>
                <dd className="mt-1 sm:mt-0">
                  <ul className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                    {project.stack.map((item) => (
                      <li
                        key={item}
                        className="border-subtle bg-surface rounded-md border px-2 py-1"
                        dir="ltr"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </article>
        ))}

        {/* docs/05-ia-url-map.md §4.2: Contact is the terminal node of every
          path, and this is the page a reader reaches it from. */}
        {hasRoute('/contact') && (
          <p className="border-subtle mt-12 border-t pt-8">
            {t('ctaLead')}{' '}
            <Link
              href={`/${locale}/contact`}
              className="text-accent hover:text-accent-hover focus-visible:outline-accent rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t('cta')}
            </Link>
          </p>
        )}
      </main>
    </>
  )
}
