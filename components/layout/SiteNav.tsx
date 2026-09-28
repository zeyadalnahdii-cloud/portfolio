'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'
import { Icon } from '@/components/home/Icon'
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
    <nav aria-label={t('primary')} className="justify-self-center">
      {/*
        Wide screens: the four pages as one object — a rail with the links
        inside it — so the navigation reads as a single control rather than
        four loose words sharing the header with the brand and the toggle.

        The rail sits on --surface, not --tile: --tile *is* the page
        background in light mode, so a rail painted with it was invisible and
        the links read as loose words again. The current page is a raised pill
        inside the rail, and the others lift into that same shape on hover, so
        hovering previews where the pill will land.
      */}
      <ul className="border-subtle bg-surface hidden items-center gap-0.5 rounded-full border p-1 text-sm sm:flex">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className="hover:bg-raised-hover hover:text-accent focus-visible:outline-accent aria-[current=page]:bg-raised aria-[current=page]:text-accent aria-[current=page]:shadow-card block rounded-full px-3.5 py-1.5 whitespace-nowrap transition-colors duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:font-semibold"
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
        className="border-subtle hover:border-accent hover:text-accent focus-visible:outline-accent grid size-9 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:hidden"
      >
        {/* Icon-only, so the name is carried by text that only a screen
          reader reads. It still changes with the state — unlike the theme
          toggle, `open` starts false on the server and on the client alike,
          so there is nothing here to flicker at hydration. */}
        <Icon name={open ? 'close' : 'menu'} className="size-[18px]" />
        <span className="sr-only">{open ? t('closeMenu') : t('menu')}</span>
      </button>

      <ul
        id={menuId}
        hidden={!open}
        className="border-subtle bg-raised shadow-lift absolute start-0 end-0 z-10 mt-3.5 flex flex-col gap-0.5 border-y p-3 text-sm sm:hidden"
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              onClick={() => {
                setOpen(false)
              }}
              className="hover:text-accent hover:bg-surface focus-visible:outline-accent aria-[current=page]:text-accent block rounded px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:font-semibold"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
