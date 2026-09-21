# 10 — Developer Task Breakdown

**Status:** Sprint 1 fully specified · Sprints 2–3 enumerated, expanded on arrival
**Method:** one task per branch, one branch per PR (`07-repo-standards.md` §5)

---

## 0. How to use this document

Tasks are worked **one at a time, in order**. Each carries:

- **Depends on** — tasks that must be done first
- **Requirements** — the IDs from `04-srs.md` it satisfies
- **Steps** — what to actually do
- **Done when** — the acceptance check, verifiable by someone else
- **Watch out** — the specific mistake this task invites

A task is finished when its *Done when* passes, not when the code is written.

**Sizes:** S ≈ under an hour · M ≈ half a day · L ≈ a full day or more.

### Why Sprints 2–3 are not expanded yet

Their tasks are listed with dependencies and acceptance criteria, but not with
step-level detail. That detail depends on decisions made during Sprint 1 — the shape
of `buildMetadata`, how the message files end up structured, what the spike rejects.
Writing it now produces detail that must be rewritten before it is used.

Each sprint is expanded when the previous one closes.

---

# Sprint 1 — Foundation

**Goal:** a site with no content whose SEO infrastructure is already complete and correct.

## Phase A — Spike (days 1–3)

The purpose is to *learn whether the approach works*, not to produce final code.
Spike code is thrown away. Resist polishing it.

---

### T-101 · Initialise the project — S

**Depends on:** —
**Requirements:** 07 §2

**Steps**
1. `npx create-next-app@latest` — TypeScript, App Router, no `src/`, ESLint yes.
2. Set `tsconfig.json` to the full strict block in `07-repo-standards.md` §2
   (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
   `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`).
3. `next.config.ts`: `trailingSlash: false`, `reactStrictMode: true`.
4. Commit: `chore: initialise next.js project with strict typescript`.

**Done when:** `npm run dev` serves a page and `npx tsc --noEmit` is clean.

**Watch out:** `noUncheckedIndexedAccess` will make `messages[locale]` return
`T | undefined`. That is correct and the point — do not disable it when it first
complains. Narrow instead.

---

### T-102 · Prove three-locale routing — M

**Depends on:** T-101
**Requirements:** I-01, I-02, I-03

**Steps**
1. `npm i next-intl`.
2. Create `app/[locale]/layout.tsx` and `app/[locale]/page.tsx`.
3. Define the locale union and the list:
   ```ts
   export const LOCALES = ['en', 'tr', 'ar'] as const
   export type Locale = (typeof LOCALES)[number]
   ```
4. `generateStaticParams` returning all three.
5. Middleware or config so `/` → `/en` (308) and an unknown locale 404s.
6. Render the locale name on the page to confirm which one is active.

**Done when:** `/en`, `/tr`, `/ar` each render and show their own locale; `/` issues a
308 to `/en`; `/fr` returns a real 404 status (not a fallback render).

**Watch out:** the default locale **must** carry its prefix — `/en`, never bare `/`
serving English content. Serving the same content at two URLs is the duplicate-content
problem the whole URL design in `05` §2 exists to avoid.

---

### T-103 · Prove RTL with logical properties — M

**Depends on:** T-102
**Requirements:** I-05, I-06, F-03, 06 §3

**Steps**
1. Set `lang` and `dir` on `<html>` from the route locale.
2. Build a throwaway layout with a header, a two-column row and a card — styled
   **only** with logical properties (`margin-inline-start`, `padding-inline-end`,
   `border-inline-start`, `text-align: start`).
3. Load `/en` and `/ar` side by side and compare.
4. Put a code snippet and an email address inside Arabic text; give them `dir="ltr"`.

**Done when:** `/ar` mirrors completely with no RTL-specific stylesheet, and the code
snippet and email render left-to-right inside the right-to-left paragraph.

**Watch out:** test with **real Arabic text**, not Lorem Ipsum. Latin placeholder text
in an RTL layout hides every bidi bug the real content will expose — most visibly a
trailing period jumping to the wrong end of the line.

---

### T-104 · Prove full static generation — S

**Depends on:** T-102
**Requirements:** 04 §1

**Steps**
1. Add throwaway `about`, `projects`, `contact` routes under `[locale]`.
2. `npm run build`.
3. Read the route table in the build output.

**Done when:** the output lists **12 routes** marked static (`○`), none marked dynamic
(`ƒ`).

> Note: Next.js 16 marks routes generated via `generateStaticParams` with `●` (SSG)
> rather than `○` (Static). Both are prerendered at build time.

