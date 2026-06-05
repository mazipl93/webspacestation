# WSS — Handoff na następny czat (żywy dokument)

**Ostatnia aktualizacja:** 5 czerwca 2026 (czat 55 — Nauka, cleanup frontu, kontakt)  
**→ Architektura treści:** `docs/WSS_CONTENT_ARCHITECTURE.md` + `.cursor/rules/wss-content-architecture.mdc`  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Ostatni commit:** `529ae5e` (czat 55) · **push:** po explicit OK usera  
**Historia:** patrz sesja czat 54 poniżej

**Prod:** https://webspacestation.pl · Vercel auto-deploy z `main`

**Decyzja usera:** więcej artykułów → **publikacja dopiero na samym końcu** (`--publish` + `cache:revalidate` tylko po explicit OK). **Bez commit/push** do OK.

**Perf homepage:** `22b0fb6` — PageSpeed mobile **83** (było 68).

**Vercel env:** `NEXT_PUBLIC_SITE_URL` ✅ · `NASA_API_KEY` ✅ · `GOOGLE_SITE_VERIFICATION` ❌ (GSC: user **już zweryfikowany** plikiem HTML — meta opcjonalne).

**GSC (user):** właściciel OK · sitemap `/sitemap.xml` przesłany — odświeżyć indeks po publikacjach.

**Artykuły redakcyjne PRO (czat 46 — 21 szt. w repo):**
- Pliki: `test-articles-june-2026.ts` (4) · `news-batch-june-04-2026.ts` (11) · `news-batch-june-05-2026.ts` (6) · `editorial-june-2026-all.ts` · `nasa-cover.ts`
- Seed: `npm run editorial:seed-test -- --update` (REVIEW) · **`--publish` tylko na koniec**
- **Okładki:** `images-assets.nasa.gov` (`nasaCoverUrl`) — stare URL-e (nasa.gov/wp-content, esa.int/pillars, apod) = **404** → jeden fallback Unsplash; naprawione w kodzie + `CoverImage` per-slug fallback
- **Linki w treści:** automatyczne — **nie** `<a>` ręcznie
- **Seed czat 46:** nie wykonany — `max clients reached` (pool Supabase); uruchom po zatrzymaniu `npm run dev` lub retry
- **WIP bez commita:** `lib/editorial/`, `components/article/CoverImage.tsx`, `ArticleCard`, `HeroArticle`, `resolve-image.ts`, handoff

**21 slugów (4+11+6):** poprzednie 15 + `europa-clipper-przelot-jowisz-ganimedes-czerwiec-2026` · `perseverance-zapas-probek-mars-czerwiec-2026` · `parker-solar-probe-perihelion-2026-najszybszy-obiekt` · `nasa-dragonfly-titan-testy-wiatrakow-2026` · `kerbal-space-program-2-eksploracja-2026-update` · `hubble-36-lat-obserwacji-orbita-2026`
- Google Analytics / AdSense — **odłożone** (user: niech strona się rozkręci)

**Krok 5+6 DONE (lokalnie, czat 43):**
- Odkrywaj: `/starty` `/kalendarz` `/mapa` `/galeria` `/wideo` + homepage ops
- API: Launch Library **2.3** `/launches/upcoming/`, ISS, NASA, artykuły Astronomia
- Fix: zły URL `/launch/` → `/launches/`; etykiety misji (Starlink…) zamiast samego „Falcon 9 Block 5”
- `lib/ops/*`, `components/discover/*`, sitemap Odkrywaj

**Na `main` (krok 4 — czat 42, `93f710b`):**
- **SEO:** `app/sitemap.ts`, `app/robots.ts`, JSON-LD (`lib/seo/`), `app/manifest.ts`
- **GSC env:** `GOOGLE_SITE_VERIFICATION` w layout (Vercel Production — ustaw ręcznie)
- **E-E-A-T:** `/polityka-prywatnosci`, `/kontakt` + stopka
- **noindex:** 404, auth, `/search` (Odkrywaj **w** sitemap od kroku 5+6 lokalnie)
- **Artykuł dół:** `ArticleMainColumnShell` — Koniec / Czytaj dalej = szerokość Komentarze

**Vercel Production (czat 44):** `NEXT_PUBLIC_SITE_URL` + `NASA_API_KEY` — **dodane**, redeploy OK

**Po deploy — GSC (user, ręcznie):**
1. Vercel Production: `NEXT_PUBLIC_SITE_URL=https://webspacestation.pl`
2. Vercel: `GOOGLE_SITE_VERIFICATION=<kod z GSC>` → redeploy
3. GSC → Sitemaps → `https://webspacestation.pl/sitemap.xml`
4. Rich Results Test na artykule (NewsArticle)

**Nie w commicie (lokalnie untracked, opcjonalnie później):** `build-log.txt`, martwe wordmarki A/B w `components/brand/wordmarks/`

**Na `main` (kroki 0–2 + pakiet CMS/hero z czat 38–39):**
- Krok 0–2: logo C, cleanup Ważne teraz, licznik REVIEW
- Hero: meta **pod okładką** (siatka jak treść artykułu)
- CMS lista: checkboxy + **bulk** publish/archive (`bulk-publish`, `bulk-archive`)
- CMS edytor: `EditorSection` 1–7, live preview obok tytułu/treści, `EditorFieldPanel`
- Autor: `bylineUserId`, `AuthorBylineField`, `ArticlePublicByline`
- Admin: nazwa + avatar z profilu Supabase (`/api/profile/sync`)
- Migracja: `20260604220000_article_byline_user` — **`npm run db:deploy` na prod**

**Na `main` (krok 3 + UI czat 40):**
- Komentarze Supabase — `14d1675` · SQL `supabase/article_comments.sql` (prod: SQL Editor jeśli 404)
- **Homepage desktop (czat 40):** Temat tygodnia (L) · hero · Najnowsze (P) — `976c55d`
- **Artykuł (czat 40):** Informacje przy tytule; Powiązane pod Informacjami — `976c55d`

**WIP → push czat 41 (UI):**
- **Shell 1320px** (`--spacing-site-shell`) — homepage, artykuł, stopka, NAV
- **Homepage v2** (`HOMEPAGE_LAYOUT_V2 = true` w `lib/site-layout.ts`): hero full width → Najnowsze 5-up → Temat tygodnia; 3 działy split-lead; Popularne 4×; **revert:** `HOMEPAGE_LAYOUT_V2 = false`
- **Artykuł:** okładka w shellu (16:9 ~520px), siatka jak homepage, breadcrumb kompaktowy (bez szerokiego paska MISJE)
- **Stopka:** jeden panel, kotwica marki, bez linku Subskrypcje w dolnym pasku
- **NAV desktop:** pill track wyśrodkowany, akcenty działów, grupa akcji

**Dokumenty:** `WSS_SITE_MAP_AUDIT.md` · `WSS_STEP_BY_STEP_BACKLOG.md`

**Pipeline REVIEW:** działa w kodzie — ~175 szt. to **kolejka redakcyjna**. Filtr CMS: **„Do sprawdzenia”** (= `REVIEW`).

**Czytaj też:** `docs/WSS_NEWS_ENGINE_HANDOFF.md` (architektura pipeline)  
**Backlog v3 (checkboxy):** `docs/WSS_ROADMAP_BACKLOG_V3.md`

---

## REGUŁA DLA KAŻDEGO NOWEGO CZATU (OBOWIĄZKOWO)

Na **końcu każdej sesji** (lub po większej zmianie) agent **dopisuje** do tego pliku:

1. Datę + 1–3 zdania „co zrobiono”
2. Nowe commity (`git log`)
3. Zmiany w produkcie / CMS / pipeline (jeśli dotyczy)
4. Nowe „Otwarte” lub zamknięte punkty
5. Aktualizację bloku **STARTING PROMPT** (skrót stanu) i **Ostatni commit**

Nie twórz osobnych handoffów — **ten plik jest jedynym źródłem prawdy** między czatami.

---

## MAPA STANU — zrobione vs do zrobienia (aktualizacja czat 33)

### WIP lokalnie (czat 33–37 — nie na `main`)

| Obszar | Stan | Uwagi |
|--------|------|--------|
| **Tło + NAV** | **User OK** | Płaskie ciemne · sam kolor · `wss-portal-page-theme-v5` |
| **Boksy homepage** | WIP | Flat · wyjątek: `homepage-ops-panel` (starty, misje) |
| **Artykuł dół** | **User OK** | `article-panel` — share, komentarze, Wróć, Czytaj dalej |
| **LOGO** | **C (Oswald)** — commit w kroku 0 | Martwe A/B w `wordmarks/` — posprzątać opcjonalnie |
| **Tło** | **User OK** · hardcoded `slate-soft` / `#060810` | Dev switchery **usunięte** |
| **Commit** | `f93415a` na main (CMS/hero/autor) |

**Theme (nie ruszać bez potrzeby):**
- `lib/ui/portal-page-themes.ts` · `portal-page-theme-vars.ts` · `app/globals.css`
- `components/brand/WssLogoWordmark.tsx` → tylko **Control**
- `app/layout.tsx` — Oswald (logo C)

**Pliki logo (iteracje odrzucone przez usera):**
- PNG wordmark · Syne + gradient · Cormorant serif · Unbounded · Bricolage · **Barlow Condensed** (za słabe)

**Research logo (czat 36 — użyć w czacie 37):**
| Brand | Font / styl | Lekcja |
|-------|-------------|--------|
| NASA Worm | Custom, grube litery, A bez poprzeczki | Wordmark > ilustracja |
| SpaceX | D-DIN Bold, CAPS, tracking 0.09–0.1em | Industrial, monochrome |
| Space.com | Bold sans, A bez poprzeczki | Kosmos = detal litery |
| Bloomberg | Avenir Heavy | Ciężki profesjonalny sans |
| The Verge | Manuka 900 | Condensed display 900 |
| Axios | Bold geometric + 1 zmodyfikowana litera | Jeden akcent wystarczy |

**Kierunek usera (logo):**
- **WSS** i/lub **WEB SPACE STATION** (oba OK)
- Separatory: `W|S|S`, kropki `·`, lub `—` między literami — user lubił **kierunek W·S·S**
- **Mocno**, wyraźnie — NIE klasyczny serif, NIE sci-fi gradient, NIE „słabe” fonty
- Prosto, elegancko, ale **z charakterem** — „jak mistrz developerski”

**Pliki WIP (pełniejsza lista):** theme powyżej + `ContentGrid.tsx`, `ArticlePageBodyMain.tsx`, `ShareBar.tsx`, `Comments.tsx`, `ArticleInteractions.tsx`, `ReadNextSection.tsx`, `aktualnosci/[slug]/page.tsx`, `Navbar.tsx`, `Footer.tsx`, `WssLogoWordmark.tsx`, `app/icon.svg`

---

## MAPA STANU — prod (`main` → `f93415a`)

### Zrobione i na `main` (prod)

