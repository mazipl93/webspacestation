# WSS — OG / SEO: plan follow-up (krok po kroku)

**Utworzono:** 13 czerwca 2026  
**Ostatnia aktualizacja planu:** 13 czerwca 2026 (Krok 8 deploy · GSC tier-2 3/6 · handoff reszta tier-2).  
**Prod HEAD:** `74bc482` (`main`) — `fix(seo): Krok 8 keywords audit and GSC tier-2 handoff`  
**Produkcja:** https://webspacestation.pl · repo `mazipl93/webspacestation` · branch `main`

### Commity OG (kolejność)

| SHA | Opis |
|---|---|
| `0f612ff` | feat(seo): per-page OG `/og/[pageId]`, CollectionPage JSON-LD |
| `fbac186` | fix: glass panel, `public/og/home-cover.jpg` (unikalne tło homepage) |
| `aeb4ed5` | fix: stała szerokość tekstu (Satori flex bug), `nodejs` + `og-load-background.ts` |

---

## Reguła pracy (dla usera i przyszłych czatów)

1. **Jeden krok na sesję** — agent implementuje tylko **następny nieodhaczony** krok poniżej.
2. Po kroku: krótki raport + testy → **STOP — czekaj na OK usera**.
3. User pisze np. „Krok 2 OK” → agent odhacza `[x]` w tym pliku (commit pliku planu razem z kodem, jeśli user każe commit).
4. **Commit/push/prod:** tylko po explicit OK usera.
5. **Nie używać długich myślników (—)** w copy UI/SEO — user preferuje ` · `, przecinek lub kropkę.
6. **Architektura treści:** `docs/WSS_CONTENT_ARCHITECTURE.md` + `.cursor/rules/wss-content-architecture.mdc` — obowiązkowe przy `/rozrywka`, `/nauka` itd.

---

## Kontekst: co już jest zrobione (baseline)

Sesja OG/SEO wdrożyła **hybrydę C**: dynamiczne karty PNG 1200×630 przez `@vercel/og`, jeden endpoint, centralny rejestr.

| Element | Opis |
|---|---|
| **Endpoint OG** | `GET /og/[pageId]` → `app/og/[pageId]/route.tsx` (**nodejs**, `revalidate: 86400`, **WebP** domyślnie, JPEG via `Accept`) |
| **Generator HQ** | `lib/seo/og-image-sharp.ts` — foto/gradient @ 2× sharp → overlay Satori @ 2× → downscale → WebP near-lossless |
| **Overlay tekst** | `lib/seo/og-overlay-satori.tsx` — panel + napisy (Satori); **wymaga** `import React` |
| **Loader tła (legacy)** | `lib/seo/og-load-background.ts` — używany tylko przez stary `og-image-response.tsx` (fallback) |
| **Rejestr stron** | `lib/seo/page-og-registry.ts` — 27 wpisów: headline, subtitle, alt, keywords, accent, backgroundImage/gradient |
| **Metadata narzędzi** | `lib/seo/tool-metadata.ts` → `getPageOgImageForPath()` zamiast `getDefaultOgImageUrl()` |
| **Metadata listingów** | `lib/seo/listing-metadata.ts` → OG + auto-keywords z rejestru |
| **Homepage** | `app/page.tsx` → `/og/home` |
| **JSON-LD listingów** | `buildListingPageJsonLd()` w `lib/seo/json-ld.ts` + `CollectionPage` w `ArticleListingPageShell`, `HubPageShell` |
| **JSON-LD narzędzi** | `WebApplication` + `image` + istniejące `FAQPage` (bez zmian w flow) |
| **Fallback globalny** | `app/opengraph-image.tsx` + `getDefaultOgImageUrl()` — gdy brak wpisu w rejestrze |
| **Artykuły** | Bez zmian — `openGraph.images` z `coverImage` w `app/aktualnosci/[slug]/page.tsx` |

**Zdjęcia tła (z `/public`):**
- **`/` (home)** → `public/og/home-cover.jpg` (Ziemia, ISS, rakieta, zorza · **≠** `/zorza`)
- **`/mapa`** → `public/og/home-cover.jpg` (tymczasowo; `iss.png` psuł layout OG)
- `/zorza` → `public/og/zorza-cover.jpg` (2400×1260 HQ; live Kp w subtitle)
- `/iss`, `/stacja-kosmiczna` → `iss.png`
- `/starty`, `/aktualnosci`, `/misje` → `cape-slc-40.png`
- `/kalendarz` → `vandenberg-slc-4e.png`
- `/astronomia` → `aurora.jpg`
- Huby bez foto → ciemne tło + glass panel

