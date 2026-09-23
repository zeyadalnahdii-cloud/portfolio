import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

/**
 * Types next-intl against the real message shape, so `t('nav.hom')` is a
 * compile error rather than a string that renders as its own key at runtime
 * (SRS I-10, I-11).
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: Messages
  }
}
