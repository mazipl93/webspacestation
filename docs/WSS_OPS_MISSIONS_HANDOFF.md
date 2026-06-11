# WSS — Handoff: Misje · Starty · ISS · strategia (następny czat)

**Data:** 11 czerwca 2026 (aktualizacja: ops strip + briefy AI)

**Repo:** `mazipl93/webspacestation` · branch `main`  
**Prod:** https://webspacestation.pl  
**Architektura treści:** `docs/WSS_CONTENT_ARCHITECTURE.md` · `.cursor/rules/wss-content-architecture.mdc`

---

## ⚠️ Pytanie na start następnego czatu (user prosił)

**Dlaczego w Centrum operacyjnym widać „Starship (zapas)” / „Starlink Group (zapas)”?**

Podejrzenie (do potwierdzenia w kodzie + DB):

1. **Launch Library HTTP 429 / timeout** → `fetchLaunchSchedule` pada → `fetchCoreOpsSnapshot` zwraca **`buildFallbackCoreSnapshot()`** (`lib/ops/fallback.ts` — mocki z etykietą „zapas”).
2. Cron / `npm run ops:refresh` **zapisuje ten fallback do `ops_cache_entries`** — UI czyta cache, nie live LL2 przy każdym request.
3. Fix do rozważenia: nie nadpisywać live snapshotu fallbackiem; albo `npm run ops:refresh` gdy LL2 OK; albo pusty strip z komunikatem zamiast mocków.

Sprawdź: `readStoredCore()` → `launches[0].mission`, logi `[ops] Launch Library failed`, prod vs local.

---

## Zrobione w sesji ops (commit w repo — deploy bez OK usera)

| Etap | Co |
|------|-----|
| **1** | Ops strip pod hero — `HomepageOpsStrip`, `OpsLaunchShowcase`, `OpsIssShowcase`, `OpsQuickNav` |
| **2** | `/starty` w nav + banner `/misje` — `CategoryOpsLaunchBanner` |
| **3** | Most artykuł ↔ start + **AI briefy** (`LaunchBriefBlock`, `generate-launch-briefs.ts`) |
| **Dane** | LL2 upcoming+previous, fazy, staleness, cron co 1 h |
| **Klucz AI** | `OPS_LAUNCH_BRIEFS_OPENAI_API_KEY` (OpenAI **wss-starty**); RSS = `OPENAI_API_KEY` |

```bash
npm run ops:refresh   # LL2 + ISS + briefy (max 8)
npm run ops:briefs    # tylko briefy z cache
```

**Kolejne:** fix „zapas” w stripie → playbook FB → deploy po OK.

---

**Ostatnie commity (sesja SEO + dystrybucja):**

| Commit | Opis |
|--------|------|
| `07fcd6a` | Harden sitemap + RSS (lean query, bez schedule tick, revalidate feeds) |
| `0a466b0` | Paginacja list `/aktualnosci` + działy (`?strona=N`, 40/str.) |
| `38d8a03` | Skrypt GSC Nauka + link „Subskrypcje RSS” w stopce |

**Decyzja usera:** bez commit/push/deploy bez explicit OK (wyjątek: powyższe już na prod).

---

## Cel następnego czatu (PRIORYTET #1 produktu)

**Audyt i plan usprawnień:** `/starty` · `/kalendarz` · `/mapa` · dział **Misje** · panel **ISS** — bez implementacji na start, chyba że user poprosi osobno po audycie.

Hipoteza strategiczna (user + ChatGPT + audyt Cursor): **starty + ISS + kalendarz** mogą być **powodem codziennego powrotu** na WSS — ważniejsze niż kolejne funkcje SEO. Artykuły = pozyskanie (Google); ops = retencja.

---

## Co już zrobiono w sesji SEO (checklist 5 punktów)

| # | Temat | Status |
|---|--------|--------|
| 1 | `/sitemap.xml` + `/feed.xml` (500 → fix) | **DONE** — wdrożone |
| 2 | Pełne archiwum HTML (paginacja) | **DONE** — `?strona=2` na `/aktualnosci` i działach |
| 3 | GSC — indeksacja evergreenów Nauki | **DONE po stronie usera** — 5 URL-i ręcznie; nowe evergreeny z `/nauka` → to samo |
| 4 | Dystrybucja RSS | **PARTIAL** — feedy OK, `/rss`, stopka; **newsletter TODO** |
| 5 | Redakcja (hook, mix evergreen) | **TODO** — proces, pola `socialCardHook` w CMS istnieją |

