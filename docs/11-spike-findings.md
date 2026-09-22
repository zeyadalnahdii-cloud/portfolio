# 11 — Spike Findings (Sprint 1, Phase A)

**Tasks:** T-101 … T-106 · **Closed:** 2026-09-22
**Purpose:** keep what the spike learned after its code is deleted.

---

## 0. Verdict

All five outcomes confirmed. **The approach stands — no change of direction.**

Two failures were found and solved, both in Arabic OG generation, and both of a
kind that produce no error and no warning. Finding them in week 1 is the entire
return on this phase.

| # | Outcome | Result |
|---|---|---|
| 1 | Next.js + TypeScript strict | ✅ builds clean under the full strict block |
| 2 | next-intl + App Router, three locales | ✅ 12 routes, correct status codes |
| 3 | RTL via logical properties | ✅ mirrors with **zero** `rtl` rules in shipped CSS |
| 4 | Full static generation | ✅ 12 prerendered, 0 dynamic |
| 5 | Arabic OG image | ✅ after two fixes — see §2 |

---

## 1. What worked as expected

**Tailwind v4 for RTL.** `ms-*`, `ps-*`, `pe-*`, `border-s-*`, `text-start` compile
to logical properties. The Arabic layout mirrors from `dir` alone. The shipped
stylesheet contains 8 logical declarations and **0** `rtl` selectors — there is no
second stylesheet to maintain. This validates the Tailwind decision taken at T-101.

**Routing without middleware.** `redirects()` in `next.config.ts` gives an exact 308
on `/` → `/en` and keeps the site fully static. next-intl's middleware would have
emitted 307 and added an edge function. No IP or `Accept-Language` negotiation
anywhere (SRS I-04).

**`dynamicParams = false`.** This is what makes `/fr` a real 404 rather than an
attempted render. Without it the locale union is advisory.

**Static generation is not fragile here.** 12 `.html` files are emitted to disk. No
route touches `headers()`, `cookies()`, `draftMode()` or `searchParams`.

---

## 2. What failed, and what replaced it

### 2.1 `next/og` does not inherit application fonts

**Symptom:** Arabic renders as tofu boxes. No error, no warning.
**Fix:** read the font file from disk and pass it in the `fonts` option.
**Detail:** use `.woff` — satori cannot decode `.woff2`, which is what most font
packages ship first.

### 2.2 `textAlign` has no effect in satori

**Symptom:** `textAlign: 'right'` left the Arabic text against the left edge.
**Cause:** satori sizes flex children to their content, so there is no space inside
the element for text to align within.
**Fix:** alignment comes from the container — `alignItems: 'flex-end'`.

### 2.3 satori does not run the bidirectional algorithm — the serious one

**Symptom:** letterforms shape and join correctly, but **word order is reversed**.
`زياد النهدي` rendered as `النهدي زياد`.

This is the dangerous failure of the three. The card looks polished to anyone who
does not read Arabic: the script is beautiful and correctly joined. Only the reading
order is wrong, and only an Arabic reader sees it.

**Rejected fix:** Unicode embedding controls (`U+202B` / `U+202C`). satori draws them
as visible boxes *and* breaks the shaping of the following word — `زياد` became
`داي ز`. Strictly worse.

**Adopted fix:** reorder as layout, not as text. One flex item per word inside a
`row-reverse` container. Source strings stay natural (`زياد النهدي` is written that
way in the code), which is what matters for whoever writes and reviews translations.

> **This belongs in `06-mockups.md` §4.** That section currently warns only about
> fonts. A developer who loads the font will believe they are finished, ship a card
> that reads backwards, and never be told.

---

## 3. Carried forward into real implementation

Foundation kept after the spike — these are **not** spike code:

| Kept | Why | Extended by |
|---|---|---|
| `lib/i18n/config.ts` | Locale union, direction map, `isLocale` | T-113 |
| `i18n/request.ts` | next-intl request config | T-113 |
| `messages/{en,tr,ar}.json` | Message files; `_meta.reviewed` gate lands in T-113 | T-113 |
| `app/[locale]/layout.tsx` | `lang`/`dir`, `generateStaticParams`, `dynamicParams` | T-120, T-123 |
| `next.config.ts` | 308 redirect, `trailingSlash`, next-intl plugin | T-124 |
| `@fontsource/*` | Fonts specified in `06` §1.2, self-hosted per P-08 | T-123 |

Deleted as spike: the throwaway page bodies and the OG route. Their findings are
this document.

---

## 4. Consequences for later tasks

**T-111 — the route-count assertion cannot be 12 yet.** The task says the build job
should assert 12 static routes. After spike cleanup only the three locale roots
exist; `about`, `projects` and `contact` arrive in T-211 … T-213. The assertion
should be written against the locale count now (3 roots × 1 page) and raised to 12
in Sprint 2, or CI will fail from the moment it is introduced.

**T-115 — OG metadata is not wired.** The spike generated images but emitted no
`og:` tags, because no route exports `metadata`. That is T-115's job, not a defect.

**T-123 — font subsetting is unverified.** The spike loaded whole font files for OG
rendering. P-09 (Arabic subset absent on `/en` and `/tr`) has not been tested.

**T-217 — rebuild the OG route from `06` §4**, carrying §2.1–2.3 above. The design
tokens, real copy and per-route cards are not what the spike produced.
