# Web Space Station — Project Checkpoint
**Date:** 1 June 2026 | **Status:** Fully navigable editorial system — Phase 2 complete

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` block) |
| Font | Geist Sans + Geist Mono (via `geist` npm package) |
| Icons | `lucide-react` |
| Images | `next/image` with `remotePatterns: [{ protocol: "https", hostname: "**" }]` |
| Utilities | `clsx` + `tailwind-merge` → `lib/cn.ts` |
| Runtime | Node / Vercel-ready, no backend, no database |

---

## File Tree (complete, project root)

```
wss-nowa/
├── app/
│   ├── globals.css                          ← design system (DO NOT change — FROZEN)
│   ├── layout.tsx                           ← root layout, Geist fonts, SEO metadata
│   ├── page.tsx                             ← homepage ( / )
│   ├── not-found.tsx                        ← branded 404 with section quick-links
│   │
│   ├── aktualnosci/
│   │   ├── page.tsx                         ← article feed, all 12 articles
│   │   └── [slug]/
│   │       └── page.tsx                     ← article page ( /aktualnosci/[slug] )
│   │
│   ├── misje/
│   │   └── page.tsx                         ← category feed — misje
│   ├── astronomia/
│   │   └── page.tsx                         ← category feed — astronomia
│   ├── technologie/
│   │   └── page.tsx                         ← category feed — technologie
│   ├── iss/
│   │   └── page.tsx                         ← category feed — ISS
│   ├── ziemia-z-kosmosu/
│   │   └── page.tsx                         ← category feed — ziemia z kosmosu
│   │
│   ├── starty/
│   │   └── page.tsx                         ← coming soon
│   ├── galeria/
│   │   └── page.tsx                         ← coming soon
│   ├── wideo/
│   │   └── page.tsx                         ← coming soon
│   ├── kalendarz/
│   │   └── page.tsx                         ← coming soon
│   ├── mapa/
│   │   └── page.tsx                         ← coming soon
│   └── logowanie/
│       └── page.tsx                         ← coming soon
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                       ← fixed glass navbar, scroll-aware, usePathname active state
│   │   └── Footer.tsx                       ← newsletter strip + links
│   ├── sections/
│   │   ├── Hero.tsx                         ← cinematic homepage hero
│   │   ├── ContentGrid.tsx                  ← all homepage grid sections
│   │   ├── ArticleFeedSection.tsx           ← shared feed section (header + filter + grid)
│   │   └── ComingSoon.tsx                   ← branded placeholder for unbuilt sections
│   └── article/
│       ├── ArticleCard.tsx                  ← card for article feed grids
│       └── StickyArticleBar.tsx             ← reading progress + context strip
│
├── data/
│   └── news.json                            ← source of truth, 12 articles
│
├── lib/
│   ├── cn.ts                                ← clsx + twMerge utility
│   └── articles.ts                          ← getAllArticles, getArticlesByCategory,
│                                               getArticleBySlug, getRelatedArticles, getAllSlugs
│
├── types/
│   └── index.ts                             ← NewsArticle, RocketLaunch, ActiveMission, etc.
│
├── docs/
│   ├── WSS_CHECKPOINT_PHASE_1.md           ← original checkpoint (homepage + article system)
│   ├── WSS_CHECKPOINT_PHASE_2.md           ← this file
│   └── WSS_UX_GOVERNANCE_V1.md            ← UX motion + signal governance spec (FROZEN)
│
├── next.config.ts
├── package.json
└── tsconfig.json                            ← path alias @/* → ./
```

---

## Route Table (complete — zero unhandled 404s)

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Live | Homepage |
| `/aktualnosci` | ✅ Live | Full article feed, 12 articles, category filter strip |
| `/aktualnosci/[slug]` | ✅ Live | 12 article pages (generateStaticParams) |
| `/misje` | ✅ Live | Category feed — 4 articles |
| `/astronomia` | ✅ Live | Category feed — 3 articles |
| `/technologie` | ✅ Live | Category feed — 2 articles |
| `/iss` | ✅ Live | Category feed — 1 article |
| `/ziemia-z-kosmosu` | ✅ Live | Category feed — 2 articles |
| `/starty` | ✅ Stub | Coming soon |
| `/galeria` | ✅ Stub | Coming soon |
| `/wideo` | ✅ Stub | Coming soon |
| `/kalendarz` | ✅ Stub | Coming soon |
| `/mapa` | ✅ Stub | Coming soon |
| `/logowanie` | ✅ Stub | Coming soon |
| `*` | ✅ Handled | `app/not-found.tsx` — branded 404 |

---

## Design System (`app/globals.css`)

**Immutable — never change without explicit system redesign decision.**

### Surface tokens
```
--color-space-bg:       #050709   page base
--color-space-surface:  #0a0d14   recessed wells
--color-space-card:     #0c1018   base card
--color-space-elevated: #11151f   raised/nested
--color-space-muted:    #232a3a
```

### Accent tokens
```
--color-accent-blue:       #2f6dff   primary CTA, misje category
--color-accent-blue-hover: #4480ff
--color-accent-cyan:       #38bdf8   hover titles, technologie category
--color-accent-live:       #ff453a   breaking news, live dot
--color-accent-amber:      #ffb830   ISS category
```

### Category colour map
```
misje             → #2f6dff
astronomia        → #a855f7
technologie       → #38bdf8
ziemia-z-kosmosu  → #22c55e
iss               → #ffb830
```

### Text scale (8pt-aligned)
```
--text-overline:  11px   uppercase labels
--text-caption:   12px
--text-meta:      13px
--text-body:      15px   article prose
--text-title-sm:  17px   article deck / card titles
--text-title:     22px
--text-headline:  28px
```

### Alpha surfaces
```
--hairline:        rgba(255,255,255,0.07)
--hairline-strong: rgba(255,255,255,0.11)
--hairline-faint:  rgba(255,255,255,0.045)
--glass-fill:      rgba(255,255,255,0.022)
--glass-fill-hover:rgba(255,255,255,0.045)
```

### Motion tokens
```
--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1)
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## UX Governance (`docs/WSS_UX_GOVERNANCE_V1.md`)

**Frozen as v1 baseline. Full spec in the governance file.**

### Motion categories (enforced)
- **Entry** — one-shot reveals (stagger, scroll-driven)
- **State** — user-triggered transitions (hover, active, scroll state)
- **Ambient** — continuous low-frequency loops (hero drift, live dot, breathe)

### Concurrency rule
One ambient animation per visible element maximum. No two simultaneous loops on the same element.

### Signal semantics
- **Red** = editorial urgency only (breaking badge, live dot, live mission indicators)
- **Blue/Cyan** = informational / system states
- **Category colours** = fixed per-category (see map above)

### Changes applied in Phase 2 consolidation
| Change | File |
|---|---|
| Removed `breaking-pulse` from article hero badge | `app/aktualnosci/[slug]/page.tsx` |
| Removed `breaking-pulse` from homepage FeaturedCard | `components/sections/ContentGrid.tsx` |
| Removed Bell notification red dot | `components/layout/Navbar.tsx` |
| Softened progress bar glow `99`→`44` alpha | `components/article/StickyArticleBar.tsx` |
| Progress bar easing `linear`→`ease-out-soft`, `0.12s`→`0.18s` | `components/article/StickyArticleBar.tsx` |

---

## Data Model (`types/index.ts`)

```typescript
type NewsCategory = "misje" | "astronomia" | "technologie" | "ziemia-z-kosmosu" | "iss";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  publishedAt: string;     // ISO 8601
  timeLabel: string;       // pre-formatted, e.g. "2 godz. temu"
  imageUrl: string;        // Unsplash URL
  slug: string;
  isBreaking?: boolean;
  content?: string[];      // body paragraphs (3–4 per article)
  readTime?: number;       // minutes
}
```

---

## News Data (`data/news.json`) — 12 articles

| slug | category | readTime | isBreaking |
|---|---|---|---|
| `starship-flight-14-pelny-sukces` | misje | 4 | ✓ |
| `europa-clipper-pierwsze-zdjecia` | misje | 3 | |
| `jwst-kosmiczna-meduza` | astronomia | 3 | |
| `artemis-ii-gotowa-do-startu` | misje | 4 | |
| `rotacja-sagittarius-a` | astronomia | 3 | |
| `falcon-9-rekord-30-lotow` | technologie | 3 | |
| `iss-spacewalk-panele-sloneczne` | iss | 3 | |
| `egzoplaneta-para-wodna` | astronomia | 3 | |
| `mapa-nocnych-swiatel-ziemi` | ziemia-z-kosmosu | 3 | |
| `ariane-6-komercyjny-start` | technologie | 3 | |
| `mars-sample-return-plan` | misje | 4 | |
| `burza-geomagnetyczna-zorze` | ziemia-z-kosmosu | 3 | |

---

## Data Access Layer (`lib/articles.ts`)

```typescript
getAllArticles(): NewsArticle[]
getAllSlugs(): string[]
getArticleBySlug(slug: string): NewsArticle | null
getArticlesByCategory(category: string): NewsArticle[]   ← NEW in Phase 2
getRelatedArticles(article: NewsArticle, count = 3): NewsArticle[]
  // priority: same-category first, then fill from others, excludes self
```

---

## Component Details

### `Navbar.tsx` — `"use client"`
- Fixed, `z-50`, glass blur `blur(20px) saturate(180%)`
- Scroll-aware: border + background opacity change after 12px scroll
- `usePathname` active state: active nav link renders `text-text-primary` (vs `text-text-secondary`)
- `isActive(href)` matches both exact path and sub-paths (e.g. `/aktualnosci/slug` activates "Aktualności")
- Desktop nav: Aktualności, Misje, Astronomia, Technologie, Ziemia z kosmosu, ISS
- "Więcej" dropdown: Galeria, Wideo, Kalendarz startów, Mapa kosmosu
- Mobile drawer: all links + "Zaloguj się" button

### `Hero.tsx` — Server component (unchanged)
- Cinematic 5-layer homepage hero
- `hero-drift` (42s), `hero-glow-drift` (28s), `hero-fade` scroll exit
- CTAs: `/aktualnosci`, `/starty`

### `ContentGrid.tsx` — Server component (minor fix)
- Removed `breaking-pulse` from FeaturedCard breaking badge
- Five sections: DzisiajWKosmosie, LiveMissionCenter, CategoryTabs, NadchodzaceStarty, AktyweneMisje, TimelineWydarzen

### `ArticleFeedSection.tsx` — Server component (NEW)
- Shared section used by `/aktualnosci` and all 5 category pages
- Props: `{ category?: string }` — undefined = all articles feed
- **Header:** breadcrumb, category overline (if applicable), h1, subtitle, article count badge
- **Header tint:** `radial-gradient` using category accent at 7% opacity — subtle per-category colour
- **Category filter strip:** 6 pill-links routing to real pages; active pill uses category accent background
- **Article grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, 5px gap

### `ArticleCard.tsx` — Server component (NEW)
- Used by `ArticleFeedSection`
- 176px image area + `img-sheen` + breaking badge (live-dot only)
- Category label + time row / title (line-clamp-2, hover→cyan) / excerpt (line-clamp-2) / read time
- Full `surface-interactive` + image scale on hover

### `ComingSoon.tsx` — Server component (NEW)
- Used by 6 stub pages (starty, galeria, wideo, kalendarz, mapa, logowanie)
- Props: `{ title, description, icon }`
- Branded "Wkrótce" badge, description, CTAs back to aktualności + homepage

### `StickyArticleBar.tsx` — `"use client"` (tuned)
- Progress bar glow reduced: `0 0 8px color99` → `0 0 5px color44`
- Progress bar transition: `0.12s linear` → `0.18s cubic-bezier(0.22,1,0.36,1)`
- Everything else unchanged

### `Footer.tsx` — `"use client"` (unchanged)
- Newsletter strip + 4-column link grid

### `app/not-found.tsx` — Server component (NEW)
- Rendered for all unmatched routes
- Large "404" numeral in muted tone
- "Nie znaleziono strony" h1 + explanatory text
- CTAs: homepage (primary blue) + aktualności (ghost)
- Quick-link pills for all 6 main sections with category accent dots

---

## Architecture Decisions & Constraints

**1. `ArticleFeedSection` is the single source of truth for the feed layout.**
All 6 feed pages (aktualności + 5 categories) compose it with a single `category?` prop. The header gradient, filter active state, breadcrumb depth, and article count all derive from that prop. No layout logic is duplicated across pages.

**2. Category filter strip uses real URL routing, not client state.**
Each pill in the filter strip is a `<Link>` to a distinct route. This is IA-correct: each category has a canonical URL and can be bookmarked, shared, or indexed.

**3. Navbar active state uses `startsWith`.**
`isActive(href)` returns true for both `/aktualnosci` and `/aktualnosci/some-slug`. This means reading any article keeps "Aktualności" highlighted — correct spatial context for the user.

**4. CATEGORY_META is intentionally duplicated** across ContentGrid, StickyArticleBar, ArticleCard, ArticleFeedSection, and the article page. Consistent with Phase 1 decision — no shared import between homepage and article/feed systems.

**5. Coming-soon pages use full site chrome** (Navbar + Footer). They feel like product pages in progress, not error states.

**6. `app/not-found.tsx` is Next.js App Router convention.** It's automatically rendered for all unmatched routes — no additional configuration needed.

---

## Known Gaps / Current Limitations

| Gap | Note |
|---|---|
| `/aktualnosci` pagination | No pagination — all 12 articles shown. Add `page` param when article count grows |
| `CategoryTabs` on homepage | Client state only — tabs don't filter (intentional MVP decision) |
| `LaunchCard` links | `href="#"` — not wired to real launch routes |
| `LiveMissionCenter` data | Hardcoded static — not from `news.json` |
| `NadchodzaceStarty` data | Hardcoded static |
| `AktyweneMisje` pins | Hardcoded static |
| `TimelineWydarzen` events | Hardcoded static |
| No CMS | All content is static JSON |
| No auth | `/logowanie` is coming soon |
| `/misje/aktywne` | Hits branded 404 — acceptable sub-route gap |
| Search | No search functionality |

---

## Immediate Next-Phase Candidates

Listed in order of product value:

1. **CMS / backend layer** — Replace `data/news.json` with Sanity, Contentful, or a custom API. Only `lib/articles.ts` changes. All pages and components remain untouched.
2. **More articles / real content** — Add articles to `news.json`. All feed and category pages update automatically.
3. **`/aktualnosci` pagination** — Add `?page=N` param and slice logic in `ArticleFeedSection` when count exceeds ~18.
4. **Wire `CategoryTabs` on homepage** — Add `searchParams` or shallow URL routing so the homepage tabs filter to category pages.
5. **Wire `LaunchCard` links** — Connect to `/starty/[id]` routes when launch data is real.
6. **Custom `/logowanie` auth page** — Replace coming-soon with real form when backend exists.
7. **Custom 404 with recent articles** — Enhance `not-found.tsx` to show 3 recent articles (requires server data fetch in the not-found handler).

---

## Starting Prompt for New Chat

> We are continuing the Web Space Station (WSS) project — a Next.js 15 App Router editorial news portal in Polish, styled with Tailwind CSS v4 and the Geist font. The checkpoint file with the full system state is at `docs/WSS_CHECKPOINT_PHASE_2.md`.
>
> **Current state:** Production-grade frontend with complete navigation. All main routes are live: `/` (homepage), `/aktualnosci` (article feed), `/aktualnosci/[slug]` (12 article pages), `/misje`, `/astronomia`, `/technologie`, `/iss`, `/ziemia-z-kosmosu` (category feeds), plus coming-soon stubs for `/starty`, `/galeria`, `/wideo`, `/kalendarz`, `/mapa`, `/logowanie`. Custom 404 page exists.
>
> **Design system:** Complete and frozen (`app/globals.css`). UX governance spec at `docs/WSS_UX_GOVERNANCE_V1.md`.
>
> **Data:** `data/news.json` (12 articles). Data layer: `lib/articles.ts`.
>
> **Critical rules:**
> - DO NOT modify design system (`globals.css` is frozen)
> - DO NOT redesign any existing UI component
> - DO NOT refactor working architecture
> - ONLY extend the system in a controlled, incremental way
>
> The next priority is: **[INSERT TASK]**
