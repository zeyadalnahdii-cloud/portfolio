# 04 — Software Requirements Specification

**Project:** Personal portfolio — Zeyad Alnahdi
**Version:** 0.1 draft
**Status:** Pending D1 (domain) — every requirement referencing `{ORIGIN}` is blocked until resolved

---

## 0. Conventions

- **MUST** — mandatory. Failure blocks the sprint gate.
- **SHOULD** — expected; deviation requires a recorded reason.
- `{ORIGIN}` — the absolute site origin, e.g. `https://zeyadalnahdi.com`. Supplied as
  `NEXT_PUBLIC_SITE_URL`. **MUST** be absolute in all metadata; relative canonicals
  and `hreflang` values are invalid.

Each requirement carries an acceptance criterion. A requirement without a testable
criterion is a wish, and is not permitted in this document.

---

## 1. System overview

A statically-renderable Next.js (App Router) application in TypeScript strict mode,
serving four pages across three locales (12 routes), deployed to Vercel behind a
custom domain. No database. No authentication. The only dynamic behaviour is the
contact form submission.

**Rendering:** all 12 routes **MUST** be statically generated at build time via
`generateStaticParams`. No route may depend on request-time data. This is a hard
constraint: it is what makes the performance budget (§5) achievable and guarantees
crawlers receive complete HTML.

---

## 2. Internationalisation

| ID | Requirement | Acceptance |
|---|---|---|
| I-01 | Locales **MUST** be `en` (default), `tr`, `ar`. | Requesting `/fr` returns 404, not a fallback render |
| I-02 | Routing **MUST** be path-based: `/en/*`, `/tr/*`, `/ar/*`. No locale on a cookie or subdomain. | All 12 URLs resolve directly |
| I-03 | The default locale **MUST** be prefixed. `/` redirects (308) to `/en`. | `curl -I /` returns 308 to `/en` |
| I-04 | Locale **MUST NOT** be chosen by IP geolocation or `Accept-Language` redirect. | Googlebot crawling from any region receives the requested locale unchanged |
| I-05 | `<html lang>` **MUST** match the locale (`en`, `tr`, `ar`). | Inspect each route |
| I-06 | `<html dir>` **MUST** be `rtl` for `ar`, `ltr` otherwise. | Inspect each route |
| I-07 | Every route **MUST** emit reciprocal `hreflang` for all three locales plus `x-default` → `/en`. | Search Console reports zero `hreflang` errors (G6) |
| I-08 | `hreflang` values **MUST** be absolute URLs under `{ORIGIN}`. | Inspect `<head>` |
| I-09 | The language switcher **MUST** map to the equivalent route in the target locale. | From `/tr/projects`, switching to AR lands on `/ar/projects`, never `/ar` |
| I-10 | Translated strings **MUST** live in `messages/{locale}.json`. No hardcoded user-facing text in components. | Lint rule / grep audit |
| I-11 | Missing translation keys **MUST** fail the build, not fall back silently. | Delete a key → `npm run build` fails |
| I-12 | Turkish copy **MUST** preserve diacritics (`ı ğ ş ç ö ü`). | Native review (D4) |
| I-13 | Dates, numbers and any formatted values **MUST** use `Intl` with the active locale. | Inspect rendered output per locale |

**I-14 — Indexing gate.** Each `messages/{locale}.json` carries `_meta.reviewed`
(boolean). When `false`, every route in that locale **MUST** emit `noindex`.

*Acceptance:* set `tr._meta.reviewed = false` → all `/tr/*` routes carry
`<meta name="robots" content="noindex">` and are excluded from the sitemap.

*Rationale:* unreviewed machine-quality Turkish, once indexed, damages the name entity
this site exists to build. The gate makes publishing bad copy require a deliberate act.

---

## 3. Metadata

