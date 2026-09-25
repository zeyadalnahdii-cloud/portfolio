/**
 * Whether this build is the production deployment.
 *
 * `VERCEL_ENV`, never `NODE_ENV`. A preview build *is* a production build as
 * far as `NODE_ENV` is concerned — it is `'production'` there too. Branching on
 * it would report every preview as production and disable the protections that
 * depend on this flag, everywhere, silently.
 *
 * Locally `VERCEL_ENV` is unset, so a local build is treated as non-production.
 *
 * This answers one question only: *is this the deployment Vercel considers
 * production?* It deliberately no longer answers "may this host be indexed" —
 * see {@link IS_INDEXABLE}.
 */
export const IS_PRODUCTION_DEPLOY = process.env.VERCEL_ENV === 'production'

/**
 * Whether this host may be indexed by search engines (SRS X-06).
 *
 * **Separate from {@link IS_PRODUCTION_DEPLOY}, and that separation is the
 * whole point of T-321.** The two used to be one flag, which was correct only
 * while the production deployment and the canonical domain were the same
 * thing. They are not: the owner deferred the custom domain (D1b, 2026-09-27)
 * and the site is published on a free `*.vercel.app` host as an interim
 * deployment. Vercel marks that deployment `VERCEL_ENV=production`, so the old
 * single flag would have served `robots: allow`, no `noindex` header and a live
 * sitemap — publishing an indexable duplicate under a URL the site is about to
 * abandon.
 *
 * **Opt-in, and the default is the safe direction.** Indexing is off unless
 * `SITE_INDEXABLE` is exactly `'true'`. Anything else — unset, empty,
 * misspelled, `'1'`, `'TRUE'` — leaves it off.
 *
 * The asymmetry is deliberate. A host wrongly `noindex` costs a delay that
 * somebody notices. A host wrongly indexable is a full duplicate of the site
 * competing with the canonical domain, and nothing reports it until the
 * duplicates appear in search results. Default to the cheap failure.
 */
export const IS_INDEXABLE = process.env.SITE_INDEXABLE === 'true'
