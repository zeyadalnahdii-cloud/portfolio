import { setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/lib/i18n/config'

/**
 * Placeholder. The spike content that proved RTL mirroring was removed in
 * T-106; the real Home page is built in T-210 against docs/06-mockups.md §2.2.
 *
 * The route itself is foundation, not spike: removing it would take /en, /tr
 * and /ar offline and leave T-111 with no route to assert against.
 */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)

  return (
    <main id="content" className="mx-auto max-w-3xl px-4 py-16 text-start">
      <h1 className="text-3xl font-bold">{locale}</h1>
    </main>
  )
}
