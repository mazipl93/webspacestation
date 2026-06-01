# WSS — Phase 8 (Engagement + Data Unification + Profile) — HANDOFF
**Status:** Phase 8 features implemented locally (tsc + lint + build green). Vercel deploy may need push of latest `force-dynamic` fix. **Date:** 1 June 2026

---

## WHAT WAS DONE THIS PHASE (do not redo)

### 1. ShareBar — social share targets
- **File:** `components/article/ShareBar.tsx`
- X/Twitter, Facebook, LinkedIn, WhatsApp (new tab). Native share + copy link kept.

### 2. Notifications — clickable placeholders
- **File:** `components/notifications/NotificationsClient.tsx`
- Each item has `href`; wrapped in `<Link>` with hover.

### 3. Article likes — global count (anonymous OK)
- **Files:** `components/article/LikeButton.tsx`, `hooks/useArticleLikes.ts`, `lib/likes.ts`, `supabase/article_likes.sql`
- Global count via Supabase `article_likes` + RPC `increment_like(slug)`.
- localStorage only for “this device already liked” (`wss:liked`), NOT for count.
- **Manual (Supabase SQL Editor):** run `supabase/article_likes.sql`.

### 4. Comments — edit/delete by author
- **File:** `components/article/Comments.tsx`
- `authorEmail` on stored comments; Edytuj/Usuń when `authorEmail === user.email`.
- Still localStorage (`wss:comments:<slug>`).

### 5. User profile page
- **Files:** `app/profil/page.tsx`, `components/profile/ProfileClient.tsx`
- Gate: redirect to `/logowanie?redirectTo=/profil` if signed out.
- Saved bookmarks + liked articles (device likes via `lib/likes.ts`).
- **AccountMenu** + mobile Navbar: link „Profil”.

### 5b. Profile settings + avatar (follow-up in same phase)
- **Files:** `components/profile/AccountSettings.tsx`, `components/profile/AvatarUploader.tsx`, `components/profile/Avatar.tsx`, `supabase/avatars.sql`
- Settings: display name, email change (confirmation link), password change (re-auth with current password).
- Avatar: upload to Supabase Storage bucket `avatars`, URL in `user_metadata.avatar_url`.
- `SessionUser` extended with `avatarUrl` in `AuthProvider.tsx` + `app/layout.tsx` seed.
- Avatar shown in `AccountMenu`, Navbar mobile drawer, profile header.
- **Manual (Supabase SQL Editor):** run `supabase/avatars.sql`.

### 6. Public articles → Prisma DB (unification)
- **File:** `lib/articles.ts` — server-only, reads published articles from Prisma via `lib/server/articles.ts`.
- **Seed:** `prisma/seed.ts` imports all 12 articles from `data/news.json` (idempotent upsert).
- **Consumers updated:** `app/aktualnosci/[slug]/page.tsx`, `components/sections/ArticleFeedSection.tsx`, `components/sections/ContentGrid.tsx` (home “Dzisiaj w kosmosie”).
- Inline **„Edytuj artykuł”** for ADMIN/EDITOR → `/admin/articles/[id]/edit`.
- Search (`app/search`) already used `/api/articles` — unchanged.

### 7. Vercel build fix (Prisma at build time)
**Problem:** `revalidate = 60` still pre-rendered at `next build` → Prisma needed `DATABASE_URL` during build → Vercel log often truncated at `Running "next build"`.

**Fix applied:**
- Replaced `export const revalidate = 60` with `export const dynamic = "force-dynamic"` on:
  - `app/page.tsx`, `app/aktualnosci/page.tsx`, `app/aktualnosci/[slug]/page.tsx`
  - `app/misje/page.tsx`, `app/astronomia/page.tsx`, `app/technologie/page.tsx`, `app/iss/page.tsx`, `app/ziemia-z-kosmosu/page.tsx`
- **`package.json`:** `"postinstall": "prisma generate"`

DB is required at **runtime** on Vercel, not at build.

---

## ARCHITECTURE REMINDERS

