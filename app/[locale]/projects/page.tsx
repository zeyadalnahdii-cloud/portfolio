import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LOCALES, isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { Icon } from '@/components/home/Icon'
import { JsonLd } from '@/components/seo/JsonLd'
import { Robot } from '@/components/home/Robot'
import { ScrollReveal } from '@/components/home/ScrollReveal'
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

/** A fact tile's width on the 12-column record grid. */
type Span = 'lg:col-span-6' | 'lg:col-span-12'

/**
 * Projects (F-20 … F-23, docs/06-mockups.md §2.3).
 *
 * Laid out as a bento grid (ui-ux-pro-max `bento-box-grid`): modular tiles of
 * varied spans rather than one column of equal rows. The variation is not
 * decoration — a tile is wide because its content is long, so the grid ends up
 * describing the shape of each project. Two projects is too few for a masonry
 * *of projects*, so the bento runs inside each record instead.
 *
 * What did not change: every project still reports the same labelled facts,
 * because a recruiter scans rather than reads and a record that invents its
 * own order costs them the comparison. Only the spans differ, and only so the
 * rows tile without leaving half-empty gaps.
 *
 * No repository links. D2/D3 resolved on 2026-09-23: both repositories stay
 * private, so there is nothing to link to. A link to a private repository is a
 * 404, which is worse than no link — it spends the visitor's click and returns
 * nothing.
 *
 * Nothing here is new information. Every string is an existing message key;
 * the metric and console tiles surface copy the Home page already shows, and
 * `problem` stays because schema.ts publishes it as each project's
 * SoftwareSourceCode description and that has to remain visible on the page.
 */