| ID | Requirement | Acceptance |
|---|---|---|
| M-01 | Every route **MUST** produce metadata via `generateMetadata`. No page inherits a generic default. | 12/12 routes have distinct title + description |
| M-02 | Titles **MUST** be ≤ 60 characters; descriptions ≤ 155. | Automated check in CI (§9) |
| M-03 | Every route **MUST** declare an absolute `canonical` at `{ORIGIN}/{locale}/{path}`. | Inspect `<head>` |
| M-04 | Titles and descriptions **MUST** be unique within a locale. | CI check for duplicates |
| M-05 | Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:locale`, `og:type`) **MUST** be present per route. | Facebook Sharing Debugger renders correctly |
| M-06 | `og:locale:alternate` **MUST** list the other two locales. | Inspect `<head>` |
| M-07 | Twitter Card (`summary_large_image`) **MUST** be present. | Card validator renders correctly |
| M-08 | OG images **MUST** be 1200×630 and localised. Generated via `next/og`. | Visual check in all three locales |
| M-09 | Exactly one `<h1>` per page, matching the H1 in `02-keyword-plan.md` §4. | Automated check |
| M-10 | Heading levels **MUST NOT** skip (no `h2` → `h4`). | axe / Lighthouse |
| M-11 | `theme-color`, `viewport` and favicon set (ICO, PNG, Apple touch icon). | Lighthouse PWA/SEO checks |

---

## 4. Structured data

All JSON-LD **MUST** validate in Google's Rich Results Test and Schema.org validator.

| ID | Requirement | Where |
|---|---|---|
| S-01 | `Person` entity — `name` (canonical spelling), `alternateName` (variants per `02` §2), `jobTitle`, `url`, `email`, `sameAs` (GitHub, LinkedIn), `knowsAbout`, `address` (Aksaray, TR), `knowsLanguage` (ar, en, tr). | All routes |
| S-02 | `WebSite` entity with `inLanguage` and `publisher` → `Person` `@id`. | All routes |
| S-03 | `BreadcrumbList` on non-home routes. | About, Projects, Contact |
| S-04 | `SoftwareSourceCode` (or `CreativeWork`) per project — `name`, `description`, `programmingLanguage`, `codeRepository`, `author` → `Person` `@id`. | Projects |
| S-05 | `ContactPage`. | Contact |
| S-06 | Entities **MUST** be linked by `@id`, not repeated as independent blocks. | Inspect graph |
| S-07 | Structured data **MUST** reflect visible page content. No fields describing content not on the page. | Manual review |

> S-07 is not pedantry: structured data contradicting the page is a manual-action risk,
> and S-04's `codeRepository` pointing at a private repo is exactly such a contradiction.
> This is a further consequence of D3.

---

## 5. Performance

Budgets are **acceptance criteria**, measured on mobile emulation with 4× CPU
throttling and Slow 4G.

| ID | Requirement | Threshold |
|---|---|---|
| P-01 | Largest Contentful Paint | < 2.5s |
| P-02 | Cumulative Layout Shift | < 0.1 |
| P-03 | Interaction to Next Paint | < 200ms |
| P-04 | Lighthouse Performance | ≥ 90 |
| P-05 | Total JS shipped per route | < 150KB gzipped |
| P-06 | All images via `next/image` with explicit `width`/`height` | Zero CLS from images |
| P-07 | Images served as AVIF/WebP with fallback | Inspect network panel |
| P-08 | Fonts: `next/font`, self-hosted, `font-display: swap`, subset per script | No FOIT; no external font request |
| P-09 | Arabic and Latin scripts **MUST** use separately subset font files | Arabic subset not downloaded on `/en` |
| P-10 | No render-blocking third-party scripts | Lighthouse audit |
| P-11 | Static assets served with immutable cache headers | Inspect response headers |

**P-09 note:** a single font file covering Latin + Arabic + Turkish is a common and
expensive mistake — it ships the Arabic glyph range to every English visitor. Subset
per script and load conditionally by locale.

---

## 6. Accessibility

Target: **WCAG 2.1 Level AA**.

| ID | Requirement | Acceptance |
|---|---|---|
| A-01 | Zero axe-core violations on all 12 routes | Automated, in CI |
| A-02 | Lighthouse Accessibility ≥ 95 | CI gate |
| A-03 | Text contrast ≥ 4.5:1 (≥ 3:1 for large text) — **in both themes** | Manual + automated |
| A-04 | All functionality reachable by keyboard; no traps | Manual walkthrough |
| A-05 | Visible focus indicator on every interactive element | Manual |
| A-06 | Skip-to-content link | Manual |
| A-07 | Form inputs have associated `<label>`; errors linked via `aria-describedby` | axe |
| A-08 | Form status changes announced via `aria-live` | Screen reader test |
| A-09 | Meaningful images have localised `alt`; decorative images `alt=""` | Manual review |
| A-10 | `prefers-reduced-motion` respected | Manual |
| A-11 | Language switcher options carry `lang` on each link | axe |
| A-12 | Theme toggle exposes state via `aria-pressed` | axe |

---

## 7. Contact form

| ID | Requirement |
|---|---|
| C-01 | Fields: name (required, ≤100), email (required, valid), message (required, ≤2000). |
| C-02 | Validation **MUST** run server-side. Client validation is UX only, never the boundary. |
| C-03 | Spam protection via honeypot + per-IP rate limiting. **No CAPTCHA** (conflicts with P-03 and A-04). |
| C-04 | Submission delivers to `zeyadalnahdii@gmail.com`. Provider: Resend or Vercel-compatible equivalent. |
| C-05 | Credentials **MUST** come from environment variables. No secret in the repository. |
| C-06 | Success and error states localised and announced (A-08). |
| C-07 | The form **MUST** degrade to a visible `mailto:` link if JavaScript fails. |
| C-08 | No personal data persisted beyond email delivery. |

---

## 8. Crawling and indexing

| ID | Requirement | Acceptance |
|---|---|---|
| X-01 | `sitemap.ts` **MUST** generate all indexable routes with absolute URLs, `lastModified`, and `alternates.languages` per entry. | Fetch `/sitemap.xml` |
| X-02 | Routes with `noindex` (I-14) **MUST** be excluded from the sitemap. | Toggle `_meta.reviewed`, re-fetch |
| X-03 | `robots.ts` **MUST** allow all crawlers and reference the sitemap. | Fetch `/robots.txt` |
| X-04 | No route returns a soft 404. Unknown paths return a real 404 status. | `curl -I /en/nonexistent` |
| X-05 | Trailing slashes **MUST** be normalised consistently (`trailingSlash: false`). | `/en/about/` 308s to `/en/about` |
| X-06 | Preview deployments **MUST** be excluded from indexing. | `X-Robots-Tag: noindex` on `*.vercel.app` |
| X-07 | HTTP **MUST** redirect to HTTPS; `www` and apex resolve to one canonical host. | `curl -I` both forms |
| X-08 | Internal links **MUST** use `next/link` with locale-correct hrefs. No bare `<a>` for internal navigation. | Lint rule |

**X-06 matters more than it looks:** an indexed `*.vercel.app` preview is a duplicate
of the entire site and directly undermines the canonical domain.

---

## 9. Quality gates

Enforced in CI (`09-cicd.md`). A pull request failing any gate cannot merge.

| Gate | Threshold |
|---|---|
| TypeScript | `strict: true`, zero errors |
| ESLint | Zero errors |
| Build | Succeeds; all 12 routes statically generated |
| Lighthouse SEO | 100 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Performance | ≥ 90 |
| axe-core | Zero violations |
| Metadata check | 12/12 routes: unique title + description, within length limits, absolute canonical |
| Link check | Zero broken internal links |

---

## 10. Out of scope

Database, authentication, CMS, blog, comments, search, analytics beyond Search
Console, additional locales, per-project routes. See `03-feature-list.md` §2.

---

## 11. Open items

| ID | Item | Blocks |
|---|---|---|
| D1 | Domain | Every `{ORIGIN}` requirement: M-03, M-05, I-08, X-01 |
| D2/D3 | Repository visibility | F-22, S-04, S-07 |
| D4 | Turkish reviewer | I-12, I-14 |
| — | Email provider choice | C-04 |
