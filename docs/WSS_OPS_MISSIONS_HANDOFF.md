# WSS — Handoff: Misje · Starty · ISS · Centrum operacyjne

**Data ostatniej aktualizacji:** 13 czerwca 2026 (rano — kroki 7–9 + ISS follow + CO cleanup)

**Repo:** `mazipl93/webspacestation` · branch `main`  
**Prod:** https://webspacestation.pl  
**Architektura treści:** `docs/WSS_CONTENT_ARCHITECTURE.md` · `.cursor/rules/wss-content-architecture.mdc`

---

## Sesja 13.06.2026 (noc) — co zrobiono

### ✅ Live ISS tracker — DONE (niezcommitowane, do push)

ISS przestało być „atrapą" — pozycja, prędkość, orbita aktualizują się realnie w przeglądarce.

**Diagnoza problemu:**
- Pozycja ISS wpadała do snapshotu tylko przy cronie (1×/dzień) — SSR pokazywał punkt sprzed wielu godzin
- Marker na mapie był statycznym propem — nic go nie odświeżało po stronie klienta
- Próba serwerowego route `/api/ops/iss` nie przeszła — Node lokalnie timeoutuje do `wheretheiss.at` (IPv6); `satellite.js` v7 (WASM) nie bundluje się po stronie klienta (ciągnie `node:module`)

**Rozwiązanie — hook `hooks/useLiveIssTrack.ts` (100% klientowy):**
- Pobiera pozycję z `api.wheretheiss.at` co 4 s
- Pobiera 10 punktów orbity (`/positions`) co 45 s — marker zawsze leży na czerwonej linii
- Startuje od snapshotu SSR (zero pustki/przeskoku przy mount)
- Pauzuje gdy karta w tle; przy padzie sieci trzyma ostatnią pozycję
- Działa lokalnie i na prodzie, zero zależności od crona

| Plik | Zmiana |
|------|--------|
| `hooks/useLiveIssTrack.ts` | **NOWY** — hook polling wheretheiss.at |
| `components/discover/OpsIssShowcase.tsx` | `"use client"` + `useLiveIssTrack` + pulsująca kropka |
| `components/sections/HomepageOpsStrip.tsx` | przekazuje `initialIss` zamiast sformatowanych stringów |
| `components/discover/OpsLiveMap.tsx` | marker, krąg widoczności, telemetria, orbit → `liveOrbit` z hooka |

**Zweryfikowane w przeglądarce:**
- `/mapa`: telemetria tyka (szer/dług/wys/prędkość), marker leży na czerwonej linii orbity
- Strip homepage: ISS coords live, prędkość ~27 500 km/h tyka co ~4 s

### ✅ Krok 6: Stary panel CO — DONE (niezcommitowane, do push)

| Zmiana | Plik |
|--------|------|
| Usunięto `NadchodzaceStarty` (4 karty = duplikat stripa) | `ContentGrid.tsx` |
| Usunięto `LiveMissionCenter` (ISS coords standalone = duplikat) | `ContentGrid.tsx` |
| Usunięto `OpsCenterExplainer` (3 kafle linkowe = duplikat QuickNav) | `ContentGrid.tsx` |
| Wyczyszczono importy `LaunchCard`, `OpsCenterExplainer`, `OpsPreviewBadge` | `ContentGrid.tsx` |
| Dolny panel = tylko **MapaStartow** + **TimelineWydarzen** | `ContentGrid.tsx` |

**Wygląd po zmianie:** „● NA ŻYWO Z KOSMOSU / CENTRUM OPERACYJNE" → mapa (ISS + 12 startów / 7 platform) + kalendarz „Kolejne terminy".

---

## Sesja 11.06.2026 (wieczór) — co zrobiono

### ✅ Krok 4: Fix „Starship (zapas)" — DONE

