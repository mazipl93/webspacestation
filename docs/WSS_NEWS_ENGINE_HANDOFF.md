# WSS — News Engine + CMS Pipeline — HANDOFF (pełna sesja)

**Data:** 2 czerwca 2026  
**Projekt:** Next.js 15, Prisma, Supabase, Tailwind v4, Vercel  
**Stan:** Pipeline RSS z moderacją wdrożony lokalnie. Backfill ~175 przeniesiony z `PUBLISHED` → `REVIEW` (nie widać na froncie do ręcznej akceptacji).

---

## STARTING PROMPT — SKOPIUJ DO NOWEGO CZATU

```
Kontynuujemy WSS (Next.js 15, Supabase, Prisma, Tailwind v4). Przeczytaj:
- docs/WSS_NEWS_ENGINE_HANDOFF.md (ten plik — pełny kontekst sesji)
- docs/WSS_PHASE_13_HANDOFF.md (UI, jeśli potrzeba)

## Architektura News Engine (OBOWIĄZKOWA)

Pipeline 3 warstw — NIGDY auto-publish:

1. INGEST (`lib/rss/ingest.ts`) → status DRAFT, surowe EN z RSS, dedupe po originalUrl (unique w DB)
2. AI (`lib/rss/process-drafts.ts`) → tłumaczenie EN→PL → status REVIEW (= ready_for_review)
3. CMS (`/admin/articles`) → ręczne PUBLISHED — tylko to widać na froncie

Cron GET /api/cron/rss (co 30 min): najpierw ingest, potem process — bez revalidate przy ingest.

Frontend: WSZYSTKIE publiczne query → status === PUBLISHED tylko (`lib/server/articles.ts`).

## Co zrobiono w tej sesji

- OpenAI only: OPENAI_API_KEY, OPENAI_TRANSLATION_MODEL=gpt-5.4-mini
- Enrichment: lib/rss/enrich-drafts.ts (jedyny worker AI)
- CMS fix: ingest nie publikuje; 175 backfill → REVIEW (npm run rss:demote-backfill)
- UI: hero tytuł mniejszy/line-clamp; Breaking tylko redakcja; chip „Ze świata” dla RSS
- Źródło artykułu: jeden blok SourceAttribution, bez duplikatu w content
- Cache: npm run cache:revalidate po bulk DB; lib/cache/revalidate-articles.ts
- RSS_ITEMS_PER_FEED domyślnie 8 (przyrost), nie 30

## Env (.env + Vercel)

OPENAI_API_KEY=...
OPENAI_TRANSLATION_MODEL=gpt-5.4-mini
CRON_SECRET=...
DATABASE_URL / DIRECT_URL / Supabase keys

## Komendy

npm run rss:ingest          # tylko DRAFT (surowe)
npm run rss:process         # DRAFT → REVIEW (AI)
npm run rss:demote-backfill # jednorazowo: PUBLISHED RSS → REVIEW
npm run cache:revalidate    # wyczyść cache Next (dev musi działać)
npm run scores:recalculate  # score tylko dla PUBLISHED

## Admin

/admin/articles — filtr „Do akceptacji” (REVIEW), przyciski Opublikuj / Odrzuć

## Zasady

- NIE modyfikuj app/globals.css
- NIE auto-publish RSS
- NIE wklejaj API keys w czat
- Deploy: git push origin main; Vercel env jak wyżej

Zacznij od potwierdzenia czego user chce dalej (publikować kolejkę REVIEW, wyłączyć RSS, osobna sekcja „Ze świata”, itd.).
```

---

## 1. PIPELINE CMS (krytyczna zmiana)

### Statusy w Prisma (`ArticleStatus`)

| Enum | Znaczenie w spec | Widoczność publiczna |
|------|------------------|----------------------|
| `DRAFT` | Surowy RSS po ingest | **NIE** |
| `REVIEW` | Po AI, do akceptacji (= ready_for_review) | **NIE** |
| `PUBLISHED` | Zaakceptowane w admin | **TAK** |
| `ARCHIVED` | Odrzucone / archiwum | **NIE** |

### Pliki pipeline

| Warstwa | Plik | Zachowanie |
|---------|------|------------|
| Ingest | `lib/rss/ingest.ts` | Fetch → DRAFT, EN title/excerpt, **bez AI**, **bez revalidateTag** |
| AI | `lib/rss/process-drafts.ts` + `enrich-drafts.ts` | Batch DRAFT → PL tytuł + streszczenie → REVIEW; błąd AI = zostaje DRAFT |
| Cron | `app/api/cron/rss/route.ts` | `ingest` + `process` w jednym wywołaniu |
| Publikacja | `app/api/articles/[slug]` PATCH + admin UI | Tylko ręcznie → PUBLISHED + `refreshArticleRanking` + revalidate |
| Score | `lib/news/recalculateScores.ts` | **Tylko** artykuły PUBLISHED |