**Watch out:** reading `headers()`, `cookies()` or `searchParams` anywhere in a route
silently opts it into dynamic rendering. The build still succeeds — it just stops
being static, and the performance budget stops being reachable.

---

### T-105 · Prove Arabic OG image generation — M

**Depends on:** T-102
**Requirements:** M-08, 06 §4

**Steps**
1. Add `app/[locale]/opengraph-image.tsx` using `next/og`.
2. Render the locale's site title — including the Arabic one.
3. Fetch the font file explicitly and pass it in the `fonts` option.
4. Open the generated image for all three locales.

**Done when:** the Arabic card renders readable Arabic glyphs, correctly shaped and
right-aligned — not boxes, not disconnected letterforms.

**Watch out:** this is the single most common failure in localised OG generation.
`next/og` does **not** inherit the app's fonts. Without an explicit font buffer the
Arabic card renders as tofu boxes, and nothing warns you — you find out when someone
shares the link.

---

### T-106 · Spike review — S

**Depends on:** T-101 … T-105
**Requirements:** 08 §Sprint 1

**Steps**
1. Confirm all five spike outcomes.
2. Record anything that did not work and what replaced it.
3. **Delete the spike code.** Keep the findings, not the implementation.

**Done when:** all five confirmed, or the approach is changed now, in week 1, rather
than in week 4.

**Watch out:** the temptation to keep spike code because "it works". Spike code has no
tests, no error handling and no structure. Keeping it means shipping it.

---

## Phase B — Infrastructure (days 4–10)

Real code from here. Every task gets a branch, a PR and green CI.

---

### T-110 · Tooling and standards — M

**Depends on:** T-106
**Requirements:** 07 §4, §5.4

**Steps**
1. ESLint: `next/core-web-vitals` + `@typescript-eslint/recommended-type-checked` +
   `jsx-a11y` (as **errors**).
2. Prettier: 2 spaces, single quotes, 100 columns, trailing commas.
3. Husky + lint-staged: `pre-commit` (format, lint, secret scan), `commit-msg`
   (commitlint), `pre-push` (`tsc --noEmit`).
4. `.gitignore`, `.env.example`.
5. The custom rules in `07` §4 (bare `<a href="/">`, `outline: none`, `style.left`).

**Done when:** a commit with a bad message is rejected; a file with a lint error cannot
be committed; `npm run lint` passes with `--max-warnings=0`.

**Watch out:** keep hooks fast. A `pre-commit` that takes 30 seconds is a hook people
bypass with `--no-verify`, and then it protects nothing.

---

### T-111 · CI skeleton — M

**Depends on:** T-110
**Requirements:** 09 §2.1, §2.2

**Steps**
1. `.github/workflows/ci.yml`: `validate` and `build` jobs on every PR.
2. `validate`: `tsc --noEmit`, `eslint --max-warnings=0`, `prettier --check`,
   `commitlint`, `gitleaks`, `npm audit --audit-level=high`.
3. `build`: `next build` + assert 12 static routes.
4. Protect `main`: PR required, CI green, branch current.

**Done when:** a PR with a type error is blocked from merging.

**Watch out:** the route-count assertion is not decoration. A change to
`generateStaticParams` or the locale union can silently drop a locale — the build
succeeds, four pages vanish, and nothing reports it.

---

### T-112 · `lib/seo/origin.ts` — env validation — S

**Depends on:** T-110
**Requirements:** 07 §2, M-03

**Steps**
1. Read `NEXT_PUBLIC_SITE_URL`.
2. Validate: present, absolute, `https` in production, **no trailing slash**.
3. **Throw at module load if invalid** — this fails the build.
4. Export `ORIGIN` and a `url(path)` helper that joins safely.
5. Document the variable in `.env.example`.

**Done when:** `npm run build` with the variable unset fails with a clear message
naming the variable.

**Watch out:** never default to `http://localhost:3000`. A silent fallback ships a site
whose every canonical URL points at localhost — deployed, indexed, and invisible until
someone reads the page source. This is the highest-consequence line of code in Sprint 1.

---

### T-113 · Locale configuration and message loading — M

**Depends on:** T-106, T-112
**Requirements:** I-01, I-10, I-11, I-14

**Steps**
1. `lib/i18n/config.ts`: `LOCALES`, `Locale`, `DEFAULT_LOCALE = 'en'`.
2. `messages/{en,tr,ar}.json`, each with:
   ```json
   { "_meta": { "reviewed": false }, "nav": { ... } }
   ```
3. Type the message shape from `en.json`; other locales must structurally match.
4. **Missing key → build failure**, not a silent fallback.
5. Export `isReviewed(locale)` — the single source of truth for the indexing gate.