export default async function ProjectsPage({ params }: PageProps<'/[locale]/projects'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('projects')
  const { projects } = getMessages(locale)

  const entries = [
    {
      ...projects.aiWorkspace,
      // [problem | result] · [architecture] · [scale | scope] — fills exactly.
      rows: [
        ['problem', projects.aiWorkspace.problem, 'lg:col-span-6'],
        // Result second, not last: the measured 32.6s is the strongest fact
        // this project has and should not sit below the architecture prose.
        ['result', projects.aiWorkspace.result, 'lg:col-span-6'],
        ['architecture', projects.aiWorkspace.architecture, 'lg:col-span-12'],
        ['scale', projects.aiWorkspace.scale, 'lg:col-span-6'],
        ['scope', projects.aiWorkspace.scope, 'lg:col-span-6'],
      ] as const satisfies readonly (readonly [string, string | readonly string[], Span])[],
    },
    {
      ...projects.restaurant,
      // [problem | scale] · [architecture] · [notable] — scale is a single
      // line of counts, so it pairs with the problem instead of stranding a
      // half-width tile on a row of its own.
      rows: [
        ['problem', projects.restaurant.problem, 'lg:col-span-6'],
        ['scale', projects.restaurant.scale, 'lg:col-span-6'],
        ['architecture', projects.restaurant.architecture, 'lg:col-span-12'],
        ['notable', projects.restaurant.notable, 'lg:col-span-12'],
      ] as const satisfies readonly (readonly [string, string | readonly string[], Span])[],
    },
  ]

  const tile =
    'border-subtle bg-tile hover:bg-tile-hover rounded-xl border p-5 transition-colors duration-[var(--dur-base)]'
  const label = 'text-muted font-mono text-[0.75rem] font-medium tracking-[0.09em] uppercase'

  return (
    <>
      <JsonLd locale={locale} page={'/projects'} />
      <ScrollReveal />
      <main
        id="content"
        className="mx-auto w-full max-w-[1280px] px-6 py-16 text-start sm:px-10 lg:py-24"
      >
        {/*
          The robot stands on its own here rather than peeking from behind a
          panel: the page opens with a wide empty column beside the heading,
          and an unframed figure reads as the page's own character instead of
          decoration stuck to a box. Same component, same three SVGs, same V3
          motion — only the size and the placement differ.
        */}
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <header className="max-w-3xl" data-reveal>
            <h1 className="text-[length:var(--text-title)] font-bold tracking-[-0.025em]">
              {t('heading')}
            </h1>
            <p className="text-muted mt-5 text-[length:var(--text-lead)] leading-relaxed">
              {t('intro')}
            </p>
          </header>

          <Robot className="mx-auto w-[170px] shrink-0 sm:w-[200px] lg:mx-0 lg:w-[240px]" />
        </div>

        <div className="mt-14 space-y-10 lg:mt-20 lg:space-y-14">
          {entries.map((project, index) => (
            <article key={project.name} aria-labelledby={projectAnchor(project.name)}>
              <div className="border-subtle bg-raised shadow-card overflow-hidden rounded-2xl border">
                <div className="border-subtle flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-5 py-3 sm:px-7">
                  {/* Position in the list, not a fact about the project, so it
                    is not announced. */}
                  <span
                    className="text-muted font-mono text-[0.625rem] tracking-[0.14em]"
                    dir="ltr"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}
                  </span>
                  <span className="border-subtle text-accent rounded-full border px-2.5 py-0.5 font-mono text-[0.625rem] tracking-wide">
                    {project.status}
                  </span>
                </div>

                <div className="p-5 sm:p-7">
                  {/* dir="ltr" on the heading itself would left-align it on the
                    Arabic page: on a block element the attribute sets
                    alignment, not just character order, and the title would
                    detach from its right-aligned record. <bdi> isolates the
                    Latin run's direction and leaves the block following the
                    page (docs/06-mockups.md §3). */}
                  <h2
                    id={projectAnchor(project.name)}
                    className="text-[1.625rem] font-bold tracking-tight sm:text-[1.875rem]"
                  >
                    <bdi>{project.name}</bdi>
                  </h2>

                  <dl className="mt-6 grid gap-4 lg:grid-cols-12" data-reveal-stagger>
                    {/* The one measured number this project reports, given the
                      widest tile on the first row: it is what a reader should
                      take away if they read nothing else. */}
                    {/* Centred rather than top-aligned: it shares a row with
                      the telemetry panel, which is much taller, and a short
                      line pinned to the top of a tall box reads as an empty
                      box. */}
                    <div className={`${tile} flex flex-col justify-center lg:col-span-7`}>
                      <dt className="text-accent flex items-center gap-2 font-mono text-[0.75rem] font-medium tracking-[0.09em] uppercase">
                        <Icon name="speed" className="size-3.5 shrink-0" />
                        {project.metricLabel}
                      </dt>
                      <dd className="text-fg mt-3 text-[1.375rem] leading-snug font-semibold text-balance">
                        {project.highlight}
                      </dd>
                    </div>

                    {/*
                      The same console lines, read as a telemetry panel rather
                      than a block of preformatted text: every line is already
                      "> key: value", so the key and the value are set at
                      opposite ends of a row and the numbers line up in a
                      column. Nothing is parsed into new facts — a line that
                      does not match that shape is printed exactly as written.
                    */}
                    <div className="border-subtle bg-terminal overflow-hidden rounded-xl border lg:col-span-5">
                      <dt className="border-subtle flex items-center gap-3 border-b px-4 py-3 font-mono text-[0.625rem] tracking-wider">
                        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
                          <span className="bg-terminal-fg/25 size-2 rounded-full" />
                          <span className="bg-terminal-fg/25 size-2 rounded-full" />
                          <span className="bg-terminal-accent/50 size-2 rounded-full" />
                        </span>
                        <span className="text-terminal-dim truncate" dir="ltr">
                          {project.consoleFile}
                        </span>
                        <span className="text-terminal-accent ms-auto shrink-0" dir="ltr">
                          {project.consoleStatus}
                        </span>
                      </dt>
                      <dd>
                        <ul className="font-mono text-[0.6875rem]" dir="ltr">
                          {project.console.map((line) => {
                            const row = /^>\s*([^:]+):\s*(.*)$/.exec(line)
                            const key = row?.[1]
                            const value = row?.[2]

                            return (
                              <li
                                key={line}
                                className="border-terminal-fg/10 flex items-baseline gap-4 border-b px-4 py-2.5 last:border-b-0"
                              >
                                {key !== undefined && value !== undefined ? (
                                  <>
                                    <span className="text-terminal-dim">{key}</span>
                                    <span className="text-terminal-fg ms-auto tabular-nums">
                                      {value}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-terminal-fg">{line}</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </dd>
                    </div>

                    {project.rows.map(([key, value, span]) => (
                      <div key={key} className={`${tile} ${span}`}>
                        <dt className={label}>{t(`labels.${key}`)}</dt>
                        {/* A row is one paragraph or several; the Arabic
                          architecture copy runs to two where the English runs
                          to one. */}
                        <dd className="mt-2.5 text-[0.9375rem] leading-relaxed">
                          {Array.isArray(value) ? (
                            value.map((paragraph, paragraphIndex) => (
                              <p
                                key={paragraph}
                                className={paragraphIndex > 0 ? 'mt-3' : undefined}
                              >
                                {paragraph}
                              </p>
                            ))
                          ) : (
                            <p>{value}</p>
                          )}
                        </dd>
                      </div>
                    ))}

                    <div className={`${tile} lg:col-span-12`}>
                      <dt className={label}>{t('labels.stack')}</dt>
                      <dd className="mt-3">
                        <ul className="flex flex-wrap gap-1.5">
                          {project.stack.map((item) => (
                            <li
                              key={item}
                              className="border-subtle bg-raised hover:bg-tile-hover hover:border-accent/40 rounded border px-2.5 py-1 font-mono text-[0.75rem] tracking-[0.02em] transition-colors duration-[var(--dur-base)]"
                              dir="ltr"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* docs/05-ia-url-map.md §4.2: Contact is the terminal node of every
          path, and this is the page a reader reaches it from. */}
        {hasRoute('/contact') && (
          <p className="border-subtle mt-14 border-t pt-8" data-reveal>
            {t('ctaLead')}{' '}
            <Link
              href={`/${locale}/contact`}
              className="text-accent hover:text-accent-hover focus-visible:outline-accent decoration-accent/40 hover:decoration-accent rounded-xs font-medium underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t('cta')}
            </Link>
          </p>
        )}
      </main>
    </>
  )
}