| Obszar | Commit(y) | Co |
|--------|-----------|-----|
| **Linki w treści artykułu** | `a5ab17c` | Reguły (1–4 linki / długość), ranking tagi+dział+archiwum; fix: read-next nie wycina kandydatów |
| **Pakiet czat 26–30** | `ea7e3b0`, `f399d9b` | Hero slider, `heroPosition`, mobile depts, artykuł, stopka, CMS listy, nav, dyskusja mobile |
| **News Engine pipeline** | `3e7139b`+ | RSS→DRAFT→AI→REVIEW; ręczny PUBLISHED; cron 1×/dobę; public tylko PUBLISHED |
| **Logo, profil, mobile nav, daty CMS** | wcześniejsze | patrz tabela w starszych wpisach |

**Reguły niepodważalne:** okładka `object-cover` · najnowszy `publishedAt` = #1 · `heroPosition` nie wyklucza z Najnowszych · **NIE auto-publish RSS**.

### Do zrobienia — krok po kroku (czat 38+)

**Plik:** `docs/WSS_STEP_BY_STEP_BACKLOG.md`

| Krok | Zadanie |
|------|---------|
| **0** | Commit WIP UI | `[x]` `eb6fc60` |
| **1** | Usunąć Ważne teraz | `[x]` `18fc9a3` |
| **2** | Licznik REVIEW w CMS | `[x]` `e16931b` |
| **3** | Komentarze Supabase | `[x]` `14d1675` |
| **4** | Sitemap + JSON-LD | `[x]` `93f710b` |
| **5** | Zbudować sekcję „Odkrywaj” (galeria, wideo, kalendarz, mapa, starty) | `[x]` lokalnie |
| **6** | Prawdziwe API → ops panel homepage (zamiast LAUNCHES[] na sztywno) | `[x]` lokalnie |

**Reguła:** po każdym kroku → raport → test usera → **CZEKAJ OK** → następny.

**Znane luki:** newsletter w stopce bez API; `getRelatedArticles()` full scan; bulk publish REVIEW — później.

**Zamknięte czat 31–32:** dyskusja mobile · COMMIT-WIP · PROD-QA · weave links `a5ab17c`

---

## STARTING PROMPT — SKOPIUJ DO NOWEGO CZATU

```
Kontynuujemy WSS. Przeczytaj: docs/WSS_NEXT_CHAT_HANDOFF.md · docs/WSS_CONTENT_ARCHITECTURE.md (+ SITE_MAP_AUDIT, STEP_BY_STEP_BACKLOG).

REGUŁA: raport · test · CZEKAJ OK · push prod tylko po explicit OK.

=== STAN (czat 55, commit `529ae5e` lokalnie — NIE PUSH bez OK) ===

**Działy:** Misje → Astronomia → **Nauka** (`/nauka`) → Technologie → ISS → Ziemia → Rozrywka  
**Fundament:** `docs/WSS_CONTENT_ARCHITECTURE.md` (aktualność vs wiedza, proporcje treści)

**Front (czat 55):**
- Sekcja **Nauka** na homepage (pusta OK) · bez kickers/SEO/evergreen na froncie
- `weekTopic` bez podtytułu env · ops bez opisów dev pod mapą/listą
- Kontakt: **kontakt@webspacestation.pl** · bez RSS na stronie kontakt

**Okładki CMS (czat 54):** upload Supabase · `ArticleFigure` · hero CMS

**W centrum uwagi:** klaster New Glenn (6× Misje) · karty jednakowe · bez subtitle

**Otwarte:**
- QA: pierwszy artykuł w **Nauce** (user dodaje w CMS)
- Push prod po explicit OK
- `SUPABASE_SERVICE_ROLE_KEY` na Vercel Preview (opcjonalnie)

**Skrypty:** `content-arch:migrate` · `category:migrate-nauka` · `week-topic:reset-new-glenn`

Prod: https://webspacestation.pl
```

---

## Historia sesji (skrót)

### Sesja 5.06.2026 (czat 54) — okładki CMS · działy SEO · W centrum uwagi · Supabase upload

| Obszar | Stan |
|--------|------|
| **Okładki** | coverImage DB · upload WebP Supabase · grafiki w treści · hero adaptacyjny · live preview bez NASA override |
| **Supabase** | bucket `article-covers` · `SERVICE_ROLE_KEY` lokalnie + Vercel Prod/Dev |
| **Działy** | +Popularnonaukowe · AI→technologie · nav/footer/homepage · `content-arch:migrate` |
| **W centrum uwagi** | klaster New Glenn (6× Misje) · zarchiwizowano Altman/Trump AI · karty jednakowe |
| **Docs** | `WSS_CONTENT_ARCHITECTURE.md` · cursor rule alwaysApply |
| **Push** | **Nie** — commit lokalny, czeka OK usera |

**Pliki kluczowe:** `lib/media/cover-url.ts` · `ArticleHeroMedia.tsx` · `content-image.ts` · `WeekTopicSection.tsx` · `lib/categories.ts` · `scripts/reset-week-topic-new-glenn.ts`

### Sesja 4.06.2026 (czat 53) — mapa satelitarna ISS + nazewnictwo PL · handoff

| Obszar | Stan |
|--------|------|
| **Mapa** | Leaflet + Esri imagery · ground track ISS (Celestrak TLE + `satellite.js`) · telemetria · strefa widoczności |
| **ISS** | `wheretheiss.at` — lat/lon + wysokość + prędkość |
| **Platformy** | Współrzędne z LL2 `pad.latitude/longitude` — realne miejsca startów z harmonogramu |
| **Copy** | `localize-ops.ts` · **platforma startowa** zamiast wyrzutnia · statusy/misje po PL |
| **UX** | Usunięty podpis pod mapą · `OpsScheduleList` · `OpsCenterExplainer` · fix `"use client"` |
| **Deps** | `leaflet`, `react-leaflet`, `satellite.js` |
| **Push** | **Nie** — user: zapisz handoff → nowy czat |

**Pliki kluczowe (ops):** `lib/ops/iss-orbit.ts`, `localize-ops.ts`, `ops-terminology.ts`, `OpsLiveMap.tsx`, `OpsMissionMap.tsx`, `OpsIssTelemetry.tsx`, `ContentGrid.tsx`, `app/mapa/page.tsx`, `package.json`

### Sesja 4.06.2026 (czat 52) — Centrum operacyjne: audyt danych + UX czytelnik

| Obszar | Stan |
|--------|------|
| **Audyt danych** | Starty = LL2 ✅ · ISS = tracker ✅ · **oś czasu fallback** = wymyślone Artemis/Gateway/MSR ❌ → usunięte |
| **Mapa** | Fałszywa „kula Ziemi” + losowe piny przy braku coords ❌ → rzut Ziemi + legenda + tylko geo z API |
| **UX** | Opisy dla laika, „Na żywo teraz”, harmonogram z datami NET, rename: Mapa startów i ISS, Harmonogram startów |
| **Pliki** | `lib/ops/format-ops-display.ts`, `OpsMissionMap`, `OpsTimeline`, `OpsWorldMapSvg`, `OpsMapLegend`, `ContentGrid`, `/mapa`, `/kalendarz`, nav/stopka |
| **Push** | **Nie** — WIP lokalnie + wcześniejsze WIP powiadomienia/CMS czekają OK |

### Sesja 4.06.2026 (czat 51) — domknięcie WIP powiadomienia + CMS

| Obszar | Stan |
|--------|------|
| **Powiadomienia** | Test lokalny OK (czat 50) · dodane **Wyczyść** (ukrywa listę, nowe alerty wracają) |
| **Ulubione** | UX **Dodaj** / **W ulubionych** (przycisk + chipy profilu) |
| **CMS edytor** | Pełny podgląd (lg+), Preview przed publikacją, wyraźniejsze pola input |
| **Push** | **Czeka** — commit WIP + SQL prod + explicit OK usera |

### Sesja 4.06.2026 (czat 50) — test powiadomień + UX „Dodaj”

| Obszar | Stan |
|--------|------|
| **SQL lokal** | `user_department_subscriptions.sql` przez Prisma execute — OK |
| **Test E2E** | Dzwonek: starty + artykuł Rozrywka po ulubionych; toggle widoczny |
| **UX** | Przycisk: **Dodaj** (nieaktywny) → nazwa działu + „W ulubionych…” (aktywny); profil: `Dodaj · Misje` / `Rozrywka` gdy aktywny |
| **WIP lokalnie** | `DepartmentSubscribeButton.tsx`, `ProfileDepartmentSubscriptions.tsx` — **bez commita** |
| **Push** | **Nie** — czeka OK usera + SQL prod |

### Sesja 4.06.2026 (czat 49) — powiadomienia żywe + ulubione działy + panel w profilu

| Obszar | Stan |
|--------|------|
| **Powiadomienia** | Usunięte mocki; `GET /api/notifications` — starty LL2 + artykuły z subskrybowanych działów |
| **Ulubione działy** | `user_department_subscriptions` (Supabase SQL) · przycisk na stronach działów · profil |
| **Panel CMS** | `canAccessCms` w sesji · link „Panel redakcyjny” w profilu i menu konta |
| **Push** | **Czeka test usera** — commit lokalny, bez push w tej sesji |

**SQL wymagany:** `supabase/user_department_subscriptions.sql`

### Sesja 4.06.2026 (czat 47–48) — dział Rozrywka + push `a57fc36`

| Obszar | Stan |
|--------|------|
| **Rozrywka** | `/rozrywka`, homepage v2, sitemap, migrate gaming |
| **Commit** | `a57fc36` — **na prod po deploy** |

### Sesja 4.06.2026 (czat 47) — dział Rozrywka + okładki gaming + sitemap

| Obszar | Stan |
|--------|------|
| **Rozrywka** | Nowy dział `/rozrywka` — gaming przeniesiony z Technologie (7 slugów w DB + State of Play) |
| **Okładki** | Osobna mapa `ROZRYWKA_COVER_BY_SLUG`; State of Play = DB wydawcy; bez fałszywego „NASA”; bez PIA19807 w Technologie |
| **Treść** | Strip `**` w DB + `render-inline-markdown.tsx` |
| **Sitemap** | `SEO_SITEMAP_PATHS` + `/rozrywka` w `lib/seo/public-routes.ts` → `app/sitemap.ts` |
| **Migrate** | `npm run rozrywka:migrate` + `cache:revalidate` lokalnie |
| **Commit** | Brak — **czekaj OK** usera |

**Pliki kluczowe:** `lib/editorial/rozrywka.ts`, `scripts/migrate-gaming-to-rozrywka.ts`, `app/rozrywka/page.tsx`, `lib/seo/public-routes.ts`, `lib/editorial/resolve-editorial-cover.ts`

### Sesja 4.06.2026 (czat 46) — 21 artykułów + naprawa okładek

| Obszar | Stan |
|--------|------|
| **Editorial +6** | Europa Clipper, Perseverance/MSR, Parker Solar Probe, Dragonfly/Titan, KSP2, Hubble 36 lat |
| **Okładki** | Przyczyna „jedno zdjęcie”: URL-e 404 → `CoverImage` → jeden Unsplash; fix: `nasaCoverUrl()` + HTTP 200 `images-assets.nasa.gov` |
| **Kod** | `CoverImage` fallbackSeed/category · `resolve-image` slug fallback · `nasa-cover.ts` |
| **Seed** | `--update` **nie** poszedł (Supabase max clients) — user: retry bez dev lub później |
| **Commit** | Brak — **czekaj OK** usera |