| Zmiana | Pliki |
|--------|--------|
| Usunięte mocki „(zapas)" | `lib/ops/fallback.ts` → pusty stan + `sanitizeCorePayload()` |
| LL2 pada → **ostatni cache**, nie fałszywe starty | `fetch-core-snapshot.ts`, `refresh-ops-cache.ts` |
| Pusty fetch **nie nadpisuje** dobrego snapshotu | `shouldPersistCoreSnapshot()` |
| Komunikat „anteny" zamiast oszustwa | `OpsLaunchFeedPaused`, `ops-outage-copy.ts`, tło animowane |
| SSR na Vercel **tylko Supabase** (`ops_cache_entries`) | `ops-ssr-mode.ts`, `get-ops-data.ts` |

### ✅ Krok 5: Deploy prod — DONE

| | |
|---|---|
| **Deploy** | `webspacestation.pl` · commit `c2021f4` na `main` |
| **Cache prod** | 12 startów live, 8 z briefami AI |
| **Env Vercel Production** | `OPS_LAUNCH_BRIEFS_OPENAI_API_KEY` ✅ · `CRON_SECRET` ✅ · `DATABASE_URL` ✅ |
| **Env brak (user: OK)** | `LAUNCH_LIBRARY_API_TOKEN` — darmowy limit LL2 wystarczy przy cronie 1×/d |

**Commity sesji 11.06:**

| Commit | Opis |
|--------|------|
| `414eed8` | fix(ops): uczciwy stan bez mocków, SSR z Supabase cache na Vercel |
| `f15c8ef` | fix(ops): cron ops-refresh **raz dziennie** 7:00 UTC (limit **Hobby Vercel**) |
| `c2021f4` | fix(ops): `publishedAt` po `unstable_cache` jako string w bridge |

**Ważne:** Plan Hobby Vercel **nie pozwala** na cron co godzinę. W `vercel.json`: **`0 7 * * *`** (raz dziennie). Ręczny refresh przy ważnym locie:

```bash
npm run ops:refresh
npm run ops:briefs    # tylko brakujące briefy z cache
curl -H "Authorization: Bearer $CRON_SECRET" https://webspacestation.pl/api/cron/ops-refresh
```

---

## Co to jest „Centrum operacyjne" (stan po sesji 13.06)

| Warstwa | Gdzie | Co pokazuje |
|--------|--------|-------------|
| **Strip (NOWY)** | Pod hero | Następny start + odliczenie + **Kontekst** (brief AI) + ISS live + skróty |
| **Panel (STARY — uproszczony)** | Dół homepage (`ContentGrid`) | Tylko mapa + timeline — bez duplikatów ✅ |

---

## Roadmap Centrum operacyjne — krok po kroku

Statusy: ✅ DONE · 🔄 PARTIAL · ⏳ TODO · 🚫 poza scope

| # | Krok | Status | Opis |
|---|------|--------|------|
| **0–3c** | Strip, nav, LL2, briefy, most artykuł↔start | ✅ | commity `8ce2737`+ |
| **4** | Fix „zapas" + komunikat antenowy | ✅ | `414eed8` |
| **5** | Deploy + env + cron | ✅ | `c2021f4`; cron **1×/d** (Hobby) |
| **6** | Stary panel CO → tylko mapa + timeline | ✅ | sesja 13.06, do push |
| **live ISS** | Hook klientowy — realny ruch markera i linii | ✅ | sesja 13.06, do push |
| **7** | ISS funnel spójny | ✅ | Usunięto cały dolny panel CO (legacy); Strip = jedyne CO na homepage |
| **8** | `/starty` + `/kalendarz` UX | ✅ | Hero slot dla primary launch (2-col); grid 3 kol; limit briefów 12 |
| **9** | AI briefy faza B (web search) | ✅ | gpt-4o-search-preview dla NROL/Crew/Starship; fallback do batcha |
| **10** | Playbook FB przed startem | ⏳ | Proces, nie kod |
| **11** | CMS `linkedLaunchId` | ⏳ | Opcjonalnie |
| **12** | Newsletter / TikTok | 🚫 | później |

**Kolejna sesja:** 10 playbook FB.

