# 02 — Content & Keyword Plan

**Scope:** 4 pages × 3 locales = 12 routes
**Default locale:** `en` · Secondary: `tr` · Tertiary: `ar`
**Status:** Draft — volumes unvalidated (see §1), copy pending review (see §6)

---

## 1. Method, and what is actually measured

**Updated by T-205, 2026-09-25.** The identity and head terms below are measured.
The rest are not, and the difference is marked term by term — `[measured]`
carries a figure, a market and a source; everything else is reasoned from
audience intent, competition and the owner's actual stack.

### Measured

| Term | Volume/mo | Market | Source |
|---|---|---|---|
| `software engineer` | 90,500 | US | WordStream |
| `software developer` | 27,100 | US | WordStream |
| `yazılımcı` | 14,800 | TR | Keyword Planner |
| `full stack developer` | 12,100 | US | WordStream |
| `مبرمج` | 2,400 | SA | Keyword Planner |
| `yazılım geliştirici` | 1,900 | TR | Keyword Planner |
| `مطور برمجيات` | 50 | SA | Keyword Planner |

Two findings changed the plan rather than confirming it:

- **The literal translation is the wrong term in two of three languages.**
  `مبرمج` outperforms `مطور برمجيات` 48×, and `yazılımcı` outperforms
  `yazılım geliştirici` 7.8×. Translating the English head term would have
  targeted the words neither market searches.
- **Volume is not the selector.** `software engineer` is the largest number in
  the table and is deliberately *not* targeted: it describes a role this
  portfolio does not claim. `software developer` was likewise not adopted as the
  site identity merely for being 2.2× `full stack developer`.

### Not measured, and deliberately so

Autocomplete and "People also ask" were **not pursued**. The measured set above
was sufficient for the decisions that had to be made, and the remaining
questions are ranking questions rather than term-selection questions. Nothing in
this document should be read as validated by them.

The **long-tail tier in §3 is unvalidated**. It is retained as evidence and as
supporting terms, not promoted to any route's primary keyword. Its volumes are
expected to be near zero; that was never the argument for it.

**The next real data is Search Console *Performance → Queries* after 30 days
live** — which §1 has always said is the only real data, and which no keyword
tool substitutes for.

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
| Identity | `full stack developer` **[measured 12,100 US]** | The canonical professional descriptor site-wide. Does **not** displace the name entity on Home. |
| Secondary | `software developer` **[measured 27,100 US]**, `AI developer`, `AI development` | `software developer` is the `/en/about` primary. AI is a positioning dimension — **not** AI Engineer or ML Engineer. |
| Technical | `C#`, `.NET`, `ASP.NET Core`, `SQL Server`, `Next.js` | Supporting terms, placed where the page content already earns them |
| Long-tail *(unvalidated, evidence only)* | `ASP.NET Core clean architecture example`, `RAG pipeline ASP.NET Core FastAPI`, `self-hosted RAG Qdrant Ollama`, `C# WinForms SQL Server project`, `Arabic RAG retrieval` | Reasoned, not measured. Retained as in-page evidence inside the relevant project, **not promoted to any route's primary keyword** (T-205). |
| ~~Differentiator~~ | ~~`psychology graduate software developer`~~ | **Withdrawn (T-205).** Psychology stays in the About narrative as story; it is not an SEO target. |

### 3.2 Turkish (`/tr`) — local employers, Aksaray (remote / Ankara available)

| Tier | Terms | Notes |
|---|---|---|
| Primary | `Zeyad Alnahdi` | Latin script; Turkish users search names in Latin |
| Identity | `full stack developer` | English technical terminology is retained where the market uses it. |
| Secondary | `yazılımcı` **[measured 14,800 TR]**, `AI developer`, `AI development` | `yazılımcı` is the `/tr/about` primary and an **approved keyword decision**. It beats `yazılım geliştirici` **[1,900]** 7.8×. |
| Technical | `C#`, `.NET`, `ASP.NET Core`, `SQL Server` | |
| Geo | ~~`Aksaray yazılım geliştirici`~~ | **Demoted (T-205).** Aksaray is factual location information, not a primary SEO target. It appears in copy because it is true, not to rank. |
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
| Identity | `Full Stack Developer` | Kept in Latin — the canonical title in this market too. |
| Secondary | `مبرمج` **[measured 2,400 SA]**, `AI developer`, `AI development` | `مبرمج` is the `/ar/about` primary. `مطور برمجيات` **[50]** is dropped: 48× weaker and the literal translation trap. |
| Technical | `C#`, `.NET`, `ASP.NET Core`, `SQL Server`, `RAG` | Latin technical terms retained where Arabic prose uses them naturally |
| Long-tail *(unvalidated)* | `نظام RAG عربي`, `بحث دلالي بالعربية`, `نظام إدارة مطعم C#`, `مبرمج سي شارب` | **The "single strongest Arabic opportunity" claim is withdrawn (T-205)** — it was never measured. These stay as in-page evidence, not as primary targets. |
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

> **Generated from the shipped message files, T-205, 2026-09-25.** The character
> counts are measured, not estimated. `scripts/verify-metadata.mjs` enforces the
> limits and the within-locale uniqueness on every pull request, so this table
> cannot drift from what is served without CI failing.

### English