**Done when:** deleting a key from `tr.json` fails `npm run build` with a message
naming the key.

**Watch out:** `isReviewed` is read by *two* consumers — the robots directive and the
alternates generator (T-114). One function, two call sites. Duplicating the check is
how they drift apart and produce the `hreflang`-points-at-`noindex` contradiction.

---

### T-114 · `lib/seo/alternates.ts` — L

**Depends on:** T-112, T-113
**Requirements:** I-07, I-08, 05 §3

**Steps**
1. `buildAlternates(locale, pathname)` returning `{ canonical, languages }`.
2. `canonical` = absolute `{ORIGIN}/{locale}{pathname}`, no trailing slash.
3. `languages` = one entry per **reviewed** locale, plus `x-default` → the `en` URL.
4. Exclude unreviewed locales entirely (`isReviewed` from T-113).
5. Every page includes **itself** in its own set.

**Done when:** unit tests cover: all three reviewed → 4 entries; `tr` unreviewed → `tr`
absent from every set; `x-default` always points at the `en` equivalent of the *same*
page; all URLs absolute with no trailing slash.

**Watch out:** reciprocity. If `/en/about` declares `tr`, then `/tr/about` must declare
`en`. A one-directional set renders perfectly, breaks nothing visible, and is the most
common trilingual SEO defect there is. The test for it is cheap; finding it in Search
Console six weeks later is not.

---

### T-115 · `lib/seo/metadata.ts` — L

**Depends on:** T-114
**Requirements:** M-01 … M-08

**Steps**
1. `buildMetadata({ locale, pathname, title, description })` → Next.js `Metadata`.
2. Compose: title, description, `alternates` (T-114), Open Graph
   (`title`, `description`, `url`, `siteName`, `locale`, `type`,
   `alternateLocale`), Twitter `summary_large_image`.
3. Assert in development: title ≤ 60, description ≤ 155 — fail loudly.
4. Emit `robots: { index: false }` when the locale is unreviewed (I-14).

**Done when:** a route calling only `buildMetadata` produces complete, valid `<head>`
markup with an absolute canonical and a full alternates set.

**Watch out:** no route may hand-write its own alternates or canonical. One helper,
used everywhere. The moment a page writes its own, the set drifts.

---

### T-116 · `lib/seo/schema.ts` — M

**Depends on:** T-112
**Requirements:** S-01, S-02, S-06, S-07

**Steps**
1. `Person`: canonical name, `alternateName` variants (`02` §2), `jobTitle`, `url`,
   `email`, `sameAs` (GitHub, LinkedIn), `knowsAbout`, `address` (Aksaray, TR),
   `knowsLanguage`.
2. `WebSite`: `inLanguage`, `publisher` → the `Person` `@id`.
3. Emit as a single `@graph` with stable `@id`s.
4. Render via `<script type="application/ld+json">` in the locale layout.

**Done when:** the output passes Google's Rich Results Test and the Schema.org
validator, with entities linked by `@id` rather than repeated.

**Watch out:** S-07 — structured data must describe what is actually on the page.
Do not add `codeRepository` fields pointing at repositories nobody can open (D3).

---

### T-117 · `sitemap.ts` — M

**Depends on:** T-113, T-114
**Requirements:** X-01, X-02, 05 §5

**Steps**
1. Generate an entry per reviewed locale × the four pages.
2. Absolute `loc`; `alternates.languages` mirroring T-114 exactly.
3. **Omit** `changefreq` and `priority` — Google ignores both.
4. `lastModified` only if genuinely accurate; otherwise omit it.

**Done when:** `/sitemap.xml` lists 12 entries with all locales reviewed, and 8 when
one locale is gated off.

**Watch out:** a `lastmod` equal to build time on every page is a false signal — it is
ignored at best and distrusted at worst. Omitting it is better than faking it.

---

### T-118 · `robots.ts` + preview isolation — M

**Depends on:** T-112
**Requirements:** X-03, X-06, 05 §6

**Steps**
1. Production: `Allow: /` plus the sitemap reference.
2. Non-production: `Disallow: /` **and** an `X-Robots-Tag: noindex` header from
   `next.config.ts` headers or middleware.
3. Branch on `VERCEL_ENV === 'production'` — **not** `NODE_ENV`.

**Done when:** `curl -I` against a preview deployment shows `X-Robots-Tag: noindex`,
and production does not.

**Watch out:** `robots.txt` alone does not prevent indexing of a URL discovered through
a link — the header is what actually protects you. And preview builds *are* production
builds, so `NODE_ENV` is always `production` there; branching on it disables the
protection everywhere.

---

