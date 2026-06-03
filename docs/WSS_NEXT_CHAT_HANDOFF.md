# WSS — Handoff na następny czat (żywy dokument)

**Ostatnia aktualizacja:** 2 czerwca 2026 (sesja B+ hybryda RSS + fixy CMS)  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Domena prod:** https://webspacestation.pl  
**Ostatni commit:** `e759397` — fix(UI): usun meta-disclaimer z boxu Kontekst WSS

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

## Stan po ostatniej sesji (skrót)

PROD: admin + API + front działają (DATABASE_URL :6543 + pgbouncer=true).

Model treści RSS = **B+ hybryda** (agregat + redakcja WSS):
- INGEST → DRAFT (surowe EN)
- AI (gpt-5.4-mini) → REVIEW: title, lead, body (2–4 akapity), context WSS, tagi
- Mapowanie DB: excerpt=lead, content=body, contextNote=context
- CMS: RSS readonly (AI), edytujesz kategorię, Popraw z AI, Preview publikacji, Opublikuj
- Strona: hero (tytuł+lead) → body → box „Kontekst WSS” → link do źródła

Migracja do wdrożenia na prod jeśli nie było: contextNote (npm run db:deploy).

## Workflow redakcyjny

1. /admin/articles → Do akceptacji
2. Popraw z AI (stare REVIEW bez body — uzupełnia B+)
3. Preview publikacji → wybierz kategorię → Opublikuj
4. RSS ręcznie: npm run rss:ingest && npm run rss:process

## Otwarte

- Publikować wybrane z ~175 REVIEW (nie wszystko naraz)
- Cron co 30 min na Hobby NIE — vercel.json 0 6 * * * (1×/dzień) lub zewnętrzny cron / Pro
- Stare REVIEW bez body/context: Popraw z AI lub zostaw jako lead-only (SAFE MODE)
- npm run rss:clean-subtitles — stare podtytuły
- Preview Vercel env może nie mieć DATABASE_URL

Na końcu sesji: ZAKTUALIZUJ docs/WSS_NEXT_CHAT_HANDOFF.md (reguła w pliku).

Zacznij od tego, co user chce dalej.
```

---

## Historia sesji (skrót)

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
INGEST (lib/rss/ingest.ts)           → DRAFT (EN, content="")
AI (process-drafts + enrich-drafts)  → REVIEW (B+ pełne pola)
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

### Edycja artykułu RSS

- Karta **Źródło RSS** + link + **Popraw z AI**
- Pola AI **readonly**: tytuł, lead, treść, kontekst WSS
- **Edytujesz:** kategoria (wymagana przed Opublikuj), opcjonalnie featured wyłączone dla RSS
- **Preview publikacji** (jeden przycisk u góry)
- **Opublikuj** zablokowany bez kategorii

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
4. **Źródło** — `SourceAttribution` + „Czytaj u {wydawca}”

Chip **„Ze świata”** na listach.

**Nie pokazujemy:** wewnętrznych disclaimerów redakcyjnych w boxie kontekstu (usunięte `e759397`).

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
npm run db:deploy              # migracje (+ contextNote)
npm run rss:ingest             # DRAFT z RSS
npm run rss:process            # AI B+ → REVIEW
npm run rss:clean-subtitles    # stare podtytuły → Ze świata · źródło
npm run cache:revalidate       # po bulk zmianach w DB
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
| Kolejka ~175 REVIEW | Publikuj wybrane; stare bez body → Popraw z AI |
| `db:deploy` na prod | Jeśli jeszcze nie — kolumna `contextNote` |
| Cron 30 min | Nie na Hobby — 1×/dzień lub zewnętrzny cron |
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
