import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'

import { LanguageSwitcher } from './LanguageSwitcher'
import { SiteNav } from './SiteNav'

interface SiteHeaderProps {
  locale: Locale
}

/**
 * Site header (SRS F-06), laid out with logical properties so it mirrors under
 * dir="rtl" without a second stylesheet (docs/06-mockups.md §3.1).
 */
export function SiteHeader({ locale }: SiteHeaderProps) {
  return (
    <header className="border-subtle relative border-b">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
        <Link
          href={`/${locale}`}
          className="focus-visible:outline-accent rounded-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Zeyad Alnahdi
        </Link>

        <SiteNav locale={locale} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {/* Slot filled by T-122 (theme toggle). */}
        </div>
      </div>
    </header>
  )
}
