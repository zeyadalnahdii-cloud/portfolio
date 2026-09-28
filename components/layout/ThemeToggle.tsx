'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react'

import { Icon } from '@/components/home/Icon'
import {
  THEME_CHANGE_EVENT,
  applyTheme,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
  type Theme,
} from '@/lib/theme'

/**
 * Dark mode toggle (SRS F-04, A-12).
 *
 * The colours are already correct before this component exists: the inline
 * script in the layout applies any stored choice before first paint, and with
 * no stored choice the stylesheet stays on its dark default. This only
 * reports and changes that state.
 *
 * The current theme lives in the DOM, not in React, so it is read with
 * `useSyncExternalStore`. Reading it in an effect and calling `setState` would
 * render twice on every mount, and reading it during render would break
 * hydration. This subscribes to both sources that can change it: the toggle
 * itself, and the system preference changing under a visitor who never chose.
 *
 * The icon does change with the theme, but not from React: both glyphs are
 * rendered and CSS picks one off `data-theme`, which the inline script has
 * already set before anything paints. Driving it from this component's state
 * instead would show the wrong glyph until hydration — the flash the fixed
 * label was introduced to avoid (SRS P-02). The accessible name stays
 * constant for the same reason; `aria-pressed` is what moves (A-12).
 */
function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  media.addEventListener('change', onChange)
  window.addEventListener(THEME_CHANGE_EVENT, onChange)

  return () => {
    media.removeEventListener('change', onChange)
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
  }
}

/** On the server there is no document to read, and no paint to protect. */
function getServerSnapshot(): Theme {
  return 'dark'
}

export function ThemeToggle() {
  const t = useTranslations('theme')
  const pathname = usePathname()
  const theme = useSyncExternalStore(subscribe, resolveTheme, getServerSnapshot)

  /**
   * Puts the stored choice back after a locale switch.
   *
   * Each locale has its own root layout, so /en -> /ar re-renders <html> from
   * markup that carries no data-theme — and the attribute the inline script
   * set in <head> is dropped with it. Measured: a visitor reading in light
   * mode switched language and the page snapped to dark, then came back to
   * light only on the next full reload.
   *
   * A layout effect keyed on the path runs after that commit but *before* the
   * browser paints the new route, so the attribute is restored without the
   * snap being visible. It is deliberately not a plain effect: that one runs
   * after paint, which is exactly the flash being fixed.
   */
  useLayoutEffect(() => {
    const stored = readStoredTheme()

    if (stored !== null && document.documentElement.dataset.theme !== stored) {
      applyTheme(stored)
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
    }
  }, [pathname])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'

    applyTheme(next)
    writeStoredTheme(next)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }, [theme])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      className="border-subtle hover:border-accent hover:text-accent focus-visible:outline-accent grid size-9 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {/* Both glyphs ship; globals.css shows the one matching the theme in
        effect. The name is text, not an aria-label, so it is translated by
        the same mechanism as everything else. */}
      <Icon name="dark_mode" className="theme-icon-dark size-[18px]" />
      <Icon name="light_mode" className="theme-icon-light size-[18px]" />
      <span className="sr-only">{t('darkMode')}</span>
    </button>
  )
}
