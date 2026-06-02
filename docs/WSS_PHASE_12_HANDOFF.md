# WSS — Phase 12 (Homepage V2 polish + auth fix + UI PL) — HANDOFF
**Status:** Wdrożone na `main` @ `ea0761e` (+ lokalnie niezcommitowane zmiany w `ContentGrid.tsx` — sekcja Technologie). Build zielony przy ostatnim `next build`. **Date:** 2 June 2026

---

## READ FIRST

1. **Ten plik** — Homepage V2 dopracowanie, auth regression fix, powiadomienia popover, polonizacja UI
2. `docs/WSS_PHASE_11_HANDOFF.md` — ISR (revalidate 300) + homepage news-first (Phase 11 baseline)
3. `docs/WSS_PHASE_10_HANDOFF.md` — performance audit Prio 3–7 (NIE wdrożone)

---

## CO ZROBIONO W TEJ FAZIE

### A. Homepage Redesign V2 — news dominant (WDROŻONE, commit `7cad360`)

- Szeroki layout `max-w-[min(95vw,1720px)]` zamiast wąskiego `container-site` (1240px)
- Hero (~70%) + **Ważne teraz** (dawniej „Top stories”) w gridzie bocznym
- **Najnowsze wiadomości** — do 12 artykułów, siatka 4/2/1 kolumn
- **Sticky panel** desktop (`HomeSidebar.tsx`): Popularne, Komentarze, Na czasie, Ostatnio dodane
- Widżety kosmiczne (Live, starty, mapa, timeline) na samym dole
- `Navbar` — menu jednoliniowe (Kategorie dropdown), większa typografia mobile
- `globals.css` **nietknięty**

### B. Auth regression po Phase 11 — NAPRAWIONE (commit `9b451a0`)

**Objawy:** wylogowanie po nawigacji, `/profil` bez sesji, „Zaloguj się” tylko odświeża stronę.

**Przyczyna:** usunięcie `getInitialUser()` z root layout + `onAuthStateChange` wołający `getUser()` przy refreshu cookies przez middleware → UI traciło sesję mimo że serwer ją widział.

**Fix:**
- **`app/api/auth/session/route.ts`** — dynamiczny odczyt sesji z cookies (bez dynamic root layout)
- **`components/auth/AuthProvider.tsx`** — bootstrap z API + `getSession()`; `onAuthStateChange` używa `session` z eventu; weryfikacja serwera przed wyczyszczeniem usera
- **`components/profile/ProfileClient.tsx`** — usunięty agresywny redirect na `/`
- **`components/layout/Navbar.tsx`** — skeleton podczas `authLoading`

ISR na stronach publicznych **zachowane**.

### C. Powiadomienia — popover zamiast strony (WDROŻONE)

- **`components/notifications/NotificationsPopover.tsx`** — dropdown przy dzwonku
- **`hooks/useNotifications.ts`** + **`lib/notifications.ts`** — stan przeczytanych (localStorage per email)
- Niebieska kropka tylko przy nieprzeczytanych; znika po odczytaniu / „Oznacz wszystkie"
- Pełna strona `/notifications` nadal dostępna (link „Zobacz wszystkie")

### D. Polonizacja UI (WDROŻONE)

| Było | Jest |
|------|------|
| Top stories | **Ważne teraz** |
| Breaking news / Pilne | **Ważne** (badge wyróżnionych) |
| Live | **Na żywo** |
| Live Mission Center | **Centrum misji na żywo** |
| Timeline wydarzeń | **Oś czasu wydarzeń** |
| Trending | **Na czasie** |
| Live space & science intelligence | **Wiadomości kosmiczne na żywo** |

### E. Kolejność sekcji kategorii (WDROŻONE)

Po **Najnowszych wiadomościach**:
1. Technologie
2. Astronomia
3. Misje
4. Ziemia z kosmosu
5. ISS

### F. Sekcja Technologie — layout (LOKALNIE, może być niezcommitowane)

**Problem:** variant „split” (wąski panel + siatka) — mało widoczny, wyglądał jak bałagan.

**Fix w `ContentGrid.tsx`:**
- Technologie → variant **`hero-strip`** (duży lead + 3 compact karty)
- Mocniejszy gradient/cyan border/glow dla `slug === "technologie"`
- Misje → variant **`banner`** (zamiast hero-strip)
- Usunięty variant **`split`**

---

## STAN GIT

- Branch **`main`**, ostatni commit: **`ea0761e`** „opis zmian"
- **`origin/main`** zsynchronizowany (sprawdź `git status` — `ContentGrid.tsx` może być unstaged)
- Historia od Phase 11: `7cad360` → `9b451a0` (auth) → `1e32544`/`5416bc3`/`ea0761e` (PL + kolejność)

---

## PLIKI — SKRÓT

| Obszar | Pliki |
|--------|-------|
| Homepage V2 | `ContentGrid.tsx`, `HeroArticle.tsx`, `TopStoriesList.tsx`, `HomeSidebar.tsx`, `ArticleCard.tsx` |
| Auth fix | `app/api/auth/session/route.ts`, `AuthProvider.tsx`, `ProfileClient.tsx`, `Navbar.tsx` |
| Powiadomienia | `NotificationsPopover.tsx`, `useNotifications.ts`, `lib/notifications.ts` |
| ISR (bez zmian) | `app/layout.tsx`, `lib/server/articles.ts`, `revalidate = 300` |

---

## PERFORMANCE AUDIT — CO ZOSTAŁO (z Phase 10/11)

| Prio | Temat | Status |
|------|-------|--------|
| 3 | `getRelatedArticles()` — celowane query | NIE |
| 4 | Zawęzić matcher middleware | NIE |
| 5 | Cache fetch Navbar search / `/search` | NIE |
| 6 | Obrazy `next.config.ts` | NIE |
| 7 | Indeksy DB | NIE |

---

## ZASADY (bez zmian)

- **`app/globals.css` ZAMROŻONY**
- Walidacja: `npx tsc --noEmit` → `npm run build`
- Deploy: `git push origin main` → Vercel auto
- PowerShell: commit przez `git commit -m "..."` (bez heredoc)

---

## STARTING PROMPT FOR THE NEXT CHAT

> Kontynuujemy **WSS** (Next.js 15, Supabase, Prisma, Tailwind v4). Przeczytaj **`docs/WSS_PHASE_12_HANDOFF.md`** (potem Phase 11/10 w razie potrzeby).
>
> **Stan:** `main` @ `ea0761e` — Homepage V2 (news-dominant), auth fix (`/api/auth/session` + AuthProvider), powiadomienia popover, UI po polsku. ISR 5 min bez zmian. Sprawdź czy `ContentGrid.tsx` (sekcja Technologie hero-strip) jest zcommitowany.
>
> **Zadanie:** [TU DOPISZ CO ROBIMY]
>
> **Zasady:** NIE modyfikuj `app/globals.css`. Minimalny scope. `tsc` + `build` przed commitem. Deploy: `git push origin main`.
