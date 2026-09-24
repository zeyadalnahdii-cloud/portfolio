# 03 — Feature List

**Scope:** v1 only. Anything not listed under §1 requires an explicit scope change.
**Status:** Draft — §1.3 depends on D2/D3 (repo visibility)

---

## 0. How to read this document

Features here are **user-facing capabilities**. SEO, performance, accessibility and
i18n correctness are deliberately **not** listed as features — they are requirements
in `04-srs.md` and gates in `08-sprint-plans.md`.

This separation is intentional. A "features" list is the first thing cut under time
pressure; a requirement with an acceptance gate is not. Putting `hreflang` in a
feature list is how it ends up postponed to a version that never ships.

---

## 1. v1 — must ship

### 1.1 Site-wide

| ID | Feature | Notes |
|---|---|---|
| F-01 | Three locales: EN (default), TR, AR | Path-based: `/en`, `/tr`, `/ar` |
| F-02 | Language switcher | Stays on the equivalent page; never dumps the user on the homepage |
| F-03 | Full RTL for Arabic | Layout mirroring, not a CSS flip — see `06-mockups.md` |
| F-04 | Dark / light mode | Respects `prefers-color-scheme`, manual override persisted |
| F-05 | Responsive layout | Mobile-first; 320px minimum width |
| F-06 | Header with navigation | Four links + language switcher + theme toggle |
| F-07 | Footer | Email, GitHub, LinkedIn, copyright |
| F-08 | 404 page | Localised, links back into the site |

### 1.2 Home

| ID | Feature | Notes |
|---|---|---|
| F-10 | Positioning statement | One line. Backend & desktop developer |
| F-11 | Short introduction | 2–3 sentences |
| F-12 | Tech stack list | **Plain text, not logo images.** Text is indexable; logos are not |
| F-13 | Two project cards | Links to `/projects` |
| F-14 | Primary call to action | Links to `/contact` |

> No hero image, carousel or background video. Each is a direct LCP cost, and LCP is
> a gate (G4). If a visual is wanted, it must fit within the performance budget.

### 1.3 Projects

| ID | Feature | Notes |
|---|---|---|
| F-20 | AI Autonomous Workspace card | Lead project. Problem · stack · one named architecture decision · measured result · deployment status |
| F-21 | Restaurant Management card | Problem · stack · three-tier architecture · 37 stored procedures · Arabic RTL UI |
| F-22 | Repository links | **Blocked on D2/D3.** A link to a private repo resolves to 404 and is worse than no link |
| F-23 | Per-project tech tags | Text, indexable |

**Content rule for F-20:** lead with the measured result (35-page PDF indexed
end-to-end in 32.6s on a self-hosted stack, answers returned with source attribution).
The system is feature-complete through Sprint 9; Sprint 10 is release preparation, so
the accurate phrasing is "built and verified, deployment pending" — not "in development",
which understates it badly.

If the project is deployed before this site launches, F-20 gains a **live demo link**,
which outweighs every other element on the Projects page. Treat that as the preferred
outcome (see `01` §7.1).

### 1.4 About

| ID | Feature | Notes |
|---|---|---|
| F-30 | Learning path | Self-taught: C++ → C# → SQL Server → ASP.NET Core |
| F-31 | Psychology background | One concrete example of it affecting a technical decision. **Not** framed as a career change |
| F-32 | What he is looking for | Freelance, remote, or local roles |
| F-33 | Location | Aksaray, Turkey — available remotely and for Ankara roles |
| F-34 | CV download | **One English PDF, served on all three locales** (owner decision, T-206 — not translated). Filename carries the canonical name spelling; the link states format, size and `hreflang="en"` |

### 1.5 Contact

| ID | Feature | Notes |
|---|---|---|
| F-40 | Contact form | Name, email, message. Client + server validation |
| F-41 | Spam protection | Honeypot field + rate limiting. **No CAPTCHA** — it costs INP and accessibility, both of which are gates |
| F-42 | Email as text | `zeyadalnahdii@gmail.com`, selectable and machine-readable |
| F-43 | LinkedIn + GitHub links | `rel="me"` — helps consolidate the name entity (see `02-keyword-plan.md` §2) |
| F-44 | Response-time expectation | "Within two business days" |
| F-45 | Success / error states | Localised, announced to screen readers |

---

## 2. Explicitly excluded from v1

Listed so that exclusion is a recorded decision rather than an oversight.

| Excluded | Why |
|---|---|
| Blog / CMS | Owner decision. Revisit after launch — it is the main lever for traffic beyond the name query |
| Per-project detail routes | Two projects do not justify six extra routes. Cards carry enough |
| Analytics dashboard | Search Console is sufficient for v1 goals |
| Comments, newsletter | No audience to serve yet |
| Additional locales | Three is already the hard part |
| WhatsApp contact | F-46, deferred — phone number not yet available |
| Animations beyond CSS transitions | Costs INP and CLS for no measurable gain |

---

## 3. Deferred — v1.1 candidates

| ID | Feature | Trigger to reconsider |
|---|---|---|
| F-46 | WhatsApp contact link | Phone number becomes available |
| F-50 | Blog | After launch, if owner commits to writing regularly |
| F-51 | Per-project detail pages | If a third project ships, or a project needs a full case study |
| F-52 | Project screenshots / demo video | If repos stay private — becomes the only remaining evidence |

> F-52 is the fallback for D3. If `ai-autonomous-workspace` returns to private, visual
> evidence stops being optional and this moves into v1.

---

## 4. Dependencies

| Feature | Blocked by |
|---|---|
| F-22 | D2 / D3 — repository visibility |
| ~~F-34~~ | ~~CV content written in three locales~~ — **withdrawn (T-206):** one English CV serves all three |
| F-40 | Form handling choice — see `04-srs.md` §7 |
| All metadata | D1 — domain, needed for absolute canonical URLs |