**GSC — workflow evergreenów Nauki:**  
`npx tsx scripts/list-gsc-nauka-urls.ts` → Inspekcja URL → Poproś o indeksowanie (max ~10/dzień).  
**RSS:** `/feed/nauka` = XML dla Feedly — **nie** dodawać do GSC; indeksujemy `/aktualnosci/slug`.

---

## Social (stan + rekomendacja)

**Wdrożone (nie ruszać bez OK):**
- Auto-post FB + IG przy pierwszym PUBLISH (share-card + instagram-card, `after()` na Vercel)
- Duplikaty: skip gdy `facebookPostId` / `instagramPostId` w DB

**Rekomendacja strategiczna (ChatGPT + Cursor, ocena planu **7/10**):**
- Auto-post = **backup**, nie liczyć na zasięg
- **1 ręczny post FB/dzień** (native: hook + grafika, **bez linka w pierwszym akapicie**; link w komentarzu)
- Przed startem SpaceX/ESA → post „za X h start” + `/starty`
- **Nie** gonić lajków od ~22 obserwujących; metryka: zasięg, wejścia, zapis RSS
- TikTok/Reels **później** — dopiero gdy FB co jakiś post łapie
- Cel ruchu: **100 UV/d → 500 → 1000 → 3000 → 5000**, nie od razu 5000
- **90 dni:** ~300–500 artykułów + indeksacja + pierwsze stałe źródła ruchu (kontrola), nie pytanie „czy już mam 5000”

**Przewaga vs farmy AI:** własny głos, kontekst „co to znaczy” — bez fejków i UFO-clickbaitu.

---

## Architektura treści (must-follow przy Misjach / ISS)

| Dział | Slug | Rola |
|-------|------|------|
| **Misje** | `/misje` | ~90% news — starty, NASA, ESA, SpaceX, Artemis… **Bez** evergreenów typu „jak działa rakieta” → **Nauka** |
| **ISS** | `/iss` | news + trochę evergreenów o życiu na stacji |
| **Nauka** | `/nauka` | **100% evergreen** — zero newsów z 24h |
| **Technologie** | `/technologie` | rakiety, Starlink, napędy (news) |

**Zasada:** pytaj „aktualność czy wiedza?”, nie „który dział jest newsowy”.

---

## Stan techniczny: Odkrywaj / Ops (punkt wyjścia audytu)

### Strony publiczne

| URL | Plik | Dane |
|-----|------|------|
| `/starty` | `app/starty/page.tsx` | `getCoreOpsData()` → karty `LaunchCard`, odliczenia client-side |
| `/kalendarz` | `app/kalendarz/page.tsx` | `OpsTimeline` + lista `ops.calendar` |
| `/mapa` | `app/mapa/page.tsx` | `getMapOpsData()` → `OpsMissionMap` (ISS orbit, pady startowe) |
| `/galeria` | `app/galeria/page.tsx` | NASA gallery ops |
| `/wideo` | `app/wideo/page.tsx` | NASA video ops |

**Źródła danych:** Launch Library 2, tracker ISS, NASA APIs — snapshot w DB, odświeżanie cronem.

### Homepage

| Element | Plik | Uwaga |
|---------|------|--------|
| CTA „Starty rakiet” w hero | `components/sections/Hero.tsx` | link `/starty` |
| Panel ops (starty, ISS, mapa, timeline) | `components/sections/ContentGrid.tsx` | **`HomepageOpsDashboardLoader`** — **na dole** homepage, **po** sekcjach działów i Popularne |
| Suspense + skeleton | `ContentGrid.tsx` | lazy load ops |

**Pytania audytu:** czy ops powinno być wyżej (pod hero / obok Najnowsze)? czy wystarczająco widoczne na mobile?

### Backend / cache

| Obszar | Pliki |
|--------|--------|
| Fetch + merge | `lib/ops/get-ops-data.ts`, `lib/ops/fetch-core-snapshot.ts`, `lib/ops/payloads.ts` |
| Store | `lib/ops/snapshot-store.ts`, `lib/ops/fallback.ts` |
| Cron refresh | `app/api/cron/ops-refresh/route.ts` → `lib/ops/refresh-ops-cache.ts` |
| UI | `components/discover/LaunchCard.tsx`, `LaunchCountdown.tsx`, `OpsMissionMap.tsx`, `OpsTimeline.tsx` |
| Typy | `lib/ops/types.ts` |

