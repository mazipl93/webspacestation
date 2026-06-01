# WSS — Phase 7 (Public Auth + Feature Gating) — HANDOFF
**Status:** Auth done & verified (lint + tsc + build green). Engagement/data gaps below are NOT started. **Date:** 1 June 2026

---

## WHAT WAS DONE THIS PHASE (do not redo)

### Public auth (Supabase, Polish routes)
- `components/auth/AuthProvider.tsx` — single client context `{ user, loading, signOut }`, server-seeded from `app/layout.tsx` via `getCurrentUser()` (no auth flicker), one `onAuthStateChange` subscription, graceful when unconfigured.
- `hooks/useSessionUser.ts` — now a thin wrapper over `AuthProvider` (same `{ user, loading }` API).
- `app/logowanie/` — real login (`page.tsx` server redirect-if-authed + `LoginForm.tsx`): `signInWithPassword`, loading, Polish error mapping, `?redirectTo=`, link to register. Replaced the old `ComingSoon` placeholder.
- `app/rejestracja/` — register (`page.tsx` + `RegisterForm.tsx`): `signUp` with `name` metadata, validation (email / password >= 8 / confirm-match), dual success (confirm-email screen vs immediate redirect), `emailRedirectTo` -> `/auth/callback`.
- `app/auth/callback/route.ts` — exchanges email-link code for a session (PKCE), open-redirect-safe.
- `components/auth/AccountMenu.tsx` — desktop account dropdown (name, Powiadomienia, Wyloguj się).
- `components/layout/Navbar.tsx` — auth-reactive: AccountMenu when logged in, else **Zaloguj się + Zarejestruj się** (both with `redirectTo`); bell unread dot only when logged in; mobile drawer mirrors all of this.

### Feature gating
- Bookmarks now REQUIRE login: `hooks/useBookmarks.ts` is user-scoped (`wss:bookmarks:<email>`, empty when signed out, `toggle` returns false when blocked); `components/article/BookmarkButton.tsx` routes signed-out clicks to `/logowanie?redirectTo=`.
- Comments + Notifications login CTAs carry `redirectTo`.

### Env / Supabase config (live project)
- `.env` now has `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (project ref `blpnxcnapirdhjtujimo`). **Restart dev server after any env change.**
- Verified via `/auth/v1/settings`: email/password ON, signups ON, **`mailer_autoconfirm = false` (email confirmation REQUIRED)**, no OAuth providers.
- TODO in Supabase dashboard (not code): add Redirect URL `http://localhost:3000/auth/callback` (+ prod) under Authentication → URL Configuration. Admin login: create `admin@wss.space` in Authentication → Users with "Auto Confirm User".

---

## ⛔ REMAINING WORK — start here

Diagnosed, not yet built. Ordered easy-win → architectural.

### 1. ShareBar — real social share targets (EASY)
File: `components/article/ShareBar.tsx`. Today only native `navigator.share` (mobile/https only) + "Kopiuj link" exist — desktop users see no real way to share.
Add explicit share links (open in new tab), independent of `navigator.share`:
- X/Twitter: `https://twitter.com/intent/tweet?url=<u>&text=<title>`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u=<u>`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=<u>`
- WhatsApp: `https://wa.me/?text=<title>%20<u>`
Keep native share + copy link. URL = `window.location.href` (or canonical from slug). Use existing tokens/`lucide-react` icons.

### 2. Notifications — clickable items (EASY-MEDIUM)
File: `components/notifications/NotificationsClient.tsx`. The `NOTIFICATIONS` array is static and items render as plain `<li>` (no link, no target).
Add a `href` field to each placeholder (e.g. point to an article slug or `/starty`) and wrap each item in `<Link>` with hover affordance. Real backend feed is out of scope; just make the placeholders navigable.

