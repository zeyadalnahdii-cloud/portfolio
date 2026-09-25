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
4. Follow the content rules already recorded. **Psychology is removed from the
   site entirely (2026-09-26); `03` F-31 is withdrawn.**
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


**Status — CLOSED 2026-09-26. Not open for further keyword research.**

**Step 1** measured the identity and head terms across three markets. Seven
terms carry a figure, a market and a source, recorded in `02` §1. Two findings
changed the plan rather than confirming it: the literal translation is the wrong
term in two of three languages (`مبرمج` beats `مطور برمجيات` 48×; `yazılımcı`
beats `yazılım geliştirici` 7.8×), and volume is not the selector — the largest
number in the table, `software engineer` at 90,500, is deliberately not
targeted because it describes a role this portfolio does not claim.

**Step 2 was deliberately not pursued.** Autocomplete and "People also ask" were
judged unnecessary once the measured set settled the decisions. `02` §1 says so
explicitly; nothing in the document is presented as validated by them.

**Step 3** rewrote `02` §3 and §4 and the shipped copy. The canonical identity is
now `Full Stack Developer` in all three locales, with each locale's measured term
alongside it.

**The original completion criterion was intentionally narrowed, by owner
decision.** As written it said the `02` §1 caveat could be *removed*, because
every term would be measured. It is not removed; it is scoped.

The owner's decision, recorded verbatim in substance: sufficient measured
head, identity and AI data was collected to make the site-level decisions, and
**the remaining long-tail hypotheses are not claimed as validated**. Autocomplete
and "People also ask" were intentionally not pursued. **Post-launch Search
Console query data is the next validation source** — which `02` §1 always called
the only real data.

This is recorded as a narrowing of the criterion, not as the criterion having
been met, and not as the criterion having been reworded to fit. The distinction
matters: a future reader must be able to see that the long-tail tier in `02` §3
carries no measurement behind it.

**T-205 is closed.** It does not reopen for more keyword work. The next keyword
input to this project arrives from Search Console after launch (`08`,
post-launch verification window, +30 days).

Withdrawn as SEO targets (all reasoned, never measured): the psychology
differentiator terms, the Aksaray geo terms, and the claim that Arabic RAG was
"the single strongest Arabic opportunity". Psychology stays in the About
narrative; Aksaray stays as factual location; RAG stays as project evidence.

`yazılımcı` is settled as a keyword. **D4 still gates publication of `/tr`** —
native review of the Turkish prose — but no longer gates this keyword choice.

---

### T-206 · CV download — M

**Depends on:** T-201
**Requirements:** F-34

**Steps** *(step 1 revised by owner decision, 2026-09-26)*

1. ~~One PDF per locale in `public/`.~~ **One English PDF, served on all three
   locales.** The CV is deliberately not translated and there are not three
   files. The UI around the download stays localised; the document is English.
2. Filenames carry the canonical name spelling — `Zeyad-Alnahdi-CV.pdf` —
   because the filename is visible in the URL and in the reader's downloads.
   (No `-en` / `-tr` / `-ar` suffix, since there is one file.)
3. Link from About with the file size and format in the link text.

**Done when:** every locale's About page offers the CV and the link resolves.

**Status — complete, 2026-09-26.**

`public/cv/Zeyad-Alnahdi-CV.pdf` (71,148 bytes). `lib/cv.ts` serves one path
for every locale and measures the size from the file rather than hardcoding
it — a written-down number is wrong the first time the CV is replaced, and
nothing would report it. The link carries `hreflang="en"` and
`type="application/pdf"`, so the document's language is stated to a machine
even though the label is localised. Size renders in Western numerals in
Arabic (`06` §3).

`tests/cv.test.ts` pins the single-file decision, so a later change back to
one-per-locale is deliberate rather than drift, and asserts the file really
is a PDF rather than a placeholder.

> **Open, and the owner's to resolve: the name on the CV does not match the
> name on the site.** The document reads *Zeyad Saeed Sulaiman Bin Huwail*;
> the site, `schema.ts` `name`, the `alternateName` list and **G1** are all
> built on *Zeyad Alnahdi* / *زياد النهدي*. The filename follows step 2 and
> uses the site's canonical spelling, which means the filename and the
> document's own heading disagree. This is exactly the entity-consolidation
> problem `02` §2 exists to prevent, and no code change fixes it — see the
> watch-out below, which anticipated it.

> Two smaller consistency notes: the CV publishes a phone number
> (+90 534 293 28 92) that `01` §6 deliberately keeps off the site, and it
> states *English: Elementary (A2)* while `01` §3 makes English-language
> recruiters the priority-1 audience. Both are facts about the document, not
> defects in the implementation.

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
3. Sections: how I learned, what I have built since, what I am looking for, CV
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


**Status — complete.** Both jobs run on every pull request, pass, and are
required status checks on `main` and `dev`.

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

**Step 3.** Both jobs are in `.github/workflows/ci.yml` and are **required
status checks on `main` and `dev`**, with `strict` on.

This was two things, not one: a job that merely runs is advisory, and a red
advisory check is something people learn to merge past. `dev` previously had
**no protection at all** — even `validate` and `build` were unenforced on the
branch every pull request here actually targets, so requiring the new gates only
on `main` would have left them unenforced where they are used.

Verified rather than assumed: the four required context names match the names
CI reports exactly. A typo there fails in one of two silent ways — a name that
never reports blocks every pull request forever, and a name that does not match
requires nothing at all. With all four green the pull request reports
`mergeStateStatus: CLEAN`, so the wiring is live.

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

#### Status 2026-09-27: **run. Sprint 2 closes with two checks not passed.**

Recorded in `13-sprint-2-gate.md`. Nine of eleven green. Check 8 (Turkish
reviewed) fails on **D4** and the exit condition explicitly permits closure with
an unreviewed locale held `noindex`. Check 3 could not be run — the Rich Results
Test needs a publicly reachable URL and there is no deployment yet; it carries to
Sprint 3 Phase 1.

T-126's check 1 now reads 12 routes and its exception is discharged.

Closing does **not** mean 12 routes are indexed, that Turkish is ready, that the
contact form has delivered a message, or that a 404 page exists. Each is recorded
in the gate document with its blocker.

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

**Goal:** meet the performance and accessibility budgets, deploy, verify indexing.

## What changed since these tasks were enumerated

Sprint 2 overtook four of them. Writing them up as fresh work would mean doing
it twice and reporting it as progress.