### Sesja 4.06.2026 (czat 45, koniec) — 15 artykułów w repo · handoff na czat 46

| Obszar | Stan |
|--------|------|
| **Editorial** | **15** artykułów w `lib/editorial/` (misje, astronomia, technologie+gaming), news **4.06.2026** |
| **DB lokalna** | Było `--publish` w sesji — user: **finalna publikacja dopiero na końcu** |
| **Okładki** | User: **wszędzie to samo zdjęcie** — priorytet czat 46 przed publikacją |
| **Następny czat** | Więcej artykułów → unikalne okładki → na koniec publish + P1-6 + OPS-REVIEW |
| **Commit** | Brak — WIP `lib/editorial/`, seed, handoff |

### Sesja 4.06.2026 (czat 45, cd.) — 15× seed + publish (technicznie)

| Obszar | Stan |
|--------|------|
| **Seed** | `ALL_EDITORIAL_JUNE_2026` · `--update --publish` · cache revalidate |
| **Partia +11** | Tc1, 3I/ATLAS, Starlink 4.06, NMS, Star Fox, X4, Stellaris, SC, EVE, New Glenn, CRS-34 |

### Sesja 4.06.2026 (czat 44, koniec) — handoff na czat 45 · artykuły testowe odrzucone

| Obszar | Stan |
|--------|------|
| **Prod** | krok 5+6 + perf 83 + NASA key |
| **GSC** | User już właściciel (plik HTML) — bez ponownej weryfikacji |
| **Editorial** | 2 szkice w `lib/editorial/` — Roman w DB REVIEW; MAVEN seed fix `originalUrl` |
| **User** | Chce **długie, konkretne** artykuły w czacie 45 — nie krótkie szkice |
| **Odłożone** | GA / AdSense |
| **Następny czat** | Artykuły PRO → P1-6 → OPS-REVIEW |

### Sesja 4.06.2026 (czat 44, cd.) — perf push + PageSpeed OK

| Obszar | Stan |
|--------|------|
| **Push** | `22b0fb6` perf homepage |
| **PageSpeed user** | Wydajność **83** (było 68) · A11y 88 · SEO 100 |
| **Vercel** | `NEXT_PUBLIC_SITE_URL` OK · NASA + GSC — **czeka wartości od usera** |
| **GSC smoke** | `sitemap.xml` OK · meta verification **brak** (brak env) |
| **Następny** | User: NASA + GSC w Vercel → redeploy → GSC sitemap · P1-6 |

### Sesja 4.06.2026 (czat 44) — commit/push krok 5+6 + Vercel env + smoke prod

| Obszar | Stan |
|--------|------|
| **Push** | `a069877` → `origin/main` · Vercel deploy OK |
| **Vercel** | `NEXT_PUBLIC_SITE_URL` Production dodane; `NASA_API_KEY` / `GOOGLE_SITE_VERIFICATION` — **do ustawienia przez usera** |
| **Smoke prod** | `/starty` Starlink Group + odliczenie · `/` ops live · galeria/wideo/mapa 200 · sitemap z Odkrywaj |
| **type-check** | OK przed commitem |
| **Następny** | NASA klucz · GSC meta · P1-6 · OPS-REVIEW |

### Sesja 4.06.2026 (czat 43, koniec) — krok 5+6 Odkrywaj + ops API (lokalnie, bez commita)

| Obszar | Stan |
|--------|------|
| **Krok 5** | `/starty` `/kalendarz` `/mapa` `/galeria` `/wideo` — DiscoverPageShell + żywe feedy |
| **Krok 6** | Homepage ops z `getOpsData()` — bez mock LAUNCHES[] |
| **API** | LL2 **2.3.0** `/launches/upcoming/` · ISS wheretheiss.at · NASA · WSS Astronomia |
| **Bugfix** | URL `/launch/`→404→fallback 24:00:00; etykiety misji z `mission.name` |
| **SEO** | Wszystkie Odkrywaj w `SEO_SITEMAP_PATHS` |
| **User** | OK na starty · „lećmy dalej” · **zapisz na następny czat** (commit tam) |
| **Następny czat** | **Commit + push** → Vercel env → GSC → P1-6 lub REVIEW |

**Pliki kluczowe:** `lib/ops/get-ops-data.ts`, `launch-library.ts`, `components/discover/LaunchCard.tsx`, `LaunchCountdown.tsx`, `ContentGrid.tsx`, `app/starty|kalendarz|mapa|galeria|wideo/page.tsx`

### Sesja 4.06.2026 (czat 42) — krok 4 SEO push + handoff na czat 43

| Obszar | Stan |
|--------|------|
| **Push** | `93f710b` → `origin/main` · Vercel auto-deploy |
| **Sitemap** | działy + `/polityka-prywatnosci` + `/kontakt` + artykuły; **bez** `/search` i Odkrywaj |
| **robots.txt** | disallow admin/api/profil/auth |
| **JSON-LD** | WebSite + Organization + NewsArticle; `updatedAt` → dateModified |
| **E-E-A-T** | `/polityka-prywatnosci`, `/kontakt`, linki w stopce |
| **noindex** | 404, auth, Odkrywaj, brakujący slug |
| **manifest** | `app/manifest.ts` |
| **Artykuł UI** | `ArticleMainColumnShell` |
| **Następny czat** | **Krok 5** Odkrywaj · GSC po deploy (env Vercel) |

**Pliki kluczowe:** `lib/seo/*`, `app/sitemap.ts`, `app/robots.ts`, `app/polityka-prywatnosci/`, `app/kontakt/`, `components/article/ArticleMainColumnShell.tsx`

### Sesja 4.06.2026 (czat 41) — UI homepage v2, artykuł, stopka, NAV

| Obszar | Stan |
|--------|------|
| **Homepage** | v2: hero pełna szerokość shellu, Najnowsze 5 kart pod hero, Temat tygodnia pod spodem, 3 działy (Technologie/Astronomia/Misje), Popularne 4× |
| **Revert layoutu** | `HOMEPAGE_LAYOUT_V2 = false` w `lib/site-layout.ts` → stary układ hero + rail |
| **Artykuł** | Ten sam shell 1320px, szersza okładka, breadcrumb kompaktowy |
| **Stopka** | Przebudowa — kotwica marki + newsletter w lewej kolumnie |
| **NAV** | Pill track desktop, wyśrodkowane menu |
| **Następny czat** | Krok 4 SEO (sitemap, JSON-LD, GSC) |

**Pliki kluczowe:** `lib/site-layout.ts`, `HomepageTopZone.tsx`, `lib/ui/article-editorial-layout.ts`, `lib/ui/nav-desktop.ts`, `Footer.tsx`, `Navbar.tsx`

### Sesja 4.06.2026 (czat 40, koniec) — UI homepage + artykuł

| Obszar | Stan |
|--------|------|
| **Push** | `976c55d` — homepage 3 kolumny, sticky Temat tygodnia, artykuł sidebar |
| **Artykuł** | Informacje przy tytule; Powiązane pod Informacjami; okładka bez border |
| **Następny czat** | Krok 4 SEO |

### Sesja 4.06.2026 (czat 40) — krok 3 komentarze + push

| Obszar | Stan |
|--------|------|
| **Push** | `14d1675` → `origin/main` · Vercel auto-deploy |
| **Komentarze** | Supabase `article_comments` + RLS |
| **SQL** | Lokalnie: `prisma db execute --file supabase/article_comments.sql` — prod: ten sam skrypt w SQL Editor jeśli 404 |
| **Następny** | Krok 4 SEO · redakcja / weave artykułów |

### Sesja 4.06.2026 (czat 39) — push pakietu CMS/hero + nowy czat

| Obszar | Stan |
|--------|------|
| **Commit/push** | `f93415a` → `origin/main` |
| **CMS** | bulk, edytor 7 sekcji, preview obok tytułu/treści, autor, toggle fix |
| **Public** | hero meta pod okładką, Avatar use client |
| **Admin** | profil = nazwa + avatar w sidebarze |
| **Następny czat** | krok 3 Supabase komentarze |

### Sesja 4.06.2026 (czat 38) — krok 0 push + krok 1 cleanup

| Obszar | Stan |
|--------|------|
| **Krok 0** | `eb6fc60` |
| **Krok 1** | `18fc9a3` |

**Poza commitem (opcjonalnie później):** `WssWordmarkApex`, `WssWordmarkStation`, `WssLetterWCustom`, `wss-logo-variants.ts`, `build-log.txt`

### Sesja 4.06.2026 (czat 38, koniec) — kroki 0–2 na main + WIP CMS/hero/autor

| Obszar | Stan |
|--------|------|
| **Commity** | `e16931b` (krok 2) · WIP bez commita: bulk CMS, edytor bloków, autor, hero |
| **Następny czat** | Commit WIP (opcjonalnie) → krok 3 Supabase |

### Sesja 4.06.2026 (czat 37, koniec) — audyt pełny + backlog krok po kroku na czat 38

| Obszar | Stan |
|--------|------|
| **Logo** | Ustawione **C** (Oswald) · dev switchery usunięte |
| **Audyt** | `WSS_SITE_MAP_AUDIT.md` (pełny) + `WSS_STEP_BY_STEP_BACKLOG.md` |
| **Decyzje usera na czat 38** | Komentarze Supabase · Sitemap/JSON-LD · licznik REVIEW · wyrzucić Ważne teraz · API ops · zbudować Odkrywaj |
| **Commit** | **Brak** — krok 0 następnego czatu |

### Sesja 4.06.2026 (czat 37) — logo: 3 warianty → C + dev UI out

| Obszar | Stan |
|--------|------|
| **Research** | NASA Worm, SpaceX D-DIN, Bloomberg Avenir, Verge Manuka, Space.com, Axios — w raporcie czatu |
| **Warianty** | A Station (Saira 900 W·S·S) · B Apex (custom W + S\|S) · C Control (Oswald WSS lockup) |
| **Dev** | `LogoVariantSwitcher` + `LogoVariantBootScript` · localStorage `wss-logo-variant-v1` |
| **Fonty** | Barlow usunięty · Saira + Oswald w `layout.tsx` |
| **Favicon** | `icon.svg` — grubsze WSS, większy tracking |
| **Commit** | **Brak** — czeka OK usera na wariant |

### Sesja 4.06.2026 (czat 36, koniec) — UI flat OK · logo WIP · handoff na czat 37

| Obszar | Stan |
|--------|------|
| **Tło** | Płaskie ciemne — user **OK** (po odrzuceniu WhatsApp + gwiazd) |
| **Artykuł dół** | `article-panel` — share, komentarze, nawigacja — user **OK** |
| **Homepage ops** | `homepage-ops-panel` — Nadchodzące starty, Aktywne misje |
| **Logo** | Wiele iteracji (Syne, Cormorant, Unbounded, Bricolage, Barlow W\|S\|S) — **user: ciągle za słabe** |
| **Research** | NASA Worm, SpaceX D-DIN, Bloomberg, Verge Manuka, Space.com, Axios — zapisane w handoff |
| **Commit** | **Brak** — następny czat: logo jak mistrz → potem preset tła + commit pakietu |

