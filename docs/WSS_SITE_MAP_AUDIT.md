# WSS — Mapa strony i audyt produktu (pełny)

**Data:** 4 czerwca 2026  
**Prod:** https://webspacestation.pl · remote `main` @ `a5ab17c`  
**Lokalnie:** WIP (logo C, flat theme, bez dev switcherów) — **bez commita**

**Kolejne kroki pracy:** `docs/WSS_STEP_BY_STEP_BACKLOG.md` (krok po kroku + OK usera).

Legenda ocen: **Dobrze** · **Średnio** · **Brak / słabo** · **Do dodania**

---

## 0. Szkielet na każdej stronie publicznej

| Element | Plik | Na stronie |
|---------|------|------------|
| Tło | `SiteBackground.tsx`, `globals.css` | Płaskie `#060810` (WIP) |
| Navbar | `Navbar.tsx`, `nav-menu-config.ts` | Logo C, Aktualności, 3 działy, Kategorie (2), Więcej (4), Szukaj, Powiadomienia, Konto |
| Footer | `Footer.tsx` | Newsletter (bez API — tylko UI), 3 kolumny linków, © 2026 |

---

## 0b. Homepage `/` — sekcje w kolejności (ContentGrid.tsx)

| # | Nagłówek usera | Dane | Ocena |
|---|----------------|------|--------|
| 1 | Hero slider | DB `heroPosition` 1–4 | Dobrze |
| 2 | Najnowsze (mobile 6 + desktop rail 5) | `publishedAt` desc | Dobrze |
| 3 | Temat tygodnia (jeśli jest) | CMS `weekTopic` | Średnio |
| 4 | Popularne | ranking + lajki | Średnio |
| 5–9 | Technologie, Astronomia, Misje, Ziemia, ISS | po 4 artykuły z DB | Dobrze |
| 10 | Centrum operacyjne | **LAUNCHES[], MISSION_PINS[], EVENTS[] — sztywno** | Brak/mock |
| — | **Ważne teraz** | **NIE renderowane** — do usunięcia z repo | Wyrzucić kod |

---

## 0c. Artykuł `/aktualnosci/[slug]`

Hero → treść (+ weave linki) → Kontekst WSS → Źródło → panel WSS → sidebar Informacje + Powiązane → Dyskusja (ShareBar + **Comments localStorage**) → Koniec artykułu → Czytaj dalej → Powiązane (dół).

---

## 0d. Sekcja „Odkrywaj” (krok 5+6, WIP lokalnie)

`/starty`, `/kalendarz`, `/mapa`, `/galeria`, `/wideo` — żywe dane (`lib/ops/`: Launch Library 2.3, ISS, NASA, redakcja). Homepage: Centrum operacyjne z tym samym feedem.

---

## 1. Mapa tras publicznych (URL → plik)

| URL | Plik | Stan produktu |
|-----|------|----------------|
| `/` | `app/page.tsx` → `ContentGrid` | **Dobrze** — hero slider, Najnowsze, Ważne teraz, Popularne, działy, ops panel |
| `/aktualnosci` | `app/aktualnosci/page.tsx` → `ArticleFeedSection` | **Dobrze** — lista 40 szt., filtry działów (bez dev copy pod tytułem) |
| `/aktualnosci/[slug]` | `app/aktualnosci/[slug]/page.tsx` | **Dobrze** — hero, treść B+, kontekst, źródło, powiązane, czytaj dalej, dyskusja |
| `/misje` | `app/misje/page.tsx` | **Dobrze** — feed kategorii + featured |
| `/astronomia` | `app/astronomia/page.tsx` | j.w. |
| `/technologie` | `app/technologie/page.tsx` | j.w. |
| `/ai` | `app/ai/page.tsx` | j.w. |
| `/ziemia-z-kosmosu` | `app/ziemia-z-kosmosu/page.tsx` | j.w. |
| `/iss` | `app/iss/page.tsx` | j.w. |
| `/starty` | `app/starty/page.tsx` | **Dobrze** — LL2, odliczenie live, misja + rakieta |
| `/kalendarz` | `app/kalendarz/page.tsx` | **Dobrze** — timeline z NET startów |
| `/mapa` | `app/mapa/page.tsx` | **Średnio** — ISS + wyrzutnie (mapa uproszczona) |
| `/galeria` | `app/galeria/page.tsx` | **Dobrze** — NASA APOD + Image + WSS |
| `/wideo` | `app/wideo/page.tsx` | **Dobrze** — NASA Video Library |
| `/rss` | `app/rss/page.tsx` | **Średnio** — Subskrypcje (feed XML), nie pełny hub |
| `/search` | `app/search/page.tsx` + `SearchClient` | **Średnio** — działa z nav; osobna strona mało eksponowana |
| `/profil` | `app/profil/page.tsx` | **Dobrze** — redesign, statystyki, lajki (jeśli SQL wdrożony) |
| `/logowanie`, `/login` | `app/logowanie/page.tsx`, `app/login/page.tsx` | **Dobrze** — Supabase auth |
| `/rejestracja` | `app/rejestracja/page.tsx` | **Dobrze** |
| `/notifications` | `app/notifications/page.tsx` | **Średnio** — UI; backend ograniczony |
| `/feed.xml`, `/feed/[category]` | `app/feed.xml/route.ts`, `app/feed/[category]/route.ts` | **Dobrze** — RSS public |
| `not-found` | `app/not-found.tsx` | **Średnio** — podstawowy |

