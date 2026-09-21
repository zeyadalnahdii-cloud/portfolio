# Roadmap — Personal Portfolio (EN / AR / TR)

> Governing principle: **SEO is an architectural constraint, not a phase.**
> Every SEO concern enters as a *requirement* in the SRS, becomes an *architectural
> decision* in the IA document, and is enforced as a *Definition of Done* that
> gates each sprint. There is no "SEO sprint".

## Scope

Four pages — Home, About, Projects, Contact — in three languages (12 routes).
No blog. No CMS. No features beyond this list without an explicit scope change.

## Stack

Next.js (App Router) · TypeScript (strict) · next-intl · Vercel + custom domain

## Documents

| # | Document | File | Status |
|---|---|---|---|
| 1 | Project Proposal | `01-project-proposal.md` | draft v2 |
| 2 | Content & Keyword Plan | `02-keyword-plan.md` | draft v2 |
| 3 | Feature List | `03-feature-list.md` | draft |
| 4 | SRS | `04-srs.md` | draft |
| 5 | Information Architecture & URL Map | `05-ia-url-map.md` | draft |
| 6 | Mockups | `06-mockups.md` | draft |
| 7 | Repository Standards | `07-repo-standards.md` | draft |
| 8 | Sprint Plans | `08-sprint-plans.md` | draft |
| 9 | CI/CD Plan | `09-cicd.md` | draft |
| 10 | Developer Task Breakdown | `10-task-breakdown.md` | S1 detailed; S2–S3 enumerated |

Deliberately excluded: Gantt chart (replaced by document 5 + sprint plans).

## Sprints

Three sprints, two weeks each. A sprint does not close until its SEO gate passes.

| Sprint | Deliverables | SEO gate (DoD) |
|---|---|---|
| S1 — Foundation | Next.js setup, i18n, RTL, layout shell, central SEO module | 3 locales route correctly · reciprocal `hreflang` + `x-default` · correct `lang`/`dir` · `sitemap.ts` + `robots.ts` generate · Lighthouse SEO = 100 |
| S2 — Content | 4 pages × 3 locales, internal linking | Unique metadata on all 12 routes · correct absolute canonicals · JSON-LD passes Rich Results Test · images sized, no CLS · valid heading order |
| S3 — Hardening | Performance, accessibility, deploy | CWV within budget on mobile · axe: zero violations · full keyboard nav · OG images render · Search Console verified, sitemap submitted |

First 2–3 days of S1 are a spike: prove `next-intl` + App Router + RTL work together
before building on them.

## Budgets (treated as acceptance criteria, not aspirations)

- LCP < 2.5s · CLS < 0.1 · INP < 200ms (mobile, throttled)
- Lighthouse: SEO 100 · Accessibility 95 · Performance 90
- WCAG 2.1 AA
