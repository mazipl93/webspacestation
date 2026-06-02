# WSS — Handoff na następny czat (deploy + FAQ)

**Data:** 2 czerwca 2026  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Ostatni commit:** News Engine (RSS + OpenAI + CMS moderacja) — push na GitHub, deploy Vercel w toku / do weryfikacji

---

## STARTING PROMPT — SKOPIUJ CAŁOŚĆ DO NOWEGO CZATU

```
Kontynuujemy WSS (Next.js 15, Supabase, Prisma, Vercel, Tailwind v4).

Przeczytaj:
- docs/WSS_NEXT_CHAT_HANDOFF.md (ten plik — sesja deploy + FAQ)
- docs/WSS_NEWS_ENGINE_HANDOFF.md (architektura techniczna)

## Pytania użytkownika (odpowiedz konkretnie po audycie kodu / Vercel)

1. Czy po deployu wszystko będzie działać end-to-end? (cron, AI, admin, frontend tylko PUBLISHED)
2. Ile mniej więcej artykułów dziennie spłynie z RSS? (9 feedów, domyślnie 8 pozycji/feed na run, cron co 30 min, dedupe po URL)
3. Czy user ma DODATKOWO pisać własne artykuły redakcyjne w CMS? (tak — to osobna ścieżka)
4. Czy ma dopisywać własną treść / komentarz do artykułów RSS w adminie? (co jest auto, co ręcznie)
5. Czy „ChatGPT wgrany” = automatyczne tłumaczenie? (wyjaśnij: OpenAI API z .env, nie aplikacja ChatGPT; co robi cron)

## Stan techniczny (skrót)

Pipeline — NIGDY auto-publish:
DRAFT (surowe EN z RSS) → OpenAI gpt-5.4-mini (enrich) → REVIEW → admin PUBLISHED → frontend

- OpenAI only: lib/rss/enrich-drafts.ts (tytuł PL, streszczenie, tagi, kategoria, czas czytania)
- lib/rss/process-drafts.ts — max 10 szkiców AI na jeden run (RSS_PROCESS_BATCH_SIZE)
- Cron: GET /api/cron/rss co 30 min (vercel.json), wymaga CRON_SECRET w env
- Frontend: tylko status=PUBLISHED
- Article.tags w Prisma (nie w subtitle)
- Admin: /admin/articles, filtr Do akceptacji, Ponów AI (OpenAI), Opublikuj/Odrzuć
- Push na main zrobiony; Vercel env: DATABASE_URL, Supabase, OPENAI_*, CRON_SECRET

## Do sprawdzenia na prod

- npm run db:deploy na bazie prod (migracje: RSS fields, score, tags)
- DATABASE_URL na Vercel = pooler :6543 + ?pgbouncer=true
- Redeploy po ustawieniu env
- Kolejka REVIEW (~175?) — publikować ręcznie

NEXTAUTH_* w Vercel — nieużywane w kodzie (auth = Supabase). Można zignorować.

Zacznij od odpowiedzi na 5 pytań powyżej, potem ewentualna weryfikacja deployu / logów cron.
```

---

## Co zrobiliśmy w tej sesji (chronologia)

1. **News Engine pipeline:** ingest → DRAFT, AI → REVIEW, publish tylko w CMS  
2. **OpenAI only** — usunięto DeepL; model `gpt-5.4-mini` (`OPENAI_TRANSLATION_MODEL`)  
3. **Enrichment:** tytuł PL, streszczenie (nie kopia tytułu — walidacja), tagi w `Article.tags`, kategoria, `readingTime`  
4. **CMS UI:** lista z streszczeniem/tagami, podgląd AI, **Ponów AI** dla pojedynczego wpisu  
5. **Subtitle:** `Ze świata · SpaceNews` (bez „agregat WSS / tłumaczenie automatyczne”)  
6. **Stabilizacja:** tylko DRAFT do AI, idempotencja, `PUBLISHED_ARTICLE_WHERE`  
7. **Deploy:** `npm run build` OK, commit + `git push origin main`  
8. **Vercel env:** użytkownik uzupełnia OPENAI_*, CRON_SECRET, DATABASE_URL itd.  
9. **CRON_SECRET** wpisany w `.env` (lokalnie) — ta sama wartość co na Vercel  

---

## FAQ — odpowiedzi na Twoje pytania (możesz skopiować do czatu)

### Czy teraz wszystko będzie działać?

**Tak, pod warunkiem że:**

| Krok | Status |
|------|--------|
| Kod na `main` + deploy Vercel **Ready** | sprawdź dashboard |
| `npm run db:deploy` na **produkcyjnej** bazie | **konieczne** (kolumna `tags`, pola RSS) |
| `DATABASE_URL` na Vercel = **pooler 6543** + `?pgbouncer=true` | nie `:5432` |
| `OPENAI_API_KEY` + `OPENAI_TRANSLATION_MODEL=gpt-5.4-mini` | tak |
| `CRON_SECRET` ustawiony | tak (Vercel cron + opcjonalnie Bearer) |
| **Redeploy** po zmianie env | tak |

Bez `db:deploy` na prod — błędy Prisma / brak `tags`.

