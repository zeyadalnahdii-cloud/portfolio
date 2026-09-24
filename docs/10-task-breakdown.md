# 10 — Developer Task Breakdown

**Status:** Sprints 1 and 2 fully specified · Sprint 3 enumerated, expanded on arrival
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

### Why Sprint 3 is not expanded yet

Its tasks are listed with dependencies and acceptance criteria, but not with
step-level detail. That detail depends on what Sprint 2 produces — which pages
exist, what the measured performance actually is, what the deploy needs.
Writing it now produces detail that must be rewritten before it is used.

Sprint 2 was expanded on the same principle, once Sprint 1 had settled the shape
of `buildMetadata`, the message files and the route registry.

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

**Goal:** twelve routes live, in three languages, each one indexable and correct.

Sprint 1 built the machinery and left it running on one page. This sprint is
mostly writing, and the code is thin by comparison: every page passes copy to
`buildMetadata` and is added to `lib/seo/routes.ts`, and the sitemap, navigation,
redirects and route assertion follow on their own.

**Entered under a recorded exception.** T-126 check 1 is still failing and is
re-run once T-211..T-213 land — see `12-sprint-1-gate.md`.

## What changed since these tasks were enumerated

Three facts from Sprint 1 shape the work and were not known when this list was
first written:

**`lib/seo/routes.ts` is the single source of truth for which pages exist.** The
sitemap, the header navigation, the locale-less redirects and
`scripts/assert-routes.mjs` all read it. Adding a route there before its page
exists breaks all four at once — a sitemap advertising a 404, a nav item that
dead-ends, a redirect chain into nothing, and a failing CI assertion. So every
page task ends by adding its route, never begins with it.

**`ROUTE_LABEL` is typed against `ROUTES`.** Adding a route without giving it a
navigation label does not compile. That is deliberate and means nothing extra is
needed to keep the nav honest.

**Metadata is not a separate step per page.** `buildMetadata` is a single call
and belongs in the page task that creates the route. T-215 is therefore a
verification and consolidation task, not wiring — see its entry.

## Sequencing

The content track is the critical path, not the build. Four pages in three
languages is more writing than it looks, and the Turkish review (D4) is an
external dependency with its own latency. **T-201 and T-203 start on day 1**,
in parallel with T-210.

Pages land one at a time, each complete: copy, metadata, route registration,
RTL check. A half-finished page in `ROUTES` is worse than no page.

---

## Content track

### T-201 · English copy, all four pages — L

**Depends on:** —
**Requirements:** I-10, `02` §4, §5

**Steps**

1. Write Home, About, Projects and Contact from the outlines in `02` §5, using
   the titles and descriptions already mapped in `02` §4.
2. Put every string in `messages/en.json`. Nothing user-facing in a component
   (SRS I-10).
3. Keep titles ≤ 60 characters and descriptions ≤ 155. `buildMetadata` throws in
   development if either is over, so this is checked as you write.
4. Follow the content rules already recorded: the psychology background as an
   added capability with one concrete example, never a career-change story
   (`01` §2, F-31); the AI Autonomous Workspace described as built and verified
   with deployment pending, never "in development" (`03` §1.3).

**Done when:** all four pages' copy exists in `en.json`, within the length
limits, and `npm run build` passes.

**Watch out:** the Projects copy is the one with a factual obligation. State the
measured result — a 35-page PDF indexed end to end in 32.6s on a self-hosted
stack — and say plainly what is not finished. A portfolio that is precise about
scope is read as trustworthy about results; one that rounds up is not.

---

### T-202 · Arabic copy — L

**Depends on:** T-201
**Requirements:** I-10, I-12, `02` §3.3

**Steps**

1. Write the Arabic in `messages/ar.json`. Written, not translated — the keyword
   research for Arabic is independent of the English set (`02` §3.3).
2. Include both transliterated and Latin forms of technical terms where people
   search both (`باك اند` alongside `backend`).
3. Set `ar._meta.reviewed = true` once the owner has read it through.

**Done when:** the Arabic reads as Arabic rather than as English with Arabic
words, and `/ar` drops its `noindex`.

