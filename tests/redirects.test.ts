import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALE } from '@/lib/i18n/config'

interface Redirect {
  source: string
  destination: string
  permanent: boolean
  has?: { type: string; value: string }[]
}

/**
 * The route list is mocked to the full four-page shape so these tests state
 * the redirect map from docs/05-ia-url-map.md §8 rather than today's single
 * page. lib/seo/routes.ts holds the real list and grows in T-211..T-213.
 */
vi.mock('@/lib/seo/routes', () => ({
  ROUTES: ['', '/about', '/projects', '/contact'],
}))

async function redirects(): Promise<Redirect[]> {
  vi.resetModules()
  const config = (await import('@/next.config')).default
  const result: unknown = await config.redirects?.()
  return (result ?? []) as Redirect[]
}

describe('redirects', () => {
  /**
   * The one that matters most. A 302 or 307 tells search engines the old URL
   * is still canonical, so the locale-less form would keep whatever ranking it
   * has and the real URL would never accumulate any.
   */
  it('are all permanent, never temporary', async () => {
    for (const redirect of await redirects()) {
      expect(redirect.permanent, `${redirect.source} must be 308`).toBe(true)
    }
  })

  it('sends the bare root to the default locale', async () => {
    expect(await redirects()).toContainEqual(
      expect.objectContaining({ source: '/', destination: `/${DEFAULT_LOCALE}` }),
    )
  })

  it('sends every locale-less page to its default-locale equivalent', async () => {
    const map = await redirects()

    for (const path of ['/about', '/projects', '/contact']) {
      expect(map).toContainEqual(
        expect.objectContaining({ source: path, destination: `/${DEFAULT_LOCALE}${path}` }),
      )
    }
  })

  it('redirects www to the apex without naming a domain', async () => {
    const www = (await redirects()).find((redirect) => redirect.has?.[0]?.type === 'host')

    expect(www).toBeDefined()
    expect(www?.destination).toBe('https://:host/:path*')
    expect(www?.permanent).toBe(true)
  })

  it('does not redirect a URL that is already canonical', async () => {
    const sources = (await redirects()).map((redirect) => redirect.source)

    expect(sources).not.toContain(`/${DEFAULT_LOCALE}`)
    expect(sources).not.toContain('/en/about')
  })
})
