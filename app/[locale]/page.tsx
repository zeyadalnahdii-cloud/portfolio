import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'

import { LOCALE_DIRECTION, isLocale } from '@/lib/i18n/config'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    // Unreachable: the layout has already called notFound(). Present so the
    // narrowing below holds without a non-null assertion (07 §2).
    return null
  }

  setRequestLocale(locale)
  const t = await getTranslations('locale')

  return (
    <main id="content" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-4xl font-bold">{t('nativeName')}</h1>
      <dl className="mt-8 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium">locale</dt>
          <dd>
            <code>{locale}</code>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">dir</dt>
          <dd>
            <code>{LOCALE_DIRECTION[locale]}</code>
          </dd>
        </div>
      </dl>
    </main>
  )
}
