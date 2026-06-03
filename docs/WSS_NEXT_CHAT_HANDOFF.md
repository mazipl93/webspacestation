# WSS — Handoff na następny czat (żywy dokument)

**Ostatnia aktualizacja:** 3 czerwca 2026 (zapis sesji: PR-H5 + PR7 + PR8)  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Domena prod:** https://webspacestation.pl  
**Ostatni commit na remote:** `8cc6f8a` — feat(WSS): CMS UX + homepage ranking (PR-H5, PR7, PR8)

**Czytaj też:** `docs/WSS_NEWS_ENGINE_HANDOFF.md` (architektura pipeline)

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

Przeczytaj:
- docs/WSS_NEXT_CHAT_HANDOFF.md (ten plik — ZAWSZE najpierw)
- docs/WSS_NEWS_ENGINE_HANDOFF.md (architektura News Engine)

## Stan po sesji 3.06.2026 (czat 2 — PR-H5 / PR7 / PR8)

PROD: `0bbfdb5`+ na main po push (wcześniej `10fb880` docs). Migracje contentOrigin+SCHEDULED już na DB.

### Backend / DB (bez zmian w tym czacie)

- **`contentOrigin`:** EDITORIAL | RSS | AI_DRAFT — immutable po create
- **Workflow:** DRAFT → REVIEW → PUBLISHED → SCHEDULED (+ ARCHIVED)
- **RSS pipeline:** ingest DRAFT → process REVIEW; CMS publish ręcznie
- **AI read-only:** `aiScore` w GET API (nie ranking homepage)

### CMS / UI (PR-H5, PR7 — UX only)

- Typ w CMS: **Artykuł** | **Źródło zewnętrzne** (`source` + `url`) — zero RSS/AI/contentOrigin w copy
- Edytor: „Dopracuj tekst”, „Źródło (opcjonalne)”
- Public layout RSS: `contentOrigin` w `NewsArticle` (nie w CMS copy)

### Homepage (PR8 — frontend only)

- `lib/home/rank-articles.ts` — `rankImportantNow`, `rankLatest`, `rankPopular`
- Sekcje: **Ważne teraz** (hero+sidebar) · **Najnowsze** · **Popularne**
- `NewsArticle`: `featured`, `createdAt` w mapowaniu (bez zmian DB)

### Testy npm

npm run test:ui          # article-kind + rank-articles
npm run test:content-origin
npm run test:workflow
npm run test:articles
npm run test:ai

## Otwarte / następny czat (priorytet)

1. **Deploy Vercel** — push main (auto) jeśli jeszcze nie na prod
2. **PR-H4:** korekta starych `contentOrigin` (backfill infer)
3. Kolejka ~175 REVIEW — publikacja ręczna w CMS
4. Scheduler `SCHEDULED` — nie zaimplementowany
5. Opcjonalnie: prawdziwe views w DB dla „Popularne” (dziś: likes Supabase + score)

Na końcu sesji: ZAKTUALIZUJ docs/WSS_NEXT_CHAT_HANDOFF.md.

Zacznij od tego, co user chce (deploy, publikacja REVIEW, PR-H4).
```

---

## Historia sesji (skrót)

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
npm run db:deploy              # migracje (contextNote + contentOrigin + SCHEDULED)
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
| **Commit + deploy** sesji 3.06 | **Zamknięte** w tej sesji |
| `db:deploy` prod | **Zamknięte** po push (migracje contentOrigin + SCHEDULED) |
| PR-H4 korekta `contentOrigin` | Stare rekordy po inferze source+url |
| Scheduler `SCHEDULED` | Enum jest; cron/publish-at — nie zrobione |
| Kolejka ~175 REVIEW | Publikuj w CMS |
| Front/ranking po `contentOrigin` | Opcjonalnie (heurystyka source+url nadal) |
| `db:backfill-content-origin` | Wyłączyć infer z pól źródła |
| Cron 30 min | Nie na Hobby — 1×/dzień |
| Homepage / sekcje | Do iteracji po publikacji treści |
| `article_likes` 404 | `supabase/article_likes.sql` w Supabase |
| Pełny artykuł skopiowany z RSS | **Nie** — hybryda + link |

---

## 9. FAQ

| Pytanie | Odpowiedź |
|---------|-----------|
| Czy RSS ma pełną treść na stronie? | **Tak (B+):** lead + 2–4 akapity AI + kontekst + link |
| Czy lead może wspominać SpaceNews? | **Nie** — tylko w stopce (SourceAttribution) |
| Stary artykuł bez body? | Publikuj jako lead-only lub **Popraw z AI** |
| Push na Vercel? | `main` auto-deploy po push |

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
