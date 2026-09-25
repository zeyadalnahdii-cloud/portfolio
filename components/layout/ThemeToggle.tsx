'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useSyncExternalStore } from 'react'

import {
  THEME_CHANGE_EVENT,
  applyTheme,
  resolveTheme,
  writeStoredTheme,
  type Theme,
} from '@/lib/theme'

/**
 * Dark mode toggle (SRS F-04, A-12).
 *
 * The colours are already correct before this component exists: the inline
 * script in the layout applies any stored choice before first paint, and with
 * no stored choice the stylesheet follows `prefers-color-scheme` on its own.
 * This only reports and changes that state.
 *
 * The current theme lives in the DOM, not in React, so it is read with
 * `useSyncExternalStore`. Reading it in an effect and calling `setState` would
 * render twice on every mount, and reading it during render would break
 * hydration. This subscribes to both sources that can change it: the toggle
 * itself, and the system preference changing under a visitor who never chose.
 *
 * Nothing visible depends on the value — the label is fixed and only
 * `aria-pressed` moves — so there is no flash and no layout shift (SRS P-02).
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
  return 'light'
}

export function ThemeToggle() {
  const t = useTranslations('theme')
  const theme = useSyncExternalStore(subscribe, resolveTheme, getServerSnapshot)

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
      className="focus-visible:outline-accent hover:text-accent rounded-xs px-2 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {t('darkMode')}
    </button>
  )
}
