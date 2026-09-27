import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'

import { LanguageSwitcher } from './LanguageSwitcher'
import { SiteNav } from './SiteNav'
import { ThemeToggle } from './ThemeToggle'

interface SiteHeaderProps {
  locale: Locale
}

/**
 * Site header (SRS F-06), laid out with logical properties so it mirrors under
 * dir="rtl" without a second stylesheet (docs/06-mockups.md §3.1).
 */
export function SiteHeader({ locale }: SiteHeaderProps) {
  return (
    <header className="border-subtle bg-bg/85 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3.5 sm:px-6">
        <Link
          href={`/${locale}`}
          className="focus-visible:outline-accent hover:text-accent rounded-xs text-[0.975rem] font-bold tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Zeyad Alnahdi
        </Link>

        <SiteNav locale={locale} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
