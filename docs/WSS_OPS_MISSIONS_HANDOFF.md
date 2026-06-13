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

### ✅ Topic huby (sesja 13.06 noc — część 2) — DONE

Wszystkie 10 zaplanowanych hubów dodane i zdeployowane:

| Hub | Slug | Accent |
|-----|------|--------|
| Teleskop Hubble'a | `/hubble` | `#a78bfa` |
| Czarne dziury | `/czarne-dziury` | `#7c3aed` |
| Egzoplanety | `/egzoplanety` | `#10b981` |
| Mars | `/mars` | `#ef4444` |
| Księżyc | `/ksiezyc` | `#94a3b8` |
| Blue Origin | `/blue-origin` | `#1d6fa4` |
| Starlink | `/starlink` | `#06b6d4` |
| Program Artemis | `/artemis` | `#f59e0b` |
| Ciemna materia | `/ciemna-materia` | `#6d28d9` |
| ISS / Stacja kosmiczna | `/stacja-kosmiczna` | `#38bdf8` |

### ✅ Hub anchor text linking — DONE

| Plik | Co robi |
|------|---------|
| `lib/article/hub-anchor-links.ts` | `HUB_LINK_RULES[]` — 14 reguł keyword→hub z polską fleksją (Księżycu, Marsa, czarną dziurą itp.); `injectHubAnchors(text, usedHrefs)` |
| `components/article/ArticlePageBodyMain.tsx` | `usedHubHrefs = new Set()` przez cały artykuł; `injectHubAnchors()` przed `renderInlineMarkdown()` na leadzie i każdym paragrafie |

**Jak działa:** tekst "NASA ogłosiła..." → `[NASA](/nasa) ogłosiła...` → `<a href="/nasa">NASA</a> ogłosiła...`
**Reguły:** 1 link na hub na artykuł, nie linkuje w środku istniejących `[label](url)` / `**bold**` / URL, Unicode word boundary dla polskich znaków.

**Commit:** `68cbc07` (fix lint) na `main` — prod deploy OK.

### Sesja 13.06.2026 (noc, czesc 3) — co zrobiono

**1. Audit tagow — DONE**
- Sprawdzono wszystkie 14 hubow vs rzeczywiste tagi w DB
- Jedyny problem: `/hubble` = 0 artykulow (tag "Hubble" nie istnieje w DB)
- Fix: rozszerzono `tags` w `app/hubble/page.tsx` o polskie warianty: `["Hubble", "Teleskop Hubble'a", "Kosmiczny Teleskop Hubble'a", "HST"]`
- Pozostale huby OK: NASA (12), ESA (6), SpaceX (4), JWST (4), Artemis (4), Blue Origin+New Glenn (~6), Ksiezyc (3), ISS (~3), czarne dziury (~5), egzoplanety (2), Mars (2), Starlink (1), ciemna materia (1)

**2. Widget "Powiazane huby" — DONE**
- `lib/article/related-hubs.ts` (NOWY) — `HubRef` type + `HUB_MATCH_RULES[]` + `getRelatedHubs(articleTags, max)` — zwraca do 3 hubow matchujacych tagi artyku­lu
- `components/article/RelatedHubsWidget.tsx` (NOWY) — kafelki 1/3 kol, accent kolor tytulu, tagline, chevron on hover
- `app/aktualnosci/[slug]/page.tsx` — `<RelatedHubsWidget tags={article.tags ?? []} />` miedzy ReturnBand a ReadNextSection
- Widget ukryty gdy 0 matchow