**Watch out:** this is the one locale with no external dependency — the owner is
a native speaker. It is also the one most likely to be left at `reviewed: false`
because nothing forces the moment of sign-off. Set the flag deliberately.

---

### T-203 · Turkish copy, drafted — L

**Depends on:** T-201
**Requirements:** I-10, I-12, `02` §3.2

**Steps**

1. Draft Turkish in `messages/tr.json`.
2. Use `geliştirici`, not `mühendis`: the latter implies a formal engineering
   degree in Turkish professional usage (`02` §3.2).
3. Preserve every diacritic. `tests/typography.test.ts` guards this.

**Done when:** the draft is complete and ready for review. `tr._meta.reviewed`
stays `false`.

**Watch out:** `yazilim` and `yazılım` are different strings to a search engine,
and the second is what people type. Stripping diacritics does not merely look
wrong, it changes the word.

---

### T-204 · Turkish native review — M

**Depends on:** T-203, **D4**
**Requirements:** I-12, I-14

**Steps**

1. A competent Turkish speaker reads the whole of `tr.json`.
2. Corrections applied.
3. `tr._meta.reviewed = true`.

**Done when:** `/tr` drops its `noindex`, appears in the sitemap and in every
`hreflang` set, and Lighthouse SEO on `/tr` reaches 100.

**Watch out:** blocked on D4, which is a person, not a decision. Start looking
for the reviewer in week 1 rather than discovering in week 2 that nobody is
available. Until then the gate degrades gracefully — `/tr` builds and serves,
it is simply kept out of the index.

---

### T-205 · Keyword validation — M

**Depends on:** —
**Requirements:** `02` §1

**Steps**

1. Run the terms in `02` §3 through Google Keyword Planner per locale.
2. Check autocomplete and "People also ask" from the target region and language.
3. Adjust the titles and descriptions in `02` §4 where the data disagrees with
   the hypothesis, then update the copy.

**Done when:** `02` §1's caveat can be removed, because the terms are measured
rather than reasoned.

**Watch out:** every term in `02` is explicitly a hypothesis. Some will be
wrong. Changing them is the point of this task, not a sign the plan failed.

---

### T-206 · CV, three locales — M

**Depends on:** T-201
**Requirements:** F-34

**Steps**

1. One PDF per locale in `public/`.
2. Filenames carry the canonical name spelling — `Zeyad-Alnahdi-CV-en.pdf` —
   because the filename is visible in the URL and in the reader's downloads.
3. Link from About with the file size and format in the link text.

**Done when:** each locale's About page offers its own CV and the links resolve.

**Watch out:** the canonical spelling matters here as much as on the page. A CV
filed as `cv-final-2.pdf` in someone's downloads folder is not findable later
by the name it should reinforce.

---

## Build track

### T-210 · Home page — L

**Depends on:** T-126 *(under exception)*, T-201
**Requirements:** F-10 … F-14, `06` §2.2

**Steps**

1. Replace the placeholder in `app/[locale]/page.tsx` with the real page:
   positioning line, introduction, stack as plain text, two project cards,
   one call to action.
2. Call `buildMetadata` with the Home copy. Nothing else — no hand-written
   canonical or alternates.
3. The stack list is text, not logos (F-12): text is indexable, images are not.
4. Fixed card heights so nothing shifts as content loads (P-02).

**Done when:** `/en`, `/tr` and `/ar` render the real Home page, `npm run
assert:routes` passes, and Lighthouse SEO on `/en` is still 100.

**Watch out:** no hero image, carousel or background video. Each is a direct LCP
cost and LCP is a gate (P-01). The LCP element on this page should be text.

---

### T-211 · About page — M

**Depends on:** T-210, T-201
**Requirements:** F-30 … F-34, `06` §2.4

**Steps**

1. `app/[locale]/about/page.tsx`, `generateStaticParams` and `setRequestLocale`
   as the other routes do.
2. `buildMetadata` with the About copy.
3. Sections: how I learned, psychology applied, what I am looking for, CV
   download.
4. **Then** add `'/about'` to `ROUTES` and its label to `ROUTE_LABEL`.

**Done when:** six routes prerender, `/about` appears in the navigation, the
sitemap and the locale-less redirect map, and `assert:routes` passes at 6.