- **`globals.css` is FROZEN.** Do not modify.
- **Public auth:** Supabase (`/logowanie`, `/rejestracja`, `AuthProvider`, middleware session refresh).
- **Admin auth:** `/login`, `/admin`, Prisma `User` role by email — unchanged.
- **Validate locally:** `npx tsc --noEmit` → `npm run lint` → `npx next build`.
- On Windows sandbox, shell may need elevated permissions for npm/tsc.

---

## MANUAL SETUP CHECKLIST (production)

### A. Database (once, from local machine with prod `DATABASE_URL`)
```bash
npx prisma migrate deploy
npm run db:seed
```
Creates categories, 12 published articles, admin CMS user (`admin@wss.space` / `SEED_ADMIN_PASSWORD` or default in seed).

### B. Supabase SQL Editor (once)
1. `supabase/article_likes.sql` — likes RPC + RLS for anon
2. `supabase/avatars.sql` — public `avatars` bucket + owner-only write policies

### C. Supabase Auth → URL Configuration
- **Site URL:** `https://<your-vercel-domain>`
- **Redirect URLs:**
  - `https://<your-vercel-domain>/auth/callback`
  - `https://*.vercel.app/auth/callback` (preview)
  - `http://localhost:3000/auth/callback` (dev)
- Admin: create `admin@wss.space` in Authentication → Users with **Auto Confirm User**.

### D. Vercel → Environment Variables (Production + Preview)
| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Supabase pooler connection string (same as local if working) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |

After env changes: **Redeploy**.

### E. Deploy flow
1. Push repo to Git (ensure `.env` is NOT committed).
2. Vercel → Import project → Next.js defaults.
3. Build should pass after `force-dynamic` + `postinstall` are on the branch.
4. If build fails: scroll **full** build logs for `prisma`, `P1001`, `DATABASE_URL`.

### F. Post-deploy smoke test
- `/`, `/aktualnosci`, article slug
- `/logowanie`, `/profil` (name, email, password, avatar upload)
- Like button on article (after SQL)
- `/login` → `/admin` (admin Supabase user + Prisma role)

---

## KNOWN / OPTIONAL FOLLOW-UPS (not started)

- ISR/caching again via `unstable_cache` if you want static-feel without build-time DB.
- Delete old avatar files from Storage on replace (currently new path per upload).
- Show `Avatar` in comment list (still initials gradient).
- Comments/likes/notifications → real Supabase tables (still localStorage / placeholder feed).
- `metadataBase` in `app/layout.tsx` is `https://webspacestation.pl` — align with real Vercel/custom domain.
- Rotate Supabase keys if `.env` was ever exposed in chat/logs.

---

## KEY FILES (quick map)

| Area | Path |
|------|------|
| Public articles API | `lib/articles.ts`, `lib/server/articles.ts` |
| Likes | `hooks/useArticleLikes.ts`, `supabase/article_likes.sql` |
| Profile | `app/profil/`, `components/profile/*` |
| Avatars SQL | `supabase/avatars.sql` |
| Seed (news.json → DB) | `prisma/seed.ts`, `data/news.json` (legacy source, not runtime) |
| Phase 7 auth handoff | `docs/WSS_PHASE_7_HANDOFF.md` |

---

## STARTING PROMPT FOR THE NEXT CHAT

> We continue **WSS** (Next.js 15 App Router, Tailwind v4, Supabase, Prisma). Read **`docs/WSS_PHASE_8_HANDOFF.md`** first (and Phase 7 handoff for auth baseline).
>
> Phase 8 code is done: share, notifications links, comment edit/delete, profile + account settings + avatar, global likes, DB-backed public articles, Vercel `force-dynamic` build fix.
>
> **If deploying:** ensure SQL scripts ran, `db:seed` on prod DB, Vercel env vars set, Supabase redirect URLs updated, then redeploy.
>
> **Do NOT modify `app/globals.css` or break admin/public auth.**

---

## GIT NOTE

All changes are in the working tree. User asked to “save everything” for next chat — this file is the handoff. **Commit/push when ready** so Vercel picks up `force-dynamic` + `postinstall`.
