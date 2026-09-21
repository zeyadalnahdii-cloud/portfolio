# 09 — CI/CD Plan

**Platform:** GitHub Actions + Vercel
**Status:** Draft — implemented in Sprint 1, fully enforcing by Sprint 3

---

## 0. Purpose

Vercel handles deployment on its own. CI here exists for a different reason: **to stop
quality from eroding after launch.**

Every SEO, performance and accessibility requirement in `04-srs.md` is easy to satisfy
once and easy to break later — a missing `generateMetadata` on a new route, an image
without dimensions, an `outline: none`, a font subset silently widened. None of these
produce an error. They produce a slow decline that nobody notices until a Search
Console warning arrives weeks later.

The gates below turn that silent class of regression into a failed pull request.

---

## 1. Pipeline overview

```
PR opened / updated
   │
   ├── validate      typecheck · lint · commitlint · secrets · audit
   ├── build         next build · 12 routes generated
   ├── test          unit · integration
   │
   ├── Vercel preview deployment  (X-Robots-Tag: noindex)
   │      │
   │      ├── lighthouse    SEO 100 · A11y ≥95 · Perf ≥90
   │      ├── axe           zero violations, 12 routes
   │      ├── metadata      uniqueness · length · canonical
   │      └── links         zero broken internal links
   │
   └── all green → merge to dev → merge to main → production deploy
```

`main` is protected: no direct pushes, PR required, every gate green, branch current.

---

## 2. Jobs

### 2.1 `validate`

| Step | Command | Fails on |
|---|---|---|
| Type check | `tsc --noEmit` | Any error |
| Lint | `eslint . --max-warnings=0` | Any error **or warning** |
| Format | `prettier --check .` | Any deviation |
| Commit messages | `commitlint` | Non-conforming message |
| Secrets | `gitleaks detect` | Any likely credential |
| Dependencies | `npm audit --audit-level=high` | High or critical |

`--max-warnings=0` is deliberate (07 §4): a warning nobody fixes trains everyone to
ignore the output, and then a real error hides inside it.

### 2.2 `build`

| Step | Fails on |
|---|---|
| `next build` | Build error |
| Route count assertion | Fewer than 12 static routes generated |
| Env validation | `NEXT_PUBLIC_SITE_URL` missing (07 §2) |
| Bundle size | Any route over 150KB gzipped JS (P-05) |

The route-count assertion catches a specific failure: a change to
`generateStaticParams` or the locale union silently dropping a locale. The build
succeeds, the site loses four pages, and nothing reports it.

### 2.3 `test`

| Suite | Scope |
|---|---|
| Unit | `lib/seo/*` — alternates, metadata, schema. Coverage ≥ 90% (07 §7) |
| Integration | `sitemap.ts` / `robots.ts` output; I-14 gate toggles correctly |
| E2E (main only) | Playwright: navigation, switching, form, per locale |

E2E runs on merges to `main` rather than every PR — it is the slowest suite and the
PR gates already cover the regressions that matter.

### 2.4 `lighthouse`

Runs against the Vercel preview URL, mobile emulation, throttled, **three runs
median** (single-run Lighthouse scores are too noisy to gate on).

| Category | Threshold | Source |
|---|---|---|
| SEO | **100** | Non-negotiable; G3 |
| Accessibility | ≥ 95 | A-02 |
| Performance | ≥ 90 | P-04 |
| Best Practices | ≥ 90 | — |

Asserted per-metric as well as per-category: LCP < 2.5s, CLS < 0.1, TBT as the INP
proxy. Category scores can stay green while one metric degrades.

Run on a representative subset — `/en`, `/ar/projects`, `/tr/about` — covering all
three locales, both directions, and the heaviest page. Twelve full audits per PR is
slow enough that people start skipping the gate.

### 2.5 `axe`

`@axe-core/playwright` against all 12 preview routes. **Zero violations** (A-01).
Full coverage here is cheap — the run takes seconds.

### 2.6 `metadata`

A project-specific script, because no off-the-shelf tool checks these:

| Assertion | Requirement |
|---|---|
| Every route has a title and description | M-01 |
| Title ≤ 60, description ≤ 155 | M-02 |
| Titles and descriptions unique within a locale | M-04 |
| Canonical present, absolute, matches the route | M-03 |
| `hreflang` set complete and **reciprocal** | I-07 |
| `x-default` → the `en` equivalent | 05 §3 |
| Exactly one `h1`; no skipped heading levels | M-09, M-10 |
| `lang` and `dir` correct | I-05, I-06 |
| JSON-LD parses and validates | S-01..S-07 |
| Sitemap entries match indexable routes exactly | X-01, X-02 |

**This is the most valuable job in the pipeline.** Everything it checks is invisible
in a browser, absent from the build output, and expensive to discover from Search
Console six weeks later.

The reciprocity check earns its place specifically: a one-directional `hreflang` set
is the single most common trilingual SEO defect, it renders correctly, and it is
undetectable by eye.

### 2.7 `links`

Crawls the preview deployment: zero broken internal links, zero unexpected redirect
chains, external links resolve (warning only — third-party availability is not this
project's gate).

---

## 3. Environments

| Environment | Trigger | Domain | Indexable |
|---|---|---|---|
| Preview | Every PR | `*.vercel.app` | **No** — `X-Robots-Tag: noindex` |
| Production | Merge to `main` | `{ORIGIN}` | Yes |

**X-06 verification is a CI assertion, not a config review.** The pipeline issues a
request against the preview URL and asserts the header is present. A `noindex` that
was configured but is not actually being served is indistinguishable from a working
one until the previews appear in search results — as a full duplicate of the site,
competing with the canonical domain.

`robots.ts` branches on `VERCEL_ENV === 'production'`, never `NODE_ENV`: preview
builds are production builds.

---

## 4. Secrets

| Secret | Used by |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Build — canonicals, `hreflang`, OG, sitemap |
| `RESEND_API_KEY` (or equivalent) | Contact form (C-04, C-05) |
| `CONTACT_TO_EMAIL` | Contact form |

Stored in Vercel environment variables and GitHub Actions secrets. Never committed
(07 §6). `.env.example` documents every variable with dummy values.

---

## 5. Post-launch monitoring

CI protects the repository. These protect the live site, where the SRS budgets are
actually measured.

| What | How | Cadence |
|---|---|---|
| Field Core Web Vitals | Search Console *Core Web Vitals* | Monthly |
| Index coverage | Search Console *Pages* | Weekly for 30 days, then monthly |
| `hreflang` errors | Search Console *International Targeting* | Weekly for 30 days (G6) |
| Real queries | Search Console *Performance* | Monthly — the only real keyword data (`02` §1) |
| Uptime | Vercel monitoring | Continuous |

Lab data (Lighthouse in CI) and field data (Search Console) disagree routinely. When
they do, **field data wins** — P-01..P-03 are defined on real users, and CI thresholds
are a proxy for them, not the goal.

---

## 6. Implementation schedule

| Sprint | State |
|---|---|
| S1 | `validate`, `build`, `test` enforcing. `lighthouse`, `axe`, `metadata` running in report-only mode |
| S2 | `metadata` and `axe` promoted to blocking |
| S3 | `lighthouse` promoted to blocking; preview `noindex` assertion added; full pipeline enforcing |

Gates start report-only and are promoted once the codebase can actually pass them.
A gate introduced as blocking before the code can satisfy it gets disabled within a
week — and a disabled gate is worse than no gate, because everyone assumes it is
still running.
