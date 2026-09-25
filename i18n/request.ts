import { getRequestConfig } from 'next-intl/server'

import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  // `requestLocale` is whatever sat in the [locale] segment, so it is untrusted.
  // The route itself 404s on an unknown locale (SRS I-01); this keeps the type
  // union honest at the boundary.
  const locale = requested && isLocale(requested) ? requested : DEFAULT_LOCALE

  // Resolved through the typed registry rather than a dynamic import: the
  // dynamic form returns `any`, which hides a missing message file behind a
  // runtime error instead of a build failure.
  return { locale, messages: getMessages(locale) }
})