| Task | Enumerated as | Actual state |
|---|---|---|
| T-307 | axe, zero violations, all 12 | **Largely done.** T-220 runs axe on all 12 routes in **both themes** on every pull request, and it is a required check. What remains is running it against the deployed site. Rescoped to **S**. |
| T-308 | Contrast audit, both themes | **Largely done.** T-219 audited every pair in both themes and fixed two dark-mode failures; `tests/contrast.test.ts` guards them. What remains is the handful of states axe cannot see. Rescoped to **S**. |
| T-313 | Full CI pipeline enforcing | **Half done.** T-220 promoted `metadata` and `axe` and made all four checks required on `main` and `dev`. What remains is `lighthouse` (§2.4) and `links` (§2.7). |
| T-318 | Repository READMEs in English | **Justification removed.** See the task. |

Two facts from Sprint 2 constrain this sprint and are easy to plan around
wrongly:

- **Only 8 of the 12 routes are indexable.** `tr` is `reviewed: false` pending
  **D4**, so the four Turkish routes carry `noindex` and are absent from the
  sitemap. This is the indexing gate working as designed, not a defect — but
  **G2 ("12/12 indexed") cannot be met until D4 resolves**, and T-314…T-316
  must be planned against 8, not 12.
- **D1 (domain) blocks everything from T-311 onward** — half the sprint.
  T-301…T-310 and T-320 need no domain and should run first.

---

## The two-phase split

**Approved by the owner, 2026-09-27.** A custom domain is deferred (**D1b**);
deployment proceeds on a free `*.vercel.app` host so that everything verifiable
without a domain can be finished now.

**What the interim host is, recorded plainly:**

- It is an **interim public deployment**, not the canonical production host.
- It is **non-canonical** and **must remain `noindex`**.
- It **does not satisfy D1b, T-311, X-07, G1 or G2.** Nothing in Phase 1 may be
  read as satisfying any of them.
- **Search Console, sitemap submission, indexing requests and indexing
  validation stay in Phase 2.**
- **Lighthouse scores SEO ≈ 66 on a `noindex` response.** A score taken against
  the interim host is *not* a valid SEO-100 measurement. Performance and
  accessibility are measured on the deployment; the **SEO category is measured
  on a local indexable production build**, and where it was measured is recorded
  with the number.

No existing task's scope or acceptance criteria changed to make this split
work. A task whose criteria need the domain stays in Phase 2 and stays
incomplete, even where part of it could be done earlier — that part is recorded
as preparatory work, not as progress against the criterion.

Two genuinely new tasks exist **because** of this decision and are numbered as
new work rather than folded into T-311: **T-321** and **T-322**.

---

# Phase 1 — before the custom domain

Execution order, respecting dependencies:

| # | Task | Depends on |
|---|---|---|
| 1 | **T-320** Localised 404 | — |
| 2 | **T-321** Indexability switch | — |
| 3 | **T-322** Interim Vercel deployment | T-321 |
| 4 | **T-307** axe against the deployed site | T-322 |
| 5 | **T-301** Lighthouse baseline | T-221 |
| 6 | **T-302** LCP · **T-303** CLS · **T-304** INP · **T-305** Bundle | T-301 |
| 7 | **T-306** Font subset isolation | — |
| 8 | **T-308** States axe cannot see · **T-309** Keyboard · **T-310** Screen reader | T-307 |

**Also unblocked by the interim URL, both carried from Sprint 2:**

- The **Rich Results Test** (Sprint 2 gate check 3), which needs a publicly
  reachable URL and could not be run at the gate.
- **T-213's delivery verification**, *if* Resend can send honestly without a
  verified custom domain. A candidate, not a promise — and an unavailable or
  failed test is recorded as such, never converted into a pass.

#### Outcome 2026-09-27, once the interim host existed

**Rich Results Test — still cannot run, and now for a sharper reason.** The
missing public URL is solved. The blocker is now our own deliberate
configuration: `robots.txt` serves `Disallow: /` and every response carries
`X-Robots-Tag: noindex, nofollow`. Google's Rich Results Test fetches as
Googlebot and honours `robots.txt`, so it reports the URL as blocked rather than
validating the markup. Confirmed that the host does not exempt a Googlebot user
agent — it answers `200` but still sends the `noindex` header, and `robots.txt`
denies the crawl.

**Disabling the block to run the test was not done.** Keeping the interim host
non-indexable is an explicit owner constraint, and turning it off to make a check
pass is exactly the kind of trade this project does not make. **Sprint 2 check 3
moves to Phase 2**, to be run against the canonical domain once indexing is on.

What *was* run instead, and labelled as what it is: a structural validation of
the live JSON-LD on all 12 routes — `@context`, required properties per type,
every `@id` reference resolving inside its graph, and sequential
`BreadcrumbList` positions. **No problems.** `/ar/projects` serves
`Person, WebSite, BreadcrumbList, SoftwareSourceCode ×2` with
`jobTitle: ["Full Stack Developer", "مبرمج"]`. **This is not the Rich Results
Test and does not substitute for it** — it checks the shape, not what Google
makes of it.

**T-213 — Resend accepted the send; arrival is unconfirmed.** A real submission
to the live endpoint returned `200 {"ok":true}`. That is meaningful rather than
cosmetic: the route returns `502` when Resend rejects a send, so a `200` means
Resend took the message. The boundary still holds — an empty payload is `400`,
and the honeypot returns `200` without sending.

**It is still not a pass.** T-213's Done-when is "a submission arrives", and
whether it landed in the inbox is something only the owner can see. **T-213
remains not fully complete** pending that confirmation.

## Days 1–5 — Performance & accessibility

### T-301 · Lighthouse baseline — M

**Depends on:** T-221
**Requirements:** P-01…P-05, A-02, G3, `09` §2.4

**Steps**

1. Run Lighthouse against a production build of all 12 routes, **mobile preset,
   throttled**.
2. Build with `VERCEL_ENV=production`. Without it the build is treated as a
   preview and served with a blanket `X-Robots-Tag: noindex`.
3. Record all four category scores **per route** in a table, with the Chrome
   version and throttling settings.
4. Fix nothing. This is the baseline T-302…T-305 work against.

**Done when:** 48 numbers recorded (12 routes × 4 categories), reproducible.

**Watch out:** do not average across routes — an average hides the one route
that fails. And building without `VERCEL_ENV=production` has already produced
false SEO readings of 66 on this project **twice**; the noindex is invisible in
the page and shows only in the response header.

#### Status 2026-09-27: **complete. Baseline recorded; nothing fixed.**

