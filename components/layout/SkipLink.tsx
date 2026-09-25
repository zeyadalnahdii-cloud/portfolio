import { useTranslations } from 'next-intl'

/**
 * Skip-to-content link (SRS A-06).
 *
 * Off-screen until focused rather than `display: none`, so it stays in the tab
 * order — a hidden skip link helps nobody. It targets the `<main id="content">`
 * every page renders.
 */
export function SkipLink() {
  const t = useTranslations('nav')

  return (
    <a
      href="#content"
      className="bg-surface text-fg focus:outline-accent sr-only rounded-xs px-4 py-2 focus:not-sr-only focus:absolute focus:inset-block-start-2 focus:inset-inline-start-2 focus:z-50 focus:outline-2 focus:outline-offset-2"
    >
      {t('skipToContent')}
    </a>
  )
}
