# WSS — Phase 11 (ISR + news-first homepage) — HANDOFF
**Status:** Wdrożone lokalnie, commit `bf386f3` na `main`, zsynchronizowane z `origin/main`. Build zielony (`tsc` + `next build`). **Date:** 2 June 2026

---

## READ FIRST

1. **Ten plik** — ISR/cache (Prio 1+2) + przebudowa homepage news-first
2. `docs/WSS_PHASE_10_HANDOFF.md` — deploy fix RBAC/logout + pełny plan performance (Prio 3–7 jeszcze NIE wdrożone)
3. `docs/WSS_PHASE_9_HANDOFF.md` — Vercel, auth split, RBAC

---

## CO ZROBIONO W TEJ FAZIE

### A. Performance audit — Prio 1 + Prio 2 (WDROŻONE)

**Cel:** odblokować cache stron publicznych, usunąć globalny dynamic rendering.

- **`app/layout.tsx`** — usunięty server-side `getInitialUser()` (cookies + Supabase przy każdym renderze opt-outował ISR dla całego drzewa).
- **`components/auth/AuthProvider.tsx`** — user hydratowany wyłącznie na kliencie; `loading: true` do pierwszego `getUser()` (guard `/profil` nie redirectuje przedwcześnie).
- **8 stron publicznych** — `force-dynamic` → `export const revalidate = 300` (`app/page.tsx`, `aktualnosci`, `[slug]`, 5 kategorii).
- **`lib/server/articles.ts`** — publiczne odczyty w `unstable_cache` + tagi + `try/catch` (build bez DB).
- **`lib/cache/tags.ts`** — `ARTICLES_TAG`, `CATEGORIES_TAG`, `articleTag()`, `categoryTag()`.
- **`lib/articles.ts`** — `new Date(...)` w `toNewsArticle` (cache deserializuje Date jako string).
- **Mutacje API** — `revalidateTag()` w POST/PATCH/DELETE artykułów i PATCH kategorii.
- **`app/aktualnosci/[slug]/page.tsx`** — usunięty server-side `getCurrentUser()` dla „Edytuj"; nowy **`components/article/ArticleEditButton.tsx`** (klient + `/api/auth/cms-check`).

**Efekt build:** strony treści `○ Static, Revalidate 5m`; `[slug]` on-demand ISR.

### B. Homepage news-first (WDROŻONE)

**Cel:** portal informacyjny zamiast landing page produktu. Stylistyka WSS bez zmian (`globals.css` nietknięty).

Nowa kolejność sekcji w **`components/sections/ContentGrid.tsx`**:

1. **Hero Article** — `HeroArticle.tsx` (lead: `isBreaking ?? articles[0]`, okładka + tytuł + CTA)
2. **Top Stories** — `TopStoriesList.tsx` (4 nagłówki; desktop: rail po prawej na hero)
3. **Najnowsze** — siatka `ArticleCard` (do 9 szt., bez duplikatów z hero/top)
4. **Kategorie** — 5 rzędów × 3 `ArticleCard` (`getArticlesByCategory` równolegle)
5. **Popularne** — `PopularArticles.tsx` (klient, ranking po Supabase `article_likes`)
6. **Centrum operacyjne** — widżety live/starty/mapa/timeline zdemotowane na dół
7. **Footer** — bez zmian (`app/page.tsx` → Navbar + ContentGrid + Footer)

**Nieużywany:** `components/sections/Hero.tsx` (stary branding „WEB SPACE STATION") — można usunąć przy sprzątaniu.

---

## PERFORMANCE AUDIT — CO ZOSTAŁO (NIE WDROŻONE)

Z `WSS_PHASE_10_HANDOFF.md`, sugerowana kolejność:

| Prio | Temat | Pliki |
|------|-------|-------|
| 3 | Related celowane + „Edytuj" już na kliencie ✓ częściowo | `lib/articles.ts` `getRelatedArticles()` nadal woła `getAllArticles()` |
| 4 | Zawęzić matcher middleware | `middleware.ts` |
| 5 | Cache fetch klienta (Navbar search, `/search`) | `Navbar.tsx`, `SearchClient.tsx`, API headers |
| 6 | Obrazy next.config | `next.config.ts` |
| 7 | Indeksy DB | `prisma/schema.prisma` + migracja |

---

## STAN GIT / DEPLOY

- Branch **`main`**, commit: **`bf386f3`** „update"
- `git status` czysty, `origin/main` zsynchronizowany
- Deploy: `git push origin main` → auto Vercel; alternatywnie `vercel --prod`
- Lokalny dev: `npm run dev` (HMR, bez deployu)

---

## PLIKI — SKRÓT

| Obszar | Pliki |
|--------|-------|
| ISR/cache | `app/layout.tsx`, `lib/cache/tags.ts`, `lib/server/articles.ts`, `lib/articles.ts`, 8× `app/**/page.tsx`, API articles/categories |
| Auth ISR | `components/auth/AuthProvider.tsx`, `components/article/ArticleEditButton.tsx` |
| Homepage | `app/page.tsx`, `ContentGrid.tsx`, `HeroArticle.tsx`, `TopStoriesList.tsx`, `PopularArticles.tsx` |
| Docs | `docs/WSS_PHASE_10_HANDOFF.md` (dodany wcześniej) |

---

## ZASADY (bez zmian)

- **`app/globals.css` ZAMROŻONY**
- Public auth: Supabase; CMS: Prisma `User.role`
- Walidacja: `npx tsc --noEmit` → `npm run build`
- PowerShell: commit przez `git commit -m "..."` (bez heredoc)

---

## STARTING PROMPT FOR THE NEXT CHAT

> Kontynuujemy **WSS** (Next.js 15, Supabase, Prisma, Tailwind v4). Przeczytaj **`docs/WSS_PHASE_11_HANDOFF.md`** (potem Phase 10/9 w razie potrzeby).
>
> **Stan:** `main` @ `bf386f3` — wdrożone ISR (Prio 1+2) + homepage news-first. Strony publiczne cache'owane 5 min + `revalidateTag` po publikacji. Hero = lead article, nie branding. Build zielony, prod zsynchronizowany.
>
> **Zadanie:** [TU DOPISZ CO ROBIMY]
>
> **Zasady:** NIE modyfikuj `app/globals.css`. Minimalny scope. `tsc` + `build` przed commitem. Deploy: `git push origin main`.
