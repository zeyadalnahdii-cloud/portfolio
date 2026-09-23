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
      // No threshold yet: origin.ts is not covered until T-125, which owns the
      // >=90% bar for lib/seo. Enforcing it here would make the gate red on
      // arrival, which is how gates get disabled (docs/09-cicd.md §6).
    },
  },
})