**Env:** `CRON_SECRET`, `NASA_API_KEY` (Vercel prod — sprawdzić czy cron ops działa).

### Footer / nav

- Stopka **Odkrywaj:** starty, kalendarz, mapa, galeria, wideo + **Subskrypcje RSS** (`/rss`)
- Dział **Misje** = `/misje` (artykuły), **nie** mylić z `/starty` (harmonogram LL2)

---

## Zakres audytu następnego czatu (deliverable)

1. **Prod smoke:** `/starty`, `/kalendarz`, `/mapa` — dane live vs fallback, odliczenia, ISS na mapie
2. **Homepage:** gdzie jest ops panel, czy user „widzi start za 17 h” bez scrolla
3. **Misje vs starty:** czy redakcja + produkt się uzupełniają (news Artemis w Misjach, countdown w /starty)
4. **ISS:** `/mapa` vs sekcja ISS na homepage vs dział `/iss` — duplikacja czy spójny funnel
5. **SEO / discovery:** czy `/starty`/`/kalendarz`/`/mapa` są w sitemap, linkowane, sensowne meta
6. **Social:** jak łączyć starty z ręcznym FB (format posta przed startem)
7. **Propozycja priorytetów:** co przenieść na homepage, co uprościć, co wdrożyć (bez kodu w pierwszej turze)

**Nie proponować:** newslettera, TikTok codziennie, evergeenów w Misjach, push prod bez OK usera.

---

## Prompt na nowy czat (SKOPIUJ PONIŻEJ)

```
Kontynuacja WSS — audyt Misje · Starty · ISS · Odkrywaj (repo: wss-nowa, prod: https://webspacestation.pl)

## Przeczytaj najpierw
- docs/WSS_OPS_MISSIONS_HANDOFF.md (ten plik — pełny kontekst sesji SEO + strategia)
- docs/WSS_CONTENT_ARCHITECTURE.md (Misje vs Nauka vs ISS)

## Kontekst (skrót)
- SEO/indeksacja: sitemap+feed naprawione, paginacja ?strona=N, user zgłosił 5 evergreenów Nauki w GSC
- FB+IG auto-post przy PUBLISH — DONE, nie proponuj od nowa
- Strategia: starty+kalendarz+ISS = potencjalny #1 powód powrotu na stronę (retencja); artykuły = Google (pozyskanie)
- User: solo, bez wypalenia; 1 ręczny post FB/dzień > auto-only; TikTok później

## Twoje zadanie (TYLKO audyt na start — bez implementacji chyba że poproszę)
1. Sprawdź prod + repo: jak działają /starty, /kalendarz, /mapa (dane Launch Library 2, ISS, cache, cron ops-refresh)
2. Sprawdź homepage: gdzie jest panel ops (ContentGrid), Hero CTA, czy starty/ISS są wystarczająco widoczne
3. Oceń dział /misje vs narzędzia Odkrywaj — spójność, duplikaty, luki
4. Dla każdego obszaru: DONE / PARTIAL / TODO + 1 zdanie dowodu (plik, endpoint, prod URL)
5. Rekomendacje: co przenieść na homepage, jak usprawnić funnel Misje→starty→mapa, jak to spiąć z ręcznym FB przed startem
6. 3–5 priorytetów wdrożenia (krótko) — bez kodu do OK usera
7. Nie commituj, nie deployuj bez mojego OK

## Kluczowe pliki
- app/starty/page.tsx, app/kalendarz/page.tsx, app/mapa/page.tsx, app/misje/page.tsx, app/iss/page.tsx
- lib/ops/*, components/discover/*, components/sections/ContentGrid.tsx, Hero.tsx
- app/api/cron/ops-refresh/route.ts

## Architektura treści
Misje = news startów/programów. Evergreen „jak działa rakieta” → Nauka. ISS news w /iss, pozycja ISS na /mapa.
```

---

## Inne handoffy (nie mieszać tematów)

- Perf / obrazy: `docs/WSS_PERF_CHAT_HANDOFF.md`
- GA4 / lajki: `docs/WSS_GA4_LIKES_HANDOFF.md`
- Ogólny żywy dokument: `docs/WSS_NEXT_CHAT_HANDOFF.md`
