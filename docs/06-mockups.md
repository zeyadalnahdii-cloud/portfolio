# 06 — Mockups & Design Specification

**Status:** Draft — wireframes and tokens defined; visual design pending
**Scope:** 4 pages × 2 directions (LTR / RTL) × 2 themes

---

## 0. What this document is

Low-fidelity structure, design tokens, and the constraints that the SRS imposes on
visual design. It is not a pixel comp. It exists so that the layout decisions that
affect **CLS, LCP and heading structure** are made before implementation rather than
discovered during a Lighthouse run.

Three constraints from `04-srs.md` shape every screen here:

| Constraint | Design consequence |
|---|---|
| P-02 — CLS < 0.1 | Every image, embed and late-loading element needs reserved space with fixed dimensions, decided at design time |
| P-01 — LCP < 2.5s | No hero image, carousel or background video. The LCP element should be **text** |
| M-09/M-10 — heading structure | The visual hierarchy must map to a valid `h1 → h2 → h3` order, marked on every screen |

---

## 1. Design tokens

### 1.1 Colour

Defined as CSS custom properties on `:root`, redefined for dark mode. Both themes
**MUST** independently satisfy A-03 (4.5:1 body text, 3:1 large text).

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0d1117` | Page background |
| `--surface` | `#f6f8fa` | `#161b22` | Cards |
| `--border` | `#d8dee4` | `#30363d` | Dividers, card edges |
| `--text` | `#1f2328` | `#e6edf3` | Body |
| `--text-muted` | `#59636e` | `#9198a1` | Secondary text |
| `--accent` | `#0969da` | `#4493f8` | Links, CTA |
| `--accent-hover` | `#0550ae` | `#6cb6ff` | Hover |
| `--focus` | `#0969da` | `#4493f8` | Focus ring (A-05) |
| `--accent-fg` | `#ffffff` | `#0d1117` | Text **on** an accent fill (buttons) |
| `--danger` | `#cf222e` | `#ff7b72` | Error text, invalid field border |
| `--border-control` | `#818b98` | `#6e7681` | Form control boundaries |

> The last three were added in **T-219**. The table originally had no token for
> text drawn *on* the accent, so both buttons hardcoded `text-white` — correct
> in light, **3.10:1 in dark**. There was likewise no error colour, so the form
> hardcoded Tailwind `red-600`, which is **3.96:1** on the dark background.
> A missing token is how a palette fails a theme: nothing is wrong with any
> value in the table, and the site still fails A-03.
>
> `--border-subtle` is unchanged and remains decorative (card edges, dividers),
> which WCAG 1.4.11 exempts. `--border-control` exists because an *empty* input
> is identifiable only by its border, so that one must reach 3:1.

> These are placeholder values chosen for guaranteed contrast, not a brand palette.
> Replace with a deliberate palette — but re-run contrast checks in **both** themes
> after any change. Dark-mode contrast failures are the usual regression.

### 1.2 Typography

| Role | Latin / Turkish | Arabic |
|---|---|---|
| Body | Inter | IBM Plex Sans Arabic |
| Code | JetBrains Mono | JetBrains Mono |

- Self-hosted via `next/font`, `font-display: swap` (P-08).
- **Subset per script and load conditionally by locale** (P-09). The Arabic face must
  not be downloaded on `/en` or `/tr`.
- Turkish requires `ı ğ ş ç ö ü` — verify the Latin subset includes Turkish glyphs,
  not just `latin`. A `latin`-only subset renders `ı` as a fallback glyph.

Scale: `0.875 / 1 / 1.125 / 1.25 / 1.5 / 2 / 2.5 rem`. Body 1rem, line-height 1.6
(1.8 for Arabic — Arabic script needs more leading at the same size).

### 1.3 Spacing & layout

- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px`.
- Content max-width: `720px` for text, `1120px` for the page shell.
- Side gutter: `16px` minimum at all widths. No horizontal scroll at 320px (P/F-05).
- Breakpoints: `640` (sm), `768` (md), `1024` (lg).

---

## 2. Wireframes

Heading levels are marked. One `h1` per page, no skipped levels.

### 2.1 Shell (all pages, LTR)

```
┌──────────────────────────────────────────────────────┐
│ [Skip to content]  ← visible on focus only (A-06)    │
├──────────────────────────────────────────────────────┤
│  Zeyad Alnahdi    Home About Projects Contact  EN▾ ☾ │  ← header
├──────────────────────────────────────────────────────┤
│                                                      │
│                  <main id="content">                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│  zeyadalnahdii@gmail.com   GitHub  LinkedIn          │  ← footer
│  © 2026 Zeyad Alnahdi                                │
└──────────────────────────────────────────────────────┘
```

Mobile: nav collapses to a disclosure button. **Not** an overlay that traps focus —
A-04 forbids traps, and a full-screen menu that cannot be dismissed by `Esc` fails it.

### 2.2 Home

```
h1   Zeyad Alnahdi
     Backend & Desktop Application Developer          ← LCP element: text
     
     2–3 sentence introduction.

h2   What I work with
     C# · ASP.NET Core · SQL Server · PostgreSQL
     Python/FastAPI · TypeScript · Next.js · Docker    ← plain text (F-12)

h2   Selected work
     ┌────────────────────┐  ┌────────────────────┐
     │ h3 AI Autonomous   │  │ h3 Restaurant      │
     │    Workspace       │  │    Management      │
     │ description        │  │ description        │
     │ tags               │  │ tags               │
     │ → Details          │  │ → Details          │
     └────────────────────┘  └────────────────────┘
     Fixed card height. Reserved. No shift on load.

     [ Get in touch ]                                  ← CTA (F-14)
```

### 2.3 Projects

```
h1   Projects

h2   AI Autonomous Workspace
     Problem      — one sentence
     Architecture — ASP.NET Core, 4 layers; FastAPI AI service; Qdrant; Ollama
     Scale        — 598 files · 85 test files · 74 merged PRs
     Result       — 35-page PDF indexed end to end in 32.6s, cited answers
     Stack tags
     [ View repository ]   [ Live demo ]               ← D3 · demo if deployed

h2   Restaurant Management
     Problem      — one sentence
     Architecture — three tiers (FM → PL → DAL), stored procedures only
     Scale        — 9 forms · 10 tables · 37 stored procedures
     Notable      — Arabic RTL desktop interface
     Stack tags
     [ View repository ]                               ← blocked on D2
```

Each project is an `h2` with a consistent internal shape. Consistency matters more
than decoration here: a recruiter scans for stack and scale, and finds both in the
same position on every card.

Where a project has a caveat worth stating, it goes in this same fixed position
rather than being omitted. Naming a limitation plainly is a credibility device: a
portfolio that is precise about scope is read as trustworthy about results.

### 2.4 About

```
h1   About me
     Positioning paragraph.

h2   How I learned
     Self-taught path: C++ → C# → SQL Server → ASP.NET Core.

h2   Psychology, applied
     One concrete example of the degree changing a technical decision.
     Not a career-change story (see 01 §2).

h2   What I'm looking for
     Freelance · remote · Aksaray-based, open to Ankara roles.

     [ Download CV (PDF) · 69 KB ]                     ← F-34, one English PDF
```

### 2.5 Contact

```
h1   Get in touch
     Response within two business days.

     ┌─────────────────────────────┐
     │ Name    [________________]  │   ← <label>, not placeholder-as-label (A-07)
     │ Email   [________________]  │
     │ Message [________________]  │
     │         [________________]  │
     │         [ Send ]            │
     │ (honeypot field, hidden)    │   ← C-03
     └─────────────────────────────┘
     Reserved space for the status message — always present,
     empty until needed. Prevents CLS on submit. (P-02, A-08)

h2   Elsewhere
     zeyadalnahdii@gmail.com · GitHub · LinkedIn       ← rel="me" (F-43)
