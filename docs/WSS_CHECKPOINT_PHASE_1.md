# Web Space Station — Project Checkpoint
**Date:** 1 June 2026 | **Status:** Multi-page editorial prototype, fully functional

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

## File Tree (complete, project root only)

```
wss-nowa/
├── app/
│   ├── globals.css                          ← design system (DO NOT change)
│   ├── layout.tsx                           ← root layout, Geist fonts, SEO metadata
│   ├── page.tsx                             ← homepage ( / )
│   └── aktualnosci/
│       └── [slug]/
│           └── page.tsx                     ← article page ( /aktualnosci/[slug] )
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                       ← fixed glass navbar (client component)
│   │   └── Footer.tsx                       ← newsletter strip + links (client component)
│   ├── sections/
│   │   ├── Hero.tsx                         ← cinematic homepage hero
│   │   └── ContentGrid.tsx                  ← all homepage grid sections
│   └── article/
│       └── StickyArticleBar.tsx             ← reading progress + context strip (client)
│
├── data/
│   └── news.json                            ← source of truth, 12 articles
│
├── lib/
│   ├── cn.ts                                ← clsx + twMerge utility
│   └── articles.ts                          ← getArticleBySlug, getRelatedArticles, getAllSlugs
│
├── types/
│   └── index.ts                             ← NewsArticle, RocketLaunch, ActiveMission, etc.
│
├── docs/
│   └── WSS_CHECKPOINT_PHASE_1.md           ← this file
│
├── next.config.ts
├── package.json
└── tsconfig.json                            ← path alias @/* → ./
```

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

Category colour map (used in both ContentGrid and article page):

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

### Alpha surfaces (the premium look)

```
--hairline:        rgba(255,255,255,0.07)
--hairline-strong: rgba(255,255,255,0.11)
--hairline-faint:  rgba(255,255,255,0.045)
--glass-fill:      rgba(255,255,255,0.022)
--glass-fill-hover:rgba(255,255,255,0.045)
```

### Key CSS utility classes

```
.container-site      max-w-[1240px] + responsive gutters
.card-surface        layered gradient + hairline border + box-shadow
.well                recessed inset (inside cards)
.surface-interactive hover lift + box-shadow transition
.overline            11px uppercase tracking-[0.16em]
.text-gradient       white→#c3cee4 vertical gradient text
.img-sheen           directional light sweep on hover (.group:hover needed on parent)
.live-dot            red pulsing dot (ping-live keyframe)
.live-breathe        gentle opacity breathing (live-breathe keyframe)
.breaking-pulse      red glow pulse (breaking-pulse keyframe)
.reveal              scroll-driven fade-in (animation-timeline: view())
.hero-drift          slow scale+translate loop (42s)
.hero-fade           defocus on scroll-exit (animation-timeline: view())
```

### Motion tokens

```
--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1)
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Keyframes defined in globals.css

`ping-live`, `twinkle`, `live-breathe`, `breaking-pulse`, `hero-drift`, `hero-glow-drift`, `reveal-fade`, `hero-defocus`

> `reveal-fade` keyframe (`opacity:0, translateY(16px)` → `opacity:1, translateY(0)`) is reused inline in the article page via `animation: reveal-fade 0.75s cubic-bezier(0.22,1,0.36,1) Xs both` with per-element delays.

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

Also defined (not yet used in pages): `RocketLaunch`, `ActiveMission`, `TimelineEvent`, `NavItem`

---

## News Data (`data/news.json`) — 12 articles

All 12 articles have the full `content[]` + `readTime` fields populated.

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
getRelatedArticles(article: NewsArticle, count = 3): NewsArticle[]
  // priority: same-category first, then fill from others, excludes self
```

---

## Page Architecture

### `app/page.tsx` — Homepage `/`

Server component. Composes:

```
<Navbar />
<Hero />
<ContentGrid />
<Footer />
```

### `app/aktualnosci/[slug]/page.tsx` — Article `/aktualnosci/[slug]`

Async server component with `params: Promise<{ slug: string }>` (Next.js 15 pattern).

Exports:
- `generateStaticParams()` — pre-renders all 12 slugs at build time
- `generateMetadata()` — per-article OpenGraph + Twitter card

Composed sections in render order:

```
<Navbar />
<StickyArticleBar title category />    ← client, fixed below navbar
<main>
  <ArticleHero article />              ← cinematic image, deck, staggered entry
  <ArticleBody article sidebarRelated />  ← id="article-body", 72ch prose, sidebar
  <ReturnBand category />              ← visual chapter break + CTA
  <ReadAlso articles />                ← 3 deduplicated related cards, reveal class
</main>
<Footer />
```

Related article split: `allRelated = getRelatedArticles(article, 6)` → sidebar takes `[0..2]`, bottom strip takes `[3..5]` (falls back to `[0..2]` if fewer than 4 exist).

---

## Navigation Routes (defined, not all implemented as pages)

Routes wired in Navbar and Footer:

| Route | Status |
|---|---|
| `/` | ✅ Homepage |
| `/aktualnosci` | 404 — no page yet |
| `/aktualnosci/[slug]` | ✅ Article pages (12 slugs) |
| `/misje` | 404 |
| `/astronomia` | 404 |
| `/technologie` | 404 |
| `/ziemia-z-kosmosu` | 404 |
| `/iss` | 404 |
| `/starty` | 404 |
| `/kalendarz` | 404 |
| `/galeria` | 404 |
| `/wideo` | 404 |
| `/mapa` | 404 |
| `/logowanie` | 404 |
| `/misje/aktywne` | 404 |

---

## Component Details

### `Navbar.tsx` — `"use client"`

