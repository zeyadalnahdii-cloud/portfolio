import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata } from '@/lib/seo/metadata'
import { hasRoute, projectAnchor } from '@/lib/seo/routes'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  setRequestLocale(locale)
  const t = await getTranslations('meta.home')

  // Copy and nothing else. Canonical, hreflang, Open Graph, Twitter and robots
  // are all composed by buildMetadata; a route that writes its own is how the
  // set drifts.
  return buildMetadata({
    locale,
    pathname: '',
    title: t('title'),
    description: t('description'),
  })
}

/**
 * Home (F-10 … F-14, docs/06-mockups.md §2.2).
 *
 * No hero image, carousel or background video. Each is a direct LCP cost and
 * LCP is a gate (SRS P-01), so the largest element on this page is the h1 —
 * text, which paints as soon as the HTML does.
 */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('home')

  // Arrays come from the typed registry rather than t.raw(), which returns
  // unknown and would need a cast at every call site.
  const messages = getMessages(locale)
  const { build, stackGroups, process } = messages.home
  const projects = [messages.projects.aiWorkspace, messages.projects.restaurant]

  return (
    <>
      <JsonLd locale={locale} page={''} />
      <main id="content" className="mx-auto w-full max-w-3xl px-4 py-16 text-start">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('name')}</h1>
        <p className="text-accent mt-2 text-xl font-medium sm:text-2xl">{t('role')}</p>

        <p className="mt-6 leading-relaxed">{t('intro')}</p>
        <p className="text-muted mt-3 text-sm">{t('location')}</p>

        <section aria-labelledby="build-heading" className="mt-12">
          <h2 id="build-heading" className="text-lg font-semibold">
            {t('buildHeading')}
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {build.map((item) => (
              <div key={item.title} className="border-subtle bg-surface rounded-lg border p-4">
                <dt className="font-medium">{item.title}</dt>
                <dd className="text-muted mt-1 text-sm leading-relaxed">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="stack-heading" className="mt-12">
          <h2 id="stack-heading" className="text-lg font-semibold">
            {t('stackHeading')}
          </h2>
          {/* F-12: plain text, never logo images. Text is indexable and costs
            nothing to load; a row of logos is neither. Grouped rather than one
            flat run, so the list reads as four capabilities instead of eleven
            unsorted words (T-205 content pass). */}
          <dl className="mt-4 space-y-4">
            {stackGroups.map((group) => (
              <div key={group.label} className="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-muted text-sm font-medium" dir="ltr">
                  {group.label}
                </dt>
                <dd className="mt-2 sm:mt-0">
                  <ul className="flex flex-wrap gap-x-2 gap-y-2 text-sm">
                    {group.items.map((item) => (
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
            ))}
          </dl>
        </section>

        <section aria-labelledby="process-heading" className="mt-12">
          <h2 id="process-heading" className="text-lg font-semibold">
            {t('processHeading')}
          </h2>
          <dl className="mt-4 space-y-4">
            {process.map((item) => (
              <div key={item.title}>
                <dt className="font-medium">{item.title}</dt>
                <dd className="text-muted mt-1 text-sm leading-relaxed">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="work-heading" className="mt-12">
          <h2 id="work-heading" className="text-lg font-semibold">
            {t('workHeading')}
          </h2>

          {/* Equal-height cells, and a floor under each card, so a font swap
            cannot resize the grid after first paint (SRS P-02). */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.name}
                className="border-subtle bg-surface flex min-h-56 flex-col rounded-lg border p-4"
              >
                <h3 className="font-semibold">
                  {/* docs/05-ia-url-map.md §4.2: the cards are the Home →
                    Projects link. The project name is the anchor text — a
                    recruiter scanning link text learns what is on the other
                    end, which "read more" never tells them. */}
                  {hasRoute('/projects') ? (
                    <Link
                      href={`/${locale}/projects#${projectAnchor(project.name)}`}
                      className="text-accent hover:text-accent-hover focus-visible:outline-accent rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2"
                      dir="ltr"
                    >
                      {project.name}
                    </Link>
                  ) : (
                    <span dir="ltr">{project.name}</span>
                  )}
                </h3>
                <p className="text-muted mt-1 text-xs">{project.status}</p>
                <p className="mt-3 text-sm leading-relaxed">{project.summary}</p>
                <p className="text-accent mt-3 text-sm font-medium">{project.highlight}</p>
                <ul className="text-muted mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-4 text-xs">
                  {project.stack.slice(0, 4).map((item) => (
                    <li key={item} dir="ltr">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Rendered only once /projects exists (T-212). */}
          {hasRoute('/projects') && (
            <p className="mt-4">
              <Link
                href={`/${locale}/projects`}
                className="text-accent hover:text-accent-hover focus-visible:outline-accent rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t('seeProjects')}
              </Link>
            </p>
          )}
        </section>

        {/* F-14. Rendered only once /contact exists (T-213). */}
        {hasRoute('/contact') && (
          <p className="mt-12">
            <Link
              href={`/${locale}/contact`}
              className="bg-accent hover:bg-accent-hover focus-visible:outline-accent inline-block rounded-md px-4 py-2 font-medium text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t('cta')}
            </Link>
          </p>
        )}
      </main>
    </>
  )
}
