import type { Locale } from '@/lib/i18n/config'
import { buildSchema, serialiseSchema, type SchemaPage } from '@/lib/seo/schema'

interface JsonLdProps {
  locale: Locale
  page: SchemaPage
}

/**
 * Renders the page's JSON-LD graph (SRS S-01 … S-06).
 *
 * Rendered per page rather than once in the layout, because the layout cannot
 * know which route it is wrapping — and a breadcrumb or a ContactPage entity
 * has to name one. The graph is still built in lib/seo/schema.ts and emitted
 * as a single block, so every `@id` resolves in one pass.
 */
export function JsonLd({ locale, page }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // The payload is escaped in serialiseSchema.
      dangerouslySetInnerHTML={{ __html: serialiseSchema(buildSchema(locale, page)) }}
    />
  )
}
