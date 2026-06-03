# WSS — Handoff na następny czat (żywy dokument)

**Ostatnia aktualizacja:** 3 czerwca 2026 (sesja 16 — P0-SCHED cron co 1 min, panel Archiwum + trwałe usuwanie)  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Domena prod:** https://webspacestation.pl  
**Ostatni commit na remote:** `b2e6ea6` — hard-lock Article data flow  
**Lokalnie (NIE commit):** ~25+ plików — sesje 13–15 (patrz sekcja 8 + lista plików poniżej)  
**Na remote po push:** wymaga `git commit` + `git push` przed prod

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

## STARTING PROMPT — SKOPIUJ DO NOWEGO CZATU

```
Kontynuujemy WSS (Next.js 15, Supabase, Prisma, Vercel, Tailwind v4).

Przeczytaj ZAWSZE najpierw:
- docs/WSS_NEXT_CHAT_HANDOFF.md (ten plik)
- docs/WSS_ROADMAP_BACKLOG_V3.md (tracker planów v3 — checkboxy)
- docs/WSS_NEWS_ENGINE_HANDOFF.md (architektura News Engine)

## PRIORYTET #1 — zaplanowana publikacja O DOKŁADNEJ GODZINIE

User wymaga: termin w CMS (np. 22:06) → artykuł sam przechodzi na PUBLISHED o tej minucie.

**Sesja 16 (kod):**
- `vercel.json`: `/api/cron/publish-scheduled` → `* * * * *` (co minutę)
- `runScheduledPublish()` → `publishedAt = publishAt` (termin planu)
- Dev: `npm run publish:scheduled:watch` (poll co 60 s)
- **Do QA na prod:** Vercel Hobby może nadal ograniczać crony — jeśli minuta nie działa, zewnętrzny ping co 1 min do `/api/cron/publish-scheduled` + `CRON_SECRET`

Workaroundy CMS (zostają jako awaryjne):
- POST /api/articles/publish-scheduled
- „Opublikuj przeterminowane” na liście Zaplanowane

## Stan lokalny (nie na remote)

Remote: b2e6ea6. Wszystko poniżej lokalnie — commit + push przed prod.

Zrobione lokalnie (sesje 14–15):
- Preview CMS = tylko URL okładki (bez fallback RSS w podglądzie)
- Najnowsze: sort publishedAt desc; /aktualnosci → getLatestArticles; homepage rankLatest
- publishedAt tylko przy Opublikuj; timeLabel od publishedAt (nowe OK; stare mogą być „23 min temu” po backfill — OK dla usera)
- Zaplanuj: UI 24h (dzień + miesiąc PL + rok + godz + min), lib/admin/schedule-datetime.ts
- Autosave nie kasuje publishAtLocal

## Komendy

npm run publish:scheduled          # ręcznie: due SCHEDULED → PUBLISHED
npm run publish:scheduled:watch    # dev: poll co 60 s
npm run db:fix-published-at        # jednorazowy backfill publishedAt (lokalnie 39 szt.)
npm run cache:revalidate
npm run test:ui && npm run test:articles && npm run type-check

Na końcu sesji: ZAKTUALIZUJ docs/WSS_NEXT_CHAT_HANDOFF.md i docs/WSS_ROADMAP_BACKLOG_V3.md.
```

---

## Historia sesji (skrót)

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

| Temat | Status |
|-------|--------|
| **BLOCKER: publikacja zaplanowana o dokładnej godzinie** | **Otwarte — P0 następny czat** (cron/infra, nie tylko UI) |
| **PR10 scheduler SCHEDULED (DB + workflow)** | **Częściowo** — zapis `publishAt` + transition OK; **auto-publish w minucie NIE** |
| Commit + push sesji 13–15 | **Otwarte** — remote nadal `b2e6ea6`, ~25 plików lokalnie |
| Audyt planów v3 | **Zamknięte** — `docs/WSS_ROADMAP_BACKLOG_V3.md` |
| QA preview + Najnowsze (lokalnie) | User potwierdził preview OK; Najnowsze — do smoke po push |
| Kolejka ~175 REVIEW | Publikuj w CMS (workflow OK) |
| `article_likes` 404 | SQL w Supabase |
| Cron dokładna minuta | **Wymagane** — obecnie `0 * * * *` (co pełną godzinę) + limit Hobby |
| `npm run publish:scheduled` | Działa ręcznie (dev/staging) |
| Front/ranking po `contentOrigin` | Opcjonalnie |
| Pełny artykuł RSS na stronie | **Nie** — hybryda B+ (świadomie) |

### Pliki lokalne do commita (skrót)

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
| Auto-publish w dokładnej minucie `publishAt` | ❌ **BLOCKER** — cron/infra |
| Collapsible admin sidebar (PR12) | ✅ |
| contentOrigin badge / Popraw z AI tylko RSS | ✅ |

### Front publiczny
| Obszar | Status |
|--------|--------|
| Homepage sekcje: Ważne teraz / Najnowsze / Popularne (PR8) | ✅ |
| Fallback pustych sekcji (rank-articles) | ✅ |
| Related articles + Czytaj dalej (PR9) | ✅ |
| resolveImage() pipeline (coverImage → image) | ✅ |
| aiScore read-only w API (CMS kolumna) | ✅ |
| Subskrypcje zamiast „Kanały RSS” (PR5) | ✅ |

### Zamknięte PR / handoff
PR1–PR2B contentOrigin · PR3 RSS alignment · PR5 UX · PR6/6.1/7 terminology · PR8 ranking · PR9 related · PR10 scheduler · PR11 preview · PR12 sidebar · PR-H4 backfill · PR-H5 semantic · hard-lock czat 12 · CMS polish czat 13

### Znane otwarte / backlog
- **P0:** Zaplanowana publikacja o wybranej godzinie (np. 22:06) — musi działać bez ręcznego „Opublikuj”
- Commit + push sesji 13–15 (~25 plików lokalnych)
- ~175 REVIEW do publikacji ręcznej
- `article_likes` 404 — SQL w Supabase

---

## 10. Commity (sesja B+ — chronologicznie)

```
e759397 fix(UI): usun meta-disclaimer z boxu Kontekst WSS
24f78d3 fix(RSS): zapis body do Article.content (mapowanie B+)
7c1cc3e feat(RSS): B+ hybryda lead/body/kontekst WSS (contextNote)
17364cd fix(CMS): Popraw z AI nadpisywane przez autosave, duplikat podgladu
```

(Wcześniej: `5428d61`…`bbd98b2` prod/CMS, `eaae2d7` News Engine)

---

*Koniec handoff — przy każdej sesji dopisuj na górze historii i aktualizuj STARTING PROMPT.*