### Sesja 4.06.2026 (czat 36) — UI-PAGE-THEME: WhatsApp-style naklejki (cofnięte)

| Obszar | Stan |
|--------|------|
| **Kierunek** | User: tło jak WhatsApp (szare + naklejki) → **wdrożone testowo** |
| **Tło** | 10 jasnych presetów z **oczywiście różnymi** kolorami + SVG doodle (rakiety, planety, gwiazdy…) |
| **Boksy** | **Przywrócone ciemne #0c1018** (koniec flat/transparent z czatu 35) |
| **Nowy plik** | `lib/ui/portal-wallpaper-patterns.ts` |
| **Storage** | `wss-portal-page-theme-v4` |
| **Commit** | **Brak** — czeka test usera 1–10 |

### Sesja 4.06.2026 (czat 35, koniec) — UI-PAGE-THEME: kosmos flat + 10 presetów

| Obszar | Stan |
|--------|------|
| **Iteracje** | Szare presety → ciemniejsze → **kosmos** (granat/czerń, nie szarość) |
| **Layout** | Usunięte obramowania boksów; treść transparent na tle |
| **Efekt tła** | `.site-cosmos` gwiazdy, glow, vignette, grain (tylko `data-portal-theme`) |
| **10 presetów** | Nazwy PL (Stacja orbitalna … Próżnia); domyślny `slate-soft` |
| **User** | „Zaczyna wyglądać ładnie” — **brak wyboru finalnego presetu** |
| **Commit** | **Brak** — handoff zapisany, następny czat: wybór + commit |

### Sesja 4.06.2026 (czat 34) — UI-PAGE-THEME: płaskie zestawy tło+boksy

| Obszar | Stan |
|--------|------|
| **Tło/NAV** | Jednolity `--color-page-fill`, bez gradientów i `--portal-page-glow` |
| **Zestawy** | 5 paczek w `portal-page-theme-vars.ts` (+ boot z JSON) — tło + space/hairline |
| **Boksy** | `card-surface` / `editorial-surface` płaskie, obramowanie `--portal-card-border` |
| **User** | Odrzucił gradienty — iteracja: płasko + kontrast bloków |
| **Commit** | **Brak** — czeka test usera |

### Sesja 4.06.2026 (czat 33) — LIGHT TEST tło+NAV · 5 presetów · za słaby kontrast

| Obszar | Stan |
|--------|------|
| **Tło** | Jasne tło strony + NAV; ciemne boksy bez zmian |
| **Dev** | 5 presetów + przełącznik „Tło” na localhost — **działa** |
| **User** | Presety **prawie identyczne** → naprawione czat 34 |
| **Inne WIP** | Artykuł offset pod NAV; stopka ciemny panel; logo `<img>` |
| **Commit** | **Brak** |

### Sesja 4.06.2026 (czat 32) — audyt OPS + weave links + prompt na nowy czat

| Obszar | Stan |
|--------|------|
| **Audyt roadmap** | OPS = redakcja REVIEW (pipeline OK); roadmap niezsynchronizowany z `a5ab17c` |
| **Weave links** | Fix read-next drain → do 4 linków; push `a5ab17c` |
| **Handoff** | Kolejność sensowna #0–#4 + STARTING PROMPT |
| **Następny czat** | OPS redakcja · opcjonalnie CMS-OPS-UX · P1-6 · weekTopic |

### Sesja 4.06.2026 (czat 31) — dyskusja mobile + commit WIP + prod

| Obszar | Stan |
|--------|------|
| **Dyskusja mobile** | ShareBar stack — user OK |
| **Commit/push** | `ea7e3b0`, `f399d9b`, `ab3989b` |
| **Weave (lokalnie→push czat 32)** | `a5ab17c` |

### Sesja 4.06.2026 (czat 30, koniec) — homepage działy + dół artykułu + stopka + handoff

| Obszar | Stan |
|--------|------|
| **Homepage działy &lt;lg** | `HomeSectionArticleFeed`, lead+lista, fix nagłówków — user OK |
| **Okładka artykułu PC** | `article-hero-frame.ts` — media `lg:` zamiast container queries |
| **Czytaj dalej** | `ReadNextSection`, `pickReadNextArticles`, CTA do działu — user OK |
| **Stopka nav** | `Footer.tsx` grid — user OK (to był właściwy „nav na dole”, nie hero) |
| **Hero breadcrumb** | `ArticleHeroBreadcrumb` — bonus, user: zostaje |
| **Commit** | Brak — następny czat: dyskusja mobile → commit → prod |
| **Następny czat** | `ArticleInteractions` mobile → COMMIT-WIP-30 → PROD-QA |

### Sesja 4.06.2026 (czat 29, koniec) — listy CMS + hero/nav + handoff na homepage mobile

| Obszar | Stan |
|--------|------|
| **CMS listy** | Przycisk „Dodaj punkt listy”, parser `<ul>`, testy — WIP lokalnie |
| **Live preview** | Wspólne `ArticlePageHero`/`ArticlePageBodyMain`; mobile OK; desktop `previewLayout` |
| **Hero artykułu / nav** | `BELOW_FIXED_NAV_OFFSET_CLASS` na `<main>` (jak homepage); `resolveImageOrFallback` |
| **Następny czat** | Działy homepage mobile · stopka · dół artykułu (dyskusja + czytaj dalej) |
| **Commit** | Brak — user idzie na nowy czat |

### Sesja 4.06.2026 (czat 28, koniec) — hero OK + homepage + nav + handoff na listy CMS

| Obszar | Stan |
|--------|------|
| **Hero artykułu** | <lg: czyste zdjęcie + meta pod spodem + offset pod nav; lg+: overlay; **user OK** |
| **Homepage** | Najnowsze lista mobile; hero≠latest; hero niższy mobile |
| **Linki w treści** | weave internal links |
| **Nav** | animowane menu |
| **Następny czat** | **CMS lista w treści** (przycisk w edytorze); potem commit |
| **Commit** | Brak |

### Sesja 4.06.2026 (czat 27, koniec) — homepage slider + hero artykułu WIP

| Obszar | Stan |
|--------|------|
| **Homepage hero** | Slider na **wszystkich** urządzeniach; `heroPosition` 1–4 w CMS; Najnowsze pod hero (mobile) |
| **DB lokalnie** | `npm run db:deploy` — migracja `20260604210000` OK (fix błędu `heroPosition` column) |
| **Hero artykułu** | `justify-end` + wyższy gradient mobile — user: **nadal za wysoko → następny czat** |
| **Inne WIP** | PNG logo, `ReadAlsoInline`, object-cover hero, bez CTA homepage |
| **Commit** | **Brak** — user idzie na nowy czat |

### Sesja 4.06.2026 (czat 27) — mobile hero slider, heroPosition, logo PNG

| Obszar | Stan |
|--------|------|
| **Pierwsza iteracja** | Slider tylko mobile → potem rozszerzony na desktop |
| **CMS** | `heroPosition` 0–4 |
| **Layout** | Najnowsze pod hero (mobile) |

### Sesja 4.06.2026 (czat 26) — hero artykułu editorial + logo SVG odrzucone

| Obszar | Stan |
|--------|------|
| **Hero artykułu** | Mobile overlay (tytuł na zdjęciu); iteracje contain (letterbox — **odrzucone**) → **ramka aspect-ratio + object-cover**; podpis zdjęcia nie koliduje z breadcrumb; `lib/ui/article-hero-frame.ts` |
| **Logo** | Próba SVG wordmark — user **odrzucił**; do redo / powrót PNG |
| **Commit** | **Brak** — WIP lokalnie, czeka QA usera |

### Sesja 4.06.2026 (czat 25, koniec) — logo wordmark v2 + zapis na nowy czat

| Obszar | Stan |
|--------|------|
| **Logo** | User dostarczył wordmark v2 (WSS + łuk + WEB SPACE STATION); czarne tło → PNG; `WssLogoWordmark` w nav (52px) i stopce (48px) |
| **Glob v1** | Zastąpiony wordmarkiem; pliki `wss-globe*.png` + skrypt zostają w repo |
| **Commit** | push na `main` przed nowym czatem |

### Sesja 4.06.2026 (czat 25) — deploy + profil + mobile nav + docs MAPA

| Obszar | Stan |
|--------|------|
| **Push prod** | `4ca8d46` → `4868232` (build fix) → `06e2d4d` (subskrypcje UI) + commit profil/mobile |
| **Vercel** | Build padał na ESLint `//` w JSX — naprawione `4868232` |
| **Profil** | Redesign `/profil` — hero, statystyki, sekcje, CTA |
| **Mobile** | Szukaj + powiadomienia — panele nie wychodzą poza ekran |
| **Docs** | Pełna MAPA zrobione/do zrobienia w tym pliku + roadmap v3 |

### Sesja 4.06.2026 (czat 25 start) — fix P0 Prisma authorByline

| Obszar | Stan |
|--------|------|
| **Prisma** | `npx prisma generate` po kill `node` (EPERM) — OK |
| **DB** | `npm run db:deploy` — 13 migracji, **no pending** (w tym `20260604200000`) |
| **Dev** | `.next` usunięty; smoke HTTP 200 na `/` i artykuł |
| **Commit** | **Brak** — czeka na user QA UI + CMS autor |

### Sesja 4.06.2026 (czat 24, koniec) — UI homepage + authorByline WIP · BLOCKER Prisma

| Obszar | Stan |
|--------|------|
| **UI homepage** | Motywy per sekcja (`DepartmentSectionFrame/Header`, `homepage-section-themes`); Najnowsze OK u usera; Popularne + działy + ops — osobny wygląd |
| **Temat tygodnia** | Usunięte „ten tydzień” z kickera; wzmocniony panel |
| **Hero mobile** | Większe zdjęcie, niższy blok zajawki (`HeroArticle.tsx`) |
| **Artykuł** | Breadcrumb jako chipy (`HeroBreadcrumbChip`); opcjonalny autor na hero |
| **CMS / DB** | Pole `authorByline` + migracja `20260604200000`; pole „Autor (opcjonalnie)” w edytorze |
| **BLOCKER** | `Unknown field authorByline` — **`npx prisma generate` nie wykonany** (EPERM przy działającym dev). **Następny czat: fix → QA → commit** |
| **Commit** | **Brak** — cały czat 24 lokalnie na `main` |

**Migracja:** `20260604200000_article_author_byline` — `ALTER TABLE articles ADD COLUMN authorByline TEXT` (lokalny Supabase: applied; prod: sprawdzić przy deploy).

**Nowe pliki (untracked):** `HeroBreadcrumbChip.tsx`, `DepartmentSectionFrame.tsx`, `DepartmentSectionHeader.tsx`, `HomepageSpotlightPanel.tsx`, `lib/home/homepage-section-themes.ts`, migracja powyżej.

### Sesja 4.06.2026 (czat 23) — push prod: week topic, daty, CMS, UI

