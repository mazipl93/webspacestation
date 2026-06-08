# WSS — Handoff: wolne ładowanie strony (następny czat)

**Data:** 8 czerwca 2026  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Prod:** https://webspacestation.pl  
**Ostatni commit:** `de288df` — `fix(cms): opaque mobile nav and sidebar on portal theme`

---

## Co już zrobiono w tej sesji (performance)

| Commit | Zmiana |
|--------|--------|
| `79c0d2b` | Listy artykułów **bez pola `content`** (`articleListSelect`) — mniej RAM/DB na homepage |
| `79c0d2b` | `revalidatePath(..., "page")` zamiast `"layout"` — mniej agresywne przebudowy po publikacji |
| `79c0d2b` | Revalidate tylko home + aktualności + **zmieniony dział** (nie wszystkie 7 działów) |
| `79c0d2b` | Jedna pula `getAllArticles()` na stronie artykułu (bez 3× fetch) |
| `79c0d2b` | `ServiceWorkerCleanup` — wyrejestrowanie starego SW (fałszywe 404 / OOM w Chrome) |
| `de288df` | CMS mobile — nieprzezroczyste menu (`.cms-shell` w `globals.css`) |

**User zgłaszał:** po publikacji/edycji artykułu strona ~20–30 s „zamula”; na starym PC 4 GB RAM Chrome → Out of Memory.

---

## Podejrzane miejsca do audytu (niezbadane dogłębnie)

1. **Homepage `ContentGrid`** (`components/sections/ContentGrid.tsx`)
   - `getAllArticles()` + `getHeroSlideArticles()` równolegle
   - **`getOpsData()`** w `HomepageOpsDashboardLoader` — do **30 s timeout** prod (`lib/ops/get-ops-data.ts`): Launch Library, ISS, NASA APOD/gallery/videos, artykuły astronomia
   - `export const revalidate = 60` na `app/page.tsx` — częstsze odświeżanie niż działy (300 s)

2. **Cache po publikacji**
   - Pierwszy gość po `revalidateTag(ARTICLES_TAG)` = cold start (HTML + data cache)
   - Sprawdzić czy Vercel Fluid / ISR działa jak oczekiwano (logi build + response headers `x-vercel-cache`)

3. **Fonty** — `layout.tsx`: Geist + GeistMono + Oswald (Google) — LCP / blokowanie renderu

4. **Middleware** — Supabase `getUser()` na każdym żądaniu (oprócz static assets) — koszt Edge

5. **Client bundle** — Navbar search, AuthProvider, ops map, lucide-react

6. **Obrazy** — hero LCP, `CoverImage`, NASA/Supabase remote

7. **Baza** — liczba opublikowanych artykułów; `getPublishedArticles()` nadal **wszystkie** wiersze (bez content, ale metadane × N)

---

## Supabase (stan)

- `user_article_likes.sql` — **wdrożony** skryptem `scripts/apply-supabase-sql-file.ts` (wymaga `pg`; nie w commicie)
- `avatars.sql` — wdrożony wcześniej
- Weryfikacja: `npx tsx scripts/verify-likes-sql.ts`

---

## Lokalnie untracked (nie na main)

- `scripts/apply-supabase-sql-file.ts`
- `scripts/verify-likes-sql.ts`
- `scripts/audit-nauka-category.ts`, `audit-popularnonaukowe.ts`, `find-gothic-article.ts`

---

## Kluczowe pliki

| Obszar | Pliki |
|--------|--------|
| Homepage data | `components/sections/ContentGrid.tsx`, `app/page.tsx` |
| Cache / publish | `lib/cache/revalidate-public-articles.ts`, `lib/server/articles.ts` |
| Ops (wolne API) | `lib/ops/get-ops-data.ts`, `lib/ops/launch-library.ts` |
| Layout / fonty | `app/layout.tsx`, `middleware.ts` |

---

## Prompt na nowy czat (skopiuj poniżej)

```
Projekt: WSS (Next.js 15, Vercel, Prisma/Supabase) — https://webspacestation.pl
Repo: C:\Users\dawid\Desktop\wss-nowa, branch main, ostatni commit de288df.

Problem: Strona nadal długo się wczytuje (user: 20–30 s po wejściu, szczególnie po publikacji artykułu w CMS). Na słabszym PC (4 GB RAM, Chrome) był Out of Memory.

Już zrobione (commit 79c0d2b):
- Listy artykułów bez pola content w DB
- revalidatePath "page" zamiast "layout", targeted revalidate działu
- ServiceWorkerCleanup, jedna pula getAllArticles na stronie artykułu

Przeczytaj docs/WSS_PERF_CHAT_HANDOFF.md i zbadaj DLACZEGO nadal wolno:
1. Zmierz TTFB/LCP na prod (curl headers, Lighthouse lub WebPageTest) — homepage i artykuł
2. Czy getOpsData() na homepage blokuje render (timeout 30s, wiele zewnętrznych API)
3. Czy cold cache po revalidateTag powoduje pełny rebuild dla wszystkich userów
4. Middleware, fonty, bundle size, liczba artykułów w getPublishedArticles()
5. Zaproponuj i wdroż minimalne fixy (np. lazy ops na homepage, dłuższy ISR, limit listy, streaming Suspense)

Nie rób commit/push bez mojej prośby. Na końcu: krótkie podsumowanie przyczyn + co zmieniłeś.
```
