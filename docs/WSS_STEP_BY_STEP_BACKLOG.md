# WSS — Backlog krok po kroku (czat 38+)

**Utworzono:** 4 czerwca 2026  
**Reguła:** **jeden krok na sesję** → raport + test usera → **STOP — czekaj na OK** → dopiero następny krok.  
**Commit/push:** tylko po explicit OK usera (albo po kroku 0 jeśli user każe commitnąć WIP).

**Czytaj przed startem:**
- `docs/WSS_SITE_MAP_AUDIT.md` — **pełny audyt: co jest na każdej stronie**
- `docs/WSS_NEXT_CHAT_HANDOFF.md` — WIP lokalny, reguły, STARTING PROMPT
- `docs/WSS_ROADMAP_BACKLOG_V3.md` — checkboxy

**Stan:** prod `main` `a069877` · https://webspacestation.pl · **krok 5+6 na prod** (czat 44)

---

## Krok 0 — Commit pakietu WIP (UI + logo C)

**Cel:** wypchnąć na `main` to, co user już zaakceptował lokalnie.

**Zakres:**
- Logo **wariant C** (Oswald) — `WssLogoWordmark.tsx`, `layout.tsx`
- Tło flat `#060810` — `globals.css`, theme vars
- Brak dev switcherów na froncie
- `article-panel` na artykule
- Usunięty podtytuł CMS na `/aktualnosci`
- Posprzątać martwe pliki logo A/B (opcjonalnie w tym kroku lub osobno)

**Test usera:** `/`, `/aktualnosci`, artykuł, nav, stopka, favicon.

**Po OK:** commit + push (jeśli user chce prod).

---

## Krok 1 — Cleanup: usunąć „Ważne teraz” z kodu

**Decyzja usera:** sekcja **nie wraca** — hero slider ją zastąpił.

**Usunąć pliki (nieimportowane):**
- `components/sections/ImportantNowSlider.tsx`
- `components/sections/HomeSidebar.tsx`
- `components/sections/TopStoriesList.tsx`
- `components/sections/HeroEditorialCluster.tsx`

**Zostawić:** `rankImportantNow()` w `lib/home/rank-articles.ts` — nadal używane w `ContentGrid.tsx` jako **fallback puli pod hero** (`buildHomepageHeroSlides`), nie jako sekcja UI.

**Test:** `npm run type-check` · homepage bez regresji hero.

---

## Krok 2 — Licznik REVIEW w CMS

**Cel:** na `/admin/articles` (lub dashboard) widoczna liczba artykułów `status = REVIEW` (~175).

**Pliki:** `app/admin/articles/page.tsx`, ewent. `app/admin/dashboard/page.tsx`, API stats jeśli jest.

**Test usera:** CMS → filtr „Do sprawdzenia” + licznik zgadza się z rzeczywistością.

---

## Krok 3 — Komentarze Supabase

**Cel:** zastąpić `localStorage` (`components/article/Comments.tsx`) trwałymi komentarzami w Supabase.

**Zakres typowy:**
- SQL migracja / tabela `comments` (articleId/slug, userId, body, createdAt, moderated?)
- RLS: read public, write authenticated
- API route lub Supabase client z server actions
- UI `Comments.tsx` — ten sam UX, inny storage
- Opcjonalnie: powiązanie z `/notifications`

**Test:** dwa konta / dwie przeglądarki — ten sam wątek widoczny.

**Nie ruszać:** workflow artykułów, RSS.

---

## Krok 4 — Sitemap + JSON-LD

**Cel:** SEO techniczne.

**Sitemap:**
- `app/sitemap.ts` (Next.js) — `/`, działy (`lib/seo/public-routes.ts`, w tym **`/rozrywka`**), `/aktualnosci`, wszystkie `PUBLISHED` slugi
- `robots.txt` jeśli brak

**JSON-LD:**
- `NewsArticle` / `Article` na `/aktualnosci/[slug]`
- `WebSite` + `Organization` na layout lub homepage

**Test:** Google Rich Results Test / podgląd źródła strony.

---

## Krok 5 — Sekcja „Odkrywaj” (prawdziwe strony, nie mock)

**Cel:** `/galeria`, `/wideo`, `/kalendarz`, `/mapa`, `/starty` — **przestać być pustym ComingSoon** (user: „zbudować sekcję Odkrywaj”).

**Propozycja kolejności podstron (ustalić z userem w kroku):**
1. `/starty` — harmonogram (zależy od kroku 6 API)
2. `/kalendarz` — wydarzenia / timeline
3. `/mapa` — mapa misji
4. `/galeria` / `/wideo` — media

**Nav:** `NAV_MORE_LINKS` w `lib/ui/nav-menu-config.ts` — już linkuje; treść musi dorastać.

**Uwaga:** można rozbić na pod-kroki 5a–5e — **jedna podstrona = jeden OK usera**.

---

## Krok 6 — Prawdziwe API pod Centrum operacyjne (homepage)

**Problem (audyt):** `ContentGrid.tsx` — `LAUNCHES[]`, `MISSION_PINS[]`, `EVENTS[]`, `LiveMissionCenter` = **dane na sztywno**, badge „Podgląd”.

**Cel:** ops panel na `/` z **żywymi lub cache’owanymi** danymi (Launch Library 2 / SpaceX / własny cron).

**Pliki:** `ContentGrid.tsx` (`DashboardWidgets`, `NadchodzaceStarty`, `AktyweneMisje`, `TimelineWydarzen`), nowy `lib/ops/` lub `app/api/launches/route.ts`.

**Test:** odliczenia / misje zmieniają się po odświeżeniu API (nie hardcoded 02:31:12).

**Zależność:** sensownie po lub razem z krokiem 5 `/starty`.

---

## Krok 7+ (później, poza listą usera)

- Upload okładek prod (P1-6)
- Bulk publish REVIEW
- Newsletter backend (stopka — dziś fake „Zapisano”)
- `getRelatedArticles` optymalizacja
- Usunąć martwe wordmarki logo A/B
- Embeddings / powiązane AI

---

## Szybka mapa „co jest na stronie” (skrót)

Pełna wersja → **`docs/WSS_SITE_MAP_AUDIT.md`**.

| URL | Co widzi user |
|-----|----------------|
| `/` | Hero slider, Najnowsze, Temat tygodnia?, Popularne, 5 działów, **Centrum operacyjne (mock starty/misje)** |
| `/aktualnosci` | Lista 40, filtry działów |
| `/aktualnosci/[slug]` | Artykuł B+, sidebar, dyskusja (**localStorage**), czytaj dalej, powiązane |
| `/misje` … `/iss` | Feed działu |
| `/starty`…`/wideo` | **Wkrótce** |
| `/rss` | Subskrypcje feedów |
| `/profil` | Konto, zapisane, polubione |
| `/admin/*` | CMS redakcja |

---

## Niespójności zamknięte decyzjami usera (czat 37→38)

| Temat | Decyzja |
|-------|---------|
| Ważne teraz UI | **Wyrzucić** z kodu (krok 1) |
| Mock starty na homepage | **Zastąpić API** (krok 6) |
| Odkrywaj w menu | **Zbudować treść** (krok 5) |
| Komentarze | **Supabase** (krok 3) |
| SEO | **Sitemap + JSON-LD** (krok 4) |
| OPS redakcja | **Licznik REVIEW** (krok 2) |

---

**Krok 5+6:** DONE lokalnie (czat 43) — commit + push w **następnym czacie** (user).

*Po każdym zamkniętym kroku: dopisz wpis w `docs/WSS_NEXT_CHAT_HANDOFF.md` (historia sesji).*
