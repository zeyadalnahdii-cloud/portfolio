import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGIN = 'https://zeyadalnahdi.test'

/**
 * The environment flag is re-read per test by resetting the module registry,
 * because the whole point of this module is that it behaves differently in two
 * environments — and the dangerous case is the one that is not production.
 */
async function loadRobots(vercelEnv: string | undefined) {
  vi.resetModules()

  if (vercelEnv === undefined) {
    delete process.env.VERCEL_ENV
  } else {
    process.env.VERCEL_ENV = vercelEnv
  }

  const mod = await import('@/app/robots')
  return mod.default()
}

afterEach(() => {
  delete process.env.VERCEL_ENV
})

describe('robots', () => {
  describe('production', () => {
    it('allows everything and points at the sitemap', async () => {
      const result = await loadRobots('production')

      expect(result.rules).toEqual({ userAgent: '*', allow: '/' })
      expect(result.sitemap).toBe(`${ORIGIN}/sitemap.xml`)
    })
  })

  describe('everywhere else', () => {
    // Preview builds are production builds as far as NODE_ENV is concerned.
    // Branching on NODE_ENV would report every preview as production and
    // disable this protection everywhere.
    it.each(['preview', 'development', undefined])(
      'disallows everything when VERCEL_ENV is %s',
      async (env) => {
        const result = await loadRobots(env)

        expect(result.rules).toEqual({ userAgent: '*', disallow: '/' })
      },
    )

    it('does not advertise the sitemap from a non-production deploy', async () => {
      const result = await loadRobots('preview')

      expect(result.sitemap).toBeUndefined()
    })
  })
})
