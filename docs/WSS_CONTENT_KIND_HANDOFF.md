# WSS — handoff: `contentKind` (Faza A) + kolejne kroki

**Data:** 16 czerwca 2026  
**Status Fazy A:** wdrożona lokalnie w kodzie — **wymaga migracji DB + testu przed prod**  
**Master backlog:** `docs/WSS_LAUNCHES_NEWS_SITEMAP_BACKLOG.md`

---

## Co zrobiono (Faza A — zadania 1–8)

| # | Zadanie | Status |
|---|---------|--------|
| 1 | Spec `contentKind` | ✅ `lib/articles/content-kind.ts` |
| 2 | Migracja Prisma | ✅ `prisma/migrations/20260616120000_article_content_kind/` |
| 3 | Backfill | ✅ w migracji SQL + `scripts/backfill-content-kind.ts` |
| 4 | Walidacja publish | ✅ `articleStateTransition` + `createArticle` |
| 5 | UI edytora | ✅ select „Typ treści” w `ArticleEditor.tsx` |
| 6 | Lista admin | ✅ badge w kolumnie Typ (`ArticlesTable.tsx`) |
| 7 | RSS ingest | ✅ `contentKind: NEWS` w `lib/rss/ingest.ts` |
| 8 | Testy | ✅ `lib/articles/content-kind.test.ts` |

### Enum `ArticleContentKind`

| Wartość | Etykieta CMS | News sitemap (48h) |
|---------|--------------|-------------------|
| `NEWS` | Aktualność | tak |
| `ANALYSIS` | Analiza | tak |
| `EVERGREEN` | Evergreen (wiedza) | nie |
| `GUIDE` | Przewodnik | nie |

**Reguła:** `nauka` + `NEWS`/`ANALYSIS` → blokada publikacji.

**Nie mylić z:** `contentOrigin` (RSS/EDITORIAL — immutable po create).

---

## Pliki zmienione

- `prisma/schema.prisma`
- `prisma/migrations/20260616120000_article_content_kind/migration.sql`
- `lib/articles/content-kind.ts` + `.test.ts`
- `lib/server/validation.ts`
- `lib/server/articles.ts`
- `lib/admin/types.ts`, `lib/admin/api.ts`
- `lib/rss/ingest.ts`
- `components/admin/ArticleEditor.tsx`
- `components/admin/ArticlesTable.tsx`
- `scripts/backfill-content-kind.ts`

---

## START — nowy czat (kopiuj)

```
Projekt: WSS, repo wss-nowa, branch main, bez push na prod bez mojego OK.

Faza A contentKind — DONE w kodzie (docs/WSS_CONTENT_KIND_HANDOFF.md).
Przeczytaj: docs/WSS_LAUNCHES_NEWS_SITEMAP_BACKLOG.md

Najpierw lokalnie:
1. npx prisma migrate dev   (lub db:deploy na staging)
2. npx prisma generate
3. npm run type-check
4. node --import tsx --test lib/articles/content-kind.test.ts
5. Smoke CMS: edytor → typ treści, publikacja Nauka+news = błąd

Potem Faza B: merge /starty + /kalendarz (zadania 9–18 w backlogu).
Następnie Faza C: /sitemaps/news.xml (filtr contentKind + 48h).
```

---

## Następne fazy (kolejność)

### Faza B — Starty + harmonogram (9–18)
- Jedna strona `/starty` (Lista | Harmonogram)
- 301 `/kalendarz` → `/starty#harmonogram`
- Nav/footer/sitemap bez `/kalendarz`

### Faza C — Sitemap news (19–25)
- `/sitemaps/news.xml` — `contentKind IN (NEWS, ANALYSIS)`, `publishedAt ≤ 48h`, `category != nauka`
- Trzeci child w `/sitemap.xml`
- Revalidate w `revalidate-public-articles.ts`

### Faza D — Newsy o startach (26–33)
- DRAFT w Misjach, tag `launch:{id}`, cron kandydatów

### Faza E–F — Polish + gate prod (34–42)

---

## Komendy migracji (dev)

```powershell
cd C:\Users\dawid\Desktop\wss-nowa
npx prisma migrate dev --name article_content_kind
npx prisma generate
npm run type-check
node --import tsx --test lib/articles/content-kind.test.ts
npm run dev
```

Opcjonalnie po migracji: `npx tsx scripts/backfill-content-kind.ts`

---

## Ryzyka / uwagi

- **Nie pushować** bez `migrate deploy` na prod i smoke CMS.
- Pełna `articles.xml` **bez zmian** — news sitemap to osobny endpoint (Faza C).
- Zmiana kategorii w edytorze **automatycznie** ustawia domyślny `contentKind` (Nauka → evergreen).