- Fixed, `z-50`, glass blur `blur(20px) saturate(180%)`
- Scroll-aware: border + background opacity change after 12px scroll
- `NAV_LINKS`: Aktualności, Misje, Astronomia, Technologie, Ziemia z kosmosu, ISS
- `MORE_LINKS` dropdown: Galeria, Wideo, Kalendarz startów, Mapa kosmosu
- Mobile drawer with full link list
- Logo: WSS rocket icon + "WSS / Web Space Station" wordmark

### `Hero.tsx` — Server component

- 5-layer cinematic composition (base → photograph → depth gradients → stars → scrim)
- `hero-drift` animation (42s scale+translate loop) on photograph layer
- `hero-fade` scroll-driven exit (defocuses as user scrolls into content grid)
- 28 pre-computed stars (SSR-safe, no hydration mismatch)
- Social follow row (X, YouTube, Instagram, Facebook)
- CTA: "Najnowsze wiadomości" (→ `/aktualnosci`) + "Starty rakiet" (→ `/starty`)

### `ContentGrid.tsx` — Server component (self-contained)

Five sections:

1. **DzisiajWKosmosie** — featured card (1.62fr) + 2 side cards (1fr), cards link to `/aktualnosci/[slug]`
2. **LiveMissionCenter** — ISS live card + Falcon 9 countdown + 4-stat strip
3. **CategoryTabs** — 5 tab pills (client-side state only, no routing yet)
4. **NadchodzaceStarty** — 4 launch cards (`href="#"` placeholder)
5. **AktyweneMisje** — orbital map with 5 mission pins
6. **TimelineWydarzen** — horizontal event timeline, 5 events

Card links: `FeaturedCard` and `SideCard` both use `href={/aktualnosci/${article.slug}}`. `LaunchCard` uses `href="#"` (not yet wired).

### `StickyArticleBar.tsx` — `"use client"`

- Renders at `position: fixed; top: 64px; z-index: 40`
- Invisible (`opacity:0, translateY(-6px), pointer-events:none`) until `window.scrollY > 360`
- Slides in with `transition: opacity + transform 0.45s cubic-bezier(0.22,1,0.36,1)`
- Context row: `← Aktualności` | category dot + label | article title (truncated)
- Progress bar (2px, bottom of strip): measures `#article-body` element, colour = category accent, `width` transitions at `0.12s linear`

### `Footer.tsx` — `"use client"`

- Newsletter strip with email input + subscribe button
- 4-column link grid: brand blurb + Nawigacja + Popularne + Społeczność
- `© 2026 Web Space Station`

---

## Architectural Decisions & Constraints

**1. Category metadata is intentionally duplicated** across `ContentGrid.tsx`, `StickyArticleBar.tsx`, and `[slug]/page.tsx`. This was a deliberate choice to keep homepage components untouched — no shared import exists between homepage and article system.

**2. Gradient fallbacks exist for every category** so cards and article heroes never show a blank background if an Unsplash image fails to load.

**3. `content[]` and `readTime` are optional fields** on `NewsArticle`. Every existing 12 articles has them populated. Future articles added without them will still render correctly (falls back to `[article.excerpt]` for content, `3` for readTime).

**4. `generateStaticParams` pre-renders all 12 article slugs** at build time. The article page is a static site generation (SSG) output, not server-side rendered on request.

**5. The `reveal` class** (scroll-driven, `animation-timeline: view()`) is a progressive enhancement — browsers without support simply skip the animation, no layout shift.

**6. `img-sheen` requires a `.group` ancestor** — every card wrapper that needs the sheen effect must carry the `group` Tailwind class. This is consistent across all card implementations.

---

## Known Gaps / Current Limitations

| Gap | Note |
|---|---|
| `/aktualnosci` list page | 404 — no paginated article listing |
| Category pages (`/misje`, etc.) | 404 — not implemented |
| Search | No search functionality anywhere |
| `LaunchCard` links | `href="#"` — not wired to real routes |
| `CategoryTabs` | Client state only — no URL routing or filtering |
| `LiveMissionCenter` data | Hardcoded static — not from `news.json` |
| `NadchodzaceStarty` data | Hardcoded static — not from `news.json` |
| `AktyweneMisje` pins | Hardcoded static |
| `TimelineWydarzen` events | Hardcoded static |
| No CMS | All content is static JSON |
| No auth | `/logowanie` is 404 |
| No 404 page | Uses Next.js default not-found |

---

## Immediate Next-Phase Candidates

Listed in order of product value:

1. **`/aktualnosci` list page** — paginated or infinite-scroll article feed. Highest user impact; all data already exists.
2. **Category filter pages** (`/misje`, `/astronomia`, etc.) — filter `news.json` by `category` field; routes already linked in Navbar.
3. **Custom 404 page** (`app/not-found.tsx`) — on-brand, with navigation back to feed.
4. **Wire `CategoryTabs`** — add URL params or shallow routing so tabs filter the content.
5. **`/aktualnosci` pagination** — if article count grows, add `page` param.
6. **CMS integration** — replace `data/news.json` with Sanity / Contentful / custom API; `lib/articles.ts` is the only file that would change.

---

## Starting Prompt for New Chat

> We are continuing the Web Space Station (WSS) project — a Next.js 15 App Router editorial news portal in Polish, styled with Tailwind CSS v4 and the Geist font. The design system is complete and frozen (`app/globals.css`). Two routes are live: `/` (homepage) and `/aktualnosci/[slug]` (12 article pages). All content is in `data/news.json`. The data access layer is `lib/articles.ts`. The project is at `C:\Users\dawid\Desktop\wss-nowa`. The next priority is [INSERT TASK].
