# WSS — Phase 9 (Vercel Deploy + Security + RBAC) — HANDOFF
**Status:** Deploy działa na Vercel; security + RBAC w kodzie. Migracja RBAC może wymagać `migrate resolve` + ponownego `deploy`. **Date:** 2 June 2026

---

## READ FIRST (kolejność dokumentów)

1. **Ten plik** — deploy, auth, RBAC, co zrobić dalej
2. `docs/WSS_PHASE_8_HANDOFF.md` — engagement, avatary, artykuły z Prisma, SQL Supabase
3. `docs/WSS_PHASE_7_HANDOFF.md` — public auth Supabase (`/logowanie`, `/rejestracja`)

---

## CO ZROBIONO W TEJ FAZIE (nie powtarzać bez potrzeby)

### A. Vercel — build i deploy
- `export const dynamic = "force-dynamic"` na stronach z Prismą (home, kategorie, aktualności)
- Usunięto `generateStaticParams` z `app/aktualnosci/[slug]/page.tsx` (Prisma przy buildzie)
- `package.json`: `"postinstall": "prisma generate"`
- `vercel.json` — framework Next.js
- `public/.gitkeep` — standardowy folder public
- **Vercel env (Production + Preview):** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Na Vercel `DATABASE_URL` najlepiej: Transaction pooler **:6543** + `?pgbouncer=true`

### B. Supabase — storage avatary
- `supabase/avatars.sql` — bucket `avatars` + RLS (ręcznie w SQL Editor)
- Upload: `components/profile/AvatarUploader.tsx`
- Fix sesji: `AuthProvider` + `getUser()` + `refreshUser()` — avatar w menu i komentarzach

### C. Komentarze — zdjęcie profilowe
- `components/article/Comments.tsx` — `Avatar`, `authorAvatarUrl`, dopasowanie po email

### D. Security fix — /admin nie dla każdego
- Wcześniej: każda sesja Supabase → `/admin`
- Naprawiono warstwowo (patrz sekcja RBAC poniżej)

### E. RBAC — role i uprawnienia CMS
**Role w Prisma (`enum Role`):** `USER` | `AUTHOR` | `EDITOR` | `MODERATOR` | `ADMIN`  
**Domyślna rola nowych kont:** `USER`

| Rola | CMS panel | Artykuły | Kategorie | Użytkownicy |
|------|-----------|----------|-----------|-------------|
| USER | — | czytanie na portalu | — | — |
| AUTHOR | ✓ | tworzy (draft) | — | — |
| EDITOR | ✓ | tworzy, edytuje, publikuje | — | — |
| MODERATOR | ✓ | edytuje (moderacja) | — | — |
| ADMIN | ✓ | pełne + usuwanie | ✓ | ✓ `/admin/users` |

**Pliki kluczowe:**
- `lib/auth/permissions.ts` — `canCreateArticle(role)`, `canEditArticle`, `canPublishArticle`, `canDeleteArticle`, `canModerateComments`, `canManageUsers`, `canManageCategories`, `canAccessCms`
- `lib/auth/guard.ts` — `requirePermission()`, `requireCmsAccess()`, `requireAdmin()`
- `lib/auth/provision.ts` — nowy Supabase user → Prisma `USER` (nigdy nie podbija roli)
- `lib/auth/admin.ts` — lookup roli po email
- `middleware.ts` — `/admin` → CMS role; `/admin/users` → ADMIN only
- `app/admin/layout.tsx` — `canAccessCms`
- `app/admin/users/` — lista + zmiana roli (ADMIN)
- API: mutacje przez `permissions.ts`; GET `?status=` / `?byId=` → `requireCmsAccess`

**Rejestracja / logowanie:**
- `POST /api/auth/provision` — tworzy wiersz Prisma z `USER`
- `app/auth/callback/route.ts`, `RegisterForm`, `LoginForm` — wywołują provision

**Powiązanie Supabase ↔ Prisma:** ten sam **email** w `getAuthContext()` (`lib/auth/user.ts`).

---

## MIGRACJE BAZY — WAŻNE

Dwie migracje RBAC (PostgreSQL nie lubi DEFAULT nowego enum w tej samej transakcji):

1. `prisma/migrations/20260602120000_rbac_roles` — tylko `ADD VALUE` USER, MODERATOR
2. `prisma/migrations/20260602120001_rbac_user_default` — `DEFAULT 'USER'`

