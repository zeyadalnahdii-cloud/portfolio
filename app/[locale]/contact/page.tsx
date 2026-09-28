import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ContactForm } from '@/components/contact/ContactForm'
import { LOCALES, isLocale } from '@/lib/i18n/config'
import { JsonLd } from '@/components/seo/JsonLd'
import { ScrollReveal } from '@/components/home/ScrollReveal'
import { buildMetadata } from '@/lib/seo/metadata'

const EMAIL = 'zeyadalnahdii@gmail.com'
const GITHUB = 'https://github.com/zeyadalnahdii-cloud'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  setRequestLocale(locale)
  const t = await getTranslations('meta.contact')

  return buildMetadata({
    locale,
    pathname: '/contact',
    title: t('title'),
    description: t('description'),
  })
}

/**
 * Contact (F-40 … F-45).
 *
 * The page itself is static; only /api/contact is dynamic. That separation is
 * the point — if this route went dynamic the other eleven would still be
 * prerendered, but this one would stop being, and the performance budget with
 * it.
 *
 * The email address is present as a real mailto link, always, before and
 * independent of the form. That is F-42 and it is also the C-07 fallback: if
 * the form's JavaScript never runs, the visitor still has a way to write.
 */
export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('contact')

  return (
    <>
      <JsonLd locale={locale} page={'/contact'} />
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
          <p className="text-muted mt-3 text-sm">{t('responseTime')}</p>
        </header>

        {/*
          Two panels rather than a form with a list underneath it. The page's
          job is "here is how to reach me", and writing a message is one of
          two equally real ways to do that — the address has to look like an
          option, not like a footnote to the form. The order still favours the
          form: it comes first in the DOM, so it is also what a screen reader
          and a narrow screen meet first.
        */}
        <div className="mt-12 grid items-start gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="border-subtle bg-raised shadow-card rounded-2xl border p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="border-subtle bg-tile rounded-2xl border p-6 sm:p-8">
              <h2
                id="elsewhere-heading"
                className="text-muted font-mono text-[0.8125rem] font-medium tracking-[0.12em] uppercase"
              >
                {t('elsewhereHeading')}
              </h2>

              {/* F-42 / C-07: a real mailto that works with the form's
                JavaScript switched off entirely. */}
              <ul className="mt-5 space-y-5">
                <li>
                  <p className="text-muted font-mono text-[0.75rem] tracking-[0.1em] uppercase">
                    {t('emailLabel')}
                  </p>
                  <a
                    href={`mailto:${EMAIL}`}
                    dir="ltr"
                    className="hover:text-accent focus-visible:outline-accent decoration-accent/40 hover:decoration-accent mt-1.5 inline-block rounded-xs text-sm underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {EMAIL}
                  </a>
                </li>
                <li>
                  <p className="text-muted font-mono text-[0.75rem] tracking-[0.1em] uppercase">
                    GitHub
                  </p>
                  <a
                    href={GITHUB}
                    rel="me noopener"
                    target="_blank"
                    dir="ltr"
                    className="hover:text-accent focus-visible:outline-accent decoration-accent/40 hover:decoration-accent mt-1.5 inline-block rounded-xs text-sm underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {/* The visible label sits outside the link, so the
                      accessible name carries it too — a link announced on its
                      own as just a handle says nothing about where it goes. */}
                    <span className="sr-only">GitHub: </span>
                    {GITHUB.replace('https://github.com/', '')}
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
