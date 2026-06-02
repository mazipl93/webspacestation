# WSS — Phase 10 (Deploy fix RBAC/logout + Performance audit) — HANDOFF
**Status:** Krytyczny fix wdrożeniowy zrobiony i wypchnięty (build na Vercel zielony, commit `fcb01e6`). Audyt wydajności wykonany — **plan gotowy, jeszcze NIE wdrożony**. **Date:** 2 June 2026

---

## READ FIRST (kolejność dokumentów)

1. **Ten plik** — fix deployu RBAC/logout + pełny plan optymalizacji wydajności
2. `docs/WSS_PHASE_9_HANDOFF.md` — Vercel deploy, auth split (Supabase public vs CMS Prisma), RBAC, migracje
3. `docs/WSS_PHASE_8_HANDOFF.md` — engagement, avatary, artykuły z Prisma, SQL Supabase

---

## CO ZROBIONO W TEJ FAZIE

### A. KRYTYCZNY FIX — `main` nie budował się na Vercel (produkcja zamrożona)
**Objaw zgłoszony przez użytkownika:**
- Zwykły user (`test@test.pl`) wchodził na `/admin` i mógł wszystko edytować.
- Przyciski „Wyloguj się” na stronie głównej nie działały (działał tylko w panelu admina).

**Przyczyna (root cause):** `origin/main` **nie kompilował się**, więc każdy build na Vercel padał, a produkcja serwowała **stary deploy sprzed RBAC** (bez blokady roli na `/admin`, ze starym klienckim wylogowaniem). Powody niekompilowania:
- `lib/server/users.ts` był **niezacommitowany** (untracked), a importował go już wypchnięty `app/api/users/route.ts` → brakujący moduł.
- `app/admin/articles/page.tsx` wołał `canDeleteArticle(role ? { role } : null)` (stare API obiektowe) niezgodnie z nowym `permissions.ts` (string roli) → błąd typów.
- `lib/admin/types.ts` / `lib/admin/api.ts` na `main` nie miały `AdminUser`/metod users → kolejne błędy typów.

**Fix:** dograne brakujące pliki + poprawki typów, lokalny `tsc` + `next build` czyste, commit `fcb01e6`, push → **build na Vercel zielony** (potwierdzone w logach: tabela `Route (app)` = sukces).

**Dowód diagnostyczny:** `node scripts/check-users.mjs` → w bazie prod jest **tylko** `admin@wss.space` (ADMIN). Konto `test@test.pl` istnieje **tylko w Supabase Auth**, NIE ma wiersza w tabeli Prisma `users`. Dlatego po poprawnym deployu `app/admin/layout.tsx` (`redirect("/")` przy braku roli) je odbija.

### B. Wylogowanie — naprawione warstwowo
- **Realny bug:** w `AccountMenu` i mobilnym `Navbar` przycisk miał `onClick={() => setOpen(false)}` / `setMobileOpen(false)`. Formularz logout jest w `{open && ...}` → klik odmontowywał `<form>` zanim przeglądarka wysłała POST → natywne wysłanie anulowane. Panel admina działał, bo tam formularz jest zawsze w DOM. **Fix:** usunięto te `onClick`.
- **Nowy komponent** `components/auth/LogoutButton.tsx` — natywny `<form method="post" action="/logout?next=...">` (bez JS/Supabase po stronie klienta). Użyty w: `AccountMenu`, `Navbar` (mobile), `ProfileClient`, `AdminSidebar`.
- **`app/logout/route.ts`** — czyści cookies sesji **na obiekcie redirect-response** (`response.cookies.set`), `signOut({ scope: "global" })`, jawne wygaszanie `sb-*-auth-token` (`maxAge:0`, `expires: epoch`), `export const dynamic = "force-dynamic"`. Param `next` walidowany (same-site).
- **`middleware.ts`** — pomija `/logout` (nie odświeża sesji tuż przed wylogowaniem).

### C. Logowanie — synchronizacja sesji (wolne/„nie loguje”)
- **Objaw:** po zalogowaniu spinner wisiał, user widoczny dopiero po ręcznej nawigacji.
- **Przyczyna:** `router.replace` + `router.refresh()` nie synchronizowało httpOnly cookies; brak `setLoading(false)`.
- **Fix:** nowy `lib/auth/login-redirect.ts` (`safeRedirectPath`, `redirectAfterAuth` = `window.location.assign`, `provisionSessionUser`). Po sukcesie → provision + **pełna nawigacja** (`window.location.assign`). Użyte w `app/logowanie/LoginForm.tsx`, `app/login/LoginForm.tsx`, `app/rejestracja/RegisterForm.tsx`.