### 3. Article likes — NEW feature (MEDIUM-HARD, needs backend)
NEW requirement: a like button with a count. **Liking allowed WITHOUT login**, but the **stats must accumulate globally** (not per-browser).
- Global counts cannot live in localStorage (that's per-device). Needs a shared store: a Supabase table `article_likes` (e.g. `slug text primary key, count int`) with an `increment_like(slug)` Postgres function (RPC), and an RLS policy allowing anon `execute`. Anon key already in the client.
- UI: new `components/article/LikeButton.tsx` — optimistic increment, calls `supabase.rpc('increment_like', { slug })`. Use localStorage only to remember "this device already liked" (prevent spam / show filled state), but the source-of-truth count is the DB.
- Place near ShareBar / ArticleInteractions.
- Graceful no-op if Supabase unconfigured (mirror `useSessionUser` pattern).

### 4. Comments — edit/delete by author (MEDIUM)
File: `components/article/Comments.tsx`. Only `submit` (create) exists; no edit/delete, and stored comments have no owner identity.
- Add `authorEmail` to the stored shape; on render, show Edytuj/Usuń only when `authorEmail === user.email`.
- Edit = inline textarea swap + save; Delete = remove from list + persist. Keep the localStorage layer (`wss:comments:<slug>`) for now.
- (Note: still client/localStorage only — real moderation needs a DB comments table later.)

### 5. User profile page (MEDIUM)
No `/profil` route exists; AccountMenu has only Powiadomienia + Wyloguj.
- New `app/profil/page.tsx` (gate: redirect to `/logowanie?redirectTo=/profil` if signed out) showing name + email, saved bookmarks list, and liked articles.
- Allow editing display name via `supabase.auth.updateUser({ data: { name } })`.
- Add a "Profil" link in `AccountMenu.tsx` + mobile drawer.

### 6. Public articles vs Admin DB — data source unification (HARD / ARCHITECTURAL)
Biggest issue. Public pages read a STATIC file `data/news.json` via `lib/articles.ts`; the admin panel + `/api/articles` operate on the Prisma DB. **Edits in the admin panel never appear on the public site**, and there is no inline "Edytuj" affordance for admins on article pages.
- Repoint public reads (`lib/articles.ts` and callers: `app/aktualnosci/[slug]`, category pages, home, search, related) to the DB (Prisma directly in Server Components, or via the existing API). Reuse `lib/search.ts` mappers (`toNewsCard`).
- Migrate `data/news.json` content into the DB seed (`prisma/seed.ts`) so nothing is lost; keep `generateStaticParams` sourcing slugs from the DB.
- Optionally add an inline "Edytuj artykuł" button on the public article page, shown only to ADMIN/EDITOR (role check), linking to `/admin/articles/[id]/edit`.
- Watch SSG/ISR: DB-backed pages become dynamic or need `revalidate`.

---

## ARCHITECTURE REMINDERS

- **`globals.css` is FROZEN.** Use existing tokens + Tailwind utilities. `reveal-fade` keyframe already exists.
- **Auth = Supabase only.** Client via `lib/supabase/client.ts`, server via `lib/supabase/server.ts`, RBAC (admin) via `lib/auth/*` + Prisma `User` (role matched by email). Public users have no role.
- **Restart `npm run dev` after `.env` changes** (`NEXT_PUBLIC_*` are build-time-injected).
- **Validate with:** `npx tsc --noEmit` then `npm run lint` (and `npx next build` for SSG/dynamic checks). In this sandbox the shell only runs with elevated/no-sandbox permission on Windows.
- Likes (#3) and DB unification (#6) are the only items needing real backend work; #1, #2, #4, #5 are front-end/localStorage-level.

---

## STARTING PROMPT FOR THE NEXT CHAT

> We are continuing **WSS Phase 8 — Engagement + Data Unification** (Next.js 15 App Router, Tailwind v4, Supabase, Prisma; Polish space portal).
> Full handoff is in `docs/WSS_PHASE_7_HANDOFF.md` — **read it first**.
>
> Implement the REMAINING WORK items in this order: **1 (social share)**, **2 (clickable notifications)**, **4 (comment edit/delete by author)**, **5 (profile page)**, **3 (article likes — anonymous allowed, global count via Supabase RPC)**, then **6 (unify public articles to the Prisma DB + inline admin edit)**.
>
> **STRICT RULES:**
> - Do NOT modify `app/globals.css`.
> - Do NOT break existing admin auth (`/login`, `/admin`, middleware) or the public auth from Phase 7.
> - Likes must work for logged-OUT users but accumulate a single global stat (Supabase table + RPC + anon RLS), NOT per-browser localStorage.
> - For #6, migrate `data/news.json` into the DB seed so no content is lost; repoint `lib/articles.ts` consumers to the DB.
> - After each major item run `npx tsc --noEmit` then `npm run lint`; fix errors before moving on.
