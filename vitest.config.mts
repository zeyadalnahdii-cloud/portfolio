import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolves the `@/*` alias from tsconfig natively — no plugin needed.
  resolve: { tsconfigPaths: true },
  test: {
    // Node by default; component suites opt into jsdom with a file-level
    // // @vitest-environment jsdom comment, so the fast suites stay fast.
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
    // Pinned so the suite is hermetic. lib/seo/origin.ts reads this at module
    // load, so without it the expected URLs would depend on whatever the
    // surrounding environment happened to set — which is how a suite passes
    // locally and fails in CI.
    env: { NEXT_PUBLIC_SITE_URL: 'https://zeyadalnahdi.test' },
    coverage: {
      provider: 'v8',
      include: ['lib/seo/**'],
      // docs/07-repo-standards.md §7. This module is held to a bar the rest of
      // the code is not, because its failures are silent: a broken hreflang set
      // produces no error, no failed build and no visible defect — only a
      // Search Console warning, weeks later. Nothing else here fails that
      // quietly.
      //
      // Enabled now rather than in T-114, because a gate introduced before the
      // code can pass it is a gate someone disables (docs/09-cicd.md §6).
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
})