| Obszar | Stan |
|--------|------|
| **Push** | `3e7139b` → `origin/main` · Vercel auto-deploy |
| **Temat tygodnia** | Autosave CMS nie zapisywał `weekTopic`; dev cache bypass; pick + hero fallback; bez podtytułu CMS |
| **Daty Najnowsze** | `publishedAt` immutable; etykieta bez `updatedAt`; idempotentny PUBLISH |
| **CMS** | Wyłączony autosave; **Zaktualizuj** = pełny zapis bez republish |
| **UI** | Usunięte podtytuły dev (Temat tygodnia, Najnowsze) |
| **Skrypty** | `week-topic:seed-dev`; `db:fix-published-at` dry-run domyślnie |

**Commity czat 23:** `3e7139b`

### Sesja 4.06.2026 (czat 22, koniec) — Temat tygodnia + BLOCKER widoczności

| Obszar | Stan |
|--------|------|
| **P1-6** | Upload okładek WebP + Supabase (`31a5525`) — `CoverImageUploader`, sharp, service role |
| **Homepage iteracje** | Ważne teraz slider → hero+2 → duży Temat tygodnia → **kompakt Temat tygodnia pod hero** (`5a5eb77`) |
| **Temat tygodnia** | Pole `weekTopic` + toggle CMS (nie tag); `WeekTopicSection` + `lib/home/week-topic.ts` |
| **Migracja** | Błąd `"Article"` → fix `"articles"` (`76cf517`); user: `db:deploy` OK lokalnie |
| **BLOCKER** | User: sekcja **nie widać** pod hero — **następny czat** |
| **Wyróżniony** | Podbija ranking (`featured`), nie to samo co `weekTopic` |

**Commity czat 22:** `31a5525` → `3d2301d` → `ccaacc5` → `9f5f0c0` → `5a5eb77` → `76cf517`

### Sesja 4.06.2026 (czat 21) — commit + push sesji 20

| Obszar | Stan |
|--------|------|
| **Deploy** | `8b447af` → `origin/main`; Vercel auto-deploy |
| **Hydration** | Fałszywy alarm — `data-cursor-ref` z przeglądarki Cursor, nie bug app |
| **Następny** | **P1-6** upload okładek |

### Sesja 3.06.2026 (czat 20, koniec) — lajki Krok 1+2, logo, tło, ShareBar

| Obszar | Stan |
|--------|------|
| **Lajki Krok 1** | `supabase/user_article_likes.sql` — tabela, widok `article_like_counts`, RPC `toggle_article_like`, `my_liked_article_slugs`; `lib/likes/article-like-counts.ts` |
| **Lajki Krok 2** | `useArticleLikes` + `LikeButton`: toggle, login gate; profil z DB; wycofany localStorage/`increment_like` w UI |
| **ShareBar** | Usunięty zduplikowany label „Udostępnij” |
| **Logo** | `WssLogoMark` — wektor „okno stacji”; `app/icon.svg` |
| **UX-BG** | Ciemny newsroom (nie Windows) — WIP lokalnie |
| **Hero artykułu** | Fix z-index okładki — **user OK lokalnie** |
| **Następny czat** | Commit WIP → **P1-6** upload okładek (WebP, sharp) |

**Supabase:** `user_article_likes.sql` uruchomiony przez usera.

### Sesja 3.06.2026 (czat 20, cd.) — UX-BG v2 + logo Ziemia

| Obszar | Stan |
|--------|------|
| **UX-BG v2** | User: v1 za jasne / Windows → **ciemny newsroom**: głęboka baza `#050709`, subtelna mgławica (11% max), gwiazdy, grain, winieta. Bez aurory działów / łuku / horyzontu. |
| **Logo** | `WssLogo` — okrągła Ziemia (`public/brand/earth.jpg`), WSS + Web Space Station (xl) + „Portal informacyjny o kosmosie”; favicon w `layout.tsx`. |
| **Pliki** | `SiteBackground.tsx`, `globals.css`, `components/brand/WssLogo.tsx`, `Navbar.tsx`, `public/brand/earth.jpg` |
| **Następny krok** | User QA tło + logo → OK → commit WIP |

### Sesja 3.06.2026 (czat 20) — UX-BG jaśniejsze tło (v1 — odrzucone)

