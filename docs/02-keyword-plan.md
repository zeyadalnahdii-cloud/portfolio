# 02 — Content & Keyword Plan

**Scope:** 4 pages × 3 locales = 12 routes
**Default locale:** `en` · Secondary: `tr` · Tertiary: `ar`
**Status:** Draft — volumes unvalidated (see §1), copy pending review (see §6)

---

## 1. Method and a caveat

Keywords below are derived from audience intent, competition reasoning and the
owner's actual stack — **not** from measured search-volume data. No keyword tool was
run. Treat every term here as a **hypothesis to validate**, not a finding.

Validate before Sprint 2 closes, using:
- Google Keyword Planner (free with any Ads account) for volume and competition.
- Google autocomplete + "People also ask" for each locale, searched from the target
  region and language.
- Search Console *Performance → Queries* after 30 days live — the only real data.

For a 12-route personal site, keyword strategy is a minor lever. The dominant ranking
factors here are: an exact-match domain, correct structured data, a clean name entity,
and external links pointing at the site (GitHub, LinkedIn, Stack Overflow profiles).
Do not over-invest in keyword tuning at the expense of those.

## 2. Name entity — the highest-value target

The single most valuable query is the owner's own name. It converts at near 100%
(someone searching it already wants *him*) and is winnable.

**Canonical form:** `Zeyad Alnahdi` — use this exact spelling everywhere: domain,
`<title>`, H1, schema `name`, GitHub display name, LinkedIn, CV filename, email
signature. Consistency is what lets search engines resolve one entity instead of three.

**Variants** — do not use as primary, but declare in schema `alternateName` and allow
to appear naturally in body copy once each:

| Variant | Where it arises |
|---|---|
| زياد النهدي | Arabic locale, canonical Arabic form |
| Ziyad Alnahdi | Common alternate transliteration |
| Zeyad Al-Nahdi / Zeyad Al Nahdi | Hyphenated and spaced forms |
| Zeyad Alnahdii | Email/GitHub handle spelling — **do not** use on site or domain |

> The doubled `i` in `zeyadalnahdii` exists in the email and GitHub handle. It splits
> the entity. Consider renaming the GitHub account to `zeyadalnahdi` if the name is
> free; keep the email as-is (changing it costs more than it gains).

**Supporting action, outside this site:** ensure GitHub, LinkedIn and any other public
profile use the canonical spelling and link to the domain. These links are what will
actually win G1, more than anything on-page.

## 3. Keywords by locale

Researched independently per locale. Turkish and Arabic terms are **not** translations
of the English set — they reflect how each market actually searches.

### 3.1 English (`/en`) — remote recruiters, international clients

| Tier | Terms | Notes |
|---|---|---|
| Primary | `Zeyad Alnahdi` | Name entity — owns G1 |
| Secondary | `backend developer portfolio`, `C# .NET developer`, `SQL Server developer` | High competition; realistic only as long-tail combinations |
| Long-tail *(best odds)* | `ASP.NET Core clean architecture example`, `RAG pipeline ASP.NET Core FastAPI`, `self-hosted RAG Qdrant Ollama`, `C# WinForms SQL Server project`, `Arabic RAG retrieval` | Low volume, low competition, high intent — the winnable set. The self-hosted RAG and Arabic-retrieval terms are unusually uncontested and map to real, verifiable work. |
| Differentiator | `psychology graduate software developer`, `developer with psychology background` | Very low volume, near-zero competition, memorable. Worth one page section. |

### 3.2 Turkish (`/tr`) — local employers, Aksaray (remote / Ankara available)

| Tier | Terms | Notes |
|---|---|---|
| Primary | `Zeyad Alnahdi` | Latin script; Turkish users search names in Latin |
| Secondary | `backend yazılım geliştirici`, `C# .NET geliştirici`, `masaüstü uygulama geliştirici` | `yazılım geliştirici` is the standard local term — not `programcı` |
| Geo | `Aksaray yazılım geliştirici`, `Aksaray backend geliştirici` | **D5 resolved: Aksaray.** Lower volume than Ankara but truthful and far less contested — a realistic win. Ankara may appear as availability ("Ankara'daki pozisyonlara açık"), never as location. |
| Long-tail | `C# SQL Server proje örneği`,  `uzaktan freelance yazılım geliştirici` | |

