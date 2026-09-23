/**
 * Whether this build is the production deployment.
 *
 * `VERCEL_ENV`, never `NODE_ENV`. A preview build *is* a production build as
 * far as `NODE_ENV` is concerned — it is `'production'` there too. Branching on
 * it would report every preview as production and disable the protections that
 * depend on this flag, everywhere, silently.
 *
 * Locally `VERCEL_ENV` is unset, so a local build is treated as non-production.
 * That is the safe direction: the failure mode is an over-cautious `noindex` on
 * a machine nobody crawls, not an indexed preview competing with the real site.
 *
 * Defined once because several places read it — the origin validator and the
 * robots directive today — and two copies of this check are two chances to get
 * it wrong.
 */
export const IS_PRODUCTION_DEPLOY = process.env.VERCEL_ENV === 'production'