```

**The reserved status area is the CLS detail worth noting:** a message that appears
after submit pushes content down. Reserve its height from the start.

---

## 3. RTL specification

Arabic is **not** the LTR layout mirrored by CSS. These are design decisions, taken here.

| Element | LTR | RTL |
|---|---|---|
| Text alignment | left | right |
| Nav order | Home → Contact, left to right | Home → Contact, **right to left** |
| Logo / name | top-left | top-right |
| Card internal flow | label left, value right | label right, value left |
| Directional icons (→, back, next) | as drawn | **mirrored** |
| Non-directional icons (☾, ✉, GitHub mark) | as drawn | **not mirrored** |
| Numerals | Western (1234) | **Western (1234)** — standard in technical Arabic |
| Code blocks & inline code | LTR | **LTR** — code never flips, even in RTL context |
| Latin technical terms in Arabic text | — | stay LTR inline; the paragraph stays RTL |
| Focus order | left → right | right → left |

### 3.1 Implementation rules

- Use **logical properties** — `margin-inline-start`, `padding-inline-end`,
  `border-inline-start` — not `left`/`right`. The layout then follows `dir`
  automatically and there is no second stylesheet to maintain.
- **Never** `transform: scaleX(-1)` on a container. It mirrors text and icons that
  must not be mirrored, and it inverts the meaning of non-directional glyphs.
- Set `dir="ltr"` explicitly on `<code>`, `<pre>`, email addresses and URLs inside
  Arabic content. Mixed-direction text without explicit marking renders with
  punctuation in the wrong place — the classic symptom is a trailing period jumping
  to the start of the line.
- Test with real Arabic content, never Lorem Ipsum. Latin placeholder text in an RTL
  layout hides every bidi bug the real content will expose.
- Put `dir="ltr"` on an **inline** element, never on a block one. On a block it sets
  the alignment too, so a Latin heading inside an Arabic page left-aligns and detaches
  from its own right-aligned section. For a run of Latin text inside RTL content use
  `<bdi>`, which isolates the run's direction and leaves the block following the page.
  (T-219 found exactly this on the `/projects` headings.)
- A logical-sounding class name is not automatically a real one. `inset-inline-0` is
  not a Tailwind utility; it compiled to nothing, and the mobile menu shipped as a
  shrink-wrapped panel floating over the page in all three locales. Tailwind's logical
  inset utilities are `start-*` / `end-*` (and `inset-x-*`). An unknown class produces
  no CSS and no warning — check the generated stylesheet, not the class name.

### 3.2 Screens requiring separate RTL review

All four pages, plus: mobile nav disclosure, language switcher dropdown, form error
states, and the 404 page. Each is signed off separately in the Sprint 2 gate.

---

## 4. Open Graph card

1200×630, generated per route per locale via `next/og` (M-08).

```
┌────────────────────────────────────────────┐
│                                            │
│   Zeyad Alnahdi                            │  ← 64px bold
│   Backend & Desktop Developer              │  ← 36px muted
│                                            │
│   ──────────────                           │  ← accent rule
│                                            │
│   C# · ASP.NET Core · SQL Server           │  ← 28px
│                                            │
│                        zeyadalnahdi.com    │  ← 24px, bottom
└────────────────────────────────────────────┘
```

- Background `--bg`, text `--text`, rule `--accent`.
- Per-locale text; Arabic version is RTL with the domain bottom-left.
- **Fonts must be loaded explicitly in the OG route** — `next/og` does not inherit the
  app's fonts. Arabic cards silently render as boxes otherwise. This is the single
  most common failure in localised OG generation.
- No photograph in v1. Avoids a licensing and file-size question for no measurable gain.

---

## 5. States

Every interactive element specifies: default · hover · focus · active · disabled.

| State | Requirement |
|---|---|
| Focus | Visible ring, `--focus`, 2px offset, on **every** interactive element (A-05). Never `outline: none` without a replacement |
| Loading (form submit) | Button disabled, text changes, `aria-busy`. No spinner that shifts layout |
| Error | `--text` on a bordered surface, icon + text (never colour alone — fails A-03 intent) |
| Empty | Not applicable in v1; no dynamic lists |
| Reduced motion | All transitions disabled under `prefers-reduced-motion` (A-10) |

Transitions: `150ms ease` on colour and background only. Nothing that moves layout.

---

## 6. Deliverables & sign-off

| Deliverable | Status |
|---|---|
| Wireframes, 4 pages | §2 — done |
| RTL specification | §3 — done |
| Design tokens | §1 — placeholder values, need a deliberate palette |
| OG card spec | §4 — done |
| High-fidelity visual design | **Not started** — optional; the wireframes are implementable as-is |

**Sign-off condition:** before Sprint 2 closes, every screen reviewed in four
combinations — LTR light, LTR dark, RTL light, RTL dark — with real content in all
three languages.
