'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { LOCALES, LOCALE_NATIVE_NAME, type Locale } from '@/lib/i18n/config'
import { switchLocale } from '@/lib/i18n/path'

interface LanguageSwitcherProps {
  locale: Locale
}

/**
 * The language switcher (SRS F-02, I-09, A-11).
 *
 * The only place on the site where a link legitimately crosses locales
 * (docs/05-ia-url-map.md §4.1). Everywhere else, a link stays inside the
 * locale it was followed from.
 *
 * Every option keeps the current path, so switching from /tr/projects reaches
 * /ar/projects rather than /ar. The path arithmetic is in lib/i18n/path.ts,
 * where it can be tested against routes that do not exist yet: with one page
 * live, landing on the home page and landing on the right page look identical.
 *
 * Three plain links rather than the dropdown sketched in docs/06-mockups.md
 * §2.1. Three options do not need a listbox's ARIA, and links are keyboard
 * accessible without any of it.
 *
 * `hreflang` and `lang` are both set: `hreflang` describes the language of the
 * page being linked to, `lang` the language of the link's own text, so a screen
 * reader pronounces "Türkçe" in Turkish instead of reading it as English.
 * Unreviewed locales are still offered — the review gate keeps a page out of
 * the index, it does not hide it from a visitor who wants to read it.
 */
export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav aria-label={t('language')}>
      <ul className="flex items-center gap-2 text-sm">
        {LOCALES.map((candidate) => {
          const current = candidate === locale

          return (
            <li key={candidate}>
              <Link
                href={switchLocale(pathname, candidate)}
                hrefLang={candidate}
                lang={candidate}
                aria-current={current ? 'true' : undefined}
                className="hover:text-accent focus-visible:outline-accent rounded-xs px-1 uppercase focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=true]:font-semibold aria-[current=true]:underline"
              >
                <span aria-hidden="true">{candidate}</span>
                <span className="sr-only">{LOCALE_NATIVE_NAME[candidate]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