Lighthouse 13.5.0, mobile preset, simulated throttling, against a **local
production build with `SITE_INDEXABLE=true`** — the measurement constraint the
owner approved, so the SEO category is read from an indexable artifact.

| Route | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms |
|---|---|---|---|---|---|---|---|
| `/en` | 93 | 100 | 100 | 100 | 2.00 | 0.000 | 289 |
| `/en/about` | 93 | 100 | 100 | 100 | 2.66 | 0.000 | 200 |
| `/en/projects` | 95 | 100 | 100 | 100 | 2.62 | 0.000 | 159 |
| `/en/contact` | 97 | 100 | 100 | 100 | 1.86 | 0.000 | 183 |
| `/tr` | 93 | 100 | 100 | **66** | 2.26 | 0.000 | 253 |
| `/tr/about` | 97 | 100 | 100 | **66** | 2.26 | 0.000 | 119 |
| `/tr/projects` | **80** | 100 | 100 | **66** | 3.43 | 0.000 | 388 |
| `/tr/contact` | 96 | 100 | 100 | **66** | 2.41 | 0.000 | 143 |
| `/ar` | 91 | 100 | 100 | 100 | 3.03 | 0.089 | 60 |
| `/ar/about` | 93 | 100 | 100 | 100 | 3.04 | 0.036 | 64 |
| `/ar/projects` | **86** | 100 | 100 | 100 | 3.25 | 0.091 | 188 |
| `/ar/contact` | **83** | 100 | 100 | 100 | 3.42 | 0.065 | 293 |

**Accessibility is 100 on all twelve** — A-02 asks for ≥ 95.

**CLS is 0.000 on every Latin route and ≤ 0.091 on every Arabic one** — P-02
asks for < 0.1, so it passes, but the Arabic pages are not at zero and T-303
should find out why before that margin erodes.

**Three routes miss the performance floor of 90:** `/tr/projects` 80,
`/ar/contact` 83, `/ar/projects` 86. The failing audits on the worst route are
render-blocking requests, unused and legacy JavaScript, and main-thread work —
not images, of which the site has none.

**Seven of twelve miss LCP < 2.5s (P-01).** The pattern is unmistakable: every
Arabic route is 3.0–3.4s while the English routes are 1.9–2.7s. That is T-302's
Arabic-font hypothesis showing up in the numbers on the first run.

#### The SEO 66 on `/tr` is not a defect, and it changes what T-319 can claim

All four Turkish routes score **66 on SEO because they are `noindex`** — the
indexing gate working exactly as designed while **D4** is open. The build was
indexable; the pages are not.

**Consequence: `08`'s Sprint 3 gate row "SEO — Lighthouse 100 on all 12 routes"
cannot pass until D4 resolves**, no matter what happens to the code. It is
capped at 8 of 12 for the same reason G2 is. T-319 must record that as a blocked
row, not as a failure of this sprint's work.

#### Caveat on where this was measured

Localhost, so network latency is synthetic rather than real. These numbers are
the **baseline T-302…T-305 work against**, not a verdict on the deployed site.
The deployed figures come from the interim host in T-322 and from the canonical
host in Phase 2.

---

### T-302 · LCP — M

**Depends on:** T-301
**Requirements:** P-01 (< 2.5s), `06` §2.2

**Steps**

1. Identify the actual LCP element on each route from the Lighthouse trace —
   read it, do not assume it.
2. Confirm it is text. The design has no hero image, carousel or background
   video specifically so that it would be (`06` §2.2).
3. If a font swap delays it, check `font-display` and whether the face is
   preloaded.
4. Re-measure the slowest route after each change.

**Done when:** LCP < 2.5s on all 12 routes at mobile throttling, and the LCP
element is text on every one.

**Watch out:** Arabic loads a different font file from Latin. `/ar` can have a
text LCP and still be late because the Arabic face blocks paint. Measure `/ar`
separately; never extrapolate from `/en`.

#### Status 2026-09-27: **step 2 passes. The measurement method decides step 1.**

**The LCP element is a `<p>` — text — on every route measured.** Read from a
`PerformanceObserver` trace, not assumed. The no-hero-image design in `06` §2.2
is doing exactly what it was for.

**The two throttling methods disagree, and the difference is the finding.**

| Route | Lighthouse *simulated* | Lighthouse *devtools* (real) |
|---|---|---|
| `/en` | 2.00s | **1.48s** |
| `/ar/projects` | 3.25s | **1.66s** |

Under real throttling every route is comfortably inside P-01's 2.5s and the
Arabic gap collapses from 1.4s to 0.18s. `FCP == LCP` in both runs: the text
paints once, in the fallback face, and is the largest element — `display: swap`
working as intended.

**So the Arabic penalty in T-301's table is the simulation modelling a longer
request chain, not a face blocking paint.** The chain is real: `/ar` fetches
**six** font files where `/en` fetches one, because IBM Plex Sans Arabic is a
static face declared at three weights and the Arabic pages need both its Arabic
and Latin ranges. Worth reducing, but it is not what paints the page.

**Not claimed as a clean pass.** P-01 is met under real throttling and missed
under simulated on seven routes. The tiebreaker is a measurement over a real
network — the interim host in T-322, and the canonical host in Phase 2.

**Flagged for the owner, not changed:** `font-medium` (500) is used ten times in
the markup, and 500 is **not** among the Arabic font's declared weights, so
Arabic renders it synthesised or snapped to a neighbour. A fidelity gap, and
fixing it by declaring 500 would add two more font files.

---

### T-303 · CLS — M

**Depends on:** T-301
**Requirements:** P-02 (< 0.1)

**Steps**

1. Audit every element whose size is not reserved before paint.
2. Confirm the known reservations still hold: the form error slot (`min-h-5`,
   so an appearing error does not push the next field down) and the Home
   project cards (`min-h-56`).
3. Measure with a **cold font cache**, not a warm one.
4. Include the mobile navigation opening, which overlays rather than reflows —
   confirm that is still true after T-219's `z-10`.

**Done when:** CLS < 0.1 on all 12 routes on a cold load.

**Watch out:** CLS is frequently 0.00 on a warm cache and non-zero on a first
visit, which is the only visit that matters for a stranger arriving from search.
A warm-cache pass proves nothing.

#### Status 2026-09-27: **passes, measured cold.**

Cache disabled per request, 4× CPU throttling, mobile viewport.

| Locale | CLS (cold) |
|---|---|
| `/en/*` | **0.000** on all four |
| `/tr/*` | 0.000, except `/tr/about` at 0.009 |
| `/ar/*` | 0.017 – **0.052** |

