import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGIN = 'https://zeyadalnahdi.test'

/**
 * The flags are re-read per test by resetting the module registry, because the
 * whole point of this module is that it behaves differently in different
 * environments — and the dangerous case is the one that should not be indexed.
 */
async function loadRobots(env: { vercelEnv?: string; indexable?: string }) {
  vi.resetModules()

  for (const [key, value] of [
    ['VERCEL_ENV', env.vercelEnv],
    ['SITE_INDEXABLE', env.indexable],
  ] as const) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }

  const mod = await import('@/app/robots')
  return mod.default()
}

afterEach(() => {
  delete process.env.VERCEL_ENV
  delete process.env.SITE_INDEXABLE
})

describe('robots', () => {
  describe('when the host may be indexed', () => {
    it('allows everything and points at the sitemap', async () => {
      const result = await loadRobots({ vercelEnv: 'production', indexable: 'true' })

      expect(result.rules).toEqual({ userAgent: '*', allow: '/' })
      expect(result.sitemap).toBe(`${ORIGIN}/sitemap.xml`)
    })
  })

  describe('when it may not', () => {
    it.each(['preview', 'development', undefined])(
      'disallows everything when VERCEL_ENV is %s and indexing is not opted in',
      async (vercelEnv) => {
        const result = await loadRobots({ vercelEnv })

        expect(result.rules).toEqual({ userAgent: '*', disallow: '/' })
      },
    )

    /**
     * **The regression T-321 exists to prevent.** Vercel marks the interim
     * `*.vercel.app` deployment `VERCEL_ENV=production`. While the two
     * questions shared one flag, that deployment would have served
     * `robots: allow` and a live sitemap — an indexable duplicate under a URL
     * the site is about to abandon.
     */
    it('is NOT indexable on a production deploy that has not opted in', async () => {
      const result = await loadRobots({ vercelEnv: 'production' })

      expect(result.rules).toEqual({ userAgent: '*', disallow: '/' })
      expect(result.sitemap).toBeUndefined()
    })

    /**
     * Opting in is exact. Anything that is not the string `'true'` leaves
     * indexing off, so a typo fails in the direction that costs a delay rather
     * than the one that publishes a duplicate.
     */
    it.each(['', 'TRUE', 'True', '1', 'yes', 'false'])(
      'treats SITE_INDEXABLE=%j as not indexable',
      async (indexable) => {
        const result = await loadRobots({ vercelEnv: 'production', indexable })

        expect(result.rules).toEqual({ userAgent: '*', disallow: '/' })
      },
    )

    it('does not advertise the sitemap when it is not indexable', async () => {
      const result = await loadRobots({ vercelEnv: 'preview' })

      expect(result.sitemap).toBeUndefined()
    })
  })
})
