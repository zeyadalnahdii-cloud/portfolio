import { useTranslations } from 'next-intl'

const EMAIL = 'zeyadalnahdii@gmail.com'
const GITHUB = 'https://github.com/zeyadalnahdii-cloud'

/**
 * Site footer (SRS F-07). One component, rendered once in app/[locale]/layout.tsx,
 * so every route in every locale ends the same way.
 */
export function SiteFooter() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  const link =
    'hover:text-accent focus-visible:outline-accent decoration-accent/40 hover:decoration-accent rounded-xs underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
  const label = 'text-muted font-mono text-[0.75rem] tracking-[0.1em] uppercase'

  return (
    <footer className="border-subtle bg-surface/40 mt-auto border-t">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-12 sm:px-10">
        {/*
          Two ways to reach the same person, given the same weight and the
          same shape as the pair on the contact page, so the end of the site
          reads as a deliberate close rather than a strip of leftover links.

          No navigation list down here. The site has four pages and they are
          all one reach away in a header that never scrolls out of use, and
          T-218 placed every internal link on this site deliberately — a
          footer that links everything from everywhere would flatten that
          into noise.
        */}
        <ul className="grid gap-6 text-sm sm:grid-cols-2 sm:gap-10">
          <li>
            <p className={label}>{t('email')}</p>
            <a href={`mailto:${EMAIL}`} dir="ltr" className={`${link} mt-1.5 inline-block`}>
              {EMAIL}
            </a>
          </li>
          <li>
            <p className={label}>{t('github')}</p>
            {/* rel="me" is load-bearing, not decoration: it is one half of the
              bidirectional confirmation that lets a search engine merge this
              site and that profile into a single entity (goal G1,
              docs/02-keyword-plan.md §2). The other half is the profile
              linking back, which is T-317.

              LinkedIn stays absent. Its URL is not known, and the same
              reasoning as the `sameAs` list in lib/seo/schema.ts applies: a
              guessed profile URL does not join an entity, it splits one. */}
            <a
              href={GITHUB}
              rel="me noopener"
              target="_blank"
              dir="ltr"
              className={`${link} mt-1.5 inline-block`}
            >
              <span className="sr-only">{t('github')}: </span>
              {GITHUB.replace('https://github.com/', '')}
            </a>
          </li>
        </ul>

        <p className="border-subtle text-muted mt-10 border-t pt-6 text-sm" dir="ltr">
          © {year} Zeyad Alnahdi
        </p>
      </div>
    </footer>
  )
}
