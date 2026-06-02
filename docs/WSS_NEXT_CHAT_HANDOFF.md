# WSS — Handoff na następny czat (deploy + CMS + prod)

**Data:** 2 czerwca 2026 (wieczór — sesja deploy + naprawa prod + CMS RSS)  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Domena prod:** https://webspacestation.pl  
**Ostatni commit:** `5428d61` — CMS: widoczny przycisk „Zobacz przed publikacją”

**Czytaj też:** `docs/WSS_NEWS_ENGINE_HANDOFF.md` (architektura pipeline)

---

## STARTING PROMPT — SKOPIUJ DO NOWEGO CZATU

```
Kontynuujemy WSS (Next.js 15, Supabase, Prisma, Vercel, Tailwind v4).

Przeczytaj:
- docs/WSS_NEXT_CHAT_HANDOFF.md (ten plik — stan po sesji 2.06.2026)
- docs/WSS_NEWS_ENGINE_HANDOFF.md (architektura News Engine)

## Stan po ostatniej sesji (skrót)

PROD DZIAŁA (admin + API + front):
- Naprawiono Vercel DATABASE_URL: port 6543 + ?pgbouncer=true&connection_limit=1
  (błąd był: prepared statement "s0" already exists — Prisma + PgBouncer)
- Migracje Prisma na prod: OK (6 migracji, schema up to date)
- CMS RSS: karta „Artykuł RSS”, Popraw z AI, linki do źródła, podpis okładki, podgląd przed publikacją

Pipeline (bez zmian):
DRAFT → OpenAI gpt-5.4-mini → REVIEW → ręczny PUBLISHED → frontend

## Co user robi na co dzień

1. /admin/articles → filtr „Do akceptacji”
2. Edycja → Popraw z AI (opcjonalnie) → Zobacz przed publikacją → Opublikuj
3. RSS ręcznie (Hobby cron max 1×/dzień): npm run rss:ingest && npm run rss:process

## Otwarte

- Opublikować wybrane z ~175 REVIEW (nie wszystko naraz)
- Cron co 30 min na Hobby NIE działa — vercel.json ustawiony na 0 6 * * * (raz dziennie)
  → albo Vercel Pro, albo zewnętrzny cron z Bearer CRON_SECRET na GET /api/cron/rss
- npm run rss:clean-subtitles — stare podtytuły „agregat WSS” → „Ze świata · źródło”
- Preview env: DATABASE_URL tylko Production (Preview może nie mieć DB)

Zacznij od tego, co user chce dalej (publikacja, cron, SEO, redakcja).
```

---

## 1. Co naprawiono na produkcji (krytyczne)

### Błąd: Application error na /admin (digest 42P05)

**Przyczyna:** `DATABASE_URL` na Vercel wskazywał pooler **:5432** bez `pgbouncer=true` → Prisma + Supavisor transaction mode = `prepared statement "s0" already exists`.

**Fix (zrobione przez agenta na Vercel):**
```
postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```
- `DIRECT_URL` (5432) — **tylko lokalnie** do `npm run db:deploy`
- Po zmianie env: **redeploy** Production

### Migracje bazy

- `npm run db:deploy` — wykonane / schema **up to date** (6 migracji, w tym `tags`, score, RSS fields)
- Bez tego: brak kolumny `tags`, błędy Prisma

### Deploy Vercel

- Projekt: `mazipl93s-projects/wss`
- `vercel link` w repo (folder `.vercel`)
- GitHub `main` → auto-deploy
- **`vercel deploy --prod` z CLI** może failować na Hobby przez cron `*/30` — deploy z GitHub/redeploy OK
- Cron w `vercel.json`: **`0 6 * * *`** (raz dziennie 06:00 UTC) — limit planu Hobby

---

## 2. CMS — co jest w panelu (po commitach 3784aa7…5428d61)

### Lista `/admin/articles`

- Kolumna **„Źródło zewnętrzne”** — nazwa wydawcy + **klikalny link** (domena)
- Badge **„Ze świata”** przy wpisach RSS
- Filtry: Do akceptacji (REVIEW), Szkice RSS (DRAFT), Opublikowane, Wszystkie

### Edycja artykułu RSS (`source` + `originalUrl` lub stary podtytuł „agregat WSS”)

- Niebieska karta **„Artykuł RSS — zewnętrzne źródło (SpaceNews)”**
- **Popraw z AI** — OpenAI: tytuł PL, zajawka, tagi, `Ze świata · źródło` (działa też po PUBLISHED)
- **Zobacz przed publikacją** — turkusowy przycisk w karcie RSS + u góry (przed Opublikuj)
- Link pełny URL do artykułu u wydawcy
- Pola: **Tytuł (PL, AI)**, **Etykieta CMS** (`Ze świata · …`), **Streszczenie (AI)**
- **Treść** pusta przy RSS — zamierzone
- Pod okładką: **podpis zdjęcia** (wydawca + strona)

### Podgląd przed publikacją

- URL: `/admin/articles/[id]/preview`
- Wymaga logowania CMS
- Pokazuje: hero, podpis zdjęcia, tytuł, zajawkę, blok SourceAttribution — **bez** wrzucania na publiczny portal
- Po **Opublikuj**: przycisk u góry → `/aktualnosci/[slug]`

### Strona publiczna (tylko PUBLISHED)

- Chip **„Ze świata”**
- `SourceAttribution` — „Materiał z zewnętrznego źródła” + **Czytaj u {wydawca}**
- Podpis na zdjęciu hero (`lib/rss/image-credit.ts`)

### Wykrywanie starych wpisów RSS

- `lib/rss/is-aggregator.ts` — także podtytuły typu `The Verge - agregat WSS - tłumaczenie automatyczne`
- `inferRssSource()` — wyciąga nazwę wydawcy ze starego podtytułu

