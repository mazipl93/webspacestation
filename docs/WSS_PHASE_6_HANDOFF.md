# WSS — Phase 6 (Product Function Layer + Polish) — HANDOFF
**Status:** Tasks 1–3 done, Tasks 3–6 (polish) in progress. **Date:** 1 June 2026

---

## WHAT WAS DONE THIS PHASE (do not redo)

### Product features added
- `hooks/useSessionUser.ts` — Supabase browser auth state hook (graceful fallback)
- `hooks/useBookmarks.ts` — localStorage bookmark state, cross-card sync via custom event
- `lib/search.ts` — shared `matchesArticle()` + `toNewsCard()` (deduped)
- `components/article/BookmarkButton.tsx` — overlay + inline variants, localStorage-backed
- `components/article/ShareBar.tsx` — Copy link (clipboard + execCommand fallback, 3-state: idle/copied/failed) + Web Share API
- `components/article/Comments.tsx` — auth-gated composer (logged-in = form, logged-out = login CTA), localStorage persistence, success feedback
- `components/article/ArticleInteractions.tsx` — wrapper: ShareBar + Comments, aligned to article column grid
- `components/article/ArticleCardSkeleton.tsx` — layout-matching skeleton for search results
- `components/notifications/NotificationsClient.tsx` + `app/notifications/page.tsx` — login-gated notifications page
- `app/aktualnosci/[slug]/page.tsx` — wired `ArticleInteractions` between body and ReturnBand

### Navbar enhancements
- Bell → functional `Link` to `/notifications` with unread dot
- Debounced search preview (top 5, 180ms debounce, lazy catalogue fetch)
- Mount/animate open+close (scale+opacity transition, not instant unmount)
- Keyboard: Escape closes, ↑↓ arrows move cursor, Enter navigates, mouse hover syncs
- Match highlighting (`<Highlight>` component, regex-safe, accent-cyan)
- `role="combobox"` / `listbox` / `option` ARIA

### Interaction polish done
- SearchClient: skeleton grid (6 cards) replaces spinner during loading; "no query" state shows before loading
- Footer newsletter: email validation + success/error feedback (was silent no-op)
- Comments: "Komentarz dodany" success confirmation (auto-clears 2.8s)
- ShareBar: tri-state copy feedback including failure state

### TypeScript fixes
- `lib/supabase/server.ts` + `middleware.ts`: added `CookieToSet` type to fix pre-existing `noImplicitAny` errors

---

## ⛔ REMAINING WORK — start here

The analysis is already done. These are the exact changes needed, in priority order:

### 1. `components/article/BookmarkButton.tsx` — spring animation on toggle
Add a `justToggled` state: set `true` on click, revert after 150ms.
While `justToggled`, add `scale-90` class (Tailwind). The button already has `transition-all duration-300 active:scale-[0.92]`.
Also add glow on active state using inline `boxShadow: \`0 0 12px ${color}55\`` where color = `#38bdf8` (accent-cyan).
Currently active state is just `border-accent-cyan/50 text-accent-cyan` — no glow, no spring.

```tsx
// after toggle:
setJustToggled(true);
window.setTimeout(() => setJustToggled(false), 150);

// in className:
justToggled && "scale-90"
// in style when active:
active ? { boxShadow: "0 0 12px rgba(56,189,248,0.45)" } : {}
```

### 2. `components/article/StickyArticleBar.tsx` — add BookmarkButton while reading
The sticky bar (visible after 360px scroll) shows: back link | category | title.
Add a `BookmarkButton` (inline variant) on the right end, so the user can bookmark without scrolling back.
The bar needs `"use client"` already (it is). Import `BookmarkButton`. Pass `slug` prop from the page.

In `app/aktualnosci/[slug]/page.tsx`, update:
```tsx
<StickyArticleBar title={article.title} category={article.category} slug={article.slug} />
```

In `StickyArticleBar.tsx`, add `slug: string` to `Props` and render:
```tsx
<BookmarkButton slug={slug} variant="inline" className="ml-auto shrink-0" />
```
on the right of the context row (after the title `<p>`).

### 3. `components/article/ArticleInteractions.tsx` — spacing + visual divider
Currently the container is `pb-4` with no `pt`, so it sits directly against `ArticleBody`'s bottom border with no breathing room.

Change `container-site pb-4` → `container-site pb-6 pt-4`.

Also add a thin section label above the block — makes ShareBar + Comments feel like one engagement zone:
```tsx
<div className="mb-4 flex items-center gap-3">
  <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
  <span className="overline text-text-muted">Dyskusja</span>
  <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
</div>
```
Place this inside the `<div className="flex flex-col gap-6">` block, before `<ShareBar>`.