**Znane pułapki Satori (nie regresować):**
- ❌ `radial-gradient` w CSS → szary prostokąt
- ❌ `flex: 1` w karcie tekstu → opis **pionowo słowo po słowie**
- ❌ edge runtime + fetch URL tła → homepage bez zdjęcia (ciche fail)
- ✅ `backgroundColor` + data URL + explicit `width` na tekście

**Homepage OG:** `og:image` → `https://webspacestation.pl/og/home` (meta w `app/page.tsx`). ❌ **Nie ma** trasy `/home` — debugger zawsze na **`/`**.

**Copy SEO:** `og:title` bez długich myślników — `sanitizeSeoTitle()` w `lib/seo/site-title.ts`, separator ` · `.

**Co NIE jest gotowe:**
- **Pre-generowane PNG** w `public/og/` dla pozostałych tras — tylko `home-cover.jpg` + `zorza-cover.jpg`
- **Dedykowane tło `/mapa`** (osobne od home) — opcjonalny follow-up po Krok 2
- **Weryfikacja crawlerów** — **Krok 1, START tutaj w nowym czacie**
- **GSC / monitoring CTR** — nie skonfigurowane

---

## Mapowanie: sekcje D / E / F → kroki planu

| Źródło | Intencja | Kroki |
|---|---|---|
| **D** Korzyści | Odblokować CTR, rich preview, SEO, brand | 1, 3, 8 |
| **E** Ryzyka | Cold start, crawler cache, dev URL, rozrywka, over-opt, Vercel | 1, 2, 4, 5, 6, 7 |
| **F** Rekomendacje | Live Kp OG, rozrywka, PNG build, GSC, re-scrape, A/B | 2, 4, 5, 6, 7, 8, 9 |

---

## CHECKLIST — wykonuj po kolei

Odhaczaj `[ ]` → `[x]` **tylko po OK usera** dla danego kroku.

---

### Krok 0 — Commit + deploy pakietu OG/SEO (jeśli jeszcze nie na prod)

- [x] **Status:** done 2026-06-13 (commit + push main)

**Cel:** Wypchnąć lokalne zmiany OG na `main` i Vercel, żeby korzyści z sekcji D w ogóle dotknęły użytkowników.

**Dlaczego (D/E):** Bez prod crawlerzy i social nadal widzą stary generic `/opengraph-image`. Ryzyko E „crawler cache” zaczyna się dopiero po deploy.

**Zakres plików (typowy diff sesji OG):**
- `lib/seo/page-og-registry.ts` (nowy)
- `lib/seo/og-image-response.tsx` (nowy)
- `app/og/[pageId]/route.tsx` (nowy)
- `lib/seo/site-og.ts`, `tool-metadata.ts`, `listing-metadata.ts`, `json-ld.ts`
- `app/page.tsx`, `app/aktualnosci/page.tsx`, `app/nauka/page.tsx`
- `components/pages/ArticleListingPageShell.tsx`, `HubPageShell.tsx`

**Test przed commit:**
```bash
npm run type-check
npm run build
```
Lokalnie sprawdź meta (dev na :3000):
```powershell
curl.exe -s "http://localhost:3000/zorza" | Select-String 'og:image'
# Oczekiwane: content="https://webspacestation.pl/og/zorza"
curl.exe -sI "http://localhost:3000/og/zorza"
# Oczekiwane: HTTP/1.1 200, content-type: image/png
```

**Kryterium DONE:** Prod/build preview pokazuje unikalne `og:image` na `/`, `/zorza`, `/mapa`, `/starty`.

**Po OK usera:** commit + push (user musi powiedzieć wprost).

---

### Krok 1 — Re-scrape social crawlerów (post-deploy)

- [x] **Status:** done 2026-06-13 · **Zależy od:** Krok 0

**Cel:** Wymusić odświeżenie cache Facebooka/X/LinkedIn po wdrożeniu nowych URL obrazów `/og/*`.

