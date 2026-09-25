'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'
import { ROUTES, ROUTE_LABEL } from '@/lib/seo/routes'

interface SiteNavProps {
  locale: Locale
}

/**
 * Primary navigation.
 *
 * Links come from ROUTES, so the header only offers pages that exist. A nav
 * item pointing at a route that has not been built yet dead-ends the visitor
 * and burns crawl budget; the list fills in on its own as T-211..T-213 land.
 *
 * On small screens this is a disclosure, not a modal: the page behind stays
 * reachable and focus is not trapped (SRS A-04). Escape closes it and returns
 * focus to the button that opened it, which is the part that has to exist from
 * the start — a menu that cannot be dismissed by keyboard fails A-04 outright,
 * and bolting the dismissal on afterwards is how that happens.
 */
export function SiteNav({ locale }: SiteNavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const items = ROUTES.map((route) => {
    const href = `/${locale}${route}`
    return {
      href,
      label: t(ROUTE_LABEL[route]),
      // The locale root has no trailing segment, so an exact match is right;
      // deeper routes match on their own prefix.
      current: pathname === href,
    }
  })

  return (
    <nav aria-label={t('primary')} className="ms-auto">
      {/* Wide screens: the list itself. */}
      <ul className="hidden gap-6 text-sm sm:flex">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className="hover:text-accent focus-visible:outline-accent rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:font-semibold"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Narrow screens: a disclosure. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((value) => !value)
        }}
        aria-expanded={open}
        aria-controls={menuId}
        className="focus-visible:outline-accent rounded-xs px-2 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 sm:hidden"
      >
        {open ? t('closeMenu') : t('menu')}
      </button>

      <ul
        id={menuId}
        hidden={!open}
        className="border-subtle bg-surface absolute start-0 end-0 z-10 mt-2 flex flex-col gap-1 border-b p-4 text-sm sm:hidden"
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              onClick={() => {
                setOpen(false)
              }}
              className="hover:text-accent focus-visible:outline-accent block rounded-xs py-1 focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:font-semibold"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
