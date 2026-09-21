import { getTranslations, setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/lib/i18n/config'

/**
 * SPIKE — throwaway (task T-103, deleted in T-106).
 *
 * Proves that a layout styled only with logical properties mirrors under
 * dir="rtl" with no RTL-specific stylesheet. Every Tailwind utility used here
 * maps to a logical CSS property:
 *
 *   ms-*  -> margin-inline-start      pe-*       -> padding-inline-end
 *   ps-*  -> padding-inline-start     border-s-* -> border-inline-start
 *   text-start -> text-align: start
 *
 * There is deliberately no `left`, `right`, `ml-`, `mr-`, `pl-`, `pr-`,
 * `text-left` or `text-right` anywhere in this file.
 */
export default async function SpikePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('spike')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 text-start">
      {/* Header: name at the inline-start edge, nav pushed to inline-end */}
      <header className="flex items-center gap-6 border-b border-black/10 py-4">
        <span className="font-bold">{t('title')}</span>
        <nav className="ms-auto flex gap-4 text-sm">
          <span>{t('nav.home')}</span>
          <span>{t('nav.about')}</span>
          <span>{t('nav.projects')}</span>
          <span>{t('nav.contact')}</span>
        </nav>
      </header>

      <main id="content" className="py-10">
        <h1 className="text-3xl font-bold">{t('role')}</h1>

        {/* Bidi test: an Arabic sentence whose full stop must land at the
            inline-end edge, with LTR runs embedded inside it. */}
        <p className="mt-4 leading-relaxed">
          {t('intro')} {t('stackLabel')}{' '}
          <code dir="ltr" className="rounded bg-black/5 px-1 font-mono text-sm">
            ASP.NET Core
          </code>
          . {t('contactLabel')}{' '}
          <a dir="ltr" href="mailto:zeyadalnahdii@gmail.com" className="underline">
            zeyadalnahdii@gmail.com
          </a>
          .
        </p>

        {/* Two-column row: must swap order under RTL with no extra rules */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          <section className="border border-black/10 p-4">
            <h2 className="font-semibold">{t('colLeftTitle')}</h2>
            <p className="mt-2 text-sm">{t('colBody')}</p>
          </section>
          <section className="border border-black/10 p-4">
            <h2 className="font-semibold">{t('colRightTitle')}</h2>
            <p className="mt-2 text-sm">{t('colBody')}</p>
          </section>
        </div>

        {/* Card: accent border on the inline-start edge */}
        <article className="mt-10 border-s-4 border-blue-600 bg-black/5 ps-4 pe-8 py-4">
          <h2 className="font-semibold">{t('cardTitle')}</h2>
          <p className="mt-2 text-sm">{t('cardBody')}</p>
          <p className="mt-3 text-sm">
            <span className="ms-8 inline-block">↳ {t('colLeftTitle')}</span>
          </p>
        </article>
      </main>
    </div>
  )
}
