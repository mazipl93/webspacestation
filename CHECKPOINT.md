# Web Space Station — Project State Checkpoint

> **Snapshot date:** 2026-06-01
> **Purpose:** Hand-off document so this project can be safely continued in a new chat without losing context.
> **One-line state:** *Homepage is a fully designed, production-grade showcase interface, but the application is still a frontend-only prototype without dynamic article pages or backend logic.*

---

## 1. Current System Status

- ✅ Homepage UI is **complete** — production-quality space-news portal.
- ✅ Includes: **Hero**, **Content Grid**, **Sidebar rail** (Live Mission Center + Active Missions), **Live modules**.
- ✅ **Design system** fully implemented — tokens, typography scale, layered surfaces, hairlines, motion easings.
- ✅ **Interaction system** implemented — hover lift + directional light, image sheen, live indicators, scroll reveal, hero drift/fade.
- ⚠️ **Content is mock/sample data** — a static `news.json` consumed on the homepage only.
- ❌ **Article routes/pages are not implemented** — visiting an article link 404s (expected for now).

---

## 2. Architecture Summary

| Layer | Implementation |
|---|---|
| Framework | **Next.js (App Router)**, React 19, TypeScript 5 |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`), Geist font |
| UI model | **Component-based** — layout + sections + shared primitives |
| Data | **Centralized static source** at `/data/news.json` (typed via `/types`) |
| Layout sections | Derived blocks: **Hero / Content Grid / Sidebar / Timeline / Footer** |
| Interaction | Dedicated **interaction layer** in `globals.css` (hover, motion, live cues, scroll), `prefers-reduced-motion` safe |
| Backend | **None** — no API, CMS, or DB yet |

### File map (source, excluding `node_modules` / `.next`)

```
app/
  layout.tsx        Root layout, Geist fonts, metadata, dark theme
  page.tsx          Homepage: Navbar + Hero + ContentGrid + Footer
  globals.css       Design system tokens + utilities + interaction/animation layer
components/
  layout/
    Navbar.tsx      Glass navbar, WSS brand + tagline, scroll-reactive
    Footer.tsx      Newsletter + link columns
  sections/
    Hero.tsx        Cinematic full-bleed hero, depth overlays, drift + scroll-fade
    ContentGrid.tsx All grid sections + cards (consumes news.json)
data/
  news.json         12 sample articles (the single content source)
types/
  index.ts          NewsArticle, RocketLaunch, ActiveMission, TimelineEvent, NavItem
lib/
  cn.ts             clsx + tailwind-merge helper
styles/             (reserved, empty)
```

> Note: `LAUNCHES`, `MISSION_PINS`, and timeline `EVENTS` are currently **inline constants inside `ContentGrid.tsx`** (not yet in `/data`). Only news is externalized to JSON.

---

## 3. What Is Done

- **Design system** — stable: surface elevations, hairline borders, `--text-*` type scale, accent palette, radius + motion tokens.
- **Layout system** — finalized: unified two-column editorial spine (`1fr` + ~300px rail), 8pt-aligned rhythm, three grouped "stories" (Lead → Explore → Timeline).
- **Interaction system** — polished: pressable cards, hover light + image sheen, breaking pulse, breathing live cues, trending carets, scroll reveal, hero parallax drift + scroll defocus.
- **Branding** — **WSS** identity in navbar with tagline *"Live space & science intelligence"*; consistent logo lockup in navbar + footer.
- **Content system** — static JSON wired into Featured + Side cards with `next/image` and category gradient fallbacks.
- **Visual polish** — cinematic hero photo, real imagery across cards, scrims/overlays, category color coding.

---

## 4. What Is NOT Done (IMPORTANT)

- ❌ **Dynamic routing for articles** — e.g. `app/aktualnosci/[slug]/page.tsx` (links currently point to `/aktualnosci/{slug}` but no page exists → 404).
- ❌ **Real CMS / backend** — no API, database, or content authoring.
- ❌ **Search system** — navbar search icon is non-functional (UI only).
- ❌ **Pagination / infinite scroll** — homepage shows a fixed slice of news.
- ❌ **True real-time data ingestion** — "live" countdowns, stats, and ISS data are static; the "live" feel is presentational.
- ❌ **SEO pages for articles** — no per-article metadata, Open Graph, or sitemap.
- ❌ **Production deployment optimization** — no analytics, error monitoring, caching strategy, or env config.
- ❌ **Other category/section pages** — nav links (Misje, Astronomia, etc.) have no destination pages.

---

## 5. Current State Description

> **Homepage is a fully designed, production-grade showcase interface, but the application is still a frontend-only prototype without dynamic article pages or backend logic.**

The visual, layout, and interaction layers are essentially "finished" for the homepage. The next meaningful phase is **functional depth** (routing, data plumbing, backend), not more styling.

---

## 6. Suggested Next Steps (for the next session)

1. **Article pages** — add `app/aktualnosci/[slug]/page.tsx`, render from `news.json` by `slug`, add `generateStaticParams` + `generateMetadata` (knocks out routing + SEO together).
2. **Externalize remaining data** — move `LAUNCHES`, `MISSION_PINS`, `EVENTS` from `ContentGrid.tsx` into `/data` files for a single content layer.
3. **Category/listing pages** — `app/[category]/page.tsx` filtering `news.json` by category.
4. **Search** — wire the navbar search to a client-side filter over the news data.
5. **Backend/CMS (later)** — replace JSON with an API/CMS once content scales.

---

## 7. How to Run

```bash
npm install
npm run dev      # Next.js dev server (required for next/image remote optimization)
```

Remote image hosts are already whitelisted in `next.config.ts` (`remotePatterns` → any HTTPS host). Images are sourced from Unsplash; each card falls back to a category gradient if an image fails to load.
