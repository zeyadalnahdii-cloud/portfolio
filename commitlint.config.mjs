/**
 * Conventional Commits, per docs/07-repo-standards.md §5.2.
 *
 * a11y, i18n and seo are deliberate non-standard additions: they make the
 * history show at a glance that these concerns were addressed continuously
 * rather than in one retrofit commit near the end.
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'a11y', 'i18n', 'seo'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
}

export default config