### T-119 · Indexing gate, end to end — M

**Depends on:** T-113, T-114, T-115, T-117
**Requirements:** I-14

**Steps**
1. Confirm `_meta.reviewed = false` produces, for that locale: `noindex` in metadata,
   removal from the sitemap, removal from **every** alternates set.
2. Integration test toggling the flag and asserting all three effects.

**Done when:** flipping `tr._meta.reviewed` to `false` changes all three outputs, in
one commit, with no other edit.

**Watch out:** this is the task that ties T-113 through T-117 together. If the three
effects can disagree, the gate is decorative.

---

### T-120 · Layout shell — L

**Depends on:** T-103, T-113
**Requirements:** F-06, F-07, A-06, 06 §2.1

**Steps**
1. Header: name, four nav links, slots for switcher and theme toggle.
2. Footer: email, GitHub, LinkedIn (`rel="me"`), copyright.
3. Skip-to-content link, visible on focus, targeting `<main id="content">`.
4. Mobile: nav collapses to a disclosure button — dismissible with `Esc`, no focus trap.
5. Logical properties only.

**Done when:** the shell renders in all three locales, mirrors correctly in Arabic, and
is fully keyboard navigable including `Esc` on the mobile menu.

**Watch out:** a full-screen mobile menu that cannot be dismissed by keyboard fails A-04
outright. Build the dismissal at the same time as the menu, not after.

---

### T-121 · Language switcher — M

**Depends on:** T-120
**Requirements:** I-09, A-11, F-02

**Steps**
1. Read the current pathname, strip the locale segment, re-prefix with the target.
2. Each option carries `hreflang` and `lang`.
3. Keyboard accessible; current locale marked with `aria-current`.

**Done when:** switching from `/tr/projects` to Arabic lands on `/ar/projects` — every
page, every direction.

**Watch out:** the failure mode is dumping the user on the locale homepage. It is also
the only place on the site where a link legitimately crosses locales (`05` §4.1).

---

### T-122 · Theme toggle — M

**Depends on:** T-120
**Requirements:** F-04, A-12, P-02

**Steps**
1. Respect `prefers-color-scheme`; allow manual override; persist in `localStorage`.
2. Apply before first paint via an inline script — no flash of the wrong theme.
3. `aria-pressed` reflects state.
4. Wrap the storage read in `try/catch` — it throws in some privacy modes.

**Done when:** no theme flash on reload, the choice persists, and axe reports no
violations on the control.

**Watch out:** reading `localStorage` in a `useEffect` means the wrong theme paints
first. That flash is also a CLS and LCP risk, not only a cosmetic one.

---

### T-123 · Fonts — M

**Depends on:** T-103
**Requirements:** P-08, P-09, 06 §1.2

**Steps**
1. `next/font/local` or `next/font/google`, self-hosted, `display: swap`.
2. **Separate subsets**: Latin+Turkish for `en`/`tr`, Arabic for `ar`.
3. Load conditionally by locale in the locale layout.
4. Verify the Latin subset includes `ı ğ ş ç ö ü`.

**Done when:** the network panel on `/en` shows **no** Arabic font request, and `/tr`
renders `ı` and `ğ` correctly rather than falling back.

**Watch out:** one font file covering Latin + Arabic + Turkish is the common and
expensive mistake — it ships the entire Arabic glyph range to every English visitor,
for nothing.

---

### T-124 · Redirects and URL normalisation — S

**Depends on:** T-102
**Requirements:** X-05, X-07, 05 §8

**Steps**
1. `trailingSlash: false`.
2. `/` → `/en`; bare `/about`, `/projects`, `/contact` → `/en/...`. All 308.
3. `www` → apex and HTTP → HTTPS configured in Vercel (verified in Sprint 3).

**Done when:** `curl -I` returns 308 for each row of the redirect map in `05` §8.

**Watch out:** 308, not 302. A temporary redirect tells search engines the old URL is
still canonical.

---

### T-125 · Unit tests for `lib/seo` — M

**Depends on:** T-114, T-115, T-116, T-117
**Requirements:** 07 §7

**Steps**
1. Vitest.
2. `buildAlternates`: reciprocity, `x-default`, absolute URLs, unreviewed exclusion.
3. `buildMetadata`: length limits, canonical correctness, `noindex` propagation.
4. `schema`: valid JSON-LD, `@id` linkage.
5. `sitemap`: entry count under each review state.
6. Coverage ≥ 90% for `lib/seo/`.

**Done when:** the suite passes in CI and coverage meets the threshold.

