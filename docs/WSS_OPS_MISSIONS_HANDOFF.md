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

**Kolejne:** patrz sekcja **„Roadmap Centrum operacyjne”** poniżej — krok po kroku.

**Commit sesji ops:** `8ce2737` — `feat(ops): Centrum operacyjne, briefy AI startów i świeże dane LL2`

---

## Co to jest „Centrum operacyjne” (stan po `8ce2737`)

Jeden produkt, **dwa miejsca na homepage** (to trzeba uporządkować w roadmapie):

| Warstwa | Gdzie | Co pokazuje | Pliki |
|--------|--------|-------------|--------|
| **Strip (NOWY)** | Tuż **pod hero**, above the fold | Następny start + odliczenie + **AI brief** + „Ostatnio: start udany” + **ISS** (pozycja, wysokość, prędkość) + skróty Starty/Terminy/Mapa | `HomepageOpsStrip.tsx`, `OpsLaunchShowcase`, `OpsIssShowcase`, `OpsQuickNav` |
| **Panel (STARY)** | **Dół homepage** w `ContentGrid` | Duży dashboard: lista startów, timeline, mapa — **duplikat** stripa | `ContentGrid.tsx` → `HomepageOpsDashboardLoader` |

**Odkrywaj (osobne strony):**

| URL | Rola w funnelu |
|-----|----------------|
| `/starty` | Pełna siatka startów + briefy AI + odliczenia |
| `/kalendarz` | Timeline NET (`OpsTimeline`) |
| `/mapa` | ISS na orbicie + pady startowe (`OpsMissionMap`) |
| `/misje` | Artykuły redakcyjne + **banner** z następnym startem |

**Dane (jeden rdzeń):** `getHomepageOpsData()` → LL2 + ISS + cache DB (`ops_cache_entries`), cron `ops-refresh` co 1 h (`vercel.json`).

**ISS w stripie:** tylko **podgląd** (współrzędne, km/h) + link „Orbita na mapie” → `/mapa`. **Nie** zastępuje działu `/iss` (newsy o stacji).

---

## Roadmap Centrum operacyjne — krok po kroku

Statusy: ✅ DONE · 🔄 PARTIAL · ⏳ TODO · 🚫 poza scope (user)

| # | Krok | Status | Opis / pliki |
|---|------|--------|----------------|
| **0** | Audyt Misje·Starty·ISS·Odkrywaj | ✅ | Hipoteza retencji, priorytety 1–5 |
| **1** | Ops **strip pod hero** | ✅ | Widoczny start bez scrolla |
| **2** | `/starty` w nav + banner **`/misje`** | ✅ | `nav-menu-config.ts`, `CategoryOpsLaunchBanner` |
| **3** | **Świeże dane LL2** | ✅ | upcoming+previous, fazy, staleness, cron 1 h |
| **3b** | **AI briefy** startów (OpenAI mini) | ✅ | `generate-launch-briefs.ts`, klucz `OPS_LAUNCH_BRIEFS_OPENAI_API_KEY` (wss-starty) |
| **3c** | Most artykuł ↔ start (opcjonalny link WSS) | ✅ | `match-launch-articles.ts` — tylko gdy tytuł = kod misji |
| **4** | **Fix „Starship (zapas)”** | ⏳ **PIERWSZE w następnym czacie** | LL2 429 → fallback nadpisuje cache; nie pokazywać mocków jako live |
| **5** | **Deploy** strip + dane + cron + env Vercel | ⏳ | Po OK usera; `OPS_LAUNCH_BRIEFS_OPENAI_API_KEY` na prod |
| **6** | **Uporządkować duplikat** — stary panel na dole homepage | ⏳ | Opcje: usunąć / zwinąć / zostawić tylko mapę+timeline; strip = główne CO |
| **7** | **ISS funnel** spójny | ⏳ | Strip → `/mapa`; ewent. cross-link `/iss` „ISS teraz”; bez 3× tego samego |
| **8** | **`/starty` + `/kalendarz` UX** | 🔄 | Działa; ewent. briefy na wszystkich kartach, fazy na countdown |
| **9** | **AI briefy faza B** — web search (Responses API) | ⏳ | Tylko „ciekawe” starty (NROL, Crew, debiuty); nie każdy Starlink |
| **10** | **Playbook FB** przed startem | ⏳ | Proces (nie kod): post „za X h”, link w komentarzu, `/starty` |
| **11** | **CMS `linkedLaunchId`** (opcjonalnie) | ⏳ | Ręczne przypięcie news ↔ start, gdy redakcja pisze o locie |
| **12** | Newsletter / TikTok | 🚫 | User: później / nie teraz |

