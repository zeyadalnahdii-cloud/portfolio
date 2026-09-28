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
    <header className="border-subtle bg-bg/90 sticky top-0 z-20 border-b backdrop-blur-md">
      {/*
        Three tracks, not a flex row: the outer two take equal space so the
        nav sits in the true centre of the header rather than wherever the
        brand and the controls happen to leave it. `1fr auto 1fr` keeps it
        centred in Arabic too, because the tracks follow the inline axis.

        The tighter gap and padding below `sm` are not cosmetic: at 360px the
        row was 13px wider than the viewport in all three locales, which is a
        horizontal scrollbar on the smallest phones.
      */}
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="focus-visible:outline-accent hover:text-accent justify-self-start rounded-xs text-[0.975rem] font-bold tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Zeyad Alnahdi
        </Link>

        <SiteNav locale={locale} />

        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
