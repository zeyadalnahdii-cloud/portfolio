# 08 — Sprint Plans

**Duration:** 3 sprints × 2 weeks = 6 weeks
**Status:** Draft — S1 blocked on D1 (domain) at its gate, not at its start

---

## 0. Structure

Each sprint has deliverables, an **SEO gate**, and an exit condition. A sprint does
not close until its gate passes. Incomplete work moves to the next sprint; a failed
gate does not.

This is the mechanism that implements the project's governing principle. "SEO is not
a phase" is a slogan until something enforces it — here, that something is a gate a
sprint cannot pass without.

There is no Gantt chart. Dependencies live in the gates; structure lives in
`05-ia-url-map.md`.

---

## Sprint 1 — Foundation (weeks 1–2)

**Goal:** a site with no content, whose SEO infrastructure is already complete and correct.

### Days 1–3 — Spike

Prove the stack before building on it.

- [ ] Next.js + TypeScript strict, per `07-repo-standards.md` §2
- [ ] `next-intl` with App Router: three locales routing correctly
- [ ] `dir="rtl"` applied for `ar`; verify a logical-property layout actually flips
- [ ] Static export: confirm `generateStaticParams` produces all 12 routes
- [ ] Confirm `next/og` can load an Arabic font (06 §4 — the known failure point)

**Spike exit:** all five confirmed, or the approach changes now rather than in week 4.

> This is the cheapest risk reduction in the project. C#/C++ experience transfers to
> architecture but not to Server Components, hydration boundaries or TypeScript's
> structural typing. Three days here is insurance against a week lost later.

### Days 4–10 — Infrastructure

- [ ] Repository standards applied in full (`07`): ESLint, Prettier, Husky, commitlint, CI skeleton
- [ ] `lib/seo/origin.ts` — env validation that **fails the build** when absent
- [ ] `lib/seo/alternates.ts` — `buildAlternates()`, single source of truth (05 §3)
- [ ] `lib/seo/metadata.ts` — `buildMetadata()` (M-01..M-08)
- [ ] `lib/seo/schema.ts` — `Person` + `WebSite` graph, `@id`-linked (S-01, S-02, S-06)
- [ ] `sitemap.ts` and `robots.ts` (X-01..X-03, 05 §5–6)
- [ ] I-14 indexing gate: `_meta.reviewed` wired to both robots and alternates
- [ ] Layout shell: header, footer, nav, language switcher, theme toggle
- [ ] Fonts: subset per script, conditional by locale (P-08, P-09)
- [ ] Redirect map (05 §8) and `trailingSlash: false`
- [ ] Unit tests for `lib/seo/*` (07 §7)

**`lib/seo/` is built before any page exists.** Written first, every page is forced
through it. Written after, it is retrofitted page by page and drifts — which is how
`hreflang` errors happen.

### Sprint 1 gate

| Check | Criterion |
|---|---|
| Routing | 12 routes resolve; `/` 308s to `/en` (I-02, I-03) |
| Language attributes | `lang` and `dir` correct on all 12 (I-05, I-06) |
| Alternates | Reciprocal `hreflang` + `x-default` on every route (I-07, I-08) |
| Indexing gate | Setting `tr._meta.reviewed = false` removes `/tr/*` from sitemap **and** from all alternate sets (I-14, 05 §3) |
| Sitemap / robots | Both generate with absolute URLs (X-01, X-03) |
| Env safety | Build fails without `NEXT_PUBLIC_SITE_URL` (07 §2) |
| Lighthouse SEO | 100 on the empty shell |
| CI | All gates run and pass |

**Exit condition:** every check green. **D1 (domain) must be resolved by now** —
absolute canonicals and `hreflang` cannot be verified against a placeholder origin.

---

## Sprint 2 — Content (weeks 3–4)

**Goal:** all 12 routes complete, in three reviewed languages.

### Content track (parallel, starts day 1)

- [ ] English copy for all four pages (`02` §5 outlines)
- [ ] Arabic copy — owner-native, written not translated
- [ ] Turkish copy — drafted, then **native review (D4)**
- [ ] CV in three locales, canonical name spelling in filenames (F-34)
- [ ] Keyword validation against real tool data (`02` §1) — adjust titles if warranted

Content is the critical path in this sprint, not the code. Four pages × three
languages is more writing than it sounds like, and the Turkish review is an external
dependency with its own latency. Start it on day 1.

### Build track

- [ ] Home (F-10..F-14)
- [ ] About (F-30..F-34)
- [ ] Projects (F-20..F-23)
- [ ] Contact (F-40..F-45) + form handler (C-01..C-08)
- [ ] 404 (F-08)
- [ ] Per-route metadata from `02` §4
- [ ] `BreadcrumbList`, `SoftwareSourceCode`, `ContactPage` schema (S-03..S-05)
- [ ] OG images, per route per locale (M-08, 06 §4)
- [ ] Internal linking per 05 §4.2; `rel="me"` on profiles (F-43)
- [ ] RTL review of all screens (06 §3.2)