**Kolejność rekomendowana dla następnych czatów:** 4 → 5 → 6 → 7 → 9 → 10.

---

## ISS — co robimy, a czego nie

| Element | Teraz | Docelowo |
|---------|--------|----------|
| **Strip homepage** | Mini ISS ( pozycja, prędkość ) | Zostaje — „live hook” |
| **`/mapa`** | Pełna orbita + pady | Główne narzędzie ISS |
| **`/iss`** | Artykuły o stacji | Newsy redakcyjne, nie duplikat trackera |
| **Stary panel CO na dole** | Pełna mapa/timeline | Prawdopodobnie **uproszczyć** po kroku 6 |

ISS tracker = **Open Notify / wss API** w `lib/ops/iss-tracker.ts` — bez płatnego API.

---

## Env (local + Vercel prod)

```env
OPS_LAUNCH_BRIEFS_OPENAI_API_KEY="..."   # projekt OpenAI wss-starty
OPENAI_API_KEY="..."                      # wss-news-engine — RSS only
OPENAI_TRANSLATION_MODEL="gpt-5.4-mini"
CRON_SECRET="..."
# OPS_LAUNCH_BRIEFS=false                 # wyłącz briefy
```

```bash
npm run ops:refresh   # LL2 + ISS + briefy (max 8 startów / run)
npm run ops:briefs    # tylko briefy z cache (gdy LL2 throttle)
```

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
| **Strip CO (NOWY)** | `HomepageTopZone` → `HomepageOpsStrip` | **Pod hero** — główny punkt retencji |
| Panel ops (STARY) | `ContentGrid.tsx` → `HomepageOpsDashboardLoader` | **Na dole** homepage — **duplikat**, krok 6 roadmapy |
| Suspense + skeleton | oba komponenty | lazy load ops |

**Audyt (zrobiony):** strip above the fold — ✅. Stary panel — do decyzji w kroku 6.

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

## Prompt na następny czat (SKOPIUJ PONIŻEJ)

```
Kontynuacja WSS — Centrum operacyjne (repo: wss-nowa, main, commit 8ce2737+)

## Przeczytaj najpierw
- docs/WSS_OPS_MISSIONS_HANDOFF.md — sekcje: „Starship (zapas)”, „Roadmap Centrum operacyjne”, „ISS”
- docs/WSS_CONTENT_ARCHITECTURE.md

## Kontekst
- Strip pod hero DONE (start + ISS + briefy AI). Stary duży panel ops nadal na DOLE homepage (ContentGrid) — duplikat, krok 6 w roadmapie.
- Strategia: starty + ISS + kalendarz = retencja; artykuły = SEO. User solo, bez wypalenia.
- FB auto-post przy PUBLISH — DONE, nie proponuj od nowa.
- Bez deploy/commit bez explicit OK usera (chyba że prosi).

## Zadanie 1 (pilne)
Dlaczego w Centrum operacyjnym widać „Starship (zapas)” zamiast LL2? Napraw: fallback nie może nadpisywać live cache. Potem npm run ops:refresh gdy LL2 OK.

## Zadanie 2+ (roadmap — krok po kroku, pytaj usera co dalej)
4 fix zapas → 5 deploy → 6 usunąć/uprosścić stary panel CO na dole → 7 ISS funnel → 9 web search briefy → 10 playbook FB.

## Kluczowe pliki
- components/sections/HomepageOpsStrip.tsx, ContentGrid.tsx (stary panel)
- lib/ops/fallback.ts, fetch-core-snapshot.ts, get-ops-data.ts, generate-launch-briefs.ts
- components/discover/OpsIssShowcase.tsx, OpsMissionMap (mapa)
- app/api/cron/ops-refresh/route.ts, vercel.json
```

---

## Inne handoffy (nie mieszać tematów)

- Perf / obrazy: `docs/WSS_PERF_CHAT_HANDOFF.md`
- GA4 / lajki: `docs/WSS_GA4_LIKES_HANDOFF.md`
- Ogólny żywy dokument: `docs/WSS_NEXT_CHAT_HANDOFF.md`
