# 12 — Sprint 1 Gate Results

**Task:** T-126 · **Run:** 2026-09-23
**Verdict:** 7 of 8 pass. **Check 1 does not.** The gate is open.

Measured against a production build served locally, with
`NEXT_PUBLIC_SITE_URL=https://zeyadalnahdi.test` and, where noted,
`VERCEL_ENV=production`. Results recorded as observed.

---

## Summary

| # | Check | Result |
|---|---|---|
| 1 | 12 routes resolve; `/` 308s to `/en` | ❌ **3 routes, not 12** |
| 2 | `lang` and `dir` correct | ✅ |
| 3 | Reciprocal `hreflang` + `x-default` on every route | ✅ |
| 4 | Toggling `_meta.reviewed` changes metadata, sitemap and alternates | ✅ |
| 5 | `/sitemap.xml` and `/robots.txt` correct, absolute URLs | ✅ |
| 6 | Build fails without `NEXT_PUBLIC_SITE_URL` | ✅ |
| 7 | Lighthouse SEO = 100 on the empty shell | ✅ |
| 8 | All CI gates green | ✅ |

---

## 1 — Routes · FAILED

```
/            308 -> /en
/en          200
/tr          200
/ar          200

prerendered page routes: 3
```

The redirect and the three locale roots are correct. The count is not.

`about`, `projects` and `contact` were deleted with the spike in T-106 and are
built in T-211, T-212 and T-213. Twelve routes is a Sprint 2 outcome, and this
check asks for it at the end of Sprint 1.

**This is a defect in the gate, not in the work.** Nothing in Sprint 1's own
task list produces those pages. The check should read "every route in
`lib/seo/routes.ts` resolves in every locale", which is what
`scripts/assert-routes.mjs` already enforces in CI and which passes today.

Left failing rather than quietly reinterpreted: the wording is the owner's to
change.

## 2 — Language and direction · PASSED

```
/en   <html lang="en" dir="ltr"
/tr   <html lang="tr" dir="ltr"
/ar   <html lang="ar" dir="rtl"
```

## 3 — Alternates · PASSED

With `en` the only reviewed locale, every route carries exactly:

```
hreflang="en"        https://zeyadalnahdi.test/en
hreflang="x-default" https://zeyadalnahdi.test/en
```

That is the correct set for that state, not a truncated one: `tr` and `ar` are
served `noindex` (SRS I-14), and advertising them as alternates would
contradict their own robots directive.

With all three marked reviewed, the set becomes reciprocal across all three
plus `x-default`, verified in the same run:

```
hreflang="en"        https://zeyadalnahdi.test/en
hreflang="tr"        https://zeyadalnahdi.test/tr
hreflang="ar"        https://zeyadalnahdi.test/ar
hreflang="x-default" https://zeyadalnahdi.test/en
```

Reciprocity is structural — the set is computed from the reviewed-locale list
and the path alone, so it cannot differ by who is asking (T-114).

## 4 — Indexing gate · PASSED

`tests/indexing-gate.test.ts`, 10 tests, all passing. One flag moves metadata,
alternates, the sitemap and the schema together, across five review
combinations. Verified in T-119 that the suite fails if any consumer
re-derives the check for itself.

## 5 — Sitemap and robots · PASSED

Production (`VERCEL_ENV=production`):

```
robots.txt      User-Agent: *
                Allow: /
                Sitemap: https://zeyadalnahdi.test/sitemap.xml

sitemap.xml     <loc>https://zeyadalnahdi.test/en</loc>
                + reciprocal xhtml:link alternates
```

Non-production serves `Disallow: /` plus `X-Robots-Tag: noindex` on every path
(SRS X-06). URLs are absolute, and no `changefreq`, `priority` or invented
`lastmod` is emitted.

## 6 — Origin validation · PASSED

```
$ env -u NEXT_PUBLIC_SITE_URL npx next build
exit 1
Error: NEXT_PUBLIC_SITE_URL is not set.
There is no default on purpose. A fallback origin would publish canonical
URLs pointing at the wrong host rather than failing here.
```

> Worth recording: the first attempt at this check reported exit 0. `env -u`
> removes the variable from the process, but Next also reads `.env.local` from
> disk, which supplies it. The check only means anything with that file moved
> aside. T-112's original verification predated `.env.local` existing, so it
> was valid then — but the same command would have quietly stopped testing
> anything the moment the file appeared.

## 7 — Lighthouse · PASSED

Chrome 154, headless, against the production build.

| Route | SEO | Accessibility | Best Practices |
|---|---|---|---|
| `/en` | **100** | 100 | 100 |
| `/tr` | 66 | 100 | 100 |
| `/ar` | 66 | 100 | 100 |

`/en` is the empty shell the check names, and it scores 100 with no failing
audits.

The 66 on `/tr` and `/ar` is one audit: `is-crawlable` — "Page is blocked from
indexing". That is the I-14 gate working, not a defect. Confirmed by marking
both locales reviewed and re-running: all three then score **100**.

So the lower scores are a statement about the copy not having been reviewed
yet, which is true, and they rise on their own when D4 is resolved.

## 8 — CI gates · PASSED

```
typecheck     0
lint          0        (--max-warnings=0)
format        0
tests         138 passed
coverage      100% statements, branches, functions, lines on lib/seo
assert-routes OK
gitleaks      0
npm audit     0        (--audit-level=high)
latest dev run: success
```

---

## What blocks closing the gate

**Check 1 needs a decision.** Either the wording changes to match what Sprint 1
actually produces, or the gate stays open until Sprint 2 builds the remaining
nine routes — in which case Sprint 2 starts before its own entry gate passes,
which defeats the purpose of having one.

**D1 is not blocking after all.** The task text expected checks 3, 5 and 7 to
be unverifiable without the real domain. They were verifiable: the origin is
injected, so a reserved `.test` domain exercises exactly the same code paths
that a real one will. What a placeholder cannot prove is that the *deployed*
site behaves identically — which is T-311 and T-314's job, not this gate's.

The domain is still required before launch. It is no longer required to close
this gate.

## Open decisions unchanged

| # | Decision | Effect |
|---|---|---|
| D1 | Domain | Needed for deployment, not for this gate |
| D4 | Turkish reviewer | `/tr` stays `noindex`, Lighthouse 66 |
| — | Arabic review | `/ar` stays `noindex`, Lighthouse 66 |
| D2/D3 | Repository visibility | Blocks the Projects page in Sprint 2 |