**Watch out:** step 4 is last for a reason. Adding the route first puts a 404 in
the sitemap and a dead link in the header until the page exists.

---

### T-212 · Projects page — L

**Depends on:** T-210, T-201, **D2/D3**
**Requirements:** F-20 … F-23, `06` §2.3

**Steps**

1. `app/[locale]/projects/page.tsx` with one `h2` per project and a consistent
   internal shape: problem, architecture, scale, result, stack tags, links.
2. `buildMetadata` with the Projects copy.
3. Repository links — blocked on D2/D3. A link to a private repository is a 404
   and is worse than no link.
4. A live demo link for the AI workspace if it has been deployed by then; it
   outweighs everything else on the page (`01` §7.1).
5. Add `'/projects'` to `ROUTES` and `ROUTE_LABEL`.

**Done when:** nine routes prerender and both projects are presented with the
same internal structure.

**Watch out:** consistency beats decoration here. A recruiter scans for stack
and scale; both should sit in the same position on every card.

---

### T-213 · Contact page and form — L

**Depends on:** T-210, T-201
**Requirements:** F-40 … F-45, C-01 … C-08

**Steps**

1. `app/[locale]/contact/page.tsx` with the form, the email as selectable text,
   and the profile links carrying `rel="me"`.
2. `buildMetadata` with the Contact copy.
3. Server-side validation as the boundary; client validation is UX only (C-02).
4. Honeypot plus per-IP rate limiting. **No CAPTCHA** — it costs INP and
   accessibility, both of which are gates (C-03).
5. Email provider decision (C-04, still open). Credentials from environment
   variables, documented in `.env.example` (C-05).
6. Reserve the height of the status message from the start, so submitting does
   not shift the page (P-02, A-08).
7. Degrade to a visible `mailto:` link if JavaScript fails (C-07).
8. Add `'/contact'` to `ROUTES` and `ROUTE_LABEL`.

**Done when:** twelve routes prerender, a submission arrives, and the form is
usable by keyboard with errors announced.

**Watch out:** this is the one route that stops being purely static. Keep the
handler at the edge of the app so the twelve pages stay prerendered — if the
route itself goes dynamic, the performance budget goes with it.

**On landing this task, re-run T-126.** Check 1 becomes satisfiable for the
first time, and the exception it was entered under ends here.

---

### T-214 · 404 page — S

**Depends on:** T-210
**Requirements:** F-08, X-04

**Steps**

1. Localised not-found page linking back into the site.
2. Confirm it returns a real 404 status, not a soft 404 (X-04).

**Done when:** an unknown path in each locale renders the localised page with a
404 status.

**Watch out:** it is not a page route and must not enter `ROUTES` — it has no
place in the sitemap or the navigation.

#### Status 2026-09-23: **not complete.** X-04 met, F-08 deferred to Sprint 3

Step 2 passes and step 1 does not. The requirement is unchanged and the task
stays open; only the schedule moved.

**What works today, with no code written for this task:**

```
/en/nonexistent · /tr/nonexistent · /ar/nonexistent   404
/fr · /fr/about · /en/a/b/c · /nonexistent            404
```

Real 404 statuses, no soft 404, nothing in the sitemap — **X-04 is met**. What
is served is Next's built-in 404: no header, no footer, no `lang`/`dir`, not in
the visitor's language. **F-08 is not met.**

**Why it is deferred, with the evidence — so nobody investigates this twice.**

Three hypotheses were tested against a running production build. Every
experiment was reverted; the tree is byte-identical to where it started.

*1. "The not-found component was throwing."* — **Disproved.** A trivial server
component with hardcoded text and no next-intl and no hooks behaves the same.

*2. "`dynamicParams = false` on the locale layout blocks the catch-all."* —
**Confirmed as a blocker, and it cannot be overridden per segment.** With it in
place the catch-all is never invoked at all: the marker string is absent from
the payload entirely. Relaxing it on the layout does let the catch-all run —
and, separately, `/fr` still returns 404, because the guard that actually
rejects unknown locales is the explicit `isLocale()` check, not this setting.

*3. "There is no root layout for the not-found boundary to render into."* —
**Confirmed, and it is the one that matters.** With the catch-all reachable,
`notFound()` renders the component — the marker appears in the HTML — but Next
wraps it in `<html id="__next_error__">` rather than in the locale layout.