---

### Ile artykułów dziennie z RSS?

**Nie ma stałej liczby** — zależy od tego, ile feedów publikuje **nowe** linki.

Ustawienia:

- **9 feedów** (TechCrunch, Verge, Wired, Ars, NASA, ESA, SpaceNews, Phys.org ×2)  
- **Co 30 min** cron: ingest + AI  
- **`RSS_ITEMS_PER_FEED=8`** — max 8 pozycji **na feed na jeden run** (nie 8 łącznie)  
- **Dedupe** po `originalUrl` — ten sam news **nie wchodzi drugi raz**  
- **AI max 10 szkiców** na run (`RSS_PROCESS_BATCH_SIZE=10`) — reszta czeka na kolejny cron  

**Szacunek realny:** zwykle **kilka–kilkadziesiąt nowych pozycji dziennie** łącznie z 9 źródeł (nie setki), bo większość runów to duplikaty. Przy pełnych feedach teoretyczny sufit ingest to ~9×8 = **72 pozycje na run**, ale tylko **nowe URL** trafiają do bazy.

---

### Czy mam dodatkowo dodawać własne artykuły?

**Tak, jeśli chcesz redakcję WSS** — to **osobna ścieżka**:

- **Nowy artykuł** w `/admin/articles/new` → pełna treść, zdjęcia, Twoja redakcja → publikujesz ręcznie  
- **RSS** → tylko skrót + link do źródła (agregator „Ze świata”), **bez** pełnego artykułu  

Oba typy mogą być na stronie po **PUBLISHED**.

---

### Czy dopisywać treść / komentarz do RSS w adminie?

**Nie ma osobnego pola „komentarz redakcji”.** Dla RSS:

| Pole | Auto (OpenAI) | Ty w CMS |
|------|----------------|----------|
| Tytuł | tak (PL) | możesz poprawić przed publikacją |
| Streszczenie (excerpt) | tak (1–2 zdania) | **warto sprawdzić** — czasem słabe; edytuj lub **Ponów AI** |
| Tagi | tak (opcjonalnie) | tylko w DB, brak osobnego edytora tagów w formularzu |
| Treść (content) | **pusta** (zamierzone) | **nie** wklejasz pełnego artykułu — na stronie jest blok „Czytaj u SpaceNews” + link |
| Publikacja | **nie** | **Ty** klikasz **Opublikuj** |

**Nie** generujemy pełnych artykułów ani komentarzy redakcyjnych — tylko metadane PL ze skrótu RSS.

---

### Czy to automatycznie tłumaczy ChatGPT (API)?

- To **nie jest** aplikacja ChatGPT w przeglądarce.  
- To **OpenAI API** (`OPENAI_API_KEY` z platform.openai.com) — model **`gpt-5.4-mini`**.  
- **Cron co 30 min** (na Vercel): pobiera RSS → zapis **DRAFT** → wywołanie API → **REVIEW**.  
- **Nic nie trafia na stronę publiczną** bez Twojego **Opublikuj** w adminie.

Lokalnie: `npm run rss:ingest` + `npm run rss:process` robi to samo ręcznie.

---

### NEXTAUTH / webspacestation.pl

W kodzie WSS **nie ma** NextAuth — logowanie CMS to **Supabase**.  
`NEXTAUTH_URL` / `NEXTAUTH_SECRET` na Vercel **nie są używane** — możesz zostawić lub usunąć.  
Domena prod: opcjonalnie `NEXT_PUBLIC_SITE_URL=https://webspacestation.pl` (feed/RSS URL).

---

## Env — checklist

**Lokalnie `.env`:**

- `DATABASE_URL`, `DIRECT_URL`, Supabase keys  
- `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL=gpt-5.4-mini`  
- `CRON_SECRET=...` (zgodny z Vercel)  

**Vercel (Production + Preview):**

- to samo + **pooler 6543** dla `DATABASE_URL`  
- **bez** commitowania `.env`  

---

## Komendy

```bash
npm run db:deploy              # migracje na prod (DIRECT_URL w .env)
npm run rss:ingest             # lokalnie: surowe DRAFT
npm run rss:process            # lokalnie: AI → REVIEW
npm run rss:clean-subtitles    # podtytuły Ze świata · źródło
npm run dev
```

---

## Pliki kluczowe (nowe / zmienione)

```
lib/rss/enrich-drafts.ts          # jedyny worker OpenAI
lib/rss/process-drafts.ts
lib/rss/reprocess-rss-article.ts  # Ponów AI
app/api/cron/rss/route.ts
app/api/articles/[slug]/reprocess-rss/route.ts
components/admin/ArticleEditor.tsx
components/admin/ArticlesTable.tsx
prisma/migrations/20260602150000_article_tags/
docs/WSS_NEWS_ENGINE_HANDOFF.md
```

---

## Otwarte po deployu

- Opublikować kolejkę **REVIEW** (~175?)  
- Sprawdzić logi cron na Vercel po 30–60 min  
- Ewentualnie `NEXT_PUBLIC_SITE_URL` na prod  

---

*Koniec — użyj bloku STARTING PROMPT na górze w nowym czacie.*
