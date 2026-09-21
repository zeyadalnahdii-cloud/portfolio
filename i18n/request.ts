import { getRequestConfig } from 'next-intl/server'

import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  // `requestLocale` is whatever sat in the [locale] segment, so it is untrusted.
  // The route itself 404s on an unknown locale (SRS I-01); this is the belt to
  // that braces, keeping the type union honest at the boundary.
  const locale = requested && isLocale(requested) ? requested : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
