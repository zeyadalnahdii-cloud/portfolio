import { useTranslations } from 'next-intl'

const EMAIL = 'zeyadalnahdii@gmail.com'
const GITHUB = 'https://github.com/zeyadalnahdii-cloud'

/**
 * Site footer (SRS F-07).
 *
 * The profile link carries `rel="me"`, which is half of the bidirectional
 * confirmation that lets search engines merge the site and the profile into
 * one entity — the mechanism behind goal G1 (docs/02-keyword-plan.md §2). The
 * other half is the profile linking back to the domain, which is T-317.
 *
 * LinkedIn is absent because its URL is not known. The same reasoning as the
 * `sameAs` list in lib/seo/schema.ts: a guessed profile URL does not join an
 * entity, it splits one. It is added the moment the real URL exists.
 */
export function SiteFooter() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-subtle mt-auto border-t">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm">
        <a
          href={`mailto:${EMAIL}`}
          dir="ltr"
          className="hover:text-accent focus-visible:outline-accent rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="sr-only">{t('email')}: </span>
          {EMAIL}
        </a>

        <a
          href={GITHUB}
          rel="me noopener"
          target="_blank"
          className="hover:text-accent focus-visible:outline-accent rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t('github')}
        </a>

        <p className="text-muted ms-auto" dir="ltr">
          © {year} Zeyad Alnahdi
        </p>
      </div>
    </footer>
  )
}
