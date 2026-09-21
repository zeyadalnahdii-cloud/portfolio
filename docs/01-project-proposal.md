# 01 — Project Proposal

**Project:** Personal portfolio website for Zeyad Alnahdi — زياد النهدي
**Owner:** Zeyad Alnahdi · zeyadalnahdii@gmail.com
**Date:** 2026-09-21
**Status:** Draft — pending owner confirmation on §7

---

## 1. Purpose

A trilingual (EN / AR / TR) personal website that makes Zeyad Alnahdi findable and
credible to three distinct audiences, and converts that visibility into freelance
enquiries and employment opportunities.

The site is small by design: four pages, no blog, no CMS. Its competitive edge is
technical execution quality — search visibility, performance, accessibility and
correct trilingual implementation — not content volume. For a backend developer,
the site is itself a work sample.

## 2. Positioning

**Primary identity:** Backend & Desktop Application Developer
**Core stack:** C# · ASP.NET Core · .NET · SQL Server / PostgreSQL · Clean Architecture ·
Python/FastAPI · TypeScript/Next.js · Docker

**Evidence base:** the positioning is not aspirational — it is backed by a four-layer
ASP.NET Core system with a verified RAG pipeline (§7.1) and a three-tier desktop
application over 37 stored procedures (§7.2). The site's job is to make that legible
quickly, not to claim more than it.

**Differentiator:** A psychology degree used as an *added capability*, not a career
change narrative. Positioned as:

> Builds software with a trained understanding of how people actually behave —
> applied to interface clarity, error handling, and data modelling that matches
> how users think rather than how databases are shaped.

This is stated once, concretely, on About. It is not the headline on Home, and it
is never framed as "I switched careers". The headline is the engineering.

## 3. Audiences and language strategy

| Audience | Language | Intent | Priority |
|---|---|---|---|
| Remote recruiters, international clients | English | "backend developer", ".NET developer" + portfolio review | **1** |
| Turkish employers & agencies (Ankara / Aksaray) | Turkish | local hiring, `yazılım geliştirici` | **2** |
| Arabic-speaking freelance clients | Arabic | project-based work, desktop systems | **3** |

**Decision: `en` is the default locale.** It serves the widest audience, is the
language recruiters screen in, and is the one the owner writes most fluently.
Turkish and Arabic are first-class, not translations-as-afterthought — each gets
independently researched keywords (see `02-keyword-plan.md`).

No IP-based redirects. Locale is chosen by URL path and an explicit switcher.

## 4. Goals — measurable

| # | Goal | Metric | Target |
|---|---|---|---|
| G1 | Own the name query | Rank for "Zeyad Alnahdi" / "زياد النهدي" | Position 1–3, 60 days |
| G2 | Complete indexing | Indexed routes in Search Console | 12 / 12, 30 days |
| G3 | Technical quality as proof | Lighthouse (mobile) | SEO 100 · A11y 95 · Perf 90 |
| G4 | Field performance | Core Web Vitals | LCP < 2.5s · CLS < 0.1 · INP < 200ms |
| G5 | Conversion | Contact form submissions + direct emails | Tracked from launch; no target in v1 |
| G6 | Trilingual correctness | `hreflang` errors in Search Console | Zero |

G1–G4 are gates. G5 is observed, not targeted, until there is baseline data.

## 5. Scope

**In scope**
- Four pages — Home, About, Projects, Contact — in three locales = 12 routes.
- Two project entries presented as cards on the Projects page (no per-project routes in v1; see §7).
- Contact form, downloadable CV per locale, dark mode, full RTL for Arabic.
- Complete technical SEO layer, implemented from Sprint 1 (not retrofitted).

**Out of scope for v1** — requires explicit scope change
- Blog, CMS, comments, newsletter, analytics dashboards, i18n beyond three locales.

## 6. Constraints

- **Domain:** not yet purchased. Blocks canonical URLs, `hreflang`, OG tags and
  Search Console — all of which need an absolute origin. **Required before Sprint 1
  closes.** Recommended: `zeyadalnahdi.com` (clean spelling; note the email handle
  carries a doubled `i` that should not propagate to the domain).
- **Hosting:** Vercel + custom domain.
- **Content:** owner requires assistance producing copy in all three languages.
  Turkish copy must pass native review before it is allowed to be indexed.
- **Phone number:** not yet available; WhatsApp contact deferred. Contact page must
  degrade gracefully without it.

## 7. Portfolio inventory

Assessed from the repositories directly. `ai-autonomous-workspace` was assessed on
its **`dev`** branch, which is substantially ahead of `main` — an earlier assessment
based on `main` alone significantly understated the project.

### 7.1 `ai-autonomous-workspace` — lead project

**State:** Sprints 0–2 complete, Sprint 3 (hardening) in progress. 598 files:
189 C#, 80 Python, 41 TS/TSX. 45 backend test files, 40 AI-service test files.