### D. Middleware — odchudzony (Edge-safe)
- Wcześniej próbował self-fetch do `/api/auth/cms-check` / `/api/auth/admin-check` (kruche na Vercel Edge).
- Teraz: tylko odświeżanie sesji + redirect niezalogowanych z `/admin` na `/login`.
- **Egzekwowanie roli jest autorytatywne w layoutach** (Node + Prisma):
  - `app/admin/layout.tsx` → `canAccessCms(user.role)`, inaczej `redirect("/")`.
  - `app/admin/users/layout.tsx` → `canManageUsers(user.role)`, inaczej `redirect("/admin/dashboard")`.
- Endpointy `app/api/auth/cms-check/route.ts` i `admin-check/route.ts` **pozostały** w repo, ale nie są już używane przez middleware (można w przyszłości usunąć).

### E. Normalizacja e-maila (Supabase ↔ Prisma)
- `trim().toLowerCase()` w `lib/auth/user.ts` (`getCurrentUser`, `getAuthContext`), `lib/auth/provision.ts`, `lib/auth/admin.ts` — spójne dopasowanie po emailu.

### F. Narzędzie diagnostyczne
- `scripts/check-users.mjs` — wypisuje wszystkich userów Prisma (email/role/name/createdAt). Uruchom: `node scripts/check-users.mjs` (używa `DATABASE_URL` z `.env`).

---

## PERFORMANCE AUDIT — PLAN (NIE WDROŻONY, główny temat na nowy czat)

Treść publiczna renderuje się server-side przez Prisma (OK — brak podwójnego fetchu). Główny problem: **zero cache** i **powtarzalne zapytania**.

### 🔴 Prio 1 — `force-dynamic` na całej treści = DB przy każdym wejściu
Pliki z `export const dynamic = "force-dynamic"`:
`app/page.tsx`, `app/aktualnosci/page.tsx`, `app/aktualnosci/[slug]/page.tsx`, `app/astronomia/page.tsx`, `app/misje/page.tsx`, `app/technologie/page.tsx`, `app/iss/page.tsx`, `app/ziemia-z-kosmosu/page.tsx`.
- **Plan:** zamień na `export const revalidate = 300` (ISR on-demand, bez `generateStaticParams` → brak DB w buildzie). Owinąć odczyty w `unstable_cache` z tagami; wołać `revalidateTag`/`revalidatePath` w mutacjach (`app/api/articles/route.ts`, `app/api/articles/[slug]/route.ts`, `app/api/categories/[id]/route.ts`).
- Cache odczytów: `lib/server/articles.ts`.

### 🔴 Prio 2 — Root layout wymusza dynamic na całej apce
`app/layout.tsx` → `getInitialUser()` czyta `cookies()` + Supabase `getUser()` przy każdym renderze → opt-out z ISR dla całego drzewa. `AuthProvider` i tak re-synchronizuje usera na kliencie.
- **Plan:** rozważyć rezygnację z server-side `getInitialUser()` (hydratacja usera wyłącznie klientem) lub osobny dynamiczny segment. Pliki: `app/layout.tsx`, `components/auth/AuthProvider.tsx`.

### 🟠 Prio 3 — Zbędne zapytania na stronie artykułu
- `lib/articles.ts` → `getRelatedArticles()` woła `getAllArticles()` (cała lista) zamiast celowanego zapytania (`where category`, `take`). Pliki: `lib/articles.ts`, `lib/server/articles.ts`.
- `app/aktualnosci/[slug]/page.tsx` → `getCurrentUser()` (Supabase + Prisma) tylko dla ołówka „Edytuj”, dla każdego anonima; blokuje cache. **Plan:** przenieść affordance edycji do komponentu klienckiego (`useAuth`).

### 🟠 Prio 4 — Wielokrotny `getUser()` + szeroki matcher
`getUser()` w `middleware.ts` (prawie każda ścieżka) + `app/layout.tsx` + `app/aktualnosci/[slug]/page.tsx`. **Plan:** zawęzić matcher w `middleware.ts` do `/admin/:path*`, `/profil`, `/logowanie`, `/rejestracja`, ew. `/api/...`.

### 🟡 Prio 5 — Fetch klienta / cache API
- `components/layout/Navbar.tsx` (~167) — `fetch("/api/articles", { cache: "no-store" })` przy otwarciu wyszukiwarki → zmienić na cache'owalne.
- `app/search/SearchClient.tsx` — osobny fetch katalogu → współdzielić cache.
- `hooks/useArticleLikes.ts` — 1 zapytanie Supabase o licznik na wejście (rozważyć SSR/cache).
- `app/api/articles/route.ts` — dodać nagłówki `Cache-Control` po wdrożeniu ISR.

### 🟡 Prio 6 — Obrazy (`next.config.ts`)
`next/image` używany dobrze (`fill`+`sizes`+`priority`). Braki w configu:
- dodać `formats: ["image/avif","image/webp"]`, `minimumCacheTTL` (np. 30 dni),
- zawęzić `hostname: "**"` do hosta Supabase Storage + `images.unsplash.com`,
- rozważyć `placeholder="blur"` na okładkach.