**Dlaczego (D/E):** Meta i inne platformy cache'ują OG tygodniami. Nowy URL `/og/zorza` i tak warto „przescrapować”, inaczej Messengery mogą pokazywać stary podgląd.

**Co zrobić (ręcznie, user lub agent z dostępem):**
1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — URL po URL:
   - `https://webspacestation.pl/`
   - `https://webspacestation.pl/zorza`
   - `https://webspacestation.pl/mapa`
   - `https://webspacestation.pl/starty`
   - Kliknij **Scrape Again** przy każdym.
2. [opengraph.xyz](https://www.opengraph.xyz/) — wizualna kontrola tytułu, opisu, obrazu.
3. Opcjonalnie: [Twitter/X Card Validator](https://cards-dev.twitter.com/validator) (jeśli dostępne dla konta).

**Kryterium DONE:** Debugger pokazuje `/og/home` ze sceną kosmiczną + czytelny subtitle w **1–2 liniach** (nie pionowo). `/og/zorza` = aurora.

**Weryfikacja wizualna przed scrape (user):**
- https://webspacestation.pl/og/home
- https://webspacestation.pl/og/mapa
- https://webspacestation.pl/og/zorza  
Hard refresh / incognito. CDN cache OG: `max-age=31536000` — po fixie może trzymać stary PNG do re-scrape.

**Notatka dla agenta:** Nie implementuj kodu w tym kroku — tylko checklista weryfikacji + wpisz datę scrape w sekcji „Log wdrożeń” na końcu pliku.

---

### Krok 2 — ~~Strona działu `/rozrywka`~~ (ANULOWANY)

- [x] **Status:** anulowany 13.06.2026 — dział Rozrywka zlikwidowany (DB + kod prod). Pozostałości w repo wyczyszczone; redirect `/rozrywka` → `/technologie`.

**Następny krok planu:** **Krok 3** (rich preview Messenger/Discord).

~~**Cel:** Dokończyć brakujący dział **Rozrywka**~~

**Dlaczego (E/F):** OG i rejestr gotowe (`id: rozrywka`), ale route nie istnieje → 404, brak w sitemap, artykuły `categorySlug: rozrywka` w DB bez strony docelowej.

**Architektura treści (MUST):**
- Slug: **`rozrywka`** (nie `gaming`)
- Treść: sci-fi, filmy, gry **o kosmosie / sci-fi** — ❌ gaming off-topic
- Kolejność menu (docelowa): … → Ziemia z kosmosu → **Rozrywka** (sprawdź `lib/ui/nav-menu-config.ts`)

**Implementacja (wzorzec):** skopiuj strukturę z `app/iss/page.tsx` lub `app/misje/page.tsx`:
1. `app/rozrywka/page.tsx` — `ArticleListingPageShell` + `LISTING` config
2. Rozszerz `NewsCategory` w `types/index.ts` o `"rozrywka"` (jeśli brak)
3. `CATEGORY_INFO.rozrywka` w `lib/categories.ts` + `CATEGORY_SLUG_ORDER` (jeśli brak)
4. `SEO_SITEMAP_PATHS` w `lib/seo/public-routes.ts` — dodaj `"/rozrywka"`
5. Nav: link w menu (kategorie / więcej — zgodnie z nav config)
6. OG działa automatycznie przez `buildListingPageMetadata` + wpis `rozrywka` w rejestrze

**SEO copy (propozycja, bez —):**
- title: `Rozrywka kosmiczna`
- description: `Sci-fi, filmy i gry o kosmosie. Artykuły o uniwersach science fiction i produkcjach kosmicznych.`

**Test:**
- `/rozrywka` → 200, feed artykułów kategorii rozrywka
- meta `og:image` → `https://webspacestation.pl/og/rozrywka`
- `/sitemap.xml` zawiera `/rozrywka`

**Kryterium DONE:** Strona indexowalna, w nav, w sitemap, H1 = intencja rozrywki kosmicznej.

---

### Krok 3 — Walidacja rich preview (Messenger / Discord / iMessage)

- [x] **Status:** done 2026-06-13 · **Zależy od:** Krok 0, 1

**Cel:** Potwierdzić korzyść **D: rich preview** w messengera (duży obraz + opis).

**Dlaczego (D):** Google/meta tagi w HTML ≠ to samo co renderuje Messenger po cache.

**Test manualny (user):**
1. Wyślij link `https://webspacestation.pl/zorza` na Messengerze (do siebie / testowej grupy).
2. To samo dla `/mapa`, `/starty`, jednego artykułu z okładką.
3. Discord: wklej link na kanale testowym.
4. iMessage (opcjonalnie): SMS do siebie z linkiem.

**Oczekiwany wynik:**
- `summary_large_image` — duża miniatura, nie mała ikonka
- `/zorza` — zielonkawa aurora, tekst o Kp
- Opis zawiera słowa kluczowe (Kp, ISS, starty) bez obcięcia w połowie słowa

**Kryterium DONE:** User potwierdza OK wizualnie lub zgłasza regresję (screenshot + URL).

---

### Krok 4 — Dynamiczny OG `/zorza` z live indeksem Kp (hybryda C+)

- [x] **Status:** done 2026-06-13 · **Zależy od:** Krok 0 · user OK „może być”

**Cel:** Na karcie OG `/og/zorza` pokazać **aktualny Kp** w copy zrozumiałym dla człowieka (np. „Dziś w Polsce bez zorzy · indeks Kp 2,7”) z danych NOAA, na tle HQ `zorza-cover.jpg`.

**Dlaczego (F):** Unikalny, „żywy” preview zwiększa CTR przy zapytaniach „zorza polarna dziś”, „indeks Kp” — użytkownik widzi wartość przed kliknięciem.

**Ryzyko (E):** Cold start + fetch NOAA w edge; pierwsze generowanie wolniejsze. Mitigacja: cache 5–15 min na odpowiedzi OG (krótszy niż 24h dla zorzy).

**Implementacja (szkic):**
1. W `app/og/[pageId]/route.tsx` lub helperze: jeśli `pageId === 'zorza'`, fetch skrócony snapshot Kp:
   - istniejący cache: `app/api/aurora/snapshot` lub `lib/aurora/api.ts` / ops cache — **nie duplikuj logiki**, reuse
2. Rozszerz `buildOgImageResponse()` o opcjonalny `dynamicLine?: string`
3. Subtitle lub trzecia linia na karcie: `Indeks Kp: 4.3 · NOAA`
4. `revalidate` dla `/og/zorza`: rozważ 300–900 s zamiast 86400

**Fallback:** Gdy API padnie → obecna statyczna karta (bez Kp).

**Test:**
```bash
curl.exe -sI "https://webspacestation.pl/og/zorza"
# Porównaj dwa requesty w odstępie zmiany Kp (lub mock)
```

**Kryterium DONE:** PNG zawiera liczbę Kp zgodną z terminalem `/zorza` (± opóźnienie cache).

---

### Krok 5 — Pre-generacja statycznych PNG (fallback offline / Hobby)

- [ ] **Status:** oczekuje · **Opcjonalny:** po Krok 4

**Cel:** Dla top tras wygenerować pliki `public/og/{id}.png` jako backup gdy edge OG niedostępny lub limit Vercel.

**Dlaczego (E/F):** Vercel Hobby + cold start; statyczne pliki = zero compute przy crawl, szybszy TTFB obrazu.

**Trasy priorytetowe:** `home`, `zorza`, `mapa`, `starty`, `aktualnosci`

**Implementacja (szkic):**
1. Skrypt `scripts/generate-og-images.ts`:
   - wywołuje lokalnie `buildOgImageResponse()` lub fetch `http://localhost:3000/og/{id}` po `next start`
   - zapisuje do `public/og/{id}.png`
2. W `resolvePageOgImage()`: opcjonalnie preferuj `/og/{id}.png` jeśli plik istnieje, else dynamic route
3. `package.json`: `"og:generate": "tsx scripts/generate-og-images.ts"` — **nie** wiązać z build bez OK usera (LCP/build time)

**Kryterium DONE:** Pliki istnieją, Facebook Debugger akceptuje bezpośredni URL PNG.

---

### Krok 6 — Google Search Console: monitoring intencji SEO

- [x] **Status:** done 2026-06-13 (pakiet GSC w repo) · **Zależy od:** Krok 0, ~2–4 tyg. indeksacji

**Cel:** Mierzyć czy opisy/keywords pod konkretne zapytania (**D: SEO**) dają efekt.

**Wdrożone w repo:**
- `lib/seo/gsc-priority.ts` — tier 1/2/3 URL + mapowanie fraz
- `scripts/gsc-priority-urls.ts` — checklista GSC, feedy, baseline do wklejenia
- `npm run gsc:priority-urls` · `npm run gsc:ping-sitemap` (Google + Bing ping)
- `app/sitemap.ts` — feedy RSS (`/feed.xml`, `/feed/{dział}`) w sitemap
- `app/layout.tsx` — wszystkie kanały RSS w `<link rel="alternate">`
- `lib/seo/json-ld.ts` — `sameAs` Organization + `image` w WebSite.hasPart

**Ręcznie (user w GSC):**
1. Property `webspacestation.pl` · Vercel: `GOOGLE_SITE_VERIFICATION` (jeśli brak meta)
2. Sitemaps → `https://webspacestation.pl/sitemap.xml` → Submit
3. `npm run gsc:priority-urls -- --tier=1` → URL Inspection → Request indexing
4. Po deploy: `npm run gsc:ping-sitemap`
5. Za 2–4 tyg.: Performance → frazy z tabeli poniżej → wpisz w Log

---

### Krok 7 — Dev/staging: poprawne tła w OG

- [x] **Status:** częściowo done · nodejs czyta z `/public` lokalnie i na Vercel
- [ ] **Opcjonalnie:** `.env.example` + test preview URL

**Cel:** Na preview/staging obrazy OG z tłem foto (`aurora.jpg`) muszą się ładować w generatorze `@vercel/og`.

**Dlaczego (E):** `buildOgImageResponse()` buduje absolute URL z `getSiteUrl()`. ImageResponse fetchuje tło z tego originu. Jeśli dev = `localhost:3000` bez plików lub zły URL → karta bez foto.

**Implementacja:**
1. Dokumentacja w `.env.example`: `NEXT_PUBLIC_SITE_URL=https://webspacestation.pl` (lub URL preview Vercel)
2. Opcjonalnie: w dev używać `VERCEL_URL` tylko gdy pliki dostępne; albo hardcode origin dla assetów `/images/ops-pads/*` jako relative file read (trudniejsze w edge)

**Test:** `next dev` → otwórz `/og/zorza` w przeglądarce → widać aurorę, nie sam gradient.

**Kryterium DONE:** Preview deployment pokazuje foto na `/og/zorza`.

---

### Krok 8 — Audyt keywords: brak over-optimization

- [x] **Status:** done 2026-06-13 · user OK „dzialaj”

**Cel:** Upewnić się, że keywords z rejestru **nie powielają** keyword stuffing w H1/body.

**Dlaczego (E):** `keywords` meta + opisy + JSON-LD — ryzyko nadmiaru fraz.

**Checklist (agent readonly):**
- [x] H1 na `/zorza` = `Terminal zorzy polarnej` (z `interactive-tools.ts`), nie „Zorza polarna dziś indeks Kp…”
- [x] H1 `/mapa` = headline narzędzia, nie lista fraz
- [x] `/nauka` — tylko evergreeny w feedzie (reguła architektury)
- [x] `keywords` tylko w `<meta name="keywords">`, nie w widocznym tekście strony

**Pliki:** `lib/seo/page-og-registry.ts`, `components/discover/DiscoverPageShell.tsx`, `ArticleFeedSection.tsx`

**Kryterium DONE:** Krótki raport „OK” lub lista 1–3 poprawek copy (osobny mini-krok).

---

### Krok 9 — A/B tytułów OG (eksperyment, opcjonalny)

- [ ] **Status:** oczekuje · **Opcjonalny:** po Krok 6 baseline

**Cel:** Przetestować który tytuł daje lepszy CTR w social / GSC.

**Dlaczego (F):** Np. `/zorza`:
- Wariant A: `Zorza polarna na żywo · indeks Kp i prognoza` (obecny)
- Wariant B: `Czy dziś będzie zorza? · indeks Kp na żywo`

**Implementacja (minimalna):**
- Tylko zmiana `title` w `interactive-tools.ts` + ewent. `headline` na karcie OG w rejestrze
- Jedna zmiana na raz, 2–4 tyg. obserwacji w GSC / Meta insights
- **Bez** frameworku A/B w kodzie na start

**Kryterium DONE:** User wybiera wariant zwycięski na podstawie danych.

---

## Szybka tabela: URL → oczekiwany OG (po Krok 0)

| URL | `og:image` | Alt (skrót) |
|---|---|---|
| `/` | `/og/home` | Portal, ISS, zorza, starty |
| `/zorza` | `/og/zorza` | Zorza, Kp, aurora |
| `/mapa` | `/og/mapa` | ISS tracker, mapa |
| `/starty` | `/og/starty` | Harmonogram startów |
| `/kalendarz` | `/og/kalendarz` | Terminy NET |
| `/aktualnosci` | `/og/aktualnosci` | Newsy kosmos |
| `/nauka` | `/og/nauka` | Evergreen, fizyka kosmosu |
| `/misje` … `/stacja-kosmiczna` | `/og/{slug}` | Gradient / foto wg rejestru |
| `/aktualnosci/[slug]` | `article.image` | Okładka artykułu (bez zmian) |

Pełne copy: `lib/seo/page-og-registry.ts`

---

## NASTĘPNY KROK (dla nowego czatu)

**→ GSC tier-2 dokończyć jutro:** `/technologie`, `/iss`, `/ziemia-z-kosmosu` (limit dzienny GSC 13.06.2026).

**→ Krok 9:** A/B tytułów OG (opcjonalny) · albo **Krok 7** (dev OG URL) · **Krok 5** (static PNG).

**GSC tier-1 Request indexing:** **DONE** 13.06.2026 (user OK na `/aktualnosci`).

**GSC tier-2 Request indexing:** **3/6 DONE** 13.06.2026 · limit po `/nauka`, `/technologie` odrzucone.

### GSC tier-1 — status (13.06.2026)

| URL | Status przed | Prośba o indeksowanie |
|---|---|---|
| `https://webspacestation.pl` | w indeksie | ✅ przesłano |
| `https://webspacestation.pl/mapa` | wykryta, niezindeksowana | ✅ przesłano |
| `https://webspacestation.pl/zorza` | w indeksie | ✅ przesłano |
| `https://webspacestation.pl/starty` | wykryta, niezindeksowana | ✅ przesłano |
| `https://webspacestation.pl/kalendarz` | wykryta, niezindeksowana | ✅ przesłano |
| `https://webspacestation.pl/aktualnosci` | wykryta, niezindeksowana | ✅ przesłano (ostatnia w sesji) |

**Weryfikacja property:** `public/google64d13b3cded8c481.html` · commit `578416e` · prod 200 OK.

**Automatyzacja GSC (browser):** po kliknięciu „Poproś o zindeksowanie” czekaj **~25–35 s** na modal „Przesłano prośbę o zindeksowanie”. URL „Google nieznany” = live test ~60–90 s. **Limit dzienny** ~10–12 URL/dzień (tier-1 + tier-2 razem).

### GSC tier-2 — status (13.06.2026)

| URL | Status przed | Prośba o indeksowanie |
|---|---|---|
| `https://webspacestation.pl/misje` | Google nieznany | ✅ przesłano |
| `https://webspacestation.pl/astronomia` | wykryta, niezindeksowana | ✅ przesłano |
| `https://webspacestation.pl/nauka` | Google nieznany | ✅ przesłano |
| `https://webspacestation.pl/technologie` | wykryta, niezindeksowana | ❌ limit dzienny |
| `https://webspacestation.pl/iss` | — | ⏳ jutro |
| `https://webspacestation.pl/ziemia-z-kosmosu` | — | ⏳ jutro |

---

## STARTING PROMPT dla przyszłego czatu

Skopiuj do nowej sesji:

```
Projekt: WSS, prod https://webspacestation.pl, repo mazipl93/webspacestation, HEAD 74bc482

Przeczytaj docs/WSS_OG_SEO_FOLLOWUP_PLAN.md · wykonaj WYŁĄCZNIE: **GSC tier-2 reszta** (3 URL).

Done (nie powtarzaj):
- Krok 0–4, 6, 8 · Krok 5 pominięty
- GSC verify: google64d13b3cded8c481.html
- GSC tier-1: /, /mapa, /zorza, /starty, /kalendarz, /aktualnosci — ✅
- GSC tier-2 częściowo: /misje, /astronomia, /nauka — ✅ (limit dzienny 13.06)

Następne (Inspekcja URL → Poproś o zindeksowanie, GSC otwarte w przeglądarce):
1. https://webspacestation.pl/technologie
2. https://webspacestation.pl/iss
3. https://webspacestation.pl/ziemia-z-kosmosu

Czekaj 25–35 s po sukcesie; „Google nieznany” = live test ~60–90 s.

Opcjonalnie po tier-2 done: tier-3 (`npm run gsc:priority-urls -- --tier=3`) · osobna sesja.

Reguły: jeden krok/sesję, STOP na OK, commit tylko po explicit OK.
Architektura: docs/WSS_CONTENT_ARCHITECTURE.md
```

---

## Log wdrożeń (wypełniaj po krokach)

| Data | Krok | Kto OK | Uwagi |
|---|---|---|---|
| 2026-06-13 | 0 — deploy OG | user | `0f612ff` |
| 2026-06-13 | hotfix OG wizual | user | `fbac186`, `aeb4ed5` |
| 2026-06-13 | 1 — Facebook scrape | user | Sharing Debugger + re-scrape |
| 2026-06-13 | 2 — /rozrywka | — | anulowany, redirect → /technologie |
| 2026-06-13 | 3 — rich preview | user | FB post + debugger `/` OK |
| 2026-06-13 | extra — jakość OG | user | `e92d7d4` JPEG sharp, `805b3d8` 2× WebP Satori, `b8f7be4` hotfix 500 |
| 2026-06-13 | extra — og:title | user | `0042519` bez em dash (` · `) |
| 2026-06-13 | 4 — live Kp OG | user | commit 41605ae |
| 2026-06-13 | 6 — GSC pakiet | user | a69d372 · RSS w sitemap, gsc:priority-urls |
| 2026-06-13 | GSC verify HTML | user | 578416e · google64d13b3cded8c481.html |
| 2026-06-13 | GSC tier-1 indexing | user | 6 URL · Inspekcja → Poproś o zindeksowanie |
| 2026-06-13 | GSC tier-2 indexing | user | 3/6 · limit po nauka (technologie odrzucone) |
| | 5 — static PNG | | opcjonalny, pominięty |
| | 7 — dev OG URL | | opcjonalny |
| 2026-06-13 | 8 — keywords audit | user | H1 /zorza · meta nauka · deploy main |
| | GSC tier-2 reszta | | **NEXT** · /technologie, /iss, /ziemia-z-kosmosu |
| | 9 — A/B tytułów | | opcjonalny po tier-2 |
| | 9 — A/B tytułów | | |

**GSC baseline (wklej po Krok 6):**
- zorza polarna dziś: imp ___ / CTR ___ / pos ___
- iss tracker: imp ___ / CTR ___ / pos ___
- (…)

---

## Pliki kluczowe (ściąga dla agenta)

```
lib/seo/page-og-registry.ts    # rejestr OG + keywords
lib/seo/og-image-sharp.ts       # HQ pipeline 2× → WebP/JPEG
lib/seo/og-overlay-satori.tsx   # panel tekstowy Satori (import React!)
lib/seo/og-image-response.tsx   # legacy Satori full-frame (fallback)
lib/seo/og-load-background.ts   # legacy loader (og-image-response)
app/og/[pageId]/route.tsx       # endpoint (runtime: nodejs)
lib/seo/og-zorza-kp-line.ts     # live Kp subtitle /zorza
lib/seo/og-overlay-fonts.ts     # Inter 400/600/800 dla Satori
public/og/zorza-cover.jpg       # HQ tło OG zorza (2400×1260)
public/og/home-cover.jpg       # tło homepage (+ /mapa tymczasowo)
lib/seo/tool-metadata.ts       # metadata narzędzi live
lib/seo/listing-metadata.ts    # metadata działów/hubów
lib/seo/json-ld.ts             # CollectionPage, WebApplication, FAQ
lib/seo/public-routes.ts       # SEO_SITEMAP_PATHS
lib/seo/gsc-priority.ts        # tier URL + frazy GSC
scripts/gsc-priority-urls.ts   # npm run gsc:priority-urls
app/aktualnosci/[slug]/page.tsx # wzorzec OG artykułu (coverImage)
docs/WSS_CONTENT_ARCHITECTURE.md
```
