import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/seo/JsonLd'
import { Icon } from '@/components/home/Icon'
import { Robot } from '@/components/home/Robot'
import { ScrollReveal } from '@/components/home/ScrollReveal'
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
  const { build, stackGroups, process, topology } = messages.home
  const projects = [messages.projects.aiWorkspace, messages.projects.restaurant]

  return (
    <>
      <JsonLd locale={locale} page={''} />
      <ScrollReveal />
      <main id="content" className="text-start">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-[1280px] px-6 py-16 sm:px-10 lg:py-24">
          <div className="isolate grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              {/* Availability pill. The dot pulses, so it stops under
                prefers-reduced-motion like everything else (A-10). */}
              <p className="border-subtle bg-raised inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-accent relative inline-flex h-2 w-2 rounded-full" />
                </span>
                <span className="text-fg font-mono text-[0.6875rem] font-medium tracking-wide">
                  {t('location')}
                </span>
              </p>

              <div className="space-y-2">
                <p className="text-muted font-mono text-[0.75rem] font-semibold tracking-[0.16em] uppercase">
                  {t('eyebrow')}
                </p>
                <h1 className="text-fg text-[length:var(--text-display)] leading-[1.05] font-bold tracking-[-0.03em]">
                  {t('name')}
                </h1>
                <p className="text-muted text-[length:var(--text-title)] font-semibold tracking-tight">
                  {t('role')}
                </p>
              </div>

              <p className="text-fg-soft max-w-2xl text-[length:var(--text-lead)] leading-relaxed">
                {t('intro')}
              </p>

              <div className="flex w-full flex-wrap items-center gap-4 pt-2 sm:w-auto">
                <Link
                  href="#selected-work"
                  className="bg-solid text-solid-fg hover:bg-solid-hover focus-visible:outline-accent group flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition duration-[var(--dur-fast)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span>{t('viewWork')}</span>
                  <Icon
                    name="arrow_downward"
                    className="size-[18px] transition-transform group-hover:translate-y-0.5"
                  />
                </Link>

                {hasRoute('/contact') && (
                  <Link
                    href={`/${locale}/contact`}
                    className="border-subtle bg-raised text-fg hover:border-accent focus-visible:outline-accent flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition duration-[var(--dur-fast)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span>{t('cta')}</span>
                    <Icon name="terminal" className="text-muted size-[18px]" />
                  </Link>
                )}
              </div>
            </div>

            {/* Architecture panel — the four tiers this project actually has. */}
            <div className="relative lg:col-span-5">
              {/*
                `relative z-10` is paint order only — no geometry changes. It
                is what puts the panel in front of the robot behind it, and the
                opaque `bg-raised` is what hides the rest of the body.
              */}
              <div className="border-subtle bg-raised shadow-lift relative z-10 overflow-hidden rounded-xl rounded-se-[2.75rem] border">
                <div className="border-subtle flex items-center justify-between border-b px-4 py-2.5">
                  <span className="text-muted font-mono text-[0.6875rem] tracking-wider" dir="ltr">
                    {t('topologyTitle')}
                  </span>
                  <span
                    className="text-accent inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-wider"
                    dir="ltr"
                  >
                    <span className="bg-accent size-1.5 rounded-full" aria-hidden="true" />
                    {t('topologyStatus')}
                  </span>
                </div>

                <ol className="p-4">
                  {topology.map((tier, index) => (
                    <li key={tier.tier}>
                      <div className="border-subtle bg-tile hover:bg-tile-hover transition-colors duration-[var(--dur-base)] rounded-lg border p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="text-muted font-mono text-[0.75rem] tracking-[0.1em] uppercase"
                            dir="ltr"
                          >
                            {tier.tier}
                          </span>
                          <span
                            className="border-subtle text-accent rounded-full border px-2 py-0.5 font-mono text-[0.625rem]"
                            dir="ltr"
                          >
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-fg mt-2 flex items-center gap-2 font-semibold" dir="ltr">
                          <Icon name={tier.icon} className="text-accent size-4 shrink-0" />
                          {tier.name}
                        </p>
                        <p className="text-muted mt-1 text-[0.8125rem] leading-relaxed">
                          {tier.note}
                        </p>
                      </div>
                      {index < topology.length - 1 && (
                        <div className="flex justify-center py-1.5" aria-hidden="true">
                          <Icon name="arrow_downward" className="text-muted size-4" />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>

                <div className="border-subtle text-muted flex items-center justify-between border-t px-4 py-2.5 font-mono text-[0.625rem] tracking-wider">
                  <span dir="ltr">{t('topologyFootLeft')}</span>
                  <span dir="ltr">{t('topologyFootRight')}</span>
                </div>
              </div>

              {/*
                Peeking over the panel's top outer corner. Pure overlay: it is
                absolutely positioned and painted under the panel, so it adds
                no height and moves nothing — the hero is exactly the layout it
                was before the robot existed.

                124px is the ceiling, not a preference: the artwork's ink
                starts 10.9% down the box, so anything larger pushes the
                antennae up behind the sticky header. At this size they clear
                it by 7px.

                The overlap is ~18% of the robot's size. That number is the
                artwork, not a guess: the ink runs from 10.9% to 90.2% of the
                square — head to 74.2%, hands from there — and the bottom 9.8%
                is empty. An 18% cut lands inside the hands, so the head and
                the tops of the hands clear the edge and everything below is
                behind the panel. A shallower cut only hides transparent
                pixels and the robot reads as hovering.
                `end-6` rather than `right-6`, so it mirrors in Arabic.

                `-z-10` inside the grid's `isolate`, not `z-0`: once the
                columns stack, the robot's box reaches across into the hero
                text, and a positioned element at z-0 paints over the static
                "Get in touch" button below it. A negative layer puts it
                behind every sibling's content at every width, and `isolate`
                keeps that layer from escaping the grid.

                Size and position are the two numbers below; the component
                itself has no opinion about either.
              */}
              <Robot className="absolute end-3 bottom-[calc(100%-22px)] -z-10 w-[124px]" />
            </div>
          </div>
        </section>

        {/* ── What I build ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="build-heading"
          className="border-subtle bg-surface/50 border-y py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end" data-reveal>
              <div className="lg:col-span-6">
                <p className="text-muted font-mono text-[0.75rem] font-semibold tracking-[0.16em] uppercase">
                  {t('buildEyebrow')}
                </p>
                <h2
                  id="build-heading"
                  className="text-fg mt-2 text-[length:var(--text-title)] font-bold tracking-tight"
                >
                  {t('buildHeading')}
                </h2>
              </div>
              <p className="text-muted text-[0.9375rem] leading-relaxed lg:col-span-6">
                {t('buildIntro')}
              </p>
            </div>

            <dl className="mt-10 grid gap-5 sm:grid-cols-2" data-reveal-stagger>
              {build.map((item) => (
                <div
                  key={item.title}
                  className="border-subtle bg-raised hover:bg-raised-hover hover:border-accent/50 hover:shadow-lift rounded-lg border p-6 transition-[box-shadow,border-color,background-color] duration-[var(--dur-base)]"
                >
                  {/* A <dl> child may be a <div>, but the div must hold a clean
                    dt/dd pair — the icon row and the tag list live inside them
                    rather than beside them (axe: definition-list). */}
                  <dt>
                    <span className="flex items-start justify-between gap-4">
                      <span className="border-subtle bg-tile text-accent flex size-10 shrink-0 items-center justify-center rounded-lg border">
                        <Icon name={item.icon} className="size-5" />
                      </span>
                      <span
                        className="text-muted font-mono text-[0.75rem] tracking-[0.1em] uppercase"
                        dir="ltr"
                      >
                        {item.index}
                      </span>
                    </span>
                    <span className="text-fg mt-5 block text-[1.125rem] font-semibold">
                      {item.title}
                    </span>
                  </dt>
                  <dd>
                    <p className="text-muted mt-2 text-[0.9375rem] leading-relaxed">{item.body}</p>
                    <ul className="border-subtle text-muted mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 font-mono text-[0.625rem] tracking-[0.08em] uppercase">
                      {item.tags.map((tag) => (
                        <li key={tag} dir="ltr">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── What I work with ─────────────────────────────────────────── */}
        <section aria-labelledby="stack-heading" className="py-16 lg:py-24">
          <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end" data-reveal>
              <div className="lg:col-span-6">
                <p className="text-muted font-mono text-[0.75rem] font-semibold tracking-[0.16em] uppercase">
                  {t('stackEyebrow')}
                </p>
                <h2
                  id="stack-heading"
                  className="text-fg mt-2 text-[length:var(--text-title)] font-bold tracking-tight"
                >
                  {t('stackHeading')}
                </h2>
              </div>
              <p className="text-muted text-[0.9375rem] leading-relaxed lg:col-span-6">
                {t('stackIntro')}
              </p>
            </div>

            <dl className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" data-reveal-stagger>
              {stackGroups.map((group) => (
                <div
                  key={group.label}
                  className="border-subtle bg-raised hover:bg-raised-hover transition-colors duration-[var(--dur-base)] flex flex-col rounded-lg border p-5"
                >
                  <dt className="text-fg flex items-center gap-2.5 font-semibold" dir="ltr">
                    <Icon name={group.icon} className="text-accent size-4 shrink-0" />
                    {group.label}
                  </dt>
                  <dd className="mt-0 flex grow flex-col">
                    <p className="text-muted mt-2 text-[0.8125rem] leading-relaxed">{group.desc}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="border-subtle bg-tile hover:bg-tile-hover text-fg rounded border px-2 py-1 font-mono text-[0.6875rem] transition-colors duration-[var(--dur-base)]"
                          dir="ltr"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p
                      className="border-subtle text-muted mt-auto border-t pt-3.5 font-mono text-[0.625rem] tracking-[0.08em]"
                      dir="ltr"
                    >
                      {group.foot}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── How I work ───────────────────────────────────────────────── */}
        <section
          aria-labelledby="process-heading"
          className="border-subtle bg-surface/50 border-y py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end" data-reveal>
              <div className="lg:col-span-6">
                <p className="text-muted font-mono text-[0.75rem] font-semibold tracking-[0.16em] uppercase">
                  {t('processEyebrow')}
                </p>
                <h2
                  id="process-heading"
                  className="text-fg mt-2 text-[length:var(--text-title)] font-bold tracking-tight"
                >
                  {t('processHeading')}
                </h2>
              </div>
              <p className="text-muted text-[0.9375rem] leading-relaxed lg:col-span-6">
                {t('processIntro')}
              </p>
            </div>

            <dl className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" data-reveal-stagger>
              {process.map((item) => (
                <div
                  key={item.title}
                  className="border-subtle bg-raised hover:bg-raised-hover transition-colors duration-[var(--dur-base)] flex flex-col rounded-lg border p-5"
                >
                  <dt>
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-accent">
                        <Icon name={item.icon} className="size-5" />
                      </span>
                      <span
                        className="text-muted font-mono text-[0.75rem] tracking-[0.1em] uppercase"
                        dir="ltr"
                      >
                        {item.rule}
                      </span>
                    </span>
                    <span className="text-fg mt-4 block font-semibold">{item.title}</span>
                  </dt>
                  <dd className="flex grow flex-col">
                    <p className="text-muted mt-2 text-[0.8125rem] leading-relaxed">{item.body}</p>
                    <p className="border-subtle text-accent mt-auto border-t pt-3.5 font-mono text-[0.625rem] tracking-[0.06em]">
                      {item.metric}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Selected work ────────────────────────────────────────────── */}
        <section id="selected-work" aria-labelledby="work-heading" className="py-16 lg:py-24">
          <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
            {/*
              A bare positioning wrapper. The robot has to be a *sibling* of
              the container to be hidden by it — nested inside, it would paint
              over the container's own background instead of behind it.
            */}
            <div className="relative isolate">
              {/*
                Same component, same motion, second instance: only smaller and
                anchored somewhere else. Behind the container's top edge, near
                the heading, and out of flow like the first — the section keeps
                the height it had.
              */}
              <Robot className="absolute start-[27%] bottom-[calc(100%-18px)] -z-10 w-[104px]" />

              {/*
                The outer container the section was missing: it is the heading
                and both project cards as one object rather than three. Kept
                deliberately quieter than the cards it holds — `bg-tile`
                sits under their `bg-raised`, and the border is the same
                hairline and radius the rest of the system uses. Opaque, which
                is also what lets it hide the robot.
              */}
              <div className="border-subtle bg-tile relative z-10 rounded-2xl rounded-se-[2.5rem] border p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
                  <div>
                    <p className="text-muted font-mono text-[0.75rem] font-semibold tracking-[0.16em] uppercase">
                      {t('workEyebrow')}
                    </p>
                    <h2
                      id="work-heading"
                      className="text-fg mt-2 text-[length:var(--text-title)] font-bold tracking-tight"
                    >
                      {t('workHeading')}
                    </h2>
                  </div>
                </div>

                <div className="mt-8 grid gap-6" data-reveal-stagger>
                  {projects.map((project) => (
                    <article
                      key={project.name}
                      className="border-subtle bg-raised hover:bg-raised-hover transition-colors duration-[var(--dur-base)] hover:border-accent/30 grid gap-6 rounded-xl border p-6 sm:p-8 lg:grid-cols-12"
                    >
                      <div className="min-w-0 lg:col-span-7">
                        <p className="border-subtle text-accent inline-flex rounded-full border px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.08em] uppercase">
                          {project.status}
                        </p>
                        {/* The card title is the Home → Projects link. Dropping it
                          would cost /projects its inbound lead, which
                          verify-links enforces (T-218, docs/05 §4.2). */}
                        <h3 className="mt-4 text-[1.5rem] font-bold tracking-tight">
                          {hasRoute('/projects') ? (
                            <Link
                              href={`/${locale}/projects#${projectAnchor(project.name)}`}
                              className="text-fg hover:text-accent focus-visible:outline-accent rounded-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                              dir="ltr"
                            >
                              {project.name}
                            </Link>
                          ) : (
                            <span className="text-fg" dir="ltr">
                              {project.name}
                            </span>
                          )}
                        </h3>
                        <p className="text-muted mt-3 leading-relaxed">{project.summary}</p>

                        <div className="border-subtle bg-tile mt-5 rounded-lg border p-4">
                          <p className="text-accent flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
                            <Icon name="speed" className="size-3.5 shrink-0" />
                            {project.metricLabel}
                          </p>
                          <p className="text-fg mt-1.5 text-[0.9375rem] font-medium">
                            {project.highlight}
                          </p>
                        </div>

                        <ul className="mt-5 flex flex-wrap gap-1.5">
                          {project.stack.map((item) => (
                            <li
                              key={item}
                              className="border-subtle bg-tile hover:bg-tile-hover text-fg rounded border px-2 py-1 font-mono text-[0.6875rem] transition-colors duration-[var(--dur-base)]"
                              dir="ltr"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* The console panel. Every line is a figure this project has
                        actually recorded — the design's invented breakdown is not
                        reproduced. */}
                      {/* min-w-0: a grid item's default min-width is its
                        content, so the console's longest monospace line set
                        the track's floor and pushed the card 13px past the
                        viewport at 360px. */}
                      <div className="min-w-0 lg:relative lg:col-span-5">
                        <div className="border-subtle bg-terminal h-full overflow-hidden rounded-lg border">
                          <div className="border-subtle flex items-center justify-between border-b px-3 py-2">
                            <span className="text-muted font-mono text-[0.625rem]" dir="ltr">
                              {project.consoleFile}
                            </span>
                            <span className="text-accent font-mono text-[0.625rem]" dir="ltr">
                              {project.consoleStatus}
                            </span>
                          </div>
                          <pre className="text-terminal-fg overflow-x-auto p-3.5 font-mono text-[0.6875rem] leading-relaxed">
                            <code dir="ltr">{project.console.join('\n')}</code>
                          </pre>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {hasRoute('/projects') && (
              <p className="mt-8">
                <Link
                  href={`/${locale}/projects`}
                  className="text-accent hover:text-accent-hover focus-visible:outline-accent decoration-accent/40 hover:decoration-accent inline-flex items-center gap-2 rounded-xs font-medium underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t('seeProjects')}
                </Link>
              </p>
            )}
          </div>
        </section>

        {/* ── Closing ──────────────────────────────────────────────────── */}
        {hasRoute('/contact') && (
          <section
            aria-labelledby="closing-heading"
            className="border-subtle bg-surface/50 border-t py-16 lg:py-24"
          >
            <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
              <div
                className="border-subtle bg-raised hover:bg-raised-hover rounded-xl border p-8 transition-colors duration-[var(--dur-base)] sm:p-12"
                data-reveal
              >
                <p className="text-muted font-mono text-[0.75rem] font-semibold tracking-[0.16em] uppercase">
                  {t('role')}
                </p>
                <h2
                  id="closing-heading"
                  className="text-fg mt-3 text-[length:var(--text-title)] font-bold tracking-tight"
                >
                  {t('cta')}
                </h2>
                <p className="text-muted mt-3 max-w-xl leading-relaxed">{t('location')}</p>
                <p className="mt-7">
                  <Link
                    href={`/${locale}/contact`}
                    className="bg-solid text-solid-fg hover:bg-solid-hover focus-visible:outline-accent inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition duration-[var(--dur-fast)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Icon name="mail" className="size-[18px]" />
                    {t('cta')}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
