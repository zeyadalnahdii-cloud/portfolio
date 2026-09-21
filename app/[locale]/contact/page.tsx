import { setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/lib/i18n/config'

/**
 * SPIKE — throwaway (task T-104, deleted in T-106).
 * Exists so the build can prove 12 routes generate statically. Real content
 * arrives in T-213.
 */
export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  setRequestLocale(locale)

  return (
    <main id="content" className="mx-auto max-w-3xl px-4 py-16 text-start">
      <h1 className="text-3xl font-bold">contact</h1>
      <p className="mt-2 text-sm">
        <code dir="ltr">/{locale}/contact</code>
      </p>
    </main>
  )
}
