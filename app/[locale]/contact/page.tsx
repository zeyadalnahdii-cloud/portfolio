import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ContactForm } from '@/components/contact/ContactForm'
import { LOCALES, isLocale } from '@/lib/i18n/config'
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
    <main id="content" className="mx-auto w-full max-w-3xl px-4 py-16 text-start">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heading')}</h1>
      <p className="mt-6 leading-relaxed">{t('intro')}</p>
      <p className="text-muted mt-2 text-sm">{t('responseTime')}</p>

      <ContactForm />

      <section aria-labelledby="elsewhere-heading" className="mt-12">
        <h2 id="elsewhere-heading" className="text-lg font-semibold">
          {t('elsewhereHeading')}
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <span className="text-muted">{t('emailLabel')}: </span>
            <a
              href={`mailto:${EMAIL}`}
              dir="ltr"
              className="hover:text-accent focus-visible:outline-accent rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {EMAIL}
            </a>
          </li>
          <li>
            <a
              href={GITHUB}
              rel="me noopener"
              target="_blank"
              dir="ltr"
              className="hover:text-accent focus-visible:outline-accent rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              GitHub
            </a>
          </li>
        </ul>
      </section>
    </main>
  )
}