---

## 2. CMS / Admin (osobna warstwa — nie na froncie publicznym)

| URL | Plik | Stan |
|-----|------|------|
| `/admin` | `app/admin/page.tsx` | redirect / dashboard |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | **Dobrze** — statystyki |
| `/admin/articles` | `app/admin/articles/page.tsx` | **Dobrze** — filtry, archiwum, workflow |
| `/admin/articles/new` | `app/admin/articles/new/page.tsx` | **Dobrze** |
| `/admin/articles/[id]/edit` | `app/admin/articles/[id]/edit/page.tsx` | **Dobrze** — unified editor, AI RSS, schedule |
| `/admin/articles/[id]/preview` | `app/admin/articles/[id]/preview/page.tsx` | **Dobrze** — 1:1 z portalem |
| `/admin/categories` | `app/admin/categories/page.tsx` | **Średnio** |
| `/admin/archive` | `app/admin/archive/page.tsx` | **Dobrze** |
| `/admin/media` | `app/admin/media/page.tsx` | **Średnio** |
| `/admin/users` | `app/admin/users/page.tsx` | **Średnio** — RBAC |

**Layout admin:** `app/admin/layout.tsx` → `AdminShell`, `AdminSidebar`, `ScheduledPublishPoller`

---

## 3. API i cron (backend)

| Endpoint / job | Plik | Stan |
|----------------|------|------|
| `GET/POST /api/articles` | `app/api/articles/route.ts` | **Dobrze** |
| `GET/PATCH /api/articles/[slug]` | `app/api/articles/[slug]/route.ts` | **Dobrze** |
| `POST publish-scheduled` | `app/api/articles/publish-scheduled/route.ts` | **Średnio** — manual/cron Hobby |
| `POST permanent-delete` | `app/api/articles/permanent-delete/route.ts` | **Dobrze** |
| `POST cover-upload` | `app/api/admin/cover-upload/route.ts` | **Średnio** — prod wymaga env |
| `GET /api/cron/rss` | `app/api/cron/rss/route.ts` | **Dobrze** — 1×/dobę |
| `GET /api/cron/publish-scheduled` | `app/api/cron/publish-scheduled/route.ts` | **Średnio** — usunięty z Hobby cron |
| Auth provision / session | `app/api/auth/*` | **Dobrze** |
| `revalidate-articles` | `app/api/revalidate-articles/route.ts` | **Dobrze** |

---

## 4. Drzewo plików kluczowych (skrót)

```
app/
  layout.tsx          — root: fonty, SiteBackground, AuthProvider (bez dev switcherów)
  globals.css         — design system + presety tła (hardcoded slate-soft)
  page.tsx            — homepage
  aktualnosci/        — lista + [slug] artykuł
  {misje,astronomia,...}/ — działy (ArticleFeedSection)
  {starty,kalendarz,mapa,galeria,wideo}/ — ComingSoon
  admin/              — CMS
  api/                — REST + cron
  profil, search, rss, auth routes

components/
  layout/             — Navbar, Footer, SiteBackground
  brand/              — WssLogo, WssLogoWordmark (C), wordmarks/
  sections/           — ContentGrid, Hero*, sliders, ArticleFeedSection
  article/            — karty, hero, treść, share, komentarze, read-next
  admin/              — edytor, tabele, upload okładek
  auth/, profile/, notifications/

lib/
  articles.ts         — public fetch, toNewsArticle
  server/articles.ts  — CMS CRUD, workflow, publish
  home/               — rank-articles, hero-slides, week-topic
  rss/                — ingest, AI B+, process
  article/            — related, weave-internal-links
  ui/                 — portal themes (dev presets w CSS), hero-frame, nav config
  auth/, prisma/, cache/, likes/, ai/

prisma/               — schema + migracje
scripts/              — RSS, backfill, publish (CLI — nie UI)
docs/                 — handoff, roadmap, ten audyt
```

**Usunięte z frontendu (czat 37):** `components/dev/*`, `PortalThemeBootScript`, `PortalThemeRoot`, `LogoVariantBootScript`, `hooks/useWssLogoVariant.ts`

---

## 5. Ocena obszarów produktu

### 5.1 Dobrze (gotowe na prod / user OK)