| Aspect | Evidence |
|---|---|
| Architecture | ASP.NET Core 10 in four layers — `Domain` / `Application` / `Infrastructure` / `Api`. Clean Architecture applied properly, not decoratively. |
| Polyglot system | ASP.NET Core + FastAPI (Python) + Next.js frontend, PostgreSQL 16 and Qdrant in Docker, Ollama for local inference. |
| Working RAG | Full pipeline: PDF extraction → OCR → chunking → `bge-m3` embeddings → Qdrant → hybrid retrieval → `qwen2.5:7b` → cited answers. 19 discrete services in the AI layer. |
| Arabic NLP | Dedicated `arabic_query_expansion`, `text_quality_service`, `language_service` — non-trivial multilingual retrieval work, and a `test/arabic-quality-gate` branch alongside it. |
| Domain modelling | 11 entities, explicit enums including `DocumentStatusTransitions` — a modelled state machine rather than loose status strings. |
| Engineering process | 24 planning documents, CI workflow, `main`/`dev` branch discipline. |
| Measured, not claimed | `docs/runtime-verification.md` records a real end-to-end run with timings (upload → `Indexed` in 32.6s, 35-page PDF, 31,507 chars) and states plainly that it records unflattering findings too. |

**Assessment: this is the strongest asset in the portfolio, by a wide margin.** It
evidences distributed system design, AI infrastructure, multilingual retrieval and
verification discipline simultaneously. The `runtime-verification.md` document in
particular — measuring rather than asserting — is a level of rigour rarely present
in self-taught portfolios, and is itself worth surfacing on the site.

**Honest limitation to state, not hide:** the AI assistant surface (Sprints 5–7) is
not built. The RAG pipeline works and is verified; the product feature layered on top
of it is not finished. Say so explicitly.

### 7.2 `Restaurant_Management` — supporting project

Complete and well documented. C# WinForms, .NET Framework 4.7.2, SQL Server. Three
tiers (`FM` → `PL` → `DAL`), stored procedures exclusively, RDLC reports. 9 forms ·
10 tables · 37 stored procedures. Arabic RTL interface.

Directly evidences the **desktop application** half of the positioning, which the AI
project does not cover. Keep it — the two projects are complementary, not redundant.

> The README is Arabic-only. For an English-default site targeting international
> recruiters, an English README is needed — it is the first thing a visitor from the
> Projects page reads. The Arabic RTL interface is, separately, a genuine credential
> for the trilingual work in *this* project.

### 7.3 The visibility problem

`ai-autonomous-workspace` was made public temporarily for this assessment and is
intended to return to private. **This materially weakens the case study.**

A case study describing an unverifiable private repository asks the reader to take
an unknown developer's word for 598 files of claimed work. For someone without an
employment track record to point at, the verifiable code *is* the credential — the
gap between "I built a working RAG pipeline" and a reader confirming it is the entire
distance between a claim and evidence. The measured numbers in `runtime-verification.md`
lose most of their force when nobody can open the file they came from.

**Recommendation:** make the repository public permanently. If specific material must
stay private, the narrower options in descending preference are:

1. **Public repo, `main` branch curated** — merge a presentable state to `main`, keep
   experimental work on branches. Preserves full verifiability.
2. **Public "showcase" repo** — a subset: architecture docs, the AI service layer,
   `runtime-verification.md`. Partial evidence, moderate effort.
3. **Private repo + detailed case study + screenshots** — weakest. Acceptable only if
   there is a concrete reason (unreleased commercial intent, licensed content,
   credentials in history). "It is unfinished" is not such a reason: Sprint 3 of 7 with
   verified infrastructure reads as serious work in progress, not as embarrassment.

If secrets in git history are the concern, that is solvable and worth solving —
audit the history rather than keeping the work hidden.

## 8. Success criteria

The project is complete when all 12 routes are live and indexed, G1–G4 and G6 are
met, all three locales are reviewed by a competent speaker, and every CI quality
gate in `09-cicd.md` passes on the main branch.

## 9. Open decisions

| # | Decision | Status | Blocks |
|---|---|---|---|
| D1 | Domain name and purchase | **Open** — `zeyadalnahdi.com` recommended | Sprint 1 close |
| D2 | `Restaurant_Management` visibility | **Open** — make public, recommended | Sprint 2 |
| D3 | `ai-autonomous-workspace` visibility (§7.3) | **Open** — make public permanently, strongly recommended | Sprint 2; determines case-study strength |
| D4 | Native Turkish reviewer | **Open** | Sprint 2 close |
| D5 | City to state publicly | **Resolved — Aksaray** | — |

**D5 resolved:** the site states Aksaray. Turkish geo keywords target
`Aksaray yazılım geliştirici`; Ankara is not claimed as a location. If remote or
Ankara-based work is acceptable, the honest phrasing is "based in Aksaray — available
for remote work and roles in Ankara", which keeps the Ankara term present without
misstating residence.