### Dedup / backfill

- `originalUrl` — **@unique** w `prisma/schema.prisma`
- Ponowny ingest **pomija** istniejące URL — backfill ~175 **nie powtórzy się**
- `RSS_ITEMS_PER_FEED` domyślnie **8** (`lib/rss/feeds-config.ts`, env `RSS_ITEMS_PER_FEED`)
- `RSS_PROCESS_BATCH_SIZE` domyślnie **10** (AI na jeden run)

### Jednorazowa migracja backfill

```bash
npm run rss:demote-backfill
```

Przenosi `PUBLISHED` + `source` + `originalUrl` → `REVIEW`, czyści `featured`.  
**Wykonane w sesji:** 175 artykułów.

---

## 2. TŁUMACZENIE PL (OpenAI)

| Plik | Rola |
|------|------|
| `lib/rss/enrich-drafts.ts` | OpenAI Chat Completions — jedyny worker AI |
| `lib/rss/translate.ts` | Wspólne utils (typografia, OPENAI_API_KEY) |
| `polishTypography()` | Zamiana em dash → przecinek przy wyświetlaniu i po AI |

**Env:**

```env
OPENAI_API_KEY="sk-proj-..."
OPENAI_TRANSLATION_MODEL="gpt-5.4-mini"
# RSS_TRANSLATE_PL=false  # wyłącza AI (szkice zostają DRAFT)
```

**Koszt:** ~$5 kredytu OpenAI wystarcza na długo przy samym tłumaczeniu skrótów. Auto-reload **wyłączony** (ręczne doładowanie).

**Uwaga:** `npm run rss:retranslate` — stary skrypt masowej aktualizacji tytułów w DB; przy nowym pipeline używaj `rss:process` + moderacja.

---

## 3. RSS INGEST (źródła)

9 feedów EN w `lib/rss/feeds-config.ts`: TechCrunch, Verge, Wired, Ars, NASA, ESA, SpaceNews, Phys.org ×2.

- Tylko **tytuł + excerpt (~300 znaków)** + link — **bez pełnej treści**
- `buildAggregatorContent()` zwraca `""` — atrybucja tylko w UI (`SourceAttribution.tsx`)

---

## 4. FRONTEND (tylko PUBLISHED)

Publiczne odczyty w `lib/server/articles.ts`:

- `getPublishedArticles()`
- `getPublishedArticleBySlug()`
- `getArticlesByCategory()`
- `getRankedPublishedArticles()` → homepage ranking

Mapowanie: `lib/articles.ts` → `toNewsArticle()`:

- Agregat (`source` + `originalUrl`): **bez** Breaking / Top priority
- Chip **„Ze świata”** w `ArticleMetaChips.tsx`
- Różne placeholder okładki: `lib/cover-fallbacks.ts`
- `polishTypography` na title/excerpt

### Homepage (`ContentGrid.tsx`, `HeroArticle.tsx`)

- Hero: mniejszy tytuł, `line-clamp`, priorytet lead = redakcja (bez `source`) jeśli jest
- Ranking grid: 3 kolumny, bez masowego Breaking
- Breaking / featured: tylko redakcja WSS, wyższy próg score (9/12) w `lib/news/score-thresholds.ts`

### Strona artykułu (`app/aktualnosci/[slug]/page.tsx`)

- Agregat: tylko `SourceAttribution` + zajawka w hero (bez powtórki w body)
- `getArticleBodyParagraphs()` filtruje stary boilerplate z DB

### Cache Next.js

- Homepage `revalidate = 300` + `unstable_cache` z tagiem `articles`
- Po zmianach w DB: `npm run cache:revalidate` → POST `/api/revalidate-articles`
- Ingest **nie** woła revalidate

---

## 5. ADMIN / MODERACJA

**URL:** `/admin/articles`

- Filtry: **Do akceptacji** (REVIEW), Szkice RSS (DRAFT), Opublikowane, Wszystkie
- Akcje w tabeli: **Opublikuj** (→ PUBLISHED), **Odrzuć** (→ ARCHIVED), Edytuj
- `components/admin/ArticlesTable.tsx`

API: `GET /api/articles?status=REVIEW` wymaga CMS auth; bez `status` = tylko PUBLISHED.

---

## 6. RANKING (score)

- `Article.score` — migracja `20260602140000_article_score`
- `calculateScore.ts` — źródło, słowa kluczowe AI, wiek
- `recalculateAllScores()` — **tylko PUBLISHED**
- Cron RSS **nie** przelicza score dla szkiców

---

## 7. PROBLEMY ZNANE / NIEDOKOŃCZONE