**Opcjonalnie:** `npm run ops:briefs` na prod (4 starty bez „Kontekstu") · token LL2 gdy 429 wróci · gładka orbita (SGP4 przez `satellite.js` v5 gdy shell wróci).

---

## Env (local + Vercel prod)

```env
OPS_LAUNCH_BRIEFS_OPENAI_API_KEY="..."   # wss-starty — NA PROD ✅
OPENAI_API_KEY="..."                      # RSS only
OPENAI_TRANSLATION_MODEL="gpt-5.4-mini"
CRON_SECRET="..."
# LAUNCH_LIBRARY_API_TOKEN="..."          # opcjonalnie, user: na razie bez
# OPS_LAUNCH_BRIEFS=false
# OPS_SSR_FETCH_EXTERNAL="true"           # tylko debug — wymusza LL2 przy SSR
```

**Architektura danych na Vercel:** SSR read-only z Supabase · LL2/ISS/NASA tylko w `/api/cron/ops-refresh` · ISS live = polling z przeglądarki (wheretheiss.at, bez crona).

---

## ISS — stan po sesji 13.06

| Element | Stan |
|---------|------|
| Strip homepage | **Live** — `OpsIssShowcase` z `useLiveIssTrack`, tyka co 4 s |
| `/mapa` marker | **Live** — `OpsLiveMap` z `useLiveIssTrack`, marker na linii orbity |
| `/mapa` orbita | **Live** — 10-punktowy ground track odświeżany co 45 s |
| `/mapa` telemetria | **Live** — szer/dług/wys/prędkość tykają |
| Stary panel CO | Usunięty `LiveMissionCenter` (ISS coords standalone) ✅ |
| `/iss` | Artykuły — newsy, nie duplikat trackera |

---

## Kluczowe pliki

- Strip: `HomepageOpsStrip.tsx`, `OpsLaunchShowcase`, `OpsLaunchFeedPaused`, `LaunchBriefBlock`
- Live ISS: `hooks/useLiveIssTrack.ts`, `OpsIssShowcase.tsx`, `OpsLiveMap.tsx` (followIss + Sledz ISS)
- QuickNav: `OpsQuickNav.tsx` (prop `exclude`)
- Homepage: `ContentGrid.tsx` — dolny panel CO **usunięty**
- Starty: `app/starty/page.tsx` (hero slot, grid 3 kol)
- Briefy: `generate-launch-briefs.ts`, `launch-brief-config.ts`, `launch-brief-interesting.ts` (NOWY), `launch-brief-web-search.ts` (NOWY)
- Cache: `lib/ops/fallback.ts`, `fetch-core-snapshot.ts`, `get-ops-data.ts`, `snapshot-store.ts`, `ops-ssr-mode.ts`
- Cron: `app/api/cron/ops-refresh/route.ts`, `vercel.json` (schedule `0 7 * * *`)

---

## Reguły usera (nie zapominać)

- Bez commit / push / deploy prod **bez explicit OK**
- FB auto-post przy PUBLISH — DONE, nie proponować od nowa
- Copy outage: „Ustawiamy anteny, łapiemy sygnał" — **bez długich myślników** w tekstach UI
- User solo — małe kroki, pytaj co dalej po każdym etapie roadmapy

---

## Sesja 13.06.2026 (rano) — co zrobiono

Wszystkie zmiany z tej sesji są **niezcommitowane** — user pushuje sam.

### Krok 7 — ISS funnel + CO cleanup
- Usunięto cały dolny panel CO z homepage (`ContentGrid`): `MapaStartow`, `TimelineWydarzen`, `DashboardWidgets`, `HomepageOpsDashboardLoader`, `OpsDashboardSkeleton` + wszystkie importy (`getHomepageOpsData`, `OPS_THEME`, `OpsScheduleList`, `OpsSnapshot`, `Globe`, `Rocket`, `Suspense`, `formatIssForReader`)
- Funnel ISS: Strip (live) → `/mapa` (live). Zero duplikatów.
- `OpsQuickNav`: nowy prop `exclude: string[]` — strip przekazuje `exclude={["/mapa"]}` (OpsIssShowcase już tam linkuje)

### ISS follow na `/mapa`
- `OpsLiveMap`: nowy prop `followIss?: boolean` + `useState(followIss)`
- `MapViewController`: refactoring — `initDoneRef` (nie `didInitialFit`), `onUserMoved` callback, gdy `followIss=true` → `map.panTo()` co każdą aktualizację `liveIss`
- Gdy user przeciągnie (`dragstart`) → `isFollowing=false`, pojawia się przycisk „● Śledź ISS" w lewym dolnym rogu → klik wznawia śledzenie
- `OpsMissionMap`: nowy prop `followIss` przekazany do `OpsLiveMap`
- `/mapa/page.tsx`: `followIss={!!ops.iss}`

### Krok 8 — `/starty` UX
- Grid: `xl:grid-cols-4` → `sm:grid-cols-2 lg:grid-cols-3`
- Pierwszy start (`pickPrimaryLaunch`) = `sm:col-span-2` — hero slot z miejscem na brief
- `OPS_LAUNCH_BRIEFS_BATCH_LIMIT`: 8 → **12**

### Krok 9 — AI briefy faza B (web search)
- **NOWY** `lib/ops/launch-brief-interesting.ts` — `isInterestingLaunch()`, wzorce: NROL, Crew Dragon, Starship, Artemis, SLS, Starliner, Axiom, USSF, CRS, misje naukowe
- **NOWY** `lib/ops/launch-brief-web-search.ts` — `generateBriefWithWebSearch()`, model `gpt-4o-search-preview`, `web_search_options: { search_context_size: "low" }`, usuwa cytowania `[1][2]`, fallback do batcha gdy padnie
- `launch-brief-config.ts`: `getWebSearchModel()` (default `gpt-4o-search-preview`), `isWebSearchBriefsEnabled()`, env `OPS_LAUNCH_BRIEFS_WEB_SEARCH=false` jako opt-out, `OPS_LAUNCH_BRIEFS_WEB_SEARCH_MODEL` jako override
- `generate-launch-briefs.ts`: split `pending` → `interesting` (web search, sekwencyjnie) + `routine` (batch); fallback routine gdy web search pada; logi `[ops:briefs]`

---

## Prompt na następny czat (SKOPIUJ PONIŻEJ)

```
Kontynuacja WSS — Centrum operacyjne (repo: wss-nowa, branch main)

## Przeczytaj najpierw
- docs/WSS_OPS_MISSIONS_HANDOFF.md — CAŁY

## Stan po sesji 13.06 (rano)
- Kroki 7/8/9 DONE + ISS follow na /mapa + dolny panel CO usunięty
- Wszystkie zmiany niezcommitowane — user pushuje sam
- Centrum operacyjne roadmapa w 90% done (zostało: 10 playbook FB, 11 CMS linkedLaunchId opcjonalnie)

## NIE robić od nowa
- FB auto-post, mocki zapas, deploy bez OK usera

## Opcjonalnie do ogarnięcia
- npm run ops:briefs na prod (briefy przez nową ścieżkę web search)
- gładka orbita: satellite.js v5 (czysty JS, bundluje się) gdy shell wróci
- LAUNCH_LIBRARY_API_TOKEN na Vercel gdy user da token

## Kluczowe pliki (nowe z tej sesji)
- lib/ops/launch-brief-interesting.ts (NOWY)
- lib/ops/launch-brief-web-search.ts (NOWY)
- lib/ops/launch-brief-config.ts (getWebSearchModel, isWebSearchBriefsEnabled)
- lib/ops/generate-launch-briefs.ts (split interesting/routine)
- components/discover/OpsLiveMap.tsx (followIss, przycisk Sledz ISS)
- components/discover/OpsQuickNav.tsx (prop exclude)
- app/starty/page.tsx (hero slot, grid 3 kol)
```

---

---

## Sesja 13.06.2026 (noc) — co zrobiono: tagi + brand huby

### ✅ Strony tagów `/tag/[slug]`

| Plik | Co robi |
|------|---------|
| `prisma/migrations/20260613010000_article_tags_gin_index/migration.sql` | GIN index na `tags[]` (nałozony na prod przez `prisma migrate deploy`) |
| `prisma/schema.prisma` | `@@index([tags], type: Gin)` |
| `lib/server/articles.ts` | `getArticlesByTagPage(tag: string | string[], ...)` — hasSome dla tablicy; `getPublishedTags()` — lista tagów do sitemapa |
| `lib/articles.ts` | eksport publiczny `getArticlesByTagPage` |
| `app/tag/[slug]/page.tsx` | SSR strona tagu: 404 gdy brak, grid 3 kol, featured card, paginacja, SEO canonical |
| `app/sitemap.ts` | tag pages w sitemapie z `priority: 0.6`, `changeFrequency: daily` |
| `lib/seo/public-routes.ts` | dodane `/nasa`, `/spacex`, `/esa`, `/jwst` |

**Dziala:** `/tag/JWST`, `/tag/NASA`, `/tag/SpaceX`, `/tag/Artemis` i setki innych automatycznie z DB.

### ✅ Brand/agency huby

| Route | Accent | Tagi |
|-------|--------|------|
| `/nasa` | `#1d9bf0` | `["NASA"]` |
| `/spacex` | `#e8f0ff` | `["SpaceX"]` |
| `/esa` | `#00b4d8` | `["ESA"]` |
| `/jwst` | `#f97316` | `["JWST", "James Webb", "James Webb Space Telescope"]` |

**Architektura:**
- `components/pages/HubPageShell.tsx` — reużywalny shell: editorial intro (akapity), related hubs, grid artykułów, paginacja
- `HubConfig` type: `slug`, `title`, `tagline`, `description`, `accent`, `tags[]`, `intro[]`, `related[]`
- Nowy hub = nowy plik `app/[slug]/page.tsx` z konfiguracją, zero nowego kodu

**Reguła:** NIE uzywaj dlugich myslnikow (em dash `—`) w zadnych tresciach UI/hubów.

### Planowane kolejne huby (SEO priority)

Dodac analogicznie jak `/nasa` — kazdy nowy hub = ~20 min:

| Hub | Slug | Tagi |
|-----|------|------|
| Teleskop Hubble'a | `/hubble` | `["Hubble"]` |
| Czarne dziury | `/czarne-dziury` | `["czarna dziura", "czarne dziury", "supermasywne czarne dziury"]` |
| Egzoplanety | `/egzoplanety` | `["egzoplanety", "exoplanets"]` |
| Mars | `/mars` | `["Mars"]` |
| Ksiezyc | `/ksiezyc` | `["Księżyc", "Moon"]` |
| ISS | `/stacja-kosmiczna` | `["ISS", "Międzynarodowa Stacja Kosmiczna"]` |
| Blue Origin | `/blue-origin` | `["Blue Origin"]` |
| Starlink | `/starlink` | `["Starlink"]` |
| Artemis | `/artemis` | `["Artemis", "Artemis III"]` |
| Czarna materia | `/ciemna-materia` | `["ciemna materia"]` |

**Uwaga:** tagi w DB maja niespojny format (mixed case, spacje). Przy dodawaniu nowych artykulow warto normalizowac (lowercase slug). Na razie nie blokuje.

### Do zrobienia (kolejna sesja)

- Dodac ~10 kolejnych hubów z listy powyzej
- Auto-linking artykul → hub w `lib/article/weave-internal-links.ts` (NASA w tekscie → link do `/nasa`)

---

## Inne handoffy

- Perf: `docs/WSS_PERF_CHAT_HANDOFF.md`
- GA4 / lajki: `docs/WSS_GA4_LIKES_HANDOFF.md`
- Ogólny: `docs/WSS_NEXT_CHAT_HANDOFF.md`