All well inside P-02's 0.1. The reserved slots hold: the form error slot
(`min-h-5`) and the Home cards (`min-h-56`) contribute nothing, and the mobile
menu overlays rather than reflows.

**The Arabic routes are not at zero, and that is the font swap** — the fallback
and IBM Plex Sans Arabic have different metrics, so the swap moves text
slightly. Inside budget with room, but it is the one number here that would grow
if more Arabic copy were added, so it is worth knowing rather than rounding to
"passes".

---

### T-304 · INP — M

**Depends on:** T-301
**Requirements:** P-03 (< 200ms)

**Steps**

1. Measure the four real interactions: theme toggle, mobile menu open/close,
   language switch, form submit.
2. Measure on a throttled CPU, not a desktop.
3. Measure the language switcher on `/ar` — it is a navigation, so it carries
   the cost of a document load.

**Done when:** INP < 200ms for every interaction on every locale.

**Watch out:** a mostly static site has very few interactions, so field data may
never accumulate enough samples to report INP at all. That is not a pass — it
means the lab measurement is the only evidence there will be, so take it
deliberately rather than assuming a static site is safe.

#### Status 2026-09-27: **passes in the lab.**

Measured on `/ar` at 4× CPU throttling, click to two painted frames:

| Interaction | Latency |
|---|---|
| Theme toggle | **44 ms** |
| Mobile menu open | **24 ms** |

Both far inside P-03's 200 ms. Measured on the Arabic page deliberately, since
it carries the heavier font and the RTL layout.

**Lab only.** As the watch-out predicts, a site this static may never accumulate
enough field samples for INP to be reported at all, so this is likely to remain
the only evidence. It is not a substitute for field data; it is what exists.

---

### T-305 · Bundle analysis — M

**Depends on:** T-301
**Requirements:** P-05 (< 150KB gzipped per route)

**Steps**

1. Read per-route JS from the build output.
2. Identify the largest contributor on the heaviest route.
3. Confirm the client bundle does **not** contain all three locales' messages.

**Done when:** every route under 150KB gzipped, with the figure recorded per
route.

**Watch out:** step 3 is the specific regression to hunt. `lib/i18n/messages`
holds all three locales in one typed registry; it is imported by server
components, which is free. The moment any **client** component imports
`getMessages`, the entire trilingual payload — including two locales the visitor
will never read — lands in the browser bundle. It will still build, still render
correctly, and still pass every other gate.

#### Status 2026-09-27: **FAILS. 186–188 KB gzipped against a 150 KB budget.**

Measured by fetching every script a route loads with `Accept-Encoding: gzip` and
summing the transferred bytes.

| Route | Gzipped JS | P-05 |
|---|---|---|
| `/en` | **186 KB** | 150 KB ❌ |
| `/ar/projects` | **186 KB** | 150 KB ❌ |
| `/en/contact` | **188 KB** | 150 KB ❌ |

**Step 3's regression is not present.** The four client components are
`ThemeToggle`, `LanguageSwitcher`, `SiteNav` and `ContactForm`; none imports
`getMessages`, and the trilingual payload is not in the browser bundle.
next-intl's client runtime totals about 15 KB.

**The overage is the framework floor, not this project's code.** Three chunks —
69 KB, 44 KB and 38 KB gzipped — account for 151 KB of the 186 KB, and they are
the Next 16 and React 19 runtime. Everything this repository wrote fits in the
remaining ~35 KB.

**Owner decision needed. P-05 is not changed here.** The budget as written is
not reachable on this stack without an architectural change, and a requirement
is not something to quietly relax because it turned out to be inconvenient. The
options are to accept the overage with the reason recorded, to revisit the
number against what Next 16 actually costs, or to change the stack — and none of
those is mine to choose.

---

### T-306 · Font subset isolation — S

**Depends on:** T-123
**Requirements:** P-09

**Steps**

1. Load `/en` and `/tr` with a clean cache and record **every font request** off
   the network panel.
2. Confirm no Arabic subset is among them.
3. Load `/ar` and confirm the Arabic face **is** requested — the check must fail
   in both directions.

**Done when:** measured from network requests on all three locales.

**Watch out:** verify by measurement, never by reading the layout code. This
project has already shipped a circular Tailwind token
(`--font-sans: var(--font-sans)`) that resolved to nothing: the build passed,
the pages rendered, and **zero fonts were requested at all**. Reading the config
would have confirmed the fonts were configured correctly. Only the network panel
showed the truth.

#### Status 2026-09-27: **passes, in both directions.**

Measured from network requests on a cold cache, never from the config.

The stylesheet declares **three** Arabic-range `@font-face` files
(`5ad8fdb5…`, `c9a0d344…`, `ceec3e50…`). Requests actually made:

| Route | Font files | Any Arabic-range file? |
|---|---|---|
| `/en` | 1 — `83afe278…` | **No** |
| `/tr` | 2 — `83afe278…`, `1bffadaa…` | **No** |
| `/ar` | 6, including all three Arabic-range files | Yes, as intended |

P-09 holds: the Arabic subset is absent from the Latin locales, and present on
the Arabic one. The check fails in both directions, so a build that requested
nothing at all — the failure this project has already shipped once — would be
caught.

---

### T-307 · axe against the deployed site — S

**Depends on:** T-311
**Requirements:** A-01

**Rescoped.** T-220 already runs axe over all 12 routes in both themes on every
pull request, as a required check, and it is green.

**Steps**

1. Run `npm run verify:axe -- https://<domain>` against production.
2. Confirm zero violations.

**Done when:** the deployed origin returns zero violations.

**Watch out:** do not redo T-219. The value here is only that CI tests a local
build, and a CDN, a redirect or an injected analytics tag can differ from it.

#### Status 2026-09-27: **complete. Zero violations on the deployed origin.**

`verify:axe` against `https://zeyad-alnahdi.vercel.app` — **24 scans**, 12 routes
× light and dark, WCAG 2.1 A + AA. **Zero violations.**

Lighthouse on the live host reports **accessibility 100 on all twelve routes**,
independently of axe.

So the deployment introduces nothing the local build did not already have: no
CDN rewrite, no injected tag, no redirect that changes the rendered page.

---

### T-308 · The states axe cannot see — S

**Depends on:** T-307
**Requirements:** A-03, A-05

**Rescoped.** T-219 audited every token pair in both themes, fixed two
dark-mode failures, and `tests/contrast.test.ts` now guards all of them.

**Steps**