| Problem | Status |
|---------|--------|
| `article_likes` 404 w konsoli | Uruchomić `supabase/article_likes.sql` w Supabase SQL Editor |
| ~175 w REVIEW — pusta strona bez publikacji | Zamierzone; publikuj ręcznie w admin lub odrzuć |
| Artykuł agregatu = krótki skrót + link | Zamierzone (agregator, nie pełny artykuł) |
| Stare EN w REVIEW już przetłumaczone | OK; nowe EN najpierw DRAFT → `rss:process` |
| OpenAI klucz w .env | Nie commitować; rotacja jeśli wyciekł |

---

## 8. KOMENDY NPM

```bash
npm run rss:ingest           # DRAFT only (surowe RSS)
npm run rss:process          # AI: DRAFT → REVIEW
npm run rss:demote-backfill  # jednorazowo PUBLISHED RSS → REVIEW
npm run rss:retranslate      # legacy — masowa aktualizacja tytułów w DB
npm run rss:cleanup-db       # czyści content placeholder + featured u agregatu
npm run cache:revalidate     # cache Next (dev server on)
npm run scores:recalculate   # score dla PUBLISHED
npm run db:deploy            # migracje Prisma
```

---

## 9. VERCEL / DEPLOY

**Env na produkcji:**

- `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL`
- `CRON_SECRET` (cron RSS)
- `DATABASE_URL` (pooler :6543), `DIRECT_URL` lokalnie do migracji
- Supabase public keys

**Cron:** `vercel.json` → `/api/cron/rss` co 30 min

Po deploy na prod: jeśli stary kod publikował RSS, uruchom **raz** `rss:demote-backfill` na prod DB (lub SQL UPDATE status).

---

## 10. PLIKI KLUCZOWE (pełna lista)

```
lib/rss/feeds-config.ts
lib/rss/fetchFeeds.ts
lib/rss/normalize.ts
lib/rss/ingest.ts              # DRAFT only
lib/rss/process-drafts.ts        # AI → REVIEW
lib/rss/enrich-drafts.ts       # OpenAI: title_pl, summary_pl, category, reading_time
lib/rss/pipeline.ts            # markery DRAFT / filtry idempotencji
lib/rss/translate.ts           # utils OpenAI (bez DeepL)
lib/rss/categorize.ts
lib/news/calculateScore.ts
lib/news/recalculateScores.ts
lib/news/score-thresholds.ts
lib/news/is-external-article.ts
lib/articles/display-content.ts
lib/cover-fallbacks.ts
lib/cache/revalidate-articles.ts
lib/server/articles.ts           # PUBLISHED-only public reads
lib/articles.ts
app/api/cron/rss/route.ts
app/api/revalidate-articles/route.ts
app/api/articles/route.ts
app/api/articles/[slug]/route.ts
app/admin/articles/page.tsx
components/admin/ArticlesTable.tsx
components/article/SourceAttribution.tsx
components/article/ArticleMetaChips.tsx
components/sections/ContentGrid.tsx
components/sections/HeroArticle.tsx
scripts/rss-ingest.ts
scripts/rss-process.ts
scripts/rss-demote-backfill.ts
scripts/rss-retranslate.ts
scripts/cache-revalidate.ts
prisma/schema.prisma
supabase/article_likes.sql
.env.example
```

---

## 11. ZASADY PROJEKTU

- **NIE** modyfikować `app/globals.css`
- **NIE** auto-publish RSS pod żadnym warunkiem
- **NIE** commitować `.env` / kluczy API
- Frontend **wyłącznie** `status === PUBLISHED`
- Deploy: `git push origin main` → Vercel

---

## 12. DECYZJE PRODUKTOWE (do kontynuacji w nowym czacie)

Użytkownik wybrał wcześniej **opcję 2** (RSS + tłumaczenie PL), potem CMS fix (nic na froncie bez akceptacji).

Otwarte kierunki:

- **A** — Publikować wybrane z kolejki REVIEW
- **B** — Wyłączyć cron RSS, tylko redakcja PL
- **C** — Sekcja „Ze świata” osobno od redakcji na homepage
- **D** — Dłuższe streszczenia AI (więcej treści, nadal bez pełnego artykułu)

---

## 13. HISTORIA SESJI (chronologia)

1. Wyjaśnienie ~175 artykułów (backfill 9×30), cron co 30 min, dedupe
2. Koszty OpenAI vs DeepL; konfiguracja billing ($5, bez auto-reload)
3. Wdrożenie tłumaczenia OpenAI (`gpt-5.4-mini`)
4. `rss:retranslate` — 175 PL w DB; problem cache → `cache:revalidate`
5. UX: hero tytuł, Breaking, layout, SourceAttribution, myślniki PL
6. **Krytyczny refactor:** ingest → DRAFT, AI → REVIEW, publish tylko CMS
7. `rss:demote-backfill` — 175 znika z frontendu

---

*Koniec handoff — użyj bloku STARTING PROMPT na górze w nowym czacie.*