**Language notes for whoever writes the Turkish copy:**
- Turkish SEO is sensitive to correct diacritics (`ı ğ ş ç ö ü`). `yazilim` and
  `yazılım` are different strings. Never strip them.
- Keep URL slugs in ASCII English (see `05-ia-url-map.md`) — Turkish slugs invite
  encoding bugs for marginal benefit.
- `mühendis` (engineer) implies a formal engineering degree in Turkish professional
  usage. Use `geliştirici` (developer). This matters for credibility, not just SEO.

### 3.3 Arabic (`/ar`) — freelance clients

| Tier | Terms | Notes |
|---|---|---|
| Primary | `زياد النهدي` | |
| Secondary | `مطور باك اند`, `مبرمج C#`, `تطوير تطبيقات سطح المكتب` | |
| Long-tail | `نظام RAG عربي`, `بحث دلالي بالعربية`, `نظام إدارة مطعم C#`, `مبرمج سي شارب` | Arabic-language RAG is a near-empty niche and the owner has real work in it (`arabic_query_expansion`, `text_quality_service`) — the single strongest Arabic opportunity |
| Service intent | `مبرمج فري لانس عربي`, `تصميم أنظمة إدارة` | |

**Language notes:**
- Arabic searchers frequently transliterate English technical terms (`باك اند`,
  `سي شارب`, `داتابيز`). Include both the transliterated and Latin forms naturally —
  people search both.
- Write real Arabic, not machine-translated English. Translated Arabic reads as
  translated and costs credibility with exactly the audience it targets.

## 4. Page → keyword → metadata map

One primary keyword per route. No cannibalisation: no two routes in the same locale
target the same primary term.

Constraints: title ≤ 60 chars · description ≤ 155 chars · exactly one H1 per page.

### English

| Route | Primary keyword | Title | Description | H1 |
|---|---|---|---|---|
| `/en` | Zeyad Alnahdi | Zeyad Alnahdi — Backend & Desktop Developer | Backend and desktop application developer working in C#, ASP.NET Core and SQL Server. Based in Aksaray, Turkey. Available for freelance and remote work. | Zeyad Alnahdi |
| `/en/about` | psychology graduate software developer | About Zeyad Alnahdi — Backend Developer | Self-taught backend developer with a psychology degree. How that background shows up in the way I design interfaces, handle errors and model data. | About me |
| `/en/projects` | ASP.NET Core clean architecture example | Projects — Backend & AI Systems \| Zeyad Alnahdi | An AI workspace with a self-hosted RAG pipeline in ASP.NET Core, FastAPI and Qdrant, and a three-tier C# desktop system over SQL Server. | Projects |
| `/en/contact` | contact backend developer | Contact Zeyad Alnahdi — Backend Developer | Get in touch about freelance projects, remote roles or collaboration. Email and GitHub, with a reply within two business days. | Get in touch |

### Turkish

| Route | Primary keyword | Title | Description | H1 |
|---|---|---|---|---|
| `/tr` | Zeyad Alnahdi | Zeyad Alnahdi — Backend ve Masaüstü Geliştirici | C#, ASP.NET Core ve SQL Server ile backend ve masaüstü uygulama geliştiricisi. Aksaray'da yaşıyor, freelance ve uzaktan çalışmaya açık. | Zeyad Alnahdi |
| `/tr/about` | backend yazılım geliştirici | Hakkımda — Zeyad Alnahdi, Yazılım Geliştirici | Psikoloji mezunu, kendi kendine yetişmiş backend geliştirici. Bu altyapının arayüz tasarımına, hata yönetimine ve veri modellemeye katkısı. | Hakkımda |
| `/tr/projects` | ASP.NET Core katmanlı mimari | Projeler — Backend ve Yapay Zekâ \| Zeyad Alnahdi | ASP.NET Core, FastAPI ve Qdrant ile kendi sunucusunda çalışan RAG altyapısı; C# ve SQL Server ile katmanlı bir masaüstü sistemi. | Projeler |
| `/tr/contact` | yazılım geliştirici iletişim | İletişim — Zeyad Alnahdi, Yazılım Geliştirici | Freelance projeler, uzaktan pozisyonlar veya iş birliği için iletişime geçin. E-posta ve GitHub üzerinden, iki iş günü içinde yanıt. | İletişim |