1. Check what automated contrast checking structurally cannot: the **disabled**
   submit button (`disabled:opacity-60` — opacity composites, so the effective
   ratio is not the token ratio), placeholder text if any is added, and the
   focus ring where it falls on `--surface` rather than `--bg`.
2. Check both themes.

**Done when:** each state measured and recorded, or confirmed absent.

**Watch out:** axe skips elements it considers non-text or indeterminate, and
reports nothing rather than a failure. Silence from axe is not a pass for these.

#### Status 2026-09-27: **one real defect found and fixed.**

**The disabled submit button failed A-03, and axe never said a word.**
`disabled:opacity-60` composites the *whole button* over the page, so both the
label and its background shift:

| Theme | Effective ratio | A-03 |
|---|---|---|
| light | `#ffffff` on `#6ba5e9` = **2.57:1** | 4.5 ❌ |
| dark | `#0d1117` on `#2e5f9e` = **2.93:1** | 4.5 ❌ |

Opacity is the wrong mechanism here. Only **95% or more** keeps the label above
4.5:1, and 95% is indistinguishable from no dimming — so there is no opacity
that both dims visibly and stays legible.

**Fixed by not dimming.** `disabled:opacity-60` → `disabled:cursor-not-allowed`.
The state is still communicated four ways: the label changes to "Sending…",
`aria-busy` is set, the cursor changes, and the control is genuinely disabled.
Contrast returns to the token ratio, 5.19:1 light and 6.11:1 dark, and
`tests/contrast.test.ts` now pins it.

This matters more than a disabled control usually would: the button is disabled
precisely while it reads "Sending…", which is the one word the user needs.

**The other two states are clean.** There are **no placeholders** in the form —
every field has a real `<label>`. The focus ring on `--surface` is already
covered by `tests/contrast.test.ts` at 4.88:1 light and 5.58:1 dark, against a
3:1 requirement.

---

### T-309 · Keyboard walkthrough — M

**Depends on:** T-307
**Requirements:** A-04, A-05

**Steps**

1. Tab through all 12 routes. The skip link must be the first stop.
2. Open the mobile menu by keyboard, confirm focus behaviour and that focus
   returns to the toggle on close.
3. Language switcher, theme toggle, every form field and the submit.
4. Confirm a visible focus indicator at every stop (A-05).
5. Repeat on `/ar`.

**Done when:** every interactive element reachable, no trap, visible focus
throughout, in all three locales.

**Watch out:** **RTL does not reorder the DOM.** Focus follows DOM order, so on
an Arabic page the visual right-to-left order and the tab order can disagree —
the eye moves right-to-left while focus moves in source order. Nothing reports
this; it has to be watched. Check the header especially, where the nav is
`ms-auto` and the switcher and toggle sit beside it.

#### Status 2026-09-27: **passes. No problems found.**

Tabbed through all four routes in `en` and `ar`, 13–18 stops each.

- **The skip link is the first stop on every route**, in both locales.
- **Every stop has a visible focus indicator.** Checked computed
  `outline-style` and `outline-width` at each stop, not by eye.
- **The mobile menu opens by keyboard and focus returns to the toggle on
  close.**

**The RTL concern in the watch-out is resolved by measurement.** Focus
x-coordinates across the Arabic header decrease monotonically:

```
تخطَّ إلى المحتوى 1179 → Zeyad Alnahdi 900 → الرئيسية 699 → نبذة عني 631
→ المشاريع 561 → تواصل معي 475 → EN 433 → TR 400 → AR 366
```

Focus moves right to left, in step with the eye. The DOM order and the visual
order agree, so the failure the watch-out describes is not present.

---

### T-310 · Screen reader pass on the form — M

**Depends on:** T-307
**Requirements:** A-07, A-08

**Steps**

1. With Orca or NVDA, submit the form empty and confirm each error is announced
   and tied to its field via `aria-describedby`.
2. Confirm the status region announces success and failure (`aria-live`).
3. Confirm `aria-busy` during submission is not announced as a loop.
4. Repeat on `/ar` with an Arabic voice if one is available; otherwise record
   that the Arabic pass is unverified rather than claiming it.

**Done when:** every error and status change is announced, in at least `en`.

**Watch out:** the error slot is always present (`min-h-5`, reserved for CLS),
so the announcement depends on a **text change inside an existing node**, not on
a node being inserted. Those behave differently across screen readers, and the
CLS fix is what makes this the harder case. Do not assume `aria-live` works
because the markup looks right.

#### Status 2026-09-27: **NOT VERIFIED. No screen reader available.**

`orca`, `nvda`, `espeak-ng`, `speech-dispatcher` and `spd-say` are all absent
from this machine. **The task's Done-when — "every error and status change is
announced, in at least `en`" — has not been tested, and is not claimed.**

**What was verified instead, and what it is worth.** The accessibility contract
the reader consumes is correct, inspected from the live accessibility tree after
submitting an empty form:

| Field | `aria-invalid` | `aria-describedby` resolves | Announced text | Real `<label>` |
|---|---|---|---|---|
| name | `true` | ✅ | "This field is required." | ✅ |
| email | `true` | ✅ | "This field is required." | ✅ |
| message | `true` | ✅ | "This field is required." | ✅ |
| company *(honeypot)* | — | — | — | ✅ |

The `aria-live="polite"` status region is present in the DOM at all times, which
is what makes this the harder case the watch-out describes: the announcement
depends on **text changing inside an existing node**, not on a node appearing.

**That is A-07 evidence, not A-08 evidence.** Correct markup is a precondition
for the announcement, never proof of it — which is exactly what the watch-out
says. **A-08 stays unverified** and needs a real screen reader on a machine that
has one.

---

# Phase 2 — after the custom domain is purchased

**Blocked on D1b.** Every task below has an acceptance criterion that names the
canonical host, Search Console, or an indexable production deployment. None is
reworded to fit the interim host.

| # | Task | Why it cannot move to Phase 1 |
|---|---|---|
| 1 | **T-311** Production deploy | Step 1 *is* "purchase the domain"; done when 12 routes resolve **at the canonical host** |
| 2 | **T-312** Preview isolation | Step 2 requires production **not** to carry `noindex` — inverted while the interim host is deliberately noindexed. Step 1 is preparable |
| 3 | **T-313** Full pipeline enforcing | Done when **all six** checks are required; a `lighthouse` job asserting SEO 100 against a noindexed host fails permanently. The `links` job is preparable |
| 4 | **T-314** Search Console | Needs the canonical property |
| 5 | **T-315** Request indexing | Depends on T-314 |
| 6 | **T-316** hreflang confirmation | Depends on T-314 |
| 7 | **T-317** Profile back-links | **Owner decision:** the permanent links point at the eventual canonical domain, never at a temporary URL |
| 8 | **T-319** Sprint 3 gate | Evaluates the canonical host, the SEO row and Search Console |

