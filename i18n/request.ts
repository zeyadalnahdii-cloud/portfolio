import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'

import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  // `requestLocale` is whatever sat in the [locale] segment, so it is untrusted.
  // The route itself 404s on an unknown locale (SRS I-01); this is the belt to
  // that braces, keeping the type union honest at the boundary.
  const locale = requested && isLocale(requested) ? requested : DEFAULT_LOCALE

  // A dynamic import resolves to `any`, which the type-checked lint rules
  // rightly reject. The assertion is the one place the shape is declared;
  // T-113 replaces it with a type derived from en.json.
  const imported = (await import(`../messages/${locale}.json`)) as {
    default: AbstractIntlMessages
  }

  return { locale, messages: imported.default }
})