| Obszar | Pliki / uwagi |
|--------|----------------|
| **News Engine** | RSS → DRAFT → AI → REVIEW → ręczny PUBLISHED; `lib/rss/*` |
| **Strona artykułu** | lead + body + Kontekst WSS + źródło; hero mobile/desktop |
| **Homepage** | slider hero, ranking sekcji, dedupe, week topic (kod) |
| **Linki w treści** | `weave-internal-links` — do 4, prod `a5ab17c` |
| **CMS workflow** | `articleStateTransition`, bez autosave status |
| **Live preview CMS** | split editor, debounce |
| **Tło flat** | `#060810`, bez dev switchera — user OK lokalnie |
| **Artykuł dół** | share, komentarze, read-next — user OK |
| **Logo (tymczasowo C)** | Oswald WSS lockup — `WssWordmarkControl` |
| **Deploy** | Vercel z `main`, pooler Supabase |

### 5.2 Średnio (działa, wymaga dopracowania)

| Obszar | Problem | Możliwa poprawa |
|--------|---------|-----------------|
| **~175 REVIEW** | Kolejka redakcyjna | User publikuje partiami; opcjonalnie bulk w CMS |
| **Komentarze** | `localStorage`, nie Supabase | Tabela + API + moderacja |
| **Lajki** | SQL gotowy, Popularne częściowo | Pełna spójność prod + profil |
| **Upload okładek** | Kod WebP/sharp | `SUPABASE_SERVICE_ROLE_KEY` + bucket prod |
| **Scheduler** | Zaplanuj w CMS; cron Hobby limit | Poller przy otwartym CMS / zewn. cron |
| **getRelatedArticles** | Full scan puli | Indeks / query po tagach |
| **Preset tła** | 10 wariantów w CSS, hardcoded jeden | User wybór → commit, bez switchera |
| **Logo A/B** | Kod wordmarków zostaje | Po decyzji: jeden wariant, usunąć martwe pliki |
| **Sekcje ComingSoon** | 5 URL w nav | Treść albo ukryć z menu do czasu launch |
| **Temat tygodnia** | Kod OK | Prod smoke + revalidate |
| **Search** | W nav OK | SEO strona `/search` |

### 5.3 Brak / słabo (nie zrobione)

| Obszar | Uwagi |
|--------|--------|
| **Starty, kalendarz, mapa, galeria, wideo** | Tylko placeholder |
| **Komentarze w DB** | Brak trwałości między urządzeniami |
| **Auto-publish RSS** | Celowo wyłączone (zasada) |
| **Pełny RSS body na stronie** | Hybryda B+ — celowo |
| **AI embeddings / pgvector** | Backlog P3 |
| **Bulk publish REVIEW** | Brak w CMS |
| **Favicon = wordmark C** | SVG uproszczony, nie identyczny z Oswald |

### 5.4 Do dodania (propozycje, nie w scope)

| Pomysł | Wartość |
|--------|---------|
| Licznik „Do sprawdzenia” w CMS | OPS ~175 |
| Newsletter / push | Retencja |
| Mapa startów (API Launch Library / SpaceX) | Różnicowanie vs agregatory |
| ISS tracker live | ISS dział |
| Dark/light toggle | Obecnie tylko dark editorial |
| Komentarze Supabase + moderacja | Społeczność |
| Embeddings related articles | Lepsze „Czytaj dalej” |
| Sitemap XML + JSON-LD Article | SEO |
| i18n EN | Ekspansja |
| Statystyki czytania / heatmap | Redakcja |

---

## 6. Komponenty publiczne — szybki indeks

| Komponent | Rola | Ocena |
|-----------|------|-------|
| `Navbar` | Nav, search, auth, mobile menu | **Dobrze** |
| `Footer` | Linki, logo 48px | **Dobrze** |
| `ContentGrid` | Homepage orchestration | **Dobrze** |
| `HomepageHeroSlider` | Hero 1–4 z CMS | **Dobrze** |
| `ArticleFeedSection` | Listy działów | **Dobrze** (po usunięciu CMS subtitle) |
| `ArticleCard` | Karty list | **Dobrze** |
| `ArticlePageHero` / `BodyMain` | Artykuł | **Dobrze** |
| `ShareBar`, `Comments`, `LikeButton` | Interakcje | **Średnio** (komentarze local) |
| `ReadNextSection` | Czytaj dalej | **Dobrze** |
| `WeekTopicSection` | Temat tygodnia | **Średnio** (widoczność prod) |
| `SiteBackground` | Płaskie tło | **Dobrze** |
| `WssLogoWordmark` | Logo C | **Średnio** — czeka final OK usera |

---

## 7. Zasady niepodważalne (stan)

- Okładka `object-cover` — **tak**
- `publishedAt` = #1 w Najnowszych — **tak**
- `heroPosition` nie wyklucza z Najnowszych — **tak**
- Public tylko PUBLISHED — **tak**
- NIE auto-publish RSS — **tak**
- **Brak dev UI na froncie** — **tak** (po czacie 37)

---

## 8. Następne kroki

→ **`docs/WSS_STEP_BY_STEP_BACKLOG.md`** (kroki 0–6, reguła OK po każdym).

*Aktualizuj ten plik przy większych zmianach architektury lub nowych działach.*