---

## 3. Pipeline News Engine (bez zmian merytorycznych)

```
INGEST (lib/rss/ingest.ts)     → DRAFT, dedupe originalUrl
AI (process-drafts + enrich)   → REVIEW (max 10/run)
CMS                          → PUBLISHED ręcznie
FRONT                        → tylko PUBLISHED
```

- **NIGDY** auto-publish
- OpenAI: `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL=gpt-5.4-mini`
- Cron: `GET /api/cron/rss` + `CRON_SECRET` lub header `x-vercel-cron: 1`
- ~175 artykułów po `rss:demote-backfill` w **REVIEW** — front był pusty do ręcznej publikacji (zamierzone)

---

## 4. FAQ (potwierdzone w sesji)

| Pytanie | Odpowiedź |
|---------|-----------|
| Czy wszystko działa? | **Tak** po fixie DATABASE_URL + deploy; admin OK; front tylko PUBLISHED |
| Ile RSS dziennie? | Kilka–kilkadziesiąt **nowych** URL/dzień; dedupe; max 8/feed/run, 10 AI/run |
| Własne artykuły? | **Tak** — `/admin/articles/new`, pełna treść, obok RSS |
| Komentarz do RSS? | **Nie** — tylko AI: tytuł + zajawka + link; Ty: Opublikuj / popraw ręcznie |
| ChatGPT? | **OpenAI API**, nie aplikacja; cron/process → REVIEW, nie na stronę |
| Push na Vercel? | **Nie trzeba** jeśli `main` zsynchronizowany — agent pushował commity CMS |

---

## 5. Env (checklist)

**Vercel Production (krytyczne):**
- `DATABASE_URL` = transaction pooler **:6543** + `?pgbouncer=true` (+ `connection_limit=1`)
- `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL=gpt-5.4-mini`
- `CRON_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_*` — **nieużywane** (auth = Supabase)

**Lokalnie `.env`:**
- `DIRECT_URL` / `DATABASE_URL` do dev i `db:deploy`
- Ten sam `CRON_SECRET` co Vercel

**Nie commitować:** `.env`, klucze API

---

## 6. Komendy

```bash
npm run db:deploy              # migracje (DIRECT_URL)
npm run rss:ingest             # DRAFT z RSS
npm run rss:process              # AI → REVIEW
npm run rss:clean-subtitles      # stare podtytuły → Ze świata · źródło
npm run rss:demote-backfill      # jednorazowo (już zrobione ~175)
npm run cache:revalidate         # po bulk zmianach w DB
npm run dev

# Vercel (z repo z .vercel)
npx vercel ls
npx vercel logs --level error --since 1h
npx vercel redeploy <deployment-url>   # po zmianie env bez nowego kodu
```

---

## 7. Commity z tej sesji (main)

```
5428d61 CMS: widoczny przycisk Zobacz przed publikacją w RSS i u góry
e87321c CMS: przycisk Podgląd także przed publikacją (preview redakcyjny)
5654c35 CMS: rozpoznaj stare RSS (agregat WSS), cron Hobby 1x/dzień
0376363 CMS RSS: linki, Popraw z AI, podpis okładki wydawcy
3784aa7 CMS: linki RSS w liście i przycisk Popraw z AI
```

(Wcześniej: News Engine eaae2d7, handoff ad6169c)

---

## 8. Pliki kluczowe (nowe / zmienione w sesji)

```
lib/rss/is-aggregator.ts           # wykrywanie RSS + inferRssSource
lib/rss/image-credit.ts            # podpis okładki RSS
lib/news/is-external-article.ts    # używa is-aggregator
components/admin/ArticleEditor.tsx
components/admin/ArticlesTable.tsx
components/admin/ArticleLivePreview.tsx
components/article/CoverImageCredit.tsx
app/admin/articles/[id]/preview/page.tsx
app/admin/articles/[id]/preview/layout.tsx
app/aktualnosci/[slug]/page.tsx    # podpis na hero
vercel.json                        # cron 0 6 * * * (Hobby)
```

Istniejące (News Engine): `lib/rss/enrich-drafts.ts`, `process-drafts.ts`, `reprocess-rss-article.ts`, `app/api/cron/rss/route.ts`, `components/article/SourceAttribution.tsx`

---

## 9. Problemy znane / następne kroki

| Temat | Status / akcja |
|-------|----------------|
| Kolejka ~175 REVIEW | User publikuje **wybrane** ręcznie |
| Cron co 30 min | **Nie na Hobby** — 1×/dzień w vercel.json lub zewnętrzny cron / Pro |
| Stare podtytuły w DB | `npm run rss:clean-subtitles` |
| Preview Vercel env | `DATABASE_URL` może brakować na **Preview** |
| `article_likes` 404 | `supabase/article_likes.sql` w Supabase SQL Editor |
| Pełny artykuł z RSS | **Nie planowane** — agregator + link |
| Launch „na ludzi” | Technicznie OK; treść = po publikacji z REVIEW |

---

## 10. Workflow redakcyjny (dla usera)

1. Wejdź `/admin/articles` → **Do akceptacji**
2. Otwórz artykuł → sprawdź kartę RSS, zajawkę
3. **Popraw z AI** jeśli słabe streszczenie
4. **Zobacz przed publikacją** (turkusowy) — sprawdź jak na stronie
5. Wybierz **kategorię** jeśli puste
6. **Opublikuj** — dopiero wtedy widać na webspacestation.pl

Ręczny podgląd (zawsze działa):
`https://webspacestation.pl/admin/articles/[ID]/preview`

---

*Koniec handoff — użyj bloku STARTING PROMPT na górze w nowym czacie.*