### 4. `components/article/Comments.tsx` — new comment slide-in + stable skeleton
**Slide-in:** Track the `id` of the most recently posted comment. On the first item in the list, apply an animation style only if its `id` matches `lastPostedId`:

```tsx
const [lastPostedId, setLastPostedId] = useState<string | null>(null);
// on submit, after building `next`:
setLastPostedId(next[0].id);
```

On the `<li>` element for `comments[0]` when `c.id === lastPostedId`:
```tsx
style={c.id === lastPostedId ? {
  animation: "reveal-fade 0.4s cubic-bezier(0.22,1,0.36,1) both"
} : undefined}
```
`reveal-fade` is already defined in `globals.css` (`@keyframes reveal-fade`). Safe to reuse.

**Stable skeleton height:** The auth loading skeleton is currently `h-[92px]`. The logged-out gate is ~80px, the form is ~130px. This causes layout jump. Fix: give the composer area a `min-h-[108px]` wrapper:
```tsx
<div className="mb-6 min-h-[108px]">
  {loading ? <skeleton /> : user ? <form /> : <gate />}
</div>
```

### 5. `components/layout/Navbar.tsx` — close moreOpen on route change + Escape
Two issues:
- The "Więcej" dropdown stays open when the user navigates (clicks a link inside it closes it, but pressing Escape or navigating elsewhere doesn't).
- No Escape key handler for `moreOpen`.

Add a `useEffect` that closes `moreOpen` when `pathname` changes:
```tsx
useEffect(() => {
  setMoreOpen(false);
}, [pathname]);
```

Add a `keydown` listener for Escape:
```tsx
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") setMoreOpen(false);
  }
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, []);
```
(The search Escape is handled separately in the input's `onKeyDown`, so no conflict.)

### 6. `components/notifications/NotificationsClient.tsx` — layout-matching skeleton
Replace the spinner blob loading state with a skeleton that mirrors the notification list structure (icon circle + two text lines):

```tsx
// Skeleton item (repeat 3×):
<div className="card-surface flex items-start gap-3.5 p-4 sm:p-5">
  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-space-surface" />
  <div className="flex-1 space-y-2">
    <div className="h-3.5 w-3/4 animate-pulse rounded bg-glass" />
    <div className="h-3 w-full animate-pulse rounded bg-glass" />
    <div className="h-2.5 w-1/3 animate-pulse rounded bg-glass" />
  </div>
</div>
```

### 7. `components/article/ArticleCard.tsx` — bookmark overlay discoverability
The overlay button is always rendered but visually subtle at idle.
On non-active state (not bookmarked), add `opacity-0 group-hover:opacity-100` so it only appears on card hover — cleaner idle look.
On active state (bookmarked), always `opacity-100` so saved articles always show the indicator.

Change the `BookmarkButton` call in `ArticleCard`:
```tsx
<BookmarkButton slug={article.slug} alwaysVisible={article.isBookmarked} />
```
But `ArticleCard` doesn't know bookmark state (server component). Instead: add an `overlayClassName` prop to `BookmarkButton` or handle via a `data-active` CSS selector.

Simpler: in `BookmarkButton.tsx` for the overlay variant, add to className:
```tsx
active ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
```
This requires the card wrapper to have `group` — it already does (`group relative flex flex-col...`).

---

## ARCHITECTURE REMINDERS

- **`globals.css` is FROZEN.** Use only existing tokens and Tailwind utilities. `reveal-fade` keyframe already exists — safe to reference in inline styles.
- **No schema/CMS/backend changes.**
- **Shell is unresponsive** in this sandbox — validate locally: `npm run lint; npx tsc --noEmit` (separate commands in PowerShell 5.x).
- `@/*` maps to repo root, so `@/hooks/...` resolves correctly.
- Category pages (`/misje` etc.) are SSR from `data/news.json` — no skeleton needed (content is instant).
- All related articles on article pages are also SSR — no skeleton needed.

---

## STARTING PROMPT FOR THE NEXT CHAT

> We are continuing **WSS Phase 6 — Interaction Polish** (Next.js 15 App Router, Tailwind v4, Polish space editorial portal).
> Full handoff is in `docs/WSS_PHASE_6_HANDOFF.md` — **read it first**, it has the exact code snippets for every change.
>
> Complete the **REMAINING WORK** section in order (items 1–7). Each item has the exact file, what to change, and the code to use.
>
> **STRICT RULES:**
> - Do NOT touch CMS / admin / backend / API routes
> - Do NOT modify `app/globals.css`
> - Do NOT redesign anything — only apply the listed interaction/polish changes
> - Run `npm run lint` then `npx tsc --noEmit` (separate commands, PowerShell 5.x) after finishing and fix any errors