**The restructure does not fix it.** Both shapes were built and served:

| Shape | Build | `lang`/`dir` on the 12 routes | Localised 404 |
|---|---|---|---|
| Root layout returning `children` only | passes | preserved | **no** — still `__next_error__` |
| Root layout with `<html>`, locale layout without | passes | **lost entirely** | **no** — still `__next_error__`, no header |

So the full restructure pays the cost — `<html>` served with no `lang` and no
`dir`, breaking I-05 and I-06 — and does not collect the benefit. That is why
option A was rejected after being chosen: the plan was written before these
measurements existed, and the measurements contradicted it.

**Not attempted, deliberately:** a middleware rewrite. It is the one remaining
untried path, and it was ruled out in T-102 for reasons that still hold — it
adds an edge function and ends the site being fully static. Revisit only if
Sprint 3 finds nothing better.

Scheduled as **T-320**.

---

### T-215 · Metadata verification — M

**Depends on:** T-210 … T-214
**Requirements:** M-01 … M-04

Not wiring: each page calls `buildMetadata` when it is created, because that is
one line and separating it invites a route to ship without metadata. This task
verifies the result across all twelve.

**Steps**

1. Confirm every route has a title and description, unique within its locale.
2. Confirm every title ≤ 60 and description ≤ 155.
3. Confirm every canonical is absolute and matches its route.
4. Confirm exactly one `h1` per page and no skipped heading levels (M-09, M-10).
5. Reconcile against the map in `02` §4 — the copy that shipped should be the
   copy that was planned, or the plan should be updated to match.

**Done when:** 12 of 12 routes verified on every point.

**Watch out:** duplicate descriptions across pages are the usual finding, and
they are invisible in a browser.

---

### T-216 · Per-page structured data — M

**Depends on:** T-215
**Requirements:** S-03, S-04, S-05, S-07

**Steps**

1. `BreadcrumbList` on About, Projects and Contact.
2. `SoftwareSourceCode` per project, linked to the Person by `@id`, with
   `codeRepository` **only** if the repository is public (D2/D3).
3. `ContactPage` on Contact.
4. Extend `lib/seo/schema.ts` rather than adding JSON-LD in pages, so the graph
   stays one graph and `@id`s stay consistent.

**Done when:** the graph validates in the Rich Results Test and every entity is
referenced by `@id` rather than repeated.

**Watch out:** S-07. Structured data describing content that is not on the page
is a manual-action risk, and `codeRepository` pointing at a repository nobody
can open is exactly that.

---

### T-217 · Open Graph images — M

**Depends on:** T-215
**Requirements:** M-08, `06` §4

Rebuilt from scratch — the T-105 spike route was deleted in T-106, deliberately.
Its findings are in `11-spike-findings.md` §2 and all three apply:

**Steps**

1. `app/[locale]/opengraph-image.tsx`, 1200×630, per route per locale.
2. Load font buffers explicitly. `next/og` does not inherit the app's fonts, and
   without them the Arabic card renders as tofu boxes with no warning.
3. Read `.woff`, not `.woff2` — satori cannot decode the latter.
4. Alignment comes from the container's `alignItems`; `textAlign` does nothing,
   because satori sizes flex children to their content.
5. Arabic word order must be reversed as layout — one flex item per word in a
   `row-reverse` container. satori does not run the bidirectional algorithm, and
   Unicode embedding controls make it worse.
6. Use the design tokens and real copy, not the spike's placeholders.

**Done when:** every card renders correctly in all three locales, checked by
opening the images.

**Watch out:** the Arabic failure is the dangerous one. The card looks polished
to anyone who does not read Arabic — the script is beautiful and correctly
joined, and only the reading order is wrong. Have someone read it.

---

### T-218 · Internal linking — S

**Depends on:** T-210 … T-214
**Requirements:** X-08, `05` §4.2

**Steps**

1. Add the contextual links in `05` §4.2 beyond the navigation: Home → Projects,
   Home → Contact, About → Projects, Projects → Contact, 404 → Home.
2. Descriptive anchor text, localised. No "click here", no "read more".
3. `rel="me"` on the profile links; `rel="noopener"` on external ones.

