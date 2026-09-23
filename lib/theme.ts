export const THEME_STORAGE_KEY = 'theme'

/**
 * Dispatched on `window` when the theme changes, so the toggle can re-read the
 * document rather than holding a second copy of the truth in React state.
 */
export const THEME_CHANGE_EVENT = 'themechange'

export type Theme = 'light' | 'dark'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/**
 * Reads the stored preference, or null if there is none.
 *
 * Every access is wrapped: `localStorage` is not merely empty in a private
 * window or with site data blocked, it *throws* on access. An unguarded read
 * takes the whole component down with it.
 */
export function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

export function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage is unavailable. The choice still applies to this page; it just
    // will not survive a reload, which is the right trade against throwing.
  }
}

/** The theme in effect right now, read from the document rather than state. */
export function resolveTheme(): Theme {
  const explicit = document.documentElement.dataset.theme

  if (isTheme(explicit)) return explicit

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

/**
 * Runs inline in <head>, before anything paints.
 *
 * This has to be a blocking inline script rather than an effect. Reading the
 * stored preference in `useEffect` means the browser paints the system theme
 * first and repaints a moment later — a visible flash, and a repaint of the
 * whole page that costs both LCP and CLS (SRS P-02).
 *
 * It only sets the attribute when there is a stored choice. With no attribute,
 * the stylesheet falls through to the `prefers-color-scheme` media query, so
 * the system preference is honoured without any JavaScript at all.
 *
 * Minified by hand: it is small, it blocks the parser, and a build step for
 * eight lines would hide what actually ships.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`
