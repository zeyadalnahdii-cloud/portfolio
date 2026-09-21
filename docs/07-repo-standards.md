# 07 — Repository Standards

**Status:** Draft — to be applied before the first feature commit
**Applies to:** this repository, from Sprint 1 day 1

---

## 0. Timing

These standards are established **before the first feature commit**, not after the
last one. Retrofitting `strict` mode onto a written codebase means fixing errors
under deadline pressure; enabling it on an empty one costs nothing.

The repository is also a work sample. A recruiter who opens it sees the commit
history, the README and the CI badge before they see any feature.

---

## 1. Structure

```
.
├── .github/workflows/      CI pipelines (09-cicd.md)
├── app/                    Next.js App Router — route map in 05 §7
├── components/
│   ├── ui/                 Presentational, no data access
│   └── layout/             Header, footer, nav, switchers
├── lib/
│   ├── seo/                origin · alternates · metadata · schema
│   └── utils/
├── messages/               en.json · tr.json · ar.json
├── public/                 Static assets, CVs, favicons
├── docs/                   These planning documents
└── tests/
```

Rules:
- One component per file. Filename matches the exported component.
- No component imports from a sibling's internals; shared code moves to `lib/`.
- `lib/seo/` has **no** UI imports. It is pure, and therefore testable.

---

## 2. TypeScript

`strict: true` from the first commit, plus:

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "forceConsistentCasingInFileNames": true
}
```

| Rule | Detail |
|---|---|
| `any` | Forbidden. Use `unknown` and narrow. Escapes need `// @ts-expect-error` with a written reason |
| Non-null assertion (`!`) | Forbidden. Narrow explicitly |
| Return types | Explicit on all exported functions |
| Locale type | `type Locale = 'en' \| 'tr' \| 'ar'` — a union, never `string`. A locale typed as `string` is how an unhandled fourth locale reaches production |
| Env vars | Validated at build time in `lib/seo/origin.ts`. A missing `NEXT_PUBLIC_SITE_URL` **fails the build**, it does not default to `localhost` |

> The env rule is load-bearing. A silent `localhost` fallback produces a site whose
> canonical URLs all point at `http://localhost:3000` — deployed, indexed, and
> invisible until someone reads the page source.

---

## 3. Naming