**T-318 is unphased** — its descope recommendation is open and has nothing to do
with the domain.

## Days 6–10 — Deploy & verify

### T-311 · Production deploy — M

**Depends on:** **D1**
**Requirements:** X-07, `01` §6

**Steps**

1. Purchase the domain. `zeyadalnahdi.com` is the recommendation in `01` §6.
2. Set `NEXT_PUBLIC_SITE_URL` in the Vercel project to the exact origin.
3. Attach the custom domain, confirm HTTPS, redirect `www` → apex.
4. Re-run `verify:metadata`, `verify:links` and `verify:axe` **against the live
   host**.

**Done when:** all 12 routes reachable over HTTPS at the canonical host, and all
three scripts pass against it.

**Watch out:** `lib/seo/origin.ts` throws at module load — and therefore fails
the build — on a trailing slash, an `http` scheme, a path, or a loopback host.
That is deliberate; set the variable exactly. Separately: **the email handle
carries a doubled `i` (`zeyadalnahdii@`) that must not propagate to the domain**
(`01` §6).

---

### T-312 · Preview isolation — S

**Depends on:** T-311
**Requirements:** X-06

**Steps**

1. `curl -I` a real `*.vercel.app` preview URL and confirm
   `X-Robots-Tag: noindex`.
2. `curl -I` the production host and confirm the header is **absent**.

**Done when:** both directions confirmed by response header.

**Watch out:** verify by request, never by reading the config — the requirement
says so explicitly. Step 2 matters as much as step 1: a single switch
(`VERCEL_ENV === 'production'`) controls both, so a mistake that noindexes
previews correctly can just as easily noindex production, and that failure is
silent, invisible in the page, and costs the launch.

---

### T-313 · Full pipeline enforcing — M

**Depends on:** T-311
**Requirements:** `09` §2.4, §2.7, §6

**Half done.** T-220 promoted `metadata` and `axe`, and `validate`, `build`,
`metadata` and `axe` are required on `main` and `dev`.

**Steps**

1. Add the `lighthouse` job (§2.4) against the deployed preview, with the
   budgets as thresholds.
2. Add the `links` job (§2.7) — broken internal links and redirect chains
   against the deployment. External links warn only.
3. Add both to the required contexts on `main` and `dev`.

**Done when:** all six checks required, and a pull request breaking any of them
cannot merge.

**Watch out:** a required context name that never reports **blocks every pull
request forever**, and one that does not match a job name requires nothing at
all — both fail silently and in opposite directions. Verify the names against
what CI actually reports, as T-220 did, rather than against the workflow file.

---

### T-314 · Search Console — S

**Depends on:** T-311
**Requirements:** G2, G6

**Steps**

1. Verify the domain by DNS TXT record.
2. Submit `/sitemap.xml`.
3. Confirm it is accepted and read.

**Done when:** the property is verified and the sitemap is accepted.

**Watch out:** the sitemap lists **8 URLs, not 12**, because `tr` is
`reviewed: false`. That is correct and must not be "fixed" by adding the Turkish
routes — submitting a `noindex` URL is a contradiction Search Console reports as
an error against the whole sitemap.

---

### T-315 · Request indexing — S

**Depends on:** T-314
**Requirements:** G2

**Steps**

1. Request indexing for the **8 indexable routes**.
2. Record that the 4 Turkish routes are deliberately excluded, blocked on D4.

**Done when:** 8 of 8 indexable routes submitted.

**Watch out:** the enumerated version of this task said "all 12 routes". That
is now wrong and would inject 4 errors. **G2's "12/12" target cannot be met
until D4 resolves** — treat 8/8 as the Sprint 3 criterion and G2 as carried.

---

### T-316 · hreflang confirmation — S

**Depends on:** T-314
**Requirements:** G6, I-07

**Steps**

1. Check the International Targeting report for `hreflang` errors.
2. Confirm zero.

**Done when:** zero errors reported, or the report confirmed as not yet
populated.

**Watch out:** T-220's `metadata` job already proves reciprocity structurally on
every pull request, so errors here would mean Google disagrees with our reading
of the spec — worth taking seriously rather than dismissing. Also, the report
lags crawling by days: **zero errors immediately after launch most likely means
"not yet crawled", not "correct"**. Do not sign this off early.

---

### T-317 · Profile back-links — S

**Depends on:** T-311
**Requirements:** `02` §2, G1

**Steps**

1. Set the canonical name spelling on GitHub and LinkedIn.
2. Add the domain to both profiles.

**Done when:** both profiles link to the domain.

**Watch out:** this is one of only two tasks that do work **outside** this
repository, and it carries more weight for G1 than anything on-page. The
`rel="me"` links the site already ships only consolidate the name entity **if
the profiles link back** — a one-directional `rel="me"` is the same failure
class as a one-directional `hreflang`, and just as invisible.

---

### T-318 · Repository READMEs — descoped, owner's call

**Depends on:** ~~D2/D3~~ — **resolved**
**Requirements:** `07` §8, `01` §7.2

**The justification for this task no longer holds.** It existed because the
README is the first thing a visitor arriving from the Projects page reads
(`01` §7.1). **D2/D3 resolved that both repositories stay private**, so the
Projects page carries no repository links and no portfolio visitor will ever
reach either README.

**Recommendation: drop it from Sprint 3.** It is real work with no remaining
portfolio value. It becomes worth doing again only if the repositories are ever
made public — and `01` §7.1 still records that `ai-autonomous-workspace`'s README
is stale by seven sprints, so the note stays there against that possibility.

**Decision needed from the owner:** drop, or keep as unrelated housekeeping.

---

### T-319 · Sprint 3 gate — M

**Depends on:** all of the above
**Requirements:** `08` Sprint 3 gate

**Steps**

1. Run every check in the `08` gate table against production.
2. Record each as pass, fail or blocked, with the measurement.
3. Do not reword a criterion to make it pass.

**Done when:** every row has a verdict and the exceptions are named.

**Watch out:** two rows cannot pass as written. **G2 (12/12 indexed)** is capped
at 8/12 by D4. **G1 (ranking)** cannot be evaluated at launch at all — it has a
60-day horizon and belongs to the post-launch verification window. Record both
as carried, with the reason, rather than as failures or as passes.

---