**Done when:** every page is reachable from every other, and Projects carries the
most inbound internal links — it is the page that converts and the one whose
keywords are most winnable.

**Watch out:** body links never cross locales. The language switcher is the only
place on the site where that is legitimate (`05` §4.1). A stray `/en/about` link
on an Arabic page is a silent locale leak.

**Status — complete except step 1's 404 link.**

| Link | State |
|---|---|
| Home → Projects | Done — the two project cards link to their sections on `/projects` via `projectAnchor()`, plus the existing "see all projects" link |
| Home → Contact | Done — the primary CTA |
| About → Projects | Done — `about.seeProjects` |
| Projects → Contact | Done — `projects.ctaLead` + `projects.cta` |
| 404 → Home | **Blocked.** No localised 404 page exists; T-214 was deferred to **T-320**. Copy (`notFound.backHome`) is written in all three locales and ships with that page |

Steps 2 and 3 pass: anchor text is descriptive and localised in all three
locales, no "click here" or "read more"; `rel="me noopener"` was already on both
profile links (footer and Contact) from T-210/T-213.

Measured inbound internal links per locale, from the prerendered HTML:
`/projects` 10 · `/` 9 · `/contact` 8 · `/about` 6. Projects leads, as the
done-when requires.

`scripts/verify-links.mjs` (wired into the CI build job) enforces all three
properties. Each check was fault-injected and confirmed to fail: a stray `/en`
href on `/ar/about`, an unmarked language switcher, and Projects losing its
lead each produce a red run.

---

### T-219 · RTL and theme review — L

**Depends on:** T-210 … T-214
**Requirements:** F-03, A-03, `06` §3.2, §6

**Steps**

1. Every screen in four combinations: LTR light, LTR dark, RTL light, RTL dark.
2. Including the mobile navigation, the language switcher, form error states and
   the 404 page.
3. Contrast checked in **both** themes (A-03).
4. Confirm no physical direction properties have crept in.

**Done when:** all four combinations signed off for all twelve routes.

**Watch out:** review with the real Arabic and Turkish content. Latin filler in
an RTL layout hides every bidi bug the real copy exposes, and dark-mode contrast
is the regression that reliably gets missed.


**Status — complete for 12 of the 13 screens; the 404 is blocked.**

Reviewed by capturing all 12 routes in every combination — light/dark x
desktop/mobile — plus the mobile navigation opened, and the contact form with
every field invalid at once. 60 states, each screenshotted and scanned with
axe-core (WCAG 2.1 A + AA). Real Arabic and Turkish copy throughout; no filler.

**Verified across all 60 states:** `lang` and `dir` correct per locale
(`ar` = `rtl`), Arabic served IBM Plex Sans Arabic at 1.8 line-height and Latin
locales Inter at 1.6 (`06` §1.2), and **zero horizontal overflow** anywhere.
Final axe result: **zero violations**.

**Three defects found and fixed.**

1. **A-03 / A-01 — `text-white` on the accent fill measured 3.10:1 in dark**
   (hover 2.15:1), on both buttons on the site: the Home CTA and the contact
   submit. Cause: `06` §1.1 had no token for text drawn *on* the accent, so both
   call sites hardcoded white — correct in light, failing in dark.
2. **A-03 / A-01 — error text at 3.96:1 in dark.** The form hardcoded Tailwind
   `red-600` for both the message and the invalid border, in both themes.
3. **RTL layout — the mobile navigation drawer was broken in all three
   locales.** It carried `inset-inline-0`, which **is not a Tailwind utility**
   and compiled to no CSS at all; the `absolute` panel shrink-wrapped to its
   content and floated over the `h1`. Replaced with `start-0 end-0` (real
   `inset-inline-start`/`-end`) plus `z-10`. Verified present in the generated
   stylesheet, not merely in the markup.

Fixes 1 and 2 added three tokens — `--accent-fg`, `--danger`,
`--border-control` — to all three theme blocks, documented in `06` §1.1.
`--border-control` also raises the form-input boundary from 1.36:1 to 3.45:1
(light) and 1.55:1 to 4.12:1 (dark), for WCAG 1.4.11; `--border-subtle` is
unchanged and stays decorative.