### 🟢 Prio 7 — Indeksy DB (`prisma/schema.prisma`)
Dodać kompozytowe `@@index([status, publishedAt])` oraz `@@index([categoryId, status, publishedAt])` (+ migracja).

### Sugerowana kolejność wdrożenia
1. Prio 2 + 1 razem (odblokować ISR) — największy zysk, uważnie przetestować auth UI.
2. Prio 3 (related celowane + „Edytuj” na kliencie).
3. Prio 4 (matcher). 4. Prio 6 (obrazy). 5. Prio 5 + 7.

---

## STAN GIT / DEPLOY
- Branch `main`, ostatni commit: **`fcb01e6`** „fix: make main buildable so RBAC + logout deploy to production”.
- `git log origin/main..HEAD` puste = zsynchronizowane. Build na Vercel **zielony**.
- Repo: `https://github.com/mazipl93/webspacestation.git`
- Env Vercel: `DATABASE_URL` (pooler :6543 + `?pgbouncer=true`), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## DO PRZETESTOWANIA NA ŻYWO (po deployu `fcb01e6`)
1. `test@test.pl` → `/admin` → przekierowanie na `/` (brak wiersza Prisma = brak roli).
2. „Wyloguj się” w navbarze/profilu → wraca na `/` bez avatara; w panelu admina → `/login`.
3. `admin@wss.space` → pełny dostęp do `/admin`.
> Testować w incognito (świeże cookies). Jeśli `test@test.pl` nadal wchodzi mimo zielonego builda → sprawdzić, czy Vercel jest podpięty do właściwej gałęzi/repo.

---

## ZASADY (bez zmian)
- **`app/globals.css` jest ZAMROŻONY** — nie modyfikować.
- **Public auth:** Supabase — `/logowanie`, `/rejestracja`, `AuthProvider`.
- **CMS auth:** `/login` + Supabase + **Prisma `User.role`**.
- Rejestracja/provision → zawsze rola `USER`. Promocje roli tylko w `/admin/users` (ADMIN).
- Minimalny scope — bez refaktoru całej apki.
- Walidacja: `npx tsc --noEmit` → `npm run build`. (Uwaga: PowerShell nie obsługuje bash heredoc — commit message przez plik + `git commit -F`.)

---

## PLIKI ZMIENIONE/DODANE (Phase 10 — skrót)
| Obszar | Pliki |
|--------|--------|
| Deploy fix | `lib/server/users.ts` (dodany), `lib/admin/types.ts`, `lib/admin/api.ts`, `app/admin/articles/page.tsx`, `app/aktualnosci/[slug]/page.tsx` |
| Logout | `components/auth/LogoutButton.tsx` (nowy), `app/logout/route.ts`, `components/auth/AccountMenu.tsx`, `components/layout/Navbar.tsx`, `components/profile/ProfileClient.tsx`, `components/admin/AdminSidebar.tsx`, `components/auth/AuthProvider.tsx` |
| Login sync | `lib/auth/login-redirect.ts` (nowy), `app/logowanie/LoginForm.tsx`, `app/login/LoginForm.tsx`, `app/rejestracja/RegisterForm.tsx` |
| Middleware/RBAC | `middleware.ts`, `app/api/auth/cms-check/route.ts`, `app/api/auth/admin-check/route.ts` (nieużywane), `lib/auth/user.ts`, `lib/auth/provision.ts`, `lib/auth/admin.ts` |
| Narzędzia | `scripts/check-users.mjs` |

---

## STARTING PROMPT FOR THE NEXT CHAT

> Kontynuujemy **WSS** (Next.js 15 App Router, Supabase, Prisma, Tailwind v4). Przeczytaj **`docs/WSS_PHASE_10_HANDOFF.md`** (potem Phase 9/8 w razie potrzeby).
>
> **Stan:** Deploy naprawiony — `main` (commit `fcb01e6`) buduje się na Vercel; RBAC `/admin` i wylogowanie działają po świeżym deployu. `test@test.pl` nie ma wiersza Prisma (rola brak → blokada). W bazie prod tylko `admin@wss.space` (ADMIN).
>
> **Zadanie:** wdrożyć **performance audit** z sekcji „PERFORMANCE AUDIT — PLAN”. Zacznij od **Prio 2 + Prio 1** (odblokowanie ISR: usunięcie server-side `getInitialUser` z root layoutu + zamiana `force-dynamic` → `revalidate` + tagi cache i `revalidateTag` w mutacjach). Po każdym kroku: `npx tsc --noEmit` + `npm run build`.
>
> **Zasady:** NIE modyfikuj `app/globals.css`. Nie psuj podziału public Supabase vs CMS Prisma role. Minimalny scope. Commit dopiero po potwierdzeniu, push wymusza deploy na Vercel.
