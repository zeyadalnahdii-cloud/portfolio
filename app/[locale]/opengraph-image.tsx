import { DEFAULT_LOCALE, LOCALES, isLocale } from '@/lib/i18n/config'
import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, ogImage } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE

  return [{ id: 'default', size: OG_SIZE, contentType: OG_CONTENT_TYPE, alt: ogAlt(locale, '') }]
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  return ogImage(isLocale(raw) ? raw : DEFAULT_LOCALE, '')
}