### T-321 · Indexability switch — S

**Depends on:** nothing
**Requirements:** X-06, and the owner decision of 2026-09-27

**New task.** It exists only because deployment now happens on an interim host,
and it deliberately does not modify T-311.

Today one flag decides two different questions:

```
IS_PRODUCTION_DEPLOY = process.env.VERCEL_ENV === 'production'
```

It is read in three places — the `X-Robots-Tag` header in `next.config.ts`,
`app/robots.ts`, and the https enforcement in `lib/seo/origin.ts`. A Vercel
deployment from the production branch gets `VERCEL_ENV=production` **even on a
`*.vercel.app` URL**, so it would serve `robots: allow`, no `noindex` header and
a live sitemap. That is an indexable interim host: the opposite of the decision,
and a direct X-06 violation.

**Steps**

1. Separate *deployment state* from *indexability*. Keep `IS_PRODUCTION_DEPLOY`
   for what it actually means, and add a second flag for whether this host may
   be indexed.
2. **Indexability defaults to the safe state — not indexable.** A host becomes
   indexable only by explicit opt-in, so forgetting the variable can never
   publish an indexable duplicate.
3. Point the `X-Robots-Tag` header and `robots.ts` at the new flag. Leave the
   https enforcement in `origin.ts` on `IS_PRODUCTION_DEPLOY`, which is the
   question it is actually asking.
4. Test both directions: the header and `robots.txt` present when indexing is
   off, absent when it is on.

**Done when:** a production-mode build can be published with indexing disabled,
and the default with no variable set is disabled.

**Watch out:** the failure is silent and asymmetric. A host wrongly `noindex`
costs nothing but a delay; a host wrongly indexable is a full duplicate of the
site competing with the canonical domain, and nothing reports it. Default to
the cheap failure.

#### Status 2026-09-27: **complete.**

`IS_INDEXABLE` in `lib/seo/environment.ts`, opt-in on `SITE_INDEXABLE === 'true'`
and off for anything else. `robots.ts` and the `X-Robots-Tag` header in
`next.config.ts` read it; `origin.ts` keeps `IS_PRODUCTION_DEPLOY`, which is the
question it actually asks.

Measured on real builds, both with `VERCEL_ENV=production`:

| `SITE_INDEXABLE` | `X-Robots-Tag` | `robots.txt` |
|---|---|---|
| unset | `noindex, nofollow` | `Disallow: /`, no sitemap |
| `true` | absent | `Allow: /` + sitemap |

The first row is the regression this task exists to prevent: Vercel marks the
interim host `production`, so before the split it would have served
`Allow: /` and a live sitemap. Tests pin the exact-match opt-in — `TRUE`, `1`,
`yes` and `''` all leave indexing off — and the CI `metadata` and `axe` jobs now
set `SITE_INDEXABLE: 'true'` so they keep checking the artifact the canonical
domain will serve.

---

### T-322 · Interim Vercel deployment — M

**Depends on:** T-321
**Requirements:** the owner decision of 2026-09-27. **Not** X-07, **not** D1b.

**New task.** It does **not** replace T-311 and does not satisfy any part of it.

**Steps**

1. Deploy the project to Vercel on the free `*.vercel.app` host.
2. Set `NEXT_PUBLIC_SITE_URL` to that exact origin — `lib/seo/origin.ts` throws
   on a trailing slash, an `http` scheme, a path or a loopback host.
3. Leave indexing **off** (T-321 default).
4. Verify all 12 routes resolve over HTTPS.
5. Verify `X-Robots-Tag: noindex` is served and `robots.txt` disallows.
6. Re-run `verify:metadata`, `verify:links` and `verify:axe` against the live
   origin.
7. Exercise the contact flow as far as the interim host allows.

**Done when:** 12 routes are publicly reachable over HTTPS, confirmed
non-indexable by response header, and the three scripts pass against the live
origin.

**Watch out:** this host is **not** canonical production. Its canonicals,
`hreflang` set and OG URLs will all name the `.vercel.app` origin, and every one
of them changes when the real domain lands. That is safe **only** because the
host is `noindex` — if indexing were ever enabled here, the site would publish a
full set of canonicals pointing at a URL it is about to abandon.

#### Status 2026-09-27: **complete.** `https://zeyad-alnahdi.vercel.app`

Deployed by the owner from `main`. Verified against the live host, not assumed.

| Step | Result |
|---|---|
| 12 routes over HTTPS | ✅ all `200`, no redirects |
| `http` → `https` | ✅ `308` |
| `/` → `/en` | ✅ `308` |
| `X-Robots-Tag` | ✅ `noindex, nofollow` on pages **and on `/sitemap.xml`** |
| `robots.txt` | ✅ `User-Agent: * / Disallow: /` |
| Per-locale gate still independent | ✅ `/tr` keeps `<meta name="robots" content="noindex, follow">` |
| Canonicals | ✅ absolute, under the `.vercel.app` origin |
| `verify:metadata` | ✅ OK against the live origin — 12 routes, all within limits, unique per locale |
| `verify:axe` | ✅ OK — 24 scans, zero violations |
| Link graph | ✅ no locale leaks, full reachability, `/projects` most inbound (10/9/8/6 in each locale) |
| Contact flow | ✅ `200 {"ok":true}`; empty payload `400`; honeypot silently `200` |

**A gap in step 6 worth naming:** `verify:links` reads the local build output by
design (T-218 — "no port, no flake, and it sees exactly the HTML that ships"), so
it cannot be pointed at a URL. The equivalent check was run against the live HTML
instead and matches the build exactly. The script was **not** rewritten to take a
URL; that would be scope this task does not carry.

**The host is confirmed non-canonical and non-indexable.** It satisfies none of
D1b, T-311, X-07, G1 or G2, and nothing here should be read as satisfying them.

---

### T-320 · Localised 404 — M

**Depends on:** nothing
**Requirements:** F-08, `05` §4.2

Carries the open half of **T-214**. X-04 is met; F-08 is not.

**Start from the T-214 findings, not from the beginning.** Three hypotheses were
tested against running production builds and two restructures were built,
measured and reverted:

| Hypothesis | Result |
|---|---|
| The component throws | **Disproved** — a trivial hardcoded component behaves identically |
| `dynamicParams = false` blocks the catch-all | **Confirmed blocker**, and it cannot be overridden per segment |
| No root layout for the not-found boundary | **Confirmed root cause** — the component renders, but Next wraps it in `<html id="__next_error__">` |