**One bidi defect found and fixed:** the `/projects` headings carried
`dir="ltr"` on the `<h2>` itself. On a block element that sets alignment as well
as character order, so both Latin project titles left-aligned on the Arabic page
while every other element was right-aligned. Replaced with `<bdi>`. This is the
defect the watch-out predicts: it is invisible in English and Turkish, and axe
never sees it.

**Step 4 — no physical direction properties.** All 21 files under `app/` and
`components/` scanned for physical Tailwind utilities (`ml-`, `pr-`, `left-`,
`border-l`, `rounded-r`, `text-left`, `float-*`, `space-x-`) and physical CSS
(`margin-left`, `left:`, `text-align: left|right`). **Zero found.** The scan was
validated against 20 known-bad and 17 known-good strings before being trusted.
Note that this check would *not* have caught defect 3, which was neither
physical nor real — a reminder that the absence of physical properties is not
the same as correct logical ones.

**Blocked — the 404 page (step 2).** It cannot be reviewed in four combinations
because it has neither a locale nor a theme: a missing route still returns
Next.js's built-in page, `<html>` with no `lang` and no `dir`, English-only
"This page could not be found.", and its own hardcoded colours that ignore the
site palette. Reviewing it is part of **T-320**, with the page itself.

**Regression guard:** `tests/contrast.test.ts` parses the tokens out of
`app/globals.css` and asserts every pair in both themes, and asserts the
media-query dark block and the explicit `[data-theme='dark']` block stay
identical — a value fixed in one and not the other gives a site accessible only
to whoever toggled the theme by hand. It restates no hex values of its own; a
test holding its own copy of the palette passes while the site fails. Confirmed
to fail when the original defect is reintroduced.

**Sign-off: 12 of 12 routes in all four combinations. The 404 is not signed off
and carries to T-320.**

---

### T-220 · Promote the CI gates — M

**Depends on:** T-215
**Requirements:** `09` §2.5, §2.6, §6

**Steps**

1. Build the `metadata` job from `09` §2.6: per-route title and description
   presence, uniqueness and length; absolute canonical; **reciprocal**
   `hreflang`; `x-default` correctness; one `h1`; valid JSON-LD; sitemap
   matching the indexable routes.
2. Add the `axe` job across all twelve routes, zero violations.
3. Promote both to blocking.

**Done when:** a pull request that breaks any of them cannot merge.

**Watch out:** these are promoted now rather than in Sprint 1 because only now
can the code pass them. A gate enforced before that is a gate someone disables
within a week (`09` §6) — and the reciprocity check in particular earns its
place, because a one-directional `hreflang` set renders perfectly and is
undetectable by eye.


**Status — complete.**

**Step 1.** `scripts/verify-metadata.mjs` already covered M-01…M-04, M-09 and
M-10. Extended with the rest of the §2.6 table: `lang`/`dir` (I-05, I-06),
hreflang reciprocity (I-07), `x-default` (`05` §3), JSON-LD validity
(S-01…S-07) and sitemap agreement (X-01, X-02).

Two design points carry the weight:

- **Nothing is derived from the code it checks.** Locales and pages are written
  out in the script, and *indexability is read from each page's own robots meta
  tag* rather than from `lib/i18n`. A check importing the same source as the
  page would agree with it while both were wrong.
- **Reciprocity is checked page-to-page over what was served**, not recomputed
  from the function that emitted it. For every pair of indexable translations,
  A must declare B *and* B must declare A. A locale held back by the indexing
  gate must not be advertised by anyone, including itself.

**Step 2.** `scripts/verify-axe.mjs` — `@axe-core/playwright`, WCAG 2.1 A + AA,
all 12 routes in **both themes** (24 scans). Two themes rather than one because
T-219 found two contrast failures that existed only in dark mode, on every
button on the site; a light-only run was green while the primary CTA was
unreadable.

**Step 3.** Both jobs added to `.github/workflows/ci.yml` and made **required
status checks**. This was two things, not one: a job that merely runs is
advisory, and a red advisory check is something people learn to merge past.
`dev` had **no branch protection at all**, so requiring them only on `main`
would have left every pull request we actually open unguarded. `validate`,
`build`, `metadata` and `axe` are now required on both branches.

