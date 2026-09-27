# 13 — Sprint 2 Gate

**Run:** 2026-09-27
**Criteria:** `08-sprint-plans.md` § Sprint 2 gate · `10-task-breakdown.md` T-221
**Verdict:** **Sprint 2 closes**, with two checks recorded as not passed — one
permitted by the exit rule, one deferred for want of a public URL.

Nothing below is reworded to make it pass. Where a check could not be run, it
says so rather than substituting a check that could.

---

## The eleven checks

| # | Check | Result |
|---|---|---|
| 1 | 12/12 routes: unique title and description, within length limits | ✅ `verify-metadata: OK` — longest title 56, longest description 152 |
| 2 | Absolute, correct canonical on every route | ✅ all 12 absolute and route-correct |
| 3 | JSON-LD passes the Rich Results Test; `@id` graph linked; reflects visible content | ⚠️ **Not verified** — see below |
| 4 | OG images render correctly in all three locales, Arabic included | ✅ 12 cards, 1200×630 PNG; Arabic read visually after the bidi fix |
| 5 | One `h1`, no skipped heading levels, on all 12 | ✅ enforced by `verify-metadata` |
| 6 | Images have explicit dimensions; zero CLS contribution | ✅ **zero `<img>` elements across all 12 routes** — see note |
| 7 | No missing translation keys; build fails if any | ✅ `Messages = typeof en` + `satisfies`; `tsc` clean |
| 8 | Turkish native-reviewed; `_meta.reviewed = true` | ❌ **Fails** — `false`, blocked on **D4** |
| 9 | RTL signed off in four theme and direction combinations | ✅ T-219, 12 routes × light/dark × desktop/mobile — 404 screen excepted |
| 10 | Language switcher maps to equivalent routes, never to home | ✅ verified from six pages in two directions |
| 11 | Zero broken internal links | ✅ `verify-links: OK` |

**Also re-run: the Sprint 1 gate (T-126).** Its check 1 — "12 routes resolve;
`/` 308s to `/en`" — now reads ✅ **12**. `assert-routes` confirms
`{ ar: 4, en: 4, tr: 4 }`. The exception recorded in `12-sprint-1-gate.md` is
discharged.

---

## Check 3 — not verified, and why

The criterion has three clauses. Two are verified on every pull request by the
`metadata` job: the `@id` graph resolves with no dangling references, and the
graph reflects the visible content of each route.

The third — **"passes the Rich Results Test"** — is a Google tool that fetches a
**publicly reachable URL**. There is no public deployment yet, so it has not been
run. That is a missing verification, not a known defect, and it is recorded as
missing rather than swapped for the local check that *was* run.

**Carries to Sprint 3 Phase 1**, once the interim Vercel deployment exists.

## Check 8 — fails, and the exit rule covers it

`tr._meta.reviewed = false`. The Turkish copy is written and shipped; no native
speaker has read it (**D4**, no reviewer found).

The exit condition anticipates exactly this:

> **Exit condition:** all green. A locale still failing review stays `noindex` —
> the sprint may close, but that locale does not ship indexed.

So check 8 failing does **not** block closure. The consequence is already live
and working as designed: the four `/tr` routes carry
`<meta name="robots" content="noindex, follow">` and are absent from the
sitemap, which lists 8 of 12 URLs.

## Check 6 — a note on what was actually verified

The site has **no images at all** — no `<img>` element on any of the 12 routes.
The stated criterion is therefore satisfied, but vacuously: there is nothing
whose dimensions could be missing.

Field CLS has **not** been measured. That is **T-303** in Sprint 3, and this
check should not be read as having covered it.

---

## Unresolved conditions, recorded as they stand

| Condition | State |
|---|---|
| **D4** — Turkish native reviewer | **Open.** No reviewer found. `/tr` ships `noindex`; 4 of 12 routes are not indexable |
| **T-204** — Turkish native review | **Blocked** on D4 |
| ~~**T-213** — real email delivery~~ | **Resolved 2026-09-27.** A real submission sent from the interim deployment arrived in the owner's inbox, confirmed by the owner. The Done-when's "a submission arrives" is met and **T-213 is complete.** Recorded here after the gate ran, not folded into it |
| **G2** — 12/12 routes indexed | **Not met and not claimable.** 8 of 12 are indexable at all, and none is indexed — there is no public deployment and no Search Console property |
| **G1** — name-query ranking | **Not measurable.** 60-day horizon, post-launch |
| **F-08 / T-320** — localised 404 | **Not built.** Blocked by a Next.js constraint (T-214); deferred to Sprint 3 |
| **D1** — custom domain | **Deferred by owner, 2026-09-27.** Deployment proceeds on a free `*.vercel.app` host, which is **not** the canonical production host and does **not** satisfy X-06, X-07 or the `01` §6 domain constraint |
| **D2 / D3** — repository visibility | **Resolved:** both stay private. `03` F-52 fallback applies; `projects.labels.repository` and `.demo` deleted |
| **F-31** — psychology background | **Withdrawn** by owner, 2026-09-26. Removed from the site entirely; remains in the CV PDF |

---

## Sprint 2 task status

| Task | State |
|---|---|
| T-201 … T-203 | Complete |
| **T-204** Turkish native review | **Blocked — D4** |
| **T-205** Keyword validation | Complete — closed with a deliberately narrowed criterion |
| T-206 CV download | Complete |
| T-210 Home · T-211 About · T-212 Projects | Complete |
| **T-213** Contact page and form | **Complete** — delivery confirmed by the owner 2026-09-27, after this gate ran |
| **T-214** 404 page | **Not complete** — X-04 met, F-08 deferred to T-320 |
| T-215 … T-220 | Complete |
| **T-221** Sprint 2 gate | This document |

---

## Can Sprint 2 close?

**Yes, under its own exit rule — and only because that rule was written to allow
exactly this case.**

Nine of eleven checks are green. Check 8 fails and the exit condition explicitly
permits closure with an unreviewed locale held `noindex`. Check 3 could not be
run at all for want of a public URL, and carries forward.

What closing does **not** mean: it does not mean 12 routes are indexed, it does
not mean Turkish is ready, it does not mean the contact form has delivered a
message, and it does not mean the site has a 404 page. Each of those is recorded
above with its blocker, and each carries into Sprint 3 or into the decision that
gates it.
