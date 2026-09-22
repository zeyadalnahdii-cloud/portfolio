import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  ...nextVitals,
  ...nextTs,

  // Type-aware rules. These catch what tsc does not — an unawaited promise
  // type-checks fine and still ships a race.
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },

  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    rules: {
      // docs/07-repo-standards.md §4: accessibility rules are errors, not
      // warnings. SRS A-01..A-12 depend on them.
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // docs/07-repo-standards.md §4, custom rule 1 — SRS X-08.
      // Internal navigation goes through next/link. A bare anchor drops
      // client-side routing and the locale prefix with it.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXOpeningElement[name.name="a"] > JSXAttribute[name.name="href"] > Literal[value=/^\\//]',
          message:
            'Internal links must use next/link, not a bare <a href="/...">. See docs/07-repo-standards.md §4 (SRS X-08).',
        },
        // Custom rule 2 — SRS A-05. Removing the outline without replacing it
        // leaves keyboard users with no visible focus indicator.
        {
          selector: 'Property[key.name="outline"][value.value="none"]',
          message:
            'Do not set outline: none. Provide a visible :focus-visible indicator instead. See docs/07-repo-standards.md §4 (SRS A-05).',
        },
        // Custom rule 3 — RTL, docs/06-mockups.md §3.1. Physical offsets do
        // not follow dir; logical properties do.
        {
          selector:
            'MemberExpression[object.property.name="style"][property.name=/^(left|right)$/]',
          message:
            'Use logical properties (inset-inline-start / inset-inline-end) rather than style.left or style.right, so the layout follows dir. See docs/06-mockups.md §3.1.',
        },
      ],
    },
  },

  // Must stay last: turns off the ESLint rules that would fight Prettier.
  prettier,
])

export default eslintConfig