### Arabic

| Route | Primary keyword | Title | Description | H1 |
|---|---|---|---|---|
| `/ar` | زياد النهدي | زياد النهدي — مطوّر باك اند وتطبيقات سطح المكتب | مطوّر باك اند وتطبيقات سطح مكتب بلغة C# و ASP.NET Core و SQL Server. مقيم في أق سراي بتركيا، ومتاح للعمل الحر والعمل عن بُعد. | زياد النهدي |
| `/ar/about` | مطور باك اند | نبذة عن زياد النهدي — مطوّر باك اند | مطوّر باك اند علّم نفسه بنفسه، وخريج علم النفس. كيف تظهر هذه الخلفية في تصميم الواجهات ومعالجة الأخطاء ونمذجة البيانات. | نبذة عني |
| `/ar/projects` | نظام RAG عربي | المشاريع — باك اند وذكاء اصطناعي \| زياد النهدي | منصة عمل بخطّ RAG ذاتي الاستضافة على ASP.NET Core و FastAPI و Qdrant، ونظام إدارة مطعم بثلاث طبقات فوق SQL Server. | المشاريع |
| `/ar/contact` | تواصل مع مبرمج | تواصل مع زياد النهدي — مطوّر باك اند | للتواصل بشأن مشاريع العمل الحر أو الوظائف عن بُعد أو التعاون. عبر البريد الإلكتروني أو غيت هب، والردّ خلال يومَي عمل. | تواصل معي |

> **Reconciled against what shipped, 2026-09-23 (T-215).** The tables above now
> carry the copy that is actually served, not the copy first drafted here. Three
> differences were deliberate and were kept: the location is Aksaray rather than
> Turkey, since D5 resolved; Contact offers GitHub rather than LinkedIn, whose
> URL is still unknown and which the page must not name; and Home lists
> ASP.NET Core, which is what the work is actually in.
>
> English and Arabic are reviewed and indexed. Turkish is drafted and stays
> `noindex` until a native reviewer reads it (D4, T-204).

## 5. Content outlines

Per page, per locale — same structure across locales, independently written copy.

**Home** — one-line positioning · what he builds (2–3 sentences) · core stack as text
not images · two project cards · a single clear call to action. No carousel, no hero
video: both cost LCP, which is a gate.

**About** — how he learned (self-taught, C++ → C# → SQL Server) · the psychology
degree as added capability, stated concretely with one real example, not as a career
story · what he is looking for · CV download.

**Projects** — one card per project: problem, stack, one architecture decision worth
naming, link to repo.

- **AI Autonomous Workspace** leads. Name the measured result, not the ambition:
  a 35-page PDF indexed end to end in 32.6s, cited answers from a self-hosted stack.
  Feature-complete through Sprint 9; deployment (Sprint 10) pending. A live demo link,
  if deployed, belongs here and outranks everything else on the page.
- **Restaurant Management** second: three tiers, 37 stored procedures, Arabic RTL.

Blocked on D2/D3. A card linking to a private repo is worse than no card — the claim
becomes unverifiable exactly where verification matters most.

**Contact** — form (name, email, message) · email address as text · LinkedIn · GitHub ·
expected response time. Phone/WhatsApp omitted until available (D-pending).

## 6. Deliverable

Final copy lands in `messages/en.json`, `messages/tr.json`, `messages/ar.json` before
Sprint 2 begins. Each file carries a `_meta.reviewed` boolean; `false` forces `noindex`
on that locale's routes.

## 7. Dependencies

| Blocks this document | From |
|---|---|
| D5 — city to state publicly | `01-project-proposal.md` §9 |
| D2/D3 — repo visibility and inclusion | `01-project-proposal.md` §9 |
| D4 — Turkish native reviewer | `01-project-proposal.md` §9 |
| D1 — domain (needed for canonical/OG) | `01-project-proposal.md` §9 |