### Sprint 2 gate

| Check | Criterion |
|---|---|
| Metadata | 12/12 unique titles + descriptions, within length limits (M-01..M-04) |
| Canonicals | Absolute and correct on all routes (M-03) |
| Structured data | Passes Rich Results Test; `@id` graph linked; reflects visible content (S-01..S-07) |
| OG | Renders correctly in all three locales, Arabic font included (M-08) |
| Headings | One `h1`, no skipped levels, on all 12 (M-09, M-10) |
| Images | Explicit dimensions; zero CLS contribution (P-06) |
| Translations | No missing keys; build fails if any (I-11) |
| Turkish | Native-reviewed; `_meta.reviewed = true` (I-12, D4) |
| RTL | All screens signed off in four theme/direction combinations (06 §6) |
| Switcher | Maps to equivalent routes, never to home (I-09) |
| Links | Zero broken internal links |

**Exit condition:** all green. A locale still failing review stays `noindex` — the
sprint may close, but that locale does not ship indexed.

---

## Sprint 3 — Hardening & launch (weeks 5–6)

**Goal:** meet the performance and accessibility budgets, deploy, verify indexing.

### Days 1–5 — Performance & accessibility

- [ ] Lighthouse mobile, throttled, on all 12 routes
- [ ] LCP < 2.5s (P-01) — confirm the LCP element is text, not an image
- [ ] CLS < 0.1 (P-02)
- [ ] INP < 200ms (P-03)
- [ ] JS < 150KB gzipped per route (P-05) — bundle analysis
- [ ] Verify the Arabic font subset is **not** requested on `/en` or `/tr` (P-09)
- [ ] axe-core: zero violations on all 12 (A-01)
- [ ] Contrast audit in **both** themes (A-03)
- [ ] Keyboard walkthrough per locale, RTL focus order included (A-04, A-05)
- [ ] Screen reader pass on the form (A-08)
- [ ] `prefers-reduced-motion` (A-10)

### Days 6–10 — Deploy & verify

- [ ] Vercel production, custom domain, HTTPS, `www` → apex (X-07)
- [ ] `X-Robots-Tag: noindex` on preview deployments (X-06) — **verify by request**, not by config reading
- [ ] Full CI pipeline enforcing (`09-cicd.md`)
- [ ] Search Console: verify domain, submit sitemap
- [ ] Request indexing for all 12 routes
- [ ] Confirm zero `hreflang` errors in the International Targeting report (G6)
- [ ] Update GitHub and LinkedIn profiles: canonical name spelling, link to domain (`02` §2)
- [ ] Repository READMEs in English (07 §8, `01` §7.2)

### Sprint 3 gate

| Check | Criterion |
|---|---|
| Performance | Lighthouse ≥ 90; LCP/CLS/INP within budget (P-01..P-05) |
| Accessibility | Lighthouse ≥ 95; axe zero violations (A-01, A-02) |
| SEO | Lighthouse 100 on all 12 routes |
| Live | All 12 routes reachable over HTTPS at the canonical host |
| Preview isolation | `*.vercel.app` returns `noindex` — confirmed by `curl -I` |
| Search Console | Verified, sitemap accepted, zero `hreflang` errors (G6) |
| Profiles | GitHub and LinkedIn link back to the domain (`02` §2) |

**Exit condition:** all green and the site is live.

---

## Post-launch — verification window

Not a sprint. Two checkpoints, because indexing is asynchronous and G1/G2 cannot be
verified at launch.

| When | Check | Against |
|---|---|---|
| +14 days | Indexed routes in Search Console; crawl errors; `hreflang` errors | G2, G6 |
| +30 days | Indexing complete (12/12); first query data in the Performance report | G2 |
| +60 days | Ranking for the name query; field CWV data | G1, G4 |

**Act on real data, not on the §3 hypotheses.** The keyword plan is explicitly
unvalidated (`02` §1); the first Search Console query report is the first genuine
evidence the project produces about what people actually search.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Next.js learning curve | Sprint 1 overruns | The 3-day spike; the stack is already used in `ai-autonomous-workspace` |
| Turkish review unavailable (D4) | `/tr` ships `noindex` | I-14 makes this a controlled degradation rather than a quality failure |
| Domain not purchased (D1) | Sprint 1 cannot close | Resolve in week 1. Everything downstream depends on it |
| Repos stay private (D2/D3) | Projects page loses its evidence | F-52 (screenshots, demo) moves into scope — see `03` §3 |
| Content underestimated | Sprint 2 overruns | Content track starts day 1, parallel to the build |
| Perfectionism on visual design | Launch slips | The wireframes in `06` are implementable as-is. Ship, then refine |

The last risk is the most likely one. A site that is live and indexed at Lighthouse 95
outperforms a beautiful one that is still local.