| Restructure | Build | `lang`/`dir` on 12 routes | Localised 404 |
|---|---|---|---|
| Pass-through root (`return children`) | passes | preserved | **no** |
| Root with `<html>`, locale layout without | passes | **lost entirely** | **no** |

Both shapes pay a cost and collect nothing.

**Steps**

1. Re-test on the current Next.js release — the blocker is a framework
   behaviour, and this is the cheapest thing that could have changed.
2. If it still fails, decide explicitly between: accepting Next's default 404,
   or the middleware rewrite T-102 ruled out.
3. If a page ships, add the **404 → Home** link (T-218 step 1, the one link that
   could not be built) and review it in all four combinations (T-219 step 2, the
   one screen that could not be reviewed). The copy `notFound.backHome` is
   already written in all three locales.

**Done when:** either a localised 404 ships with its link and review, or the
decision to keep Next's default is recorded with its cost.

**Watch out:** the middleware option is not a small change — it costs the site
its fully static build, which is the foundation of the entire performance
budget. It is a trade against P-01…P-05, not a fix. Do not take it to close a
task.

#### Status 2026-09-27: **decision recorded — Next's default 404 is kept.**

**Step 1 done.** Re-tested on Next **16.3.6**, the current stable release
(the project was on 16.3.5). `app/[locale]/not-found.tsx` is still never
reached: `dynamicParams = false` blocks it, exactly as T-214 found.

**A third shape was tried, which T-214 had not.** Next's documented pattern for
this problem is **multiple root layouts via route groups** — `app/(site)/[locale]`
for the real routes and `app/(fallback)/[...slug]` for everything else, each
group carrying its own `<html>`. It builds, and it gets closer than either shape
T-214 measured:

| Shape | Status | Markup | `lang`/`dir` on the 12 routes |
|---|---|---|---|
| Route-group catch-all **page** | **200** ❌ | **ours, fully localised** ✅ | **preserved** ✅ |
| `notFound()` → group-root `not-found.tsx` | **404** ✅ | `<html id="__next_error__">` ❌ | preserved ✅ |
| `notFound()` → **nested** `[...slug]/not-found.tsx` | **404** ✅ | `<html id="__next_error__">` ❌ | preserved ✅ |

**The blocker is now precisely located, and it is narrower than T-214 thought.**
It is not that a localised 404 cannot be rendered — it renders perfectly, with
the right layout, fonts, theme and direction. It is that **the status code and
the markup cannot both be correct at once.** A page that renders our own HTML
returns 200; anything that returns 404 goes through `notFound()`, and
`notFound()` is rendered outside every layout.

**Decision: keep Next's default 404** (step 2). The alternatives and their costs:

- **Accept the 200.** Rejected. **X-04 is currently met**, and a soft 404 on
  every unknown URL is a real SEO defect — search engines index the
  "not found" page as a thin duplicate. Trading a met requirement for an unmet
  one is a regression, not progress.
- **Middleware rewrite.** Rejected, per this task's own watch-out. It trades
  against P-01…P-05, and taking it to close a task is exactly what the warning
  forbids.

**The cost of the decision, recorded plainly:** an unknown URL returns Next's
built-in page — `<html>` with no `lang` and no `dir`, English-only "This page
could not be found.", and hardcoded colours that ignore the site palette. In
Arabic and Turkish it is an English dead end. **F-08 stays unmet.** X-04 stays
met.

**What stays blocked behind it:** T-218's 404 → Home link (the copy
`notFound.backHome` is written in all three locales and unused) and T-219's
404-screen review. Both are cheap the moment the framework allows a localised
404 with a 404 status.

**Revisit when** Next supports a `not-found` boundary that renders inside a root
layout, or allows a page to set its own status. The route-group scaffold above
is the shape to reuse; nothing else needs rediscovering.


---

## Carried from Sprint 2

Open, and some of it gates Sprint 3.

| Item | Blocks | State |
|---|---|---|
| **T-204** Turkish native review | **G2**, T-315 | Blocked on **D4** — no reviewer found |
| **T-205** keyword validation | — | Pending |
| **T-206** CVs per locale | F-20 | Pending — the About CV section renders only once the files exist |
| **T-213** real email delivery | C-04 | Unverified — needs a domain, so effectively **D1** |
| **T-221** Sprint 2 gate | T-301 | Not yet run |

---

## Sequencing

**Phase 1, in dependency order.** T-320 first: it depends on nothing, needs no
decision, and closes the two loose ends the last two Sprint 2 tasks left open —
T-218's missing 404 → Home link and T-219's unreviewable 404 screen.

```
T-320                                   (independent — start here)
T-321 ──► T-322 ──► T-307 ──► T-308, T-309, T-310
                      └─────► Rich Results Test (Sprint 2 check 3)
                      └─────► T-213 delivery verification (candidate)
T-301 ──► T-302, T-303, T-304, T-305
T-306                                   (independent)
```

**Phase 2 begins only when D1b resolves.**

```
D1b ──► T-311 ──► T-312, T-313, T-317
                    T-314 ──► T-315 ──► T-316
                    all ─────────────► T-319
```

**What is still deferred when Phase 1 finishes:** the canonical production host,
custom-domain HTTPS, apex/`www` canonicalisation (X-07), the production half of
preview isolation (X-06), `lighthouse` as a blocking gate, Search Console,
sitemap submission, indexing requests, `hreflang` validation, **G1**, **G2**, and
T-317. **D4 is untouched by any of this** — Turkish stays `noindex` regardless,
so G2 is capped at 8/12 even after the domain lands.

## Risks specific to this sprint

| Risk | Impact | Mitigation |
|---|---|---|
| **D1 still unresolved** | Half the sprint cannot start; there is no launch | Resolve before day 5 — T-301…T-310 and T-320 buy exactly that much runway |
| D4 still unresolved | `/tr` ships `noindex`; G2 capped at 8/12 | Controlled degradation by design (I-14); record it, do not paper over it |
| T-320 blocked again by the framework | F-08 ships unmet for a second sprint | Decide explicitly (step 2) rather than re-investigating a third time |
| Lighthouse measured on a non-production build | False SEO scores near 66; wrong work prioritised | Already bitten twice — `VERCEL_ENV=production` is in T-301 step 2 for that reason |
| Indexing verified too early | A green sign-off that means "not yet crawled" | The post-launch window in `08` exists for this; do not pull its checks into T-319 |

---

## Starting point

**T-101.** It depends on nothing and needs no decision.

D1 (domain) is not needed to *start* — it is needed by **T-126**, the Sprint 1 gate.
That is roughly two weeks of runway to resolve it.