| Obszar | Stan |
|--------|------|
| **UX-BG** | Nowe tło „świt orbitalny”: jaśniejsza baza (#0c1430), aurora w kolorach działów (misje/astronomia/technologie/ziemia/ISS), łuk orbitalny, blask horyzontu, jaśniejsze gwiazdy, delikatna siatka. **Lokalnie — czeka QA usera.** |
| **Pliki** | `components/layout/SiteBackground.tsx`, `app/globals.css` (`.site-cosmos-*`), `app/layout.tsx` (themeColor) |
| **Następny krok** | User testuje tło → OK → commit WIP; potem P1-6 |

### Sesja 3.06.2026 (czat 19, koniec) — deploy, layout rail, tło WIP

| Obszar | Stan |
|--------|------|
| **P0-DEPLOY** | Vercel Hobby **odmawiał buildu** — cron `publish-scheduled` `* * * * *` w `vercel.json`. Fix: usunięty cron (`794d53d`, user push). Wcześniej prod ~4h bez nowych commitów sesji 18. |
| **db:deploy / cache** | Migracje OK na prod. `cache:revalidate` naprawiony lokalnie (fallback `webspacestation.pl`). |
| **Homepage layout v2** | Desktop: Hero + panel boczny (Najnowsze pionowo 5 szt. + Ważne teraz inny styl). Mobile: slidery pod hero, strzałki też na telefonie. **Lokalnie, bez commita.** |
| **Kolory / tło** | `SiteBackground` — ciemne mgławice, gwiazdy, siatka; mocniejsze nagłówki działów, navbar, karty. **User: za ciemne / mało ciekawe → kolejny czat: jaśniejsze tło.** |
| **Scheduler** | User: nie priorytet, kod może zostać, nie musi działać ściśle. |
| **Następny czat** | **UX-BG** (tło jaśniejsze, ciekawsze) → potem P1-6 |

**Commit na remote:** `794d53d` · **WIP lokalnie:** ~17 plików (patrz git status)

### Sesja 3.06.2026 (czat 18, koniec) — scheduler QA, homepage slidery, coverImageCredit

| Obszar | Stan |
|--------|------|
| P0-SCHED-QA | Legacy RSS (excerpt bez content) może Zaplanuj/Opublikuj; panel Publikacja (REVIEW → Zaplanuj +2 min); ScheduledPublishPoller co 30 s; cache fix po auto-publish; `publishedAt = publishAt` — **user OK** |
| Homepage layout | Jedna kolumna: Hero → Najnowsze (`LatestShowcase`) → Ważne teraz (`ImportantNowSlider`) → Popularne (bez duplikatów `HomeSidebar`); `HorizontalScrollSlider` ze strzałkami + scroll kółkiem, bez drag na kartach |
| Ranking UI | HERO = `pickHeroLead`; Ważne teraz = `rankImportantNow`; Najnowsze = `rankLatest`; Popularne = `rankPopular` (likes×8 + score) |
| CMS podpis zdjęcia | DB `coverImageCredit`; pole w ArticleEditor; priorytet: ręczny > auto RSS (`lib/articles/image-credit.ts`); **prod wymaga `npm run db:deploy`** |
| Następny czat | P1-6 upload okładek |

**Commity sesji 18 (chronologicznie):** `b7a0ca6` → `cff809b` → `504c779` → `3994a66` → `241ba6e` → `39c8a9e`

### Sesja 3.06.2026 (czat 17, koniec) — 9× Najnowsze, hero, handoff pod punktowy workflow

| Obszar | Stan |
|--------|------|
| Homepage Najnowsze | 9 kart (`LATEST_LIMIT = 9`), siatka 3×3 bez pustego slotu |
| Chronologia | `pickHomepageLatest` = jak Aktualności — user potwierdził |
| Hero meta | `HeroMetaChip` — user OK |
| Następny czat | Reguła: 1 priorytet → raport → test usera → pytanie o kolejny |

### Sesja 3.06.2026 (czat 17) — Najnowsze + hero meta

| Obszar | Stan |
|--------|------|
| Homepage Najnowsze | `pickHomepageLatest` — bez wykluczania hero; `revalidatePath('/')` |
| Aktualności + Najnowsze | Ten sam porządek `publishedAt` — user potwierdził |
| Roadmap v3 | Priorytety teraz + statusy S16–S17 |

### Sesja 3.06.2026 (czat 16) — P0-SCHED + Archiwum CMS

| Obszar | Stan |
|--------|------|
| Cron publish-scheduled | `* * * * *` w vercel.json |
| publishedAt przy auto-publish | = `publishAt` (nie `now()`) |
| Dev scheduler | `publish:scheduled:watch` |
| **Archiwum** w Artykuły | zakładka „Archiwum” w `/admin/articles` — bulk trwałe usuwanie z DB |
| Lista Artykuły (ALL) | bez `ARCHIVED` — archiwum tylko w dziale Archiwum |
| API | `POST /api/articles/permanent-delete` `{ ids: [] }` |

### Sesja 3.06.2026 (czat 14–15) — preview, Najnowsze, scheduler UX (**BLOCKER cron**)

**Cel:** naprawy z czatu usera (okładka preview, kolejność Najnowsze, zaplanowana publikacja).

| Obszar | Stan |
|--------|------|
| Live preview + Preview publikacji | Okładka tylko z pola URL (`resolveHeroDisplayUrl`, `formToPreviewArticle` bez fallback) |
| `/aktualnosci` Najnowsze | `getLatestArticles` + `publishedAt desc` w DB |
| Homepage sekcja Najnowsze | `rankLatest` na puli z `getPublishedArticles` (publishedAt desc) |
| `timeLabel` („X min temu”) | Od `publishedAt` — **nowe** publikacje OK; stare po backfill mogą mieć zbliżony czas — user akceptuje |
| Zaplanuj UI | `schedule-datetime.ts` — dzień / miesiąc (PL) / rok / godz 00–23 / min (bez AM/PM) |
| Autosave vs termin | `publishAtLocal` zachowany przy silent autosave |
| **Zaplanuj o 22:06** | **NIE działa automatycznie** — cron nie odpala w minucie; zostaje SCHEDULED |
| Workaround (tymczasowy) | `POST /api/articles/publish-scheduled`, przyciski „Opublikuj teraz (termin minął)” — **user: to ma działać samo, nie obejścia** |

**Pliki nowe/zmienione (lokalnie):** `lib/admin/schedule-datetime.ts`, `lib/ui/schedule-datetime.test.ts`, `app/api/articles/publish-scheduled/route.ts`, `lib/admin/preview-article-server.ts`, `ArticleEditor.tsx`, `ArticlePublicPreview.tsx`, `ArticleFeedSection.tsx`, `lib/server/articles.ts`, `lib/articles.ts`, `app/admin/articles/page.tsx`, `docs/WSS_ROADMAP_BACKLOG_V3.md`, …

**Następny czat:** naprawa publikacji w **dokładnej** minucie `publishAt` (infra + ewent. cron frequency).

### Sesja 3.06.2026 (czat 13) — CMS polish (zapis, preview, czas publikacji)

**Cel:** domknięcie workflow edycji po hard-locku — UX zapisu, okładka w preview, poprawna data publikacji.

| Obszar | Fix |
|--------|-----|
| Nowy artykuł 409 | `articleIdRef` + blokada równoległego POST; autosave po create → PATCH |
| REVIEW → Szkic | „Zapisz szkic” → content + transition `DRAFT` |
| Lista CMS | sort `updatedAt desc` (nie `createdAt`) |
| Live preview okładka | native `<img>` w embedded; URL z formularza natychmiast |
| Opublikuj = najnowszy | `publishedAt = now()` przy każdym PUBLISH; RSS ingest `publishedAt: null` |
| Najnowsze (homepage) | `rankLatest` po `publishedAt` |
| Backfill | `npm run db:fix-published-at` — 39 opublikowanych (w tym Tajfun Jangmi) |

**Pliki (lokalnie, bez commit):** `ArticleEditor.tsx`, `ArticlePublicPreview.tsx`, `lib/server/articles.ts`, `lib/rss/ingest.ts`, `lib/articles.ts`, `rank-articles.ts`, `scripts/fix-published-at.ts`, …

### Sesja 3.06.2026 (czat 12) — hard-lock Article architecture

**Cel:** CMS = API = DB = public — jeden flow statusów, zero inferencji w UI/API.

| Obszar | Zmiana |
|--------|--------|
| Status | `articleStateTransition()` — DRAFT / REVIEW / PUBLISH / SCHEDULE; usunięto `publishArticle`, `scheduleArticle`, `transitionArticleStatus` |
| Create | Zawsze DRAFT w DB, potem transition |
| API PATCH | `statusToAction` → `articleStateTransition` |
| Trace | `ARTICLE_STATE_TRANSITION`, `ARTICLE_API_RESPONSE`, `ARTICLE_CMS_RENDER` |
| Preview | `resolveImageOrFallback()` — parity z public; bez `heroFromFormOnly` |
| Deploy | push `b2e6ea6`, db:deploy OK, PR-H4 backfill (1 rekord) |

### Sesja 3.06.2026 (czat 11) — CMS/API/DB/public spójność (audit fix)

**Broken:** autosave nadpisywał status; `updateArticle` przyjmował status z payloadu; preview ≠ public (`image` vs `imageUrl`); domyślny filtr REVIEW ukrywał Szkice.

| Obszar | Fix |
|--------|-----|
| Status | `updateArticle` = tylko content; `transitionArticleStatus` / `publishArticle` / `scheduleArticle`; autosave bez status |
| Trace | `ARTICLE_WRITE_*`, `ARTICLE_STATUS_CHANGE`, `ARTICLE_FETCH_CMS/PUBLIC` (dev) |
| Image | `resolveImage()`; DB `coverImage` → public `image`; usunięto `imageUrl` z `NewsArticle` |
| CMS | przycisk „Do sprawdzenia”; filtr domyślny **Wszystkie**; preview cover bez debounce |

### Sesja 3.06.2026 (czat 10) — CMS read/write path fix (status + image + lista)

**Broken:** autosave wysyłał `status: DRAFT` zanim załadował REVIEW z API; preview hero tylko z `image` (bez fallback `imageUrl`); domyślny filtr CMS = REVIEW (ukrywał Szkice).

| Plik | Fix |
|------|-----|
| `ArticleEditor.tsx` | autosave bez `status`; gate do `loadedArticle` |
| `app/admin/articles/page.tsx` | domyślny filtr **Wszystkie** |
| `lib/articles.ts` | `image` = tylko DB `coverImage`; `imageUrl` = cover + fallback |
| `lib/ui/article-hero-image.ts` | `resolveHeroImage` — preview = public hero |
| `ArticlePublicPreview.tsx` | używa `resolveHeroImage` |

### Sesja 3.06.2026 (czat 9) — article write path (create/update persistence)

**Problem:** status / coverImage / content niespójne między CMS, API a public; obrazy z aliasów `image`/`imageUrl` nie trafiały do DB.

| Plik | Zmiana |
|------|--------|
| `lib/server/article-fields.ts` | `coverImage \|\| imageUrl \|\| image` → DB `coverImage` |
| `lib/server/validation.ts` | create/update parse cover; update nie nadpisuje cover bez kluczy obrazu |
| `lib/server/articles.ts` | jawny `buildPrismaUpdateInput`; dev `ARTICLE WRITE` log |
| `ArticleEditor.tsx` | explicit `status` na create (DRAFT) i update |
| `lib/articles/article-write.test.ts` | testy mapowania cover |

Test: `npm run test:articles` · `npm run type-check`

### Sesja 3.06.2026 (czat 8) — homepage ranking fallback (UI only)

**Problem:** artykuły PUBLISHED w `/api/articles` nie pojawiały się w sekcjach homepage (dedupe + pusty pool po wykluczeniu slugów).

| Plik | Zmiana |
|------|--------|
| `lib/home/rank-articles.ts` | `withSectionFallback`; `rankPopular` / `rankImportantNow` z gwarancją niepustej sekcji |
| `ContentGrid.tsx` | fallback sekcji; kategorie z `allPublished` gdy bucket pusty; dev logi |
| `PopularArticles.tsx` / `HomeSidebar.tsx` | pool = pełna lista gdy exclude wycina wszystko |

Test: `npm run test:ui`

### Sesja 3.06.2026 (czat 7) — fix obrazów w preview (UI only)

**Problem:** hero nie renderował okładek w live preview, podglądzie publikacji ani `ArticlePublicPreview`.

**Cel:** jedno pole `image` w modelu preview; hero tylko z `article.image`; fallback gradient bez crasha.

| Plik | Zmiana |
|------|--------|
| `lib/admin/preview-article.ts` | `resolvePreviewImageFromForm` — `imageUrl \|\| coverImage \|\| image`; `formToPreviewArticle` ustawia `image` + `imageUrl` |
| `components/article/ArticlePublicPreview.tsx` | hero z `article.image`; dev `console.log("PREVIEW IMAGE:", …)`; `unoptimized` w embedded |
| `types/index.ts` | opcjonalne `NewsArticle.image` |
| `lib/articles.ts` | `toNewsArticle` ustawia `image` (podgląd z DB / preview route) |
| `lib/ui/preview-article.test.ts` | testy mapowania `image` |

**Nie ruszano:** API, DB, RSS, workflow, ranking, contentOrigin.

Test: `npm run test:ui` · `npm run type-check`

### Sesja 3.06.2026 (czat 6) — PR12 collapsible admin sidebar (UI only)

| Plik | Rola |
|------|------|
| `AdminShell.tsx` | layout shell, mobile drawer, localStorage |
| `AdminSidebar.tsx` | collapse, tooltips, animacja width 300ms |
| `lib/ui/admin-sidebar-storage.ts` | persist key |

### Sesja 3.06.2026 (czat 5) — PR11 live preview editor (CMS UI only)

**Cel:** split-screen editor + 1:1 preview artykułu, desktop/mobile, debounce, bez API.

| Plik | Rola |
|------|------|
| `ArticleEditor.tsx` | split layout + `ArticleEditorPreviewPane` |
| `ArticlePublicPreview.tsx` | hero + body parity z portalem |
| `ArticleEditorPreviewPane.tsx` | debounce + viewport toggle |
| `lib/admin/preview-article.ts` | `formToPreviewArticle` |

Test: `npm run test:ui`

### Sesja 3.06.2026 (czat 4) — PR10 publishing scheduler

**Cel:** auto-publikacja SCHEDULED po `publishAt`; minimalna integracja CMS; bez zmian RSS/AI/front.

| Plik | Rola |
|------|------|
| `prisma/migrations/20260603160000_article_publish_at/` | kolumna `publishAt` + indeks |
| `lib/articles/schedule-publisher.ts` | logika due/skip (pure) |
| `lib/server/articles.ts` | `scheduleArticle`, `runScheduledPublish` |
| `app/api/cron/publish-scheduled/route.ts` | cron worker |
| `app/api/cron/rss/route.ts` | daily hook schedulera |
| `components/admin/ArticleEditor.tsx` | Opublikuj teraz / Zaplanuj |

Test: `npm run test:articles` · `npm run type-check`

### Sesja 3.06.2026 (czat 3) — PR9 related articles + read next (presentation only)

**Cel:** Netflix-style UX na stronie artykułu — powiązane treści + „Czytaj dalej”, bez zmian API/DB/CMS.

| Plik | Rola |
|------|------|
| `lib/article/related-articles.ts` | `calculateRelatedScore`, `pickRelatedArticles`, `pickReadNext` |
| `lib/articles.ts` | `tags` w `toNewsArticle`; `getReadNextArticle` |
| `app/aktualnosci/[slug]/page.tsx` | sekcje Powiązane artykuły + Czytaj dalej |
| `lib/ui/related-articles.test.ts` | testy scoringu i feed order |

Test: `npm run test:ui` · `npm run type-check`

### Zamknięcie czatu 2 (3.06.2026) — PR-H5 + PR7 + PR8

**Zrobiono:** semantic fix CMS typ (`contentOrigin` public / source CMS), uproszczenie CMS (PR7), ranking homepage (PR8). Commit + push.

### Sesja 3.06.2026 (cd.) — PR8 homepage ranking (presentation only)

**Cel:** 3 sekcje newsroom — Ważne teraz, Najnowsze, Popularne — bez zmian API/DB.

| Plik | Rola |
|------|------|
| `lib/home/rank-articles.ts` | `rankArticles`, `rankImportantNow`, `rankLatest`, `rankPopular` |
| `ContentGrid.tsx` | dynamiczne sekcje, dedupe slugów, max 6–8 artykułów |
| `PopularArticles` / `HomeSidebar` | ten sam ranking co główna kolumna |

Test: `npm run test:ui` (w tym `rank-articles.test.ts`)

### Sesja 3.06.2026 (cd.) — PR7 CMS final simplification (UI only)

**Cel:** jeden prosty newsroom — bez RSS/AI/contentOrigin w CMS copy.

| Plik | Zmiana |
|------|--------|
| `lib/ui/article-kind.ts` | `cmsArticleTypeLabel(source, url)` → Artykuł / Źródło zewnętrzne |
| `ArticlesTable` | kolumna Typ; bez contentOrigin |
| `ArticleEditor` | „Dopracuj tekst”, „Źródło (opcjonalne)”, panel bez terminologii systemowej |

Test: `npm run test:ui`

### Sesja 3.06.2026 (cd.) — PR-H5 UX semantic fix (UI only)

**Cel:** rozdzielić `contentOrigin` (typ) od `source/url` (atrybucja); usunąć heurystyki source+url w UI.

| Plik | Zmiana |
|------|--------|
| `lib/ui/article-kind.ts` | `isRssArticle(contentOrigin)`, `RSS` / `Artykuł redakcyjny`; `hasSourceAttribution(url)` |
| CMS lista / edytor / preview | typ z `contentOrigin`; atrybucja niezależnie |
| `types` + `lib/articles.ts` | `NewsArticle.contentOrigin` dla public layout |
| `app/aktualnosci/[slug]` | layout RSS po `contentOrigin`, stopka po URL |

Test: `npm run test:ui`

### Sesja 3.06.2026 (cd.) — PR6.1 UX terminology lock (UI only)

**Cel:** zamrożenie warstwy UX — tylko 2 koncepcje w copy; brak Typ/Jakość/AI w UI.

| Plik | Zmiana |
|------|--------|
| `components/admin/ArticlesTable.tsx` | Usunięte kolumny Typ + Jakość; etykieta rodzaju pod tytułem |
| `components/admin/ArticleEditor.tsx` | „Popraw treść” (neutralne); bez pipeline copy |
| `components/sections/HeroArticle.tsx` | Usunięty badge „Artykuł redakcyjny” na froncie |
| `lib/ui/article-kind.ts` | Komentarz UX lock PR6.1 |

Test: `npm run test:ui`

### Zamknięcie sesji czatu 3.06.2026 — podsumowanie (commit + deploy)

**Wcześniejszy remote prod:** `1d973e6`. **Zrobiono (kolejno w czacie):**

1. CMS Unification + `contentOrigin` (PR1/PR2B)
2. PR3 — RSS ingest/process → `contentOrigin: RSS`
3. PR5 — UX editorial (Subskrypcje, bez „Ze świata”)
4. Workflow — `SCHEDULED`, `publishArticle()`, testy
5. AI layer — `aiScore` read-only w GET API
6. PR6 — jeden język UI (`lib/ui/article-kind.ts`)
7. PR6.1 — UX lock (terminologia, bez Typ/Jakość na liście CMS)

**Deploy:** commit → push main → `npm run db:deploy` (DIRECT_URL) → Vercel auto-deploy.

### Sesja 3.06.2026 (cd.) — PR6 UX language layer (UI only)

**Cel:** tylko 2 koncepcje w UI — „Artykuł redakcyjny” / „Źródło zewnętrzne”; decyzje po `source`+`url`, **nie** `contentOrigin`.

| Plik | Zmiana |
|------|--------|
| `lib/ui/article-kind.ts` | `hasExternalSource`, etykiety editorial/external |
| CMS lista / edytor / preview | bez RSS/AI/pipeline w copy; „Dopracuj treść”; kolumna „Jakość” |
| Public | hero „Artykuł redakcyjny”; meta chips bez chipu wydawcy; źródło w stopce |

Test: `npm run test:ui`

### Sesja 3.06.2026 (cd.) — AI intelligence (read-only)

**Cel:** `aiScore` on-the-fly w API; bez DB, workflow, rankingu.

| Plik | Rola |
|------|------|
| `lib/ai/article-score.ts` | `calculateArticleScore()` 0–100, `resolveAiScore()` |
| `lib/ai/enrich-response.ts` | `withAiScore(s)` dla GET API |
| `lib/ai/related-articles.ts` | scaffold tag-overlap (bez embeddings) |
| API GET | `{ ...article, aiScore: number \| null }` |
| CMS | kolumna „Score AI” (`xl:table-cell`, z API) |

Test: `npm run test:ai`

### Sesja 3.06.2026 (cd.) — Article workflow (status-only lifecycle)

**Cel:** `status` jako jedyny driver workflow; enum + `SCHEDULED`; `publishArticle()`.

| Obszar | Co zrobiono |
|--------|-------------|
| DB | `ArticleStatus.SCHEDULED` — migracja `20260603140000_article_status_scheduled` |
| Core | `lib/articles/workflow.ts` — validate publish, `publishedAt` patches, `WORKFLOW_STATUSES` |
| Server | `createArticle`/`updateArticle`/`publishArticle` — explicit status only; `ArticleWorkflowError` |
| API | PUBLISHED validation (title+content+category); PATCH `{ status: PUBLISHED }` → `publishArticle` |
| CMS (minimal) | Filtry: Szkic / Do sprawdzenia / Opublikowane / Zaplanowane; StatusBadge labels |
| Test | `npm run test:workflow` / `test:articles` |

**Nie ruszano:** RSS ingest/AI pipeline, contentOrigin, ranking, front layout.

### Sesja 3.06.2026 (cd.) — PR5 UX workflow (UI only)

**Cel:** CMS i front brzmią jak newsroom — bez RSS/pipeline w copy.

| Obszar | Co zrobiono |
|--------|-------------|
| Lista CMS | Filtry: Szkice (REVIEW), Do sprawdzenia (DRAFT); badge „Zewnętrzne źródła”; usunięte Surowy RSS / AI OK / Ze świata |
| Edytor | „Ulepsz tekst”, „Źródło zewnętrzne (edytowalne)”, sekcja „Źródło artykułu” |
| Public | Usunięto chip „Ze świata”; Źródło: subtelny footer „Źródło: [wydawca]” |
| /rss | → „Subskrypcje”; bez XML preview i debug copy |
| Footer / sekcje | „Subskrypcje” zamiast „Kanały RSS” |

**Nie ruszano:** backend, pipeline, contentOrigin, API, rankingi.

### Sesja 3.06.2026 (cd.) — PR3 RSS pipeline alignment

**Cel:** RSS ingest/process ustawiają `contentOrigin: RSS`; origin immutable po create.

| Obszar | Co zrobiono |
|--------|-------------|
| PR3 ingest | `lib/rss/ingest.ts` — `contentOrigin: RSS` przy `prisma.article.create` |
| PR3 process | `lib/rss/process-drafts.ts` — explicit `contentOrigin: RSS` w update (bez fallback/inferencji) |
| Guard | `lib/server/articles.ts` — `delete contentOrigin` z payloadu update; komentarz HARD RULE |
| Docs | `lib/articles/content-origin.ts` — systemowa reguła immutability |
| Test | `npm run test:content-origin` — CMS klasyfikuje tylko po `contentOrigin` |

**Pliki PR3:** `lib/rss/ingest.ts`, `lib/rss/process-drafts.ts`, `lib/server/articles.ts`, `lib/articles/content-origin.ts`, `lib/articles/content-origin.rules.test.ts`, `package.json`

**Nie ruszano:** UI, rankingi, heurystyki frontu.

### Sesja 3.06.2026 — CMS Unification + hotfix `contentOrigin`

**Cel:** jeden edytor; `contentOrigin` = proweniencja, nie cytat.

| Obszar | Co zrobiono |
|--------|-------------|
| DB (Step 1) | Enum `ArticleContentOrigin`, migracja + backfill SQL, `npm run db:backfill-content-origin` |
| CMS editor (Step 2) | Unified `ArticleEditor` — pełny payload, pola tagów/źródła, bez readonly |
| Hotfix PR1 | `createArticle` → `EDITORIAL`; `updateArticle` nie nadpisuje `contentOrigin` |
| Hotfix PR2B | CMS UI: `canRunRssAi`, badge, `rss-display` — **tylko** `contentOrigin === "RSS"` |

**Pliki zmienione (lokalnie, nie na `main` remote):**
`prisma/schema.prisma`, `prisma/migrations/20260603120000_article_content_origin/`, `lib/articles/content-origin.ts`, `lib/server/articles.ts`, `lib/server/validation.ts`, `lib/admin/types.ts`, `lib/admin/api.ts`, `lib/admin/rss-display.ts`, `components/admin/ArticleEditor.tsx`, `components/admin/ArticlesTable.tsx`, `package.json`, `scripts/backfill-content-origin.ts`

**Nie zrobiono w tej sesji:** commit, deploy prod, korekta DB (PR-H4), front/ranking po `contentOrigin`.

### Sesja 2.06.2026 (wieczór) — prod + CMS RSS

- Fix Vercel `DATABASE_URL` (6543 + pgbouncer)
- CMS: linki RSS, Popraw z AI, podgląd, cron Hobby 1×/dzień
- ~175 artykułów REVIEW po demote-backfill

### Sesja 2.06.2026 (kontynuacja) — B+ hybryda + fixy

| Commit | Co |
|--------|-----|
| `17364cd` | Fix autosave vs Popraw z AI; jeden przycisk podglądu |
| `7c1cc3e` | **B+**: `contextNote`, lead/body/context w AI, UI artykułu, CMS uproszczony |
| `24f78d3` | Fix mapowanie `body` → `Article.content`; autosave RSS nie czyści AI pól |
| `e759397` | Usunięty meta-disclaimer pod boxem „Kontekst WSS” (czytelnik) |

**Decyzja produktowa:** nie czysty agregator (A), nie full AI newsroom (C) — **B+ hybryda**: RSS jako input + lead + body + kontekst WSS + link źródła.

---

## 1. Produkcja (krytyczne — bez zmian)

### DATABASE_URL (Vercel Production)

```
postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

- `DIRECT_URL` (5432) — **tylko lokalnie** do `npm run db:deploy`
- Po zmianie env: redeploy Production

### Migracje Prisma

```bash
npm run db:deploy   # wymaga DIRECT_URL
```

**7. migracja (B+):** `20260602180000_article_context_note` — kolumna `contextNote TEXT NULL`  
Bez tego na prod: błędy Prisma po deployu kodu B+.

### Deploy

- GitHub `main` → auto-deploy Vercel
- Cron: `0 6 * * *` (Hobby, raz dziennie)

---

## 2. Pipeline RSS (B+ hybryda)

```
INGEST (lib/rss/ingest.ts)           → DRAFT (EN, content="", contentOrigin=RSS)
AI (process-drafts + enrich-drafts)  → REVIEW (B+ pełne pola, contentOrigin=RSS)
CMS                                  → PUBLISHED ręcznie
FRONT                                → tylko PUBLISHED
```

### OpenAI — strict JSON (per item)

```json
{
  "title": "tytuł PL",
  "lead": "1-2 zdania, fakty, BEZ wydawcy w tekście",
  "body": ["akapit 1", "akapit 2", "..."],
  "context": "2-3 zdania trend / kontekst WSS, bez nowych faktów",
  "tags": [],
  "category": "Space"
}
```

### Mapowanie do Prisma (`lib/rss/apply-enrichment.ts`)

| AI | DB |
|----|-----|
| `title` | `title` |
| `lead` | `excerpt` |
| `body[]` | `content` (join `\n\n`) |
| `context` | `contextNote` |
| `tags` | `tags` |
| `category` | `categoryId` (via slug) |

**Pliki:** `lib/rss/enrich-drafts.ts`, `apply-enrichment.ts`, `process-drafts.ts`, `reprocess-rss-article.ts`

### SAFE MODE (stare artykuły)

- `contextNote` nullable — stare REVIEW bez kontekstu **nadal publikowalne**
- Stare wpisy: często tylko `excerpt` (lead) — **Popraw z AI** uzupełnia body + context
- Autosave CMS dla RSS **nie wysyła** pól AI (tylko kategoria + featured) — nie nadpisuje `content`

---

## 3. CMS (`/admin/articles`)

### Lista

- Filtry: Do akceptacji (REVIEW), Szkice RSS (DRAFT), Opublikowane, Wszystkie
- Kolumna źródło zewnętrzne + badge „Ze świata”

### Edycja artykułu (unified — stan lokalny 3.06.2026)

- **Jeden edytor** dla manual i RSS — wszystkie pola edytowalne
- **Popraw z AI** tylko gdy `contentOrigin === "RSS"` (nie po samym `source`+`url`)
- Pola: tytuł, podtytuł, slug, zajawka, treść, kontekst WSS, tagi, kategoria, źródło (nazwa+URL), okładka, featured
- **Preview publikacji** · **Opublikuj** (kategoria wymagana)

### Edycja artykułu RSS (prod / stary opis — do wygaszenia po deployu)

- ~~readonly AI~~ → zastąpione unified editorem

### Podgląd

- `/admin/articles/[id]/preview` — jak na portalu (lead + body + Kontekst WSS + źródło)

### Własne artykuły redakcyjne

- `/admin/articles/new` — pełna edycja (nie RSS)

---

## 4. Strona publiczna (RSS opublikowany)

Kolejność:

1. Hero: okładka, tytuł, **lead** (`excerpt`)
2. **Body** — akapity z `content`
3. **Kontekst WSS** — `components/article/WssContextBox.tsx` (tylko jeśli `contextNote`)
4. **Źródło** — `SourceAttribution`: „Źródło: [wydawca]” (subtelny footer)

**Nie pokazujemy:** chip „Ze świata” (usunięty PR5/PR6); wewnętrznych disclaimerów w boxie kontekstu.

---

## 5. Env (checklist)

**Vercel Production:**
- `DATABASE_URL` = `:6543` + `?pgbouncer=true&connection_limit=1`
- `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL=gpt-5.4-mini`
- `CRON_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Lokalnie:** `.env` z `DIRECT_URL` + `DATABASE_URL`  
**Nie commitować:** `.env`, klucze API

---

## 6. Komendy

```bash
npm run test:content-origin
npm run test:workflow
npm run test:articles
npm run test:ai
npm run test:ui
npm run publish:scheduled   # due SCHEDULED → PUBLISHED (manual)
npm run db:deploy              # migracje (contextNote + contentOrigin + SCHEDULED + publishAt)
npm run rss:ingest
npm run rss:process
npm run rss:clean-subtitles
npm run cache:revalidate
npm run dev
```

**Uwaga:** `npm run rss:cleanup-db` **czyści `content`** u wszystkich RSS — nie uruchamiaj po B+ bez powodu.

---

## 7. Pliki kluczowe (B+ i CMS)

```
prisma/schema.prisma                              # contextNote
prisma/migrations/20260602180000_article_context_note/
lib/rss/apply-enrichment.ts                       # lead/body/context → DB
lib/rss/enrich-drafts.ts                          # OpenAI B+ JSON
lib/rss/process-drafts.ts
lib/rss/reprocess-rss-article.ts
components/article/WssContextBox.tsx
components/article/SourceAttribution.tsx
components/admin/ArticleEditor.tsx
components/admin/ArticleLivePreview.tsx
app/aktualnosci/[slug]/page.tsx
app/admin/articles/[id]/preview/page.tsx
lib/rss/is-aggregator.ts
lib/rss/image-credit.ts
```

---

## 8. Otwarte / następne kroki

**Pełna lista:** sekcja **MAPA STANU** na górze pliku.

| Temat | Status |
|-------|--------|
| **PROD-QA** | `[ ]` po deploy czatu 25 |
| **OPS ~175 REVIEW** | `[ ]` |
| **P1-6 prod** | `[ ]` env + bucket |
| **P2-WEEK-TOPIC prod** | `[ ]` revalidate |
| **Lajki per-user** | `[~]` SQL user uruchomił; Popularne z counts |
| P1-7 / P0-5 / P6-24 | `[ ]` backlog |
| Scheduler bez CMS | info — Hobby limit cron |
| Pełny RSS body | **Nie** — hybryda B+ |

### Commity czat 24–25 (referencja)

`3e7139b` → `4ca8d46` → `4868232` → `06e2d4d` → `f956ff0` → `c68b896`

### Pliki kluczowe (czat 24–25)

```
components/sections/DepartmentSectionFrame.tsx
components/sections/DepartmentSectionHeader.tsx
components/sections/HomepageSpotlightPanel.tsx
lib/home/homepage-section-themes.ts
components/article/HeroBreadcrumbChip.tsx
prisma/migrations/20260604200000_article_author_byline/
lib/ui/nav-overlay-panel.ts
components/brand/WssLogoWordmark.tsx
components/sections/HomepageHeroSlider.tsx
components/article/ReadAlsoInline.tsx
lib/home/hero-slides.ts
lib/ui/article-hero-frame.ts
prisma/migrations/20260604210000_article_hero_position/
public/brand/wss-wordmark.png
scripts/process-wss-wordmark.mjs
components/profile/ProfileClient.tsx
components/profile/ProfileSectionHeading.tsx
components/layout/Navbar.tsx
components/notifications/NotificationsPopover.tsx
```

### Pliki lokalne do commita (skrót — starsze WIP, już na main)

```
app/api/articles/publish-scheduled/route.ts
app/admin/articles/page.tsx
app/admin/articles/[id]/preview/page.tsx
components/admin/ArticleEditor.tsx
components/admin/ArticleEditorPreviewPane.tsx
components/admin/ArticleLivePreview.tsx
components/article/ArticlePublicPreview.tsx
components/sections/ArticleFeedSection.tsx
lib/admin/schedule-datetime.ts
lib/admin/preview-article.ts
lib/admin/preview-article-server.ts
lib/admin/api.ts
lib/server/articles.ts
lib/articles.ts
lib/articles/workflow.ts
lib/articles/resolve-image.ts
lib/article/related-articles.ts
lib/rss/ingest.ts
lib/home/rank-articles.ts
lib/ui/schedule-datetime.test.ts
lib/ui/preview-article.test.ts
scripts/fix-published-at.ts
docs/WSS_ROADMAP_BACKLOG_V3.md
docs/WSS_NEXT_CHAT_HANDOFF.md
package.json
```

---

## 9. FAQ

| Pytanie | Odpowiedź |
|---------|-----------|
| Czy RSS ma pełną treść na stronie? | **Tak (B+):** lead + 2–4 akapity AI + kontekst + link |
| Czy lead może wspominać SpaceNews? | **Nie** — tylko w stopce (SourceAttribution) |
| Stary artykuł bez body? | Publikuj jako lead-only lub **Popraw z AI** |
| Push na Vercel? | `main` auto-deploy po push |

---

## 11. STATUS PRODUKTU — co już jest (audyt vs plany, 3.06.2026)

**Użyj tej sekcji w następnym czacie:** user wyśle plany → mapuj na wiersze poniżej.

### Infrastruktura / deploy
| Obszar | Status |
|--------|--------|
| Next.js 15 + Vercel auto-deploy z `main` | ✅ |
| Supabase auth + CMS guard | ✅ |
| Prisma + Supabase Postgres (pooler 6543 / direct 5432) | ✅ |
| Migracje: contextNote, contentOrigin, SCHEDULED, publishAt | ✅ wdrożone |
| Cron RSS 1×/dzień (Hobby) | ✅ |

### News Engine / RSS (B+ hybryda)
| Obszar | Status |
|--------|--------|
| RSS ingest → DRAFT, contentOrigin=RSS | ✅ |
| AI process → REVIEW (B+ pola: lead/body/contextNote) | ✅ |
| CMS ręczna publikacja → PUBLISHED | ✅ |
| Front tylko PUBLISHED | ✅ |
| Strona artykułu: lead + body + Kontekst WSS + źródło | ✅ |
| Pełna treść RSS na stronie | ❌ celowo — hybryda + link |
| Popraw z AI (reprocess RSS) | ✅ |
| `publishedAt` = moment CMS Opublikuj (nie data RSS) | ✅ czat 13 |

### CMS / Admin
| Obszar | Status |
|--------|--------|
| Unified ArticleEditor (manual + RSS) | ✅ |
| Split live preview (desktop/mobile) | ✅ |
| Workflow: DRAFT / REVIEW / PUBLISH / SCHEDULE | ✅ `articleStateTransition` |
| Autosave content-only (bez status) | ✅ |
| Zapisz szkic → DRAFT (z REVIEW) | ✅ czat 13 |
| Lista filtry + sort ostatnio edytowany | ✅ |
| Scheduler SCHEDULED + publishAt (zapis w CMS) | ✅ |
| Auto-publish (ScheduledPublishPoller + cache fix) | ✅ sesja 18 — user OK lokalnie/prod |
| coverImageCredit (podpis zdjęcia okładki) | ✅ kod; migracja prod — sprawdzić db:deploy |
| Collapsible admin sidebar (PR12) | ✅ |
| contentOrigin badge / Popraw z AI tylko RSS | ✅ |

### Front publiczny
| Obszar | Status |
|--------|--------|
| Homepage layout sesja 18 (slidery Najnowsze + Ważne teraz, bez sidebar duplikatów) | ✅ user OK mobile prod |
| Homepage sekcje: Ważne teraz / Najnowsze / Popularne (PR8) | ✅ |
| Fallback pustych sekcji (rank-articles) | ✅ |
| Related articles + Czytaj dalej (PR9) | ✅ |
| resolveImage() pipeline (coverImage → image) | ✅ |
| aiScore read-only w API (CMS kolumna) | ✅ |
| Subskrypcje zamiast „Kanały RSS” (PR5) | ✅ |

### Zamknięte PR / handoff
PR1–PR2B contentOrigin · PR3 RSS alignment · PR5 UX · PR6/6.1/7 terminology · PR8 ranking · PR9 related · PR10 scheduler · PR11 preview · PR12 sidebar · PR-H4 backfill · PR-H5 semantic · hard-lock czat 12 · CMS polish czat 13

### Znane otwarte / backlog
- **P1-6:** Upload okładek (pro) — następny priorytet
- `db:deploy` na prod dla `coverImageCredit` (jeśli jeszcze nie było)
- ~175 REVIEW do publikacji ręcznej
- `article_likes` 404 — SQL w Supabase

---

## 10. Commity (ostatnie sesje — chronologicznie)

**Sesja 32 (czat 32):**
```
a5ab17c fix(article): smarter in-body internal links (up to 4, no read-next drain)
ab3989b docs: handoff po wdrozeniu pakietu czat 26-30 na prod (f399d9b)
f399d9b fix(ui): add title prop to HeroBreadcrumbChip for prod build
ea7e3b0 feat(ui): homepage hero slider, article UX, CMS lists, heroPosition
```

**Sesja 31 (czat 31):**
```
f399d9b fix(ui): add title prop to HeroBreadcrumbChip for prod build
ea7e3b0 feat(ui): homepage hero slider, article UX, CMS lists, heroPosition
5735f02 docs: handoff c68b896 — start nowego czatu
```

**Sesja 18:**
```
39c8a9e feat(cms): edytowalny podpis zdjecia okladki (coverImageCredit)
241ba6e fix(homepage): klik w artykul w sliderze — bez drag mysza na kartach
3994a66 fix(homepage): usun duplikat chipu kategorii w Najnowsze
504c779 fix(homepage): strzałki i drag dla sliderów na desktop
cff809b refactor(homepage): slidery Najnowsze i Ważne teraz, bez duplikatów sidebar
b7a0ca6 feat(homepage): Najnowsze w railu, Ważne teraz pod hero; fix scheduler QA
```

**Sesja 17:** `08760c7` … `6f2882a` · **Sesja 19 remote:** `794d53d`

**Sesja 19 WIP (lokalnie, bez commit):** layout hero+rail, SiteBackground, kolory, cache:revalidate

---

*Koniec handoff — przy każdej sesji dopisuj na górze historii i aktualizuj STARTING PROMPT.*