**Watch out:** this module is tested precisely because its failures are silent. A broken
`hreflang` set produces no error, no failed build and no visible defect — only a Search
Console warning, weeks later. That asymmetry is the whole argument for the coverage bar.

---

### T-126 · Sprint 1 gate — M

**Depends on:** all of the above
**Requirements:** 08 §Sprint 1 gate

**Verify, one by one**

| # | Check |
|---|---|
| 1 | 12 routes resolve; `/` 308s to `/en` |
| 2 | `lang` and `dir` correct on all 12 |
| 3 | Reciprocal `hreflang` + `x-default` on every route |
| 4 | Toggling `_meta.reviewed` changes metadata, sitemap **and** alternates |
| 5 | `/sitemap.xml` and `/robots.txt` correct, absolute URLs |
| 6 | Build fails without `NEXT_PUBLIC_SITE_URL` |
| 7 | Lighthouse SEO = 100 on the empty shell |
| 8 | All CI gates green |

**Blocked on D1.** Checks 3, 5 and 7 cannot be honestly verified against a placeholder
origin — the domain must exist by now.

**Done when:** all eight pass. Then, and only then, Sprint 2 starts.

---

# Sprint 2 — Content

Enumerated only. Expanded when Sprint 1 closes.

**Content track — starts day 1, parallel to the build.** It is the critical path:
four pages × three languages is more writing than it looks, and the Turkish review is
an external dependency with its own latency.

| ID | Task | Size | Depends on |
|---|---|---|---|
| T-201 | English copy, all four pages | L | — |
| T-202 | Arabic copy — written, not translated | L | T-201 |
| T-203 | Turkish copy — drafted | L | T-201 |
| T-204 | Turkish native review → `_meta.reviewed = true` | M | T-203, **D4** |
| T-205 | Keyword validation against real tool data | M | — |
| T-206 | CV in three locales | M | T-201 |
| T-210 | Home page | L | T-126 |
| T-211 | About page | M | T-210 |
| T-212 | Projects page | L | T-210, **D2/D3** |
| T-213 | Contact page + form handler | L | T-210 |
| T-214 | 404 page | S | T-210 |
| T-215 | Per-route metadata wired from `02` §4 | M | T-210…T-214 |
| T-216 | `BreadcrumbList`, `SoftwareSourceCode`, `ContactPage` schema | M | T-215 |
| T-217 | OG images per route per locale | M | T-105, T-215 |
| T-218 | Internal linking per `05` §4.2 | S | T-210…T-214 |
| T-219 | RTL review, all screens, four theme/direction combinations | L | T-210…T-214 |
| T-220 | `metadata` and `axe` CI jobs promoted to blocking | M | T-215 |
| T-221 | Sprint 2 gate | M | all |

---

# Sprint 3 — Hardening & launch

Enumerated only. Expanded when Sprint 2 closes.

| ID | Task | Size | Depends on |
|---|---|---|---|
| T-301 | Lighthouse pass, all 12 routes, mobile throttled | M | T-221 |
| T-302 | LCP work — confirm the LCP element is text | M | T-301 |
| T-303 | CLS work — reserved space audit | M | T-301 |
| T-304 | INP work | M | T-301 |
| T-305 | Bundle analysis — under 150KB gzipped per route | M | T-301 |
| T-306 | Verify Arabic subset absent on `/en` and `/tr` | S | T-123 |
| T-307 | axe — zero violations, all 12 | M | T-301 |
| T-308 | Contrast audit, both themes | M | T-307 |
| T-309 | Keyboard walkthrough per locale, RTL focus order | M | T-307 |
| T-310 | Screen reader pass on the form | M | T-307 |
| T-311 | Production deploy, domain, HTTPS, `www` → apex | M | **D1** |
| T-312 | Verify preview `noindex` by request | S | T-311 |
| T-313 | Full CI pipeline enforcing | M | T-311 |
| T-314 | Search Console: verify, submit sitemap | S | T-311 |
| T-315 | Request indexing, all 12 routes | S | T-314 |
| T-316 | Confirm zero `hreflang` errors | S | T-314 |
| T-317 | GitHub + LinkedIn: canonical name, link to domain | S | T-311 |
| T-318 | Repository READMEs in English | M | **D2/D3** |
| T-319 | Sprint 3 gate | M | all |

> T-317 and T-318 are the only tasks that do work **outside** this repository, and they
> carry more weight for G1 than anything on-page. The `rel="me"` links only consolidate
> the name entity if the profiles link back.

---

## Starting point

**T-101.** It depends on nothing and needs no decision.

D1 (domain) is not needed to *start* — it is needed by **T-126**, the Sprint 1 gate.
That is roughly two weeks of runway to resolve it.