| Kind | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProjectCard.tsx` |
| Hooks | camelCase, `use` prefix | `useTheme.ts` |
| Utilities | camelCase | `buildAlternates.ts` |
| Types / interfaces | PascalCase, no `I` prefix | `ProjectMeta` |
| Constants | SCREAMING_SNAKE | `SUPPORTED_LOCALES` |
| Route folders | lowercase, ASCII, hyphenated | `app/[locale]/projects/` |
| Message keys | dot-namespaced by page | `projects.aiWorkspace.title` |
| CSS custom properties | kebab-case | `--text-muted` |

Code, comments, commits and identifiers are in **English**. User-facing strings live
in `messages/*.json` and nowhere else.

---

## 4. Linting & formatting

| Tool | Configuration |
|---|---|
| ESLint | `next/core-web-vitals` + `@typescript-eslint/recommended-type-checked` |
| Prettier | 2 spaces, single quotes, no semicolons omitted, 100 cols, trailing commas |
| `eslint-plugin-jsx-a11y` | Errors, not warnings — A-01..A-12 depend on it |

Custom rules that enforce SRS requirements:

| Rule | Enforces |
|---|---|
| `no-restricted-syntax`: bare `<a href="/...">` | X-08 — internal links use `next/link` |
| `no-restricted-syntax`: `outline: none` without `:focus-visible` | A-05 |
| `no-restricted-properties`: `style.left` / `style.right` | RTL logical properties (06 §3.1) |
| `i18n/no-literal-string` on `app/` and `components/` | I-10 — no hardcoded user-facing text |

Warnings are not tolerated. A warning nobody fixes trains everyone to ignore the
output, and then a real error hides in it. CI treats warnings as failures.

---

## 5. Git

### 5.1 Branches

| Branch | Purpose |
|---|---|
| `main` | Deployable. Protected. Production deploys from here |
| `dev` | Integration |
| `feat/*`, `fix/*`, `docs/*`, `chore/*` | Short-lived, branched from `dev` |

`main` protection: no direct pushes, PR required, all CI gates green, branch up to date.

### 5.2 Commits

Conventional Commits:

```
<type>(<scope>): <subject>

[body: why, not what]
```

Types: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf` · `a11y` · `i18n` · `seo`

`a11y`, `i18n` and `seo` are non-standard additions, included deliberately: they make
the history show at a glance that these concerns were addressed continuously rather
than in one retrofit commit near the end.

```
feat(seo): add reciprocal hreflang alternates for all locales
fix(i18n): keep language switcher on the equivalent route
a11y(form): link error messages to inputs via aria-describedby
```

Rules: imperative mood, lowercase subject, no trailing period, ≤ 72 chars. The body
explains *why*. No `WIP`, `update`, or `fix stuff` on `main`.

### 5.3 Pull requests

Template requires: what changed · why · which SRS requirement IDs it satisfies ·
screenshots for UI changes (**LTR and RTL, light and dark**) · a checklist.

Checklist:
- [ ] Type-checks, lints, builds
- [ ] All three locales updated if user-facing strings changed
- [ ] RTL verified if layout changed
- [ ] Metadata present if a route was added
- [ ] `hreflang` and sitemap updated if a route was added
- [ ] axe reports zero violations
- [ ] No secrets, no `console.log`

### 5.4 Hooks (Husky + lint-staged)

| Hook | Action |
|---|---|
| `pre-commit` | Prettier + ESLint on staged files; secret scan |
| `commit-msg` | `commitlint` against Conventional Commits |
| `pre-push` | `tsc --noEmit` |

Kept fast. A slow hook is a hook people bypass with `--no-verify`.

---

## 6. Secrets

| Rule | Detail |
|---|---|
| Never committed | `.env*` in `.gitignore`, except `.env.example` |
| `.env.example` | Every variable listed with a dummy value and a comment |
| Production values | Vercel environment variables only |
| Pre-commit scan | Blocks likely keys and tokens |

If a secret is ever committed: rotate it first, then clean the history. Rotation is
the fix; history rewriting is cleanup. Doing it the other way round leaves a live
credential in every existing clone.

---

## 7. Testing

Proportionate to a 12-route static site — the CI quality gates (`09-cicd.md`) carry
most of the verification weight.

| Layer | Scope |
|---|---|
| Unit (Vitest) | `lib/seo/*` — `buildAlternates`, `buildMetadata`, `schema`. The logic where errors are silent and costly |
| Integration | `sitemap.ts` and `robots.ts` output; the I-14 indexing gate toggling correctly |
| E2E (Playwright) | One pass per locale: navigation, language switching, form submission |
| Accessibility | `axe-core` on all 12 routes, in CI |

**`lib/seo/` is the one module with a coverage expectation** (≥ 90%). A broken
`hreflang` set produces no error, no failed build and no visible defect — it produces
a Search Console warning weeks later. That asymmetry is what justifies the tests.

---

## 8. README

The README is portfolio surface. It must contain: what the project is · live URL ·
stack · local setup · environment variables · architecture summary · a note on the
trilingual SEO approach.

**In English.** See also `01-project-proposal.md` §7.2 — `Restaurant_Management`
needs the same treatment for the same reason.

---

## 9. Dependencies

| Rule | Detail |
|---|---|
| Justify additions | Each dependency is a bundle-size and supply-chain cost. P-05 caps JS at 150KB gzipped |
| Prefer platform | `Intl` over a date library. CSS logical properties over an RTL plugin |
| Lockfile committed | Reproducible builds |
| No UI framework by default | 12 static pages do not need one. Add only if the token system proves insufficient |
| Audit | `npm audit` in CI; high-severity findings block |