Both jobs build with `VERCEL_ENV=production`; otherwise the deployment is
treated as a preview and served with a blanket `X-Robots-Tag: noindex`, and the
jobs would be inspecting a page nobody will be served. The preview-`noindex`
assertion itself is Sprint 3 (`09` §6) and is deliberately not implemented here.

**Every check was fault-injected before being trusted**, against a fixture
serving mutated copies of the real pages:

| Injected defect | Caught as |
|---|---|
| `/en/about` stops declaring `ar` (one-directional) | `hreflang "ar" is (absent)` |
| `ar` declared but pointing at the wrong page | reported from **both** sides of the pair |
| `x-default` → `/ar` instead of `/en` | `x-default is …/ar, expected …/en` |
| noindex `tr` advertised as an alternate | `declares hreflang "tr", which is noindex` |
| sitemap entry removed | `does not list indexable route …` |
| sitemap entry added for a noindex route | `lists …, which is not an indexable route` |
| `dir="ltr"` on the Arabic page | `html dir is ltr, expected rtl` |
| `lang="en"` on the Turkish page | `html lang is en, expected tr` |
| JSON-LD `@id` reference broken | `references undefined @id` |
| JSON-LD made unparseable | `JSON-LD does not parse` |
| T-219's dark contrast defect reintroduced | axe: 5 violations, **all tagged `[dark]`** |

The unmutated baseline passes, so none of these is a check that fails on
everything.

---

### T-221 · Sprint 2 gate — M

**Depends on:** all of the above
**Requirements:** `08` §Sprint 2 gate

**Verify, one by one**

| # | Check |
|---|---|
| 1 | 12/12 routes: unique title and description, within length limits |
| 2 | Absolute, correct canonical on every route |
| 3 | JSON-LD passes the Rich Results Test; `@id` graph linked; reflects visible content |
| 4 | OG images render correctly in all three locales, Arabic included |
| 5 | One `h1`, no skipped heading levels, on all 12 |
| 6 | Images have explicit dimensions; zero CLS contribution |
| 7 | No missing translation keys; build fails if any |
| 8 | Turkish native-reviewed; `_meta.reviewed = true` |
| 9 | RTL signed off in four theme and direction combinations |
| 10 | Language switcher maps to equivalent routes, never to home |
| 11 | Zero broken internal links |

**Done when:** all green. A locale still failing review stays `noindex` — the
sprint may close, but that locale does not ship indexed.

**Also re-run T-126.** Its check 1 is satisfiable once twelve routes exist, and
the exception recorded in `12-sprint-1-gate.md` ends when it passes, not when
this gate does.

---

## Risks specific to this sprint

| Risk | Impact | Mitigation |
|---|---|---|
| Content underestimated | The sprint overruns on writing, not code | Content track starts day 1, parallel to the build |
| D4 unresolved | `/tr` ships `noindex` | I-14 makes this a controlled degradation, not a failure |
| D2/D3 unresolved | Projects page loses its evidence | F-52 moves into scope — screenshots and a demo video |
| Arabic never signed off | `/ar` ships `noindex` for want of one deliberate act | Treat T-202 step 3 as a real step, not a formality |
| Contact form goes dynamic | The performance budget goes with it | Keep the handler at the edge; `assert:routes` catches the rest |

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
| T-320 | Localised 404 (F-08), deferred from T-214 | M | — |

> **T-320** carries the open half of T-214. X-04 is already met; F-08 is not.
> The investigation is written up under T-214 above — three hypotheses tested,
> two restructure shapes built and measured, all reverted. Start from those
> findings rather than from the beginning: what is left to try is a newer
> Next.js release, or the middleware rewrite that T-102 ruled out and that
> would cost the site its fully static build.

> T-317 and T-318 are the only tasks that do work **outside** this repository, and they
> carry more weight for G1 than anything on-page. The `rel="me"` links only consolidate
> the name entity if the profiles link back.

---

## Starting point

**T-101.** It depends on nothing and needs no decision.

D1 (domain) is not needed to *start* — it is needed by **T-126**, the Sprint 1 gate.
That is roughly two weeks of runway to resolve it.
