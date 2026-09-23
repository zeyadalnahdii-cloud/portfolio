import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * origin.ts validates at module load, so every case re-imports it with a
 * different environment. This is the module the rest of lib/seo is built on:
 * a wrong value here is wrong in every canonical, every hreflang entry, every
 * Open Graph tag and every sitemap line at once.
 */
async function loadOrigin(url: string | undefined, vercelEnv?: string) {
  vi.resetModules()

  if (url === undefined) {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
  } else {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', url)
  }

  if (vercelEnv === undefined) {
    vi.stubEnv('VERCEL_ENV', '')
  } else {
    vi.stubEnv('VERCEL_ENV', vercelEnv)
  }

  return import('@/lib/seo/origin')
}

async function expectRejected(url: string | undefined, reason: RegExp, vercelEnv?: string) {
  await expect(loadOrigin(url, vercelEnv)).rejects.toThrow(reason)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('ORIGIN validation', () => {
  it('accepts an https origin', async () => {
    const { ORIGIN } = await loadOrigin('https://zeyadalnahdi.com')

    expect(ORIGIN).toBe('https://zeyadalnahdi.com')
  })

  it('accepts loopback over http, for local development', async () => {
    await expect(loadOrigin('http://localhost:3000')).resolves.toBeTruthy()
    await expect(loadOrigin('http://127.0.0.1:3000')).resolves.toBeTruthy()
  })

  it('keeps a non-default port', async () => {
    const { ORIGIN } = await loadOrigin('http://localhost:4000')

    expect(ORIGIN).toBe('http://localhost:4000')
  })

  describe('refuses a value it cannot build absolute URLs from', () => {
    /**
     * There is deliberately no fallback. Defaulting to localhost would let a
     * build succeed with every canonical URL pointing at the wrong host —
     * deployed, indexed, and invisible until somebody reads the page source.
     */
    it('when unset', async () => {
      await expectRejected(undefined, /is not set/)
    })

    it('when only whitespace', async () => {
      await expectRejected('   ', /is not set/)
    })

    it('when it has no scheme', async () => {
      await expectRejected('zeyadalnahdi.com', /must be an absolute URL/)
    })

    it('when the scheme is neither http nor https', async () => {
      await expectRejected('ftp://zeyadalnahdi.com', /must use http or https/)
    })

    it('when it ends in a slash', async () => {
      await expectRejected('https://zeyadalnahdi.com/', /must not end with a trailing slash/)
    })

    it('when it carries a path', async () => {
      await expectRejected('https://zeyadalnahdi.com/site', /must be an origin with no path/)
    })

    it('when it carries a query string', async () => {
      await expectRejected('https://zeyadalnahdi.com?v=1', /must not carry a query string/)
    })

    it('when it carries a fragment', async () => {
      await expectRejected('https://zeyadalnahdi.com#top', /must not carry a query string/)
    })

    it('when it is http on a host that is not loopback', async () => {
      await expectRejected('http://zeyadalnahdi.com', /must use https for any host other than/)
    })
  })

  describe('in a production deploy', () => {
    it('refuses loopback, even though it is fine locally', async () => {
      await expectRejected(
        'http://localhost:3000',
        /must be an https URL on a real host/,
        'production',
      )
    })

    it('accepts a real https host', async () => {
      const { ORIGIN } = await loadOrigin('https://zeyadalnahdi.com', 'production')

      expect(ORIGIN).toBe('https://zeyadalnahdi.com')
    })
  })

  it('names the variable and says how to set it', async () => {
    await expect(loadOrigin(undefined)).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/)
    await expect(loadOrigin(undefined)).rejects.toThrow(/\.env\.local/)
    await expect(loadOrigin(undefined)).rejects.toThrow(/Vercel/)
  })
})

describe('url()', () => {
  const ORIGIN = 'https://zeyadalnahdi.com'

  it('returns the bare origin for the root, with no trailing slash', async () => {
    const { url } = await loadOrigin(ORIGIN)

    expect(url()).toBe(ORIGIN)
    expect(url('/')).toBe(ORIGIN)
  })

  it('accepts a path with or without a leading slash', async () => {
    const { url } = await loadOrigin(ORIGIN)

    expect(url('/en/about')).toBe(`${ORIGIN}/en/about`)
    expect(url('en/about')).toBe(`${ORIGIN}/en/about`)
  })

  it('strips trailing slashes, so there is one URL form (SRS X-05)', async () => {
    const { url } = await loadOrigin(ORIGIN)

    expect(url('/en/')).toBe(`${ORIGIN}/en`)
    expect(url('/en/about/')).toBe(`${ORIGIN}/en/about`)
    expect(url('/en/about///')).toBe(`${ORIGIN}/en/about`)
  })

  it('never doubles the separator', async () => {
    const { url } = await loadOrigin(ORIGIN)

    for (const path of ['', '/', 'en', '/en', '/en/about']) {
      expect(url(path)).not.toContain('//en')
      expect(url(path).replace('https://', '')).not.toContain('//')
    }
  })
})