### Jeśli `migrate deploy` padł na P3018 / 55P04

```powershell
npx prisma migrate resolve --rolled-back 20260602120000_rbac_roles
npx prisma migrate deploy
```

Jeśli enumy już są w bazie ręcznie:

```powershell
npx prisma migrate resolve --applied 20260602120000_rbac_roles
npx prisma migrate deploy
```

### Seed (jednorazowo na prod, lokalnie z prod DATABASE_URL)

```bash
npx prisma migrate deploy
npm run db:seed
```

Admin CMS: `admin@wss.space` (hasło: `SEED_ADMIN_PASSWORD` lub domyślne w seed) + konto w **Supabase Auth** (Auto Confirm).

---

## MANUAL SETUP (nadal aktualne)

### Supabase SQL Editor
1. `supabase/article_likes.sql`
2. `supabase/avatars.sql`

### Supabase Auth → URL Configuration
- Site URL + redirecty: `https://<domena>/auth/callback`, `https://*.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

### Vercel
- 3 zmienne env (patrz wyżej)
- Deploy: **`git push`** → auto build (nie trzeba `vercel deploy` jeśli repo podpięte)

---

## ARCHITECTURE REMINDERS

- **`app/globals.css` is FROZEN**
- **Public auth:** Supabase — `/logowanie`, `/rejestracja`, `AuthProvider`
- **CMS auth:** `/login` + Supabase + **Prisma `User.role`**
- **Prisma `passwordHash`:** wymagane w schema, logowanie CMS przez Supabase (nie bcrypt z DB)
- Walidacja: `npx tsc --noEmit` → `npm run lint` → `npx next build`

---

## ZNANE / OPCJONALNE (nie zrobione)

- `canModerateComments` — zdefiniowane, komentarze nadal localStorage (brak tabeli w DB)
- EDITOR/AUTHOR w API zostały zawężone do RBAC z roli ADMIN na czas security fix, potem przywrócono pełną macierz RBAC (nie tylko ADMIN)
- Prisma 7 warning: `package.json#prisma` → docelowo `prisma.config.ts`
- Middleware + Prisma na Edge — ostrzeżenie przy buildzie; layout + API są backup
- `metadataBase` w layout: `https://webspacestation.pl` — dostosuj do domeny Vercel

---

## PLIKI DODANE/ZMIENIONE (Phase 9 — skrót)

| Obszar | Pliki |
|--------|--------|
| Deploy | `vercel.json`, `public/.gitkeep`, strony `force-dynamic`, `package.json` postinstall |
| Auth sesja | `components/auth/AuthProvider.tsx`, `lib/auth/session-user.ts` |
| Security/RBAC | `middleware.ts`, `lib/auth/permissions.ts`, `lib/auth/guard.ts`, `lib/auth/admin.ts`, `lib/auth/provision.ts` |
| Users CMS | `app/admin/users/*`, `components/admin/UsersManager.tsx`, `app/api/users/*`, `lib/server/users.ts` |
| Migracje | `prisma/schema.prisma`, `prisma/migrations/20260602120000_*`, `20260602120001_*` |
| Avatary | `supabase/avatars.sql`, `AvatarUploader.tsx`, `Comments.tsx` |

---

## STARTING PROMPT FOR THE NEXT CHAT

> Kontynuujemy **WSS** (Next.js 15, Supabase, Prisma). Przeczytaj **`docs/WSS_PHASE_9_HANDOFF.md`** (potem Phase 8/7 jeśli potrzeba kontekstu auth/content).
>
> **Stan:** Vercel deploy działa; avatary + komentarze z foto OK po SQL; RBAC wdrożony w kodzie (USER/AUTHOR/EDITOR/MODERATOR/ADMIN, `/admin/users`, API permissions).
>
> **Upewnij się że na prod:** `npx prisma migrate deploy` przeszedł (obie migracje RBAC), seed jeśli pusta baza, env na Vercel, SQL likes/avatars.
>
> **Nie modyfikuj `globals.css`.** Nie psuj podziału public Supabase vs CMS Prisma role.
>
> [Tutaj opisz zadanie: np. moderacja komentarzy w DB, rola MODERATOR w UI, testy E2E, itd.]

---

## GIT NOTE

Wypchnij na `main` przed kolejną pracą na Vercel: commit z RBAC + fix migracji + ewentualnie `migrate resolve` potwierdzony lokalnie.

Repo: `https://github.com/mazipl93/webspacestation.git`
