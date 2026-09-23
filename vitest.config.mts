import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolves the `@/*` alias from tsconfig natively — no plugin needed.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/seo/**'],
      // No threshold yet: origin.ts is not covered until T-125, which owns the
      // >=90% bar for lib/seo. Enforcing it here would make the gate red on
      // arrival, which is how gates get disabled (docs/09-cicd.md §6).
    },
  },
})