| Route | Primary | Secondary | Title | Description | H1 |
|---|---|---|---|---|---|
| `/en` | `Zeyad Alnahdi` *(name entity)* | full stack developer, AI-powered applications, C#, ASP.NET Core | Zeyad Alnahdi — Full Stack Developer · **36** | Full stack developer building web and desktop applications in C#, ASP.NET Core and Next.js, including AI-powered systems. Based in Aksaray, Turkey. · **147** | Zeyad Alnahdi |
| `/en/about` | `software developer` **[27,100 US]** | full stack developer, self-taught developer, C#, .NET, SQL Server | About Zeyad Alnahdi — Full Stack Developer · **42** | Self-taught software developer working in C#, ASP.NET Core, SQL Server and Next.js. How I learned, what I build, and the thinking behind it. · **140** | About me |
| `/en/projects` | `AI developer` | AI development, ASP.NET Core, C#, SQL Server, Next.js *(RAG, Qdrant, FastAPI as evidence)* | Projects — AI and Full Stack Development \| Zeyad Alnahdi · **56** | An AI-powered workspace built on ASP.NET Core, FastAPI and Qdrant, and a three-tier C# desktop system over SQL Server. · **118** | Projects |
| `/en/contact` | `full stack developer` **[12,100 US]** | freelance, remote | Contact Zeyad Alnahdi — Full Stack Developer · **44** | Get in touch about freelance projects, remote roles or collaboration. Email and GitHub, with a reply within two business days. · **126** | Get in touch |

### Turkish

| Route | Primary | Secondary | Title | Description | H1 |
|---|---|---|---|---|---|
| `/tr` | `Zeyad Alnahdi` *(name entity)* | full stack developer, yapay zekâ destekli sistemler, C#, ASP.NET Core | Zeyad Alnahdi — Full Stack Developer · **36** | C#, ASP.NET Core ve Next.js ile web ve masaüstü uygulamaları ve yapay zekâ destekli sistemler geliştiriyorum. Aksaray'da yaşıyorum. · **131** | Zeyad Alnahdi |
| `/tr/about` | `yazılımcı` **[14,800 TR]** | full stack developer, C#, .NET, masaüstü uygulama | Hakkımda — Zeyad Alnahdi, Full Stack Developer · **46** | Kendi kendine yetişmiş bir yazılımcı. Nasıl öğrendiğim, ne inşa ettiğim ve tasarım kararlarının arkasındaki düşünce. · **116** | Hakkımda |
| `/tr/projects` | `AI developer` | AI development, ASP.NET Core, C#, SQL Server | Projeler — AI ve Full Stack Geliştirme \| Zeyad Alnahdi · **54** | ASP.NET Core, FastAPI ve Qdrant ile kendi sunucusunda çalışan yapay zekâ altyapısı; C# ve SQL Server ile katmanlı bir masaüstü sistemi. · **135** | Projeler |
| `/tr/contact` | `full stack developer` | uzaktan, freelance | İletişim — Zeyad Alnahdi, Full Stack Developer · **46** | Freelance projeler, uzaktan pozisyonlar veya iş birliği için iletişime geçin. E-posta ve GitHub üzerinden, iki iş günü içinde yanıt. · **132** | İletişime geçin |

### Arabic

| Route | Primary | Secondary | Title | Description | H1 |
|---|---|---|---|---|---|
| `/ar` | `زياد النهدي` *(name entity)* | Full Stack Developer, مبرمج, الذكاء الاصطناعي, C#, ASP.NET Core | زياد النهدي — Full Stack Developer · **34** | مبرمج Full Stack يبني تطبيقات ويب وسطح مكتب بلغة C# و ASP.NET Core و Next.js، وأنظمة مدعومة بالذكاء الاصطناعي. مقيم في أق سراي بتركيا. · **134** | زياد النهدي |
| `/ar/about` | `مبرمج` **[2,400 SA]** | Full Stack Developer, C#, .NET, SQL Server | نبذة عن زياد النهدي — Full Stack Developer · **42** | مبرمج علّم نفسه بنفسه، يعمل بلغة C# و ASP.NET Core و SQL Server و Next.js. كيف تعلّمت، وما الذي أبنيه، والتفكير وراء قراراتي. · **125** | نبذة عني |
| `/ar/projects` | `AI developer` / `AI development` | ASP.NET Core, C#, SQL Server *(RAG, Qdrant, FastAPI as evidence)* | المشاريع — AI و Full Stack \| زياد النهدي · **40** | منصة عمل مدعومة بالذكاء الاصطناعي على ASP.NET Core و FastAPI و Qdrant، ونظام إدارة مطعم بثلاث طبقات فوق SQL Server. · **115** | المشاريع |
| `/ar/contact` | `تواصل مع مبرمج` | مبرمج, فري لانس, عن بُعد | تواصل مع زياد النهدي — Full Stack Developer · **43** | للتواصل بشأن مشاريع العمل الحر أو الوظائف عن بُعد أو التعاون. عبر البريد الإلكتروني أو غيت هب، والردّ خلال يومَي عمل. · **117** | تواصل معي |

**Notes on the primaries.**

- **The name entity stays Home's primary in all three locales** (`02` §2). `Full
  Stack Developer` is the professional descriptor and a Home secondary; it does
  not displace the name, which is the target G1 is measured against.
- `/ar/contact` is `تواصل مع مبرمج` rather than bare `مبرمج`, which would have
  collided with `/ar/about` and put two of the four Arabic pages in competition
  for one result. The measured term is retained inside the phrase.
- `/en/projects`, `/tr/projects` and `/ar/projects` carry `AI developer`.
  **AI is a positioning dimension, not a job title** — the site does not claim
  AI Engineer or ML Engineer anywhere.
- Psychology no longer appears in any title or description. It remains in the
  About narrative as story (`01` §2).

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