**3. Huby w nawigacji i footerze — DONE**
- `components/layout/Footer.tsx` — nowa kolumna "Tematy" z 12 hubami (NASA, SpaceX, ESA, JWST, Artemis, Mars, Ksiezyc, Stacja kosmiczna, Czarne dziury, Egzoplanety, Starlink, Blue Origin); grid rozszerzony do `sm:grid-cols-4`
- `lib/ui/nav-menu-config.ts` — `NAV_HUB_LINKS[]` (5 kluczowych hubow: NASA, SpaceX, JWST, Mars, Ksiezyc) + dodane do `NAV_MOBILE_SECTIONS` jako sekcja "Przewodniki" + do `NAV_ALL_PUBLIC_LINKS`
- `components/layout/Navbar.tsx` — dropdown "Kategorie" ma nowa sekcje "Przewodniki" z `NAV_HUB_LINKS`; mobile: nowy accordion "Przewodniki" (id: "hubs")

### Do zrobienia (kolejna sesja)

**Centrum operacyjne:**
- Krok 10: Playbook FB przed startem (proces, nie kod)
- `npm run ops:briefs` na prod (briefy przez nowa sciezke web search)

**SEO / huby:**
- Dodac artykuly z tagiem "Hubble" / "Teleskop Hubble'a" — hub `/hubble` ma 0 artykulow
- Rozwazyc: Teleskop Hubble'a + Spitzer jako osobny evergreen w dziale Nauka

### Sesja 13.06.2026 (noc, czesc 4) — Likwidacja dzialu Rozrywka — DONE

Podjeta decyzja: Rozrywka zaburzala topical authority portalu (gaming bez sci-fi/kosmosu).

**DB (prod, juz usuniete):**
- 8 artykulow usunieto (Gothic, EVE Frontier, Star Citizen, Stellaris, X4, Star Fox, No Man's Sky, PlayStation SoP)
- Kategoria `rozrywka` usunieta z tabeli `categories`

**Kod — zmiany we wszystkich plikach produkcyjnych:**
- `app/rozrywka/page.tsx` — usuniety
- `lib/editorial/rozrywka.ts` — usuniety
- `types/index.ts` — usuniete `| "rozrywka"` z `NewsCategory`
- `lib/categories.ts` — usuniete z CATEGORY_INFO, CATEGORY_FALLBACK_BG, EDITOR_HINTS, SLUG_ORDER, HOMEPAGE_DEPARTMENT_SLUGS
- `lib/departments/subscriptions.ts` — usuniete z SUBSCRIBABLE_DEPARTMENT_SLUGS
- `lib/ui/nav-menu-config.ts` — usuniete z NAV_CATEGORY_LINKS, import Gamepad2
- `components/layout/Footer.tsx` — usuniete z sekcji Nawigacja
- `lib/seo/public-routes.ts` — usuniete `/rozrywka` z sitemapki
- `lib/cover-fallbacks.ts` — usuniety pool okładek rozrywki
- `lib/home/homepage-section-themes.ts` — usuniete z HomepageSectionTheme + themeMap
- `lib/site-layout.ts` — usuniete z HOMEPAGE_V2_CATEGORY_SLUGS
- `components/sections/ContentGrid.tsx` — usuniete z SECTION_LAYOUTS
- `app/aktualnosci/[slug]/page.tsx` — usuniete z CATEGORY_META + CATEGORY_FALLBACK
- `lib/ui/article-preview-meta.ts` — usuniete z PREVIEW_CATEGORY_META + PREVIEW_CATEGORY_FALLBACK
- `lib/article/weave-category-rules.ts` — usuniete reguly deny/fallback dla rozrywki
- `lib/editorial/resolve-editorial-cover.ts` — usuniety import + logika rozrywka
- 3 pliki testow — zaktualizowane

**Nic niezcommitowane — user pushuje sam.**

**Aktywne dzialy po likwidacji:** Misje, Astronomia, Nauka, Technologie, ISS, Ziemia z kosmosu

---

## Inne handoffy

- Perf: `docs/WSS_PERF_CHAT_HANDOFF.md`
- GA4 / lajki: `docs/WSS_GA4_LIKES_HANDOFF.md`
- Ogólny: `docs/WSS_NEXT_CHAT_HANDOFF.md`
