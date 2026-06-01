# WSS — Phase 5 (Routing & Connectivity) — HANDOFF / CHECKPOINT
**Status:** ~80% complete. Continue in a fresh chat. **Date:** 1 June 2026

This phase converts the static UI into a fully navigable app: real routes for nav
sections, fixing dead links, and a working search page. **No backend / CMS / auth /
design-system changes allowed** — only routing + page connectivity.

---

## DECISIONS LOCKED IN (do not revisit)

1. **Category pages stay on the static data layer.** `/misje`, `/astronomia`,
   `/technologie`, `/iss`, `/ziemia-z-kosmosu` already exist, already reuse
   `ArticleFeedSection`, match the design, and have an empty state. They render
   server-side from `data/news.json` via `lib/articles.ts`. **Leave them as-is.**
   (User explicitly chose "keep" — do NOT convert them to API fetching, to avoid a
   12→3 article regression and divergence from the still-static homepage.)

2. **Search filters client-side over `/api/articles`.** The user chose NOT to add a
   `?q=` param to the backend. The `/search` page fetches the published list from
   `/api/articles` and filters in the browser. **Do NOT add `q` to the API route.**

---

## ✅ COMPLETED IN THIS PHASE

### Task 3 — Search page (DONE)
- `app/search/page.tsx` — server wrapper: Navbar + Footer + `<Suspense>` around the
  client component (Suspense required for `useSearchParams`).
- `app/search/SearchClient.tsx` — client component:
  - reads `?q=`, has its own search input (pre-filled, submits to `/search?q=`),
  - fetches `/api/articles` once, filters client-side over
    title/subtitle/excerpt/content/category name,
  - maps the API `AdminArticle` shape → `NewsArticle` shape (`toCard`) for
    `ArticleCard` (incl. `FALLBACK_IMAGE` so `<Image>` never gets an empty src),
  - loading / empty / no-query / error states, results grid uses `ArticleCard`.

### Task 2 (partial) — Navbar (DONE)
`components/layout/Navbar.tsx`:
- Added `useRouter`, `searchOpen`, `query` state + `submitSearch()`.
- Search icon now toggles a glass dropdown with an input → routes to
  `/search?q=...` on submit.
- Notifications **Bell** button is now `disabled` + `cursor-not-allowed opacity-50`
  + `title="Powiadomienia — wkrótce"` (was a dead no-op button).

### Task 2 (partial) — ContentGrid CategoryTabs (DONE)
`components/sections/ContentGrid.tsx`:
- `TABS` now have `href` and render as `<a>` linking to the real category routes
  (`/misje`, `/astronomia`, `/technologie`, `/ziemia-z-kosmosu`, `/iss`). Previously
  they were non-functional `<button>`s. (This was the "category sections not
  functional" complaint.)

---

## ⛔ REMAINING WORK (finish these)

### 1. `components/sections/ContentGrid.tsx` — fix dead `LaunchCard` link
In `LaunchCard`, the anchor uses a dead link:
```tsx
<a
  href="#"
  className="surface-interactive group flex flex-col overflow-hidden rounded-xl border border-hairline bg-space-card"
>
```
→ change `href="#"` to `href="/starty"` (the launches coming-soon page exists).

### 2. `components/sections/ContentGrid.tsx` — disable 2 dead carousel buttons
These `<button>`s do nothing; mark them coming-soon (disabled). Keep markup/icon,
just disable + remove hover affordance:

(a) In `LiveMissionCenter`, the "Następna misja" button:
```tsx
<button
  aria-label="Następna misja"
  className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:text-text-primary"
>
  <ChevronRight size={14} />
</button>
```
→ add `disabled title="Wkrótce"` and class `... cursor-not-allowed text-text-muted opacity-50` (drop the hover classes).

(b) In `TimelineWydarzen`, the "Następny okres" button:
```tsx
<button
  aria-label="Następny okres"
  className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline text-text-tertiary transition-colors duration-300 hover:border-hairline-strong hover:text-text-primary"
>
  <ChevronRight size={15} />
</button>
```
→ add `disabled title="Wkrótce"` and replace hover classes with
`cursor-not-allowed opacity-50`.

### 3. `components/layout/Footer.tsx` — fix dead link
In `FOOTER_NAV.Popularne`, this route 404s:
```ts
{ label: "Aktywne misje", href: "/misje/aktywne" },
```
→ change `href` to `/misje` (closest real route). The other Popularne links
(`/starty`, `/kalendarz`, `/mapa`, `/galeria`) are real coming-soon pages — leave them.
Social links are external — leave them. Newsletter form is intentional `preventDefault`
— leave it.

### 4. Lint-check everything changed/created
Run the linter on: `app/search/page.tsx`, `app/search/SearchClient.tsx`,
`components/layout/Navbar.tsx`, `components/sections/ContentGrid.tsx`,
`components/layout/Footer.tsx`. Fix any issues.

### 5. (Verification, optional) confirm there are no other dead links
Grep for `href="#"` and `href='#'` across `app/` and `components/` to be sure none remain.
Hero CTAs (`/aktualnosci`, `/starty`), not-found links, ComingSoon CTAs, and the
"Zaloguj się" → `/logowanie` link are all real routes — leave them.

---

## ENVIRONMENT CAVEATS (important)
- **The shell in this workspace is unresponsive** ("no exit status"). I could not run
  `npm install`, `tsc`, or `npm run dev` in any prior phase. Validation has relied on
  the editor's lint/TS server (ReadLints), which reported 0 errors.
- Earlier phases added deps to `package.json` that may not be installed in
  `node_modules` yet: `prisma`, `@prisma/client`, `bcryptjs`, `tsx`,
  `@supabase/supabase-js`, `@supabase/ssr`. The user must run `npm install` locally.
- Design system `app/globals.css` is FROZEN. Reuse tokens/classes only.

---

## STARTING PROMPT FOR THE NEXT CHAT

> We are finishing **Phase 5 (Routing & Connectivity)** of the Web Space Station (WSS)
> project — Next.js 15 App Router, Tailwind v4, Polish editorial portal. Full handoff
> is in `docs/WSS_PHASE_5_HANDOFF.md` — read it first.
>
> Most of the phase is done (search page, navbar search + disabled bell, homepage
> category tabs now link to real routes). **Finish the REMAINING WORK section** of the
> handoff:
> 1. `ContentGrid.tsx`: `LaunchCard` `href="#"` → `/starty`.
> 2. `ContentGrid.tsx`: disable the two dead carousel buttons ("Następna misja",
>    "Następny okres") as coming-soon.
> 3. `Footer.tsx`: `/misje/aktywne` → `/misje`.
> 4. Lint-check all changed files; grep for any remaining `href="#"`.
>
> **STRICT RULES:** do NOT change CMS/backend/API, do NOT touch auth, do NOT redesign
> the UI/design system, do NOT convert category pages to API (decision locked: they
> stay on `data/news.json`). Search stays client-side filtered (no `?q=` on the API).
> Only routing + connectivity.
