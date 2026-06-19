# WSS — backlog: starty, news CMS, sitemap news (48h)

**Utworzono:** 16 czerwca 2026  
**Tryb pracy:** lokalnie → test → **bez push na prod** aż cała checklista na dole = OK  
**Powiązane:** `docs/WSS_CONTENT_ARCHITECTURE.md`, `docs/WSS_SEO_SITEMAP_HANDOFF.md`

---

## Zasady (nie łamać)

- ❌ **Brak działu „Newsy”** — aktualność vs wiedza, nie nowy slug w menu
- ✅ **`/aktualnosci`** = strumień chronologiczny („Aktualności kosmiczne”), nie dział redakcyjny
- ✅ **Starty / harmonogram** = jeden hub (`/starty`), news o startach → **Misje**
- ✅ **`/sitemaps/articles.xml`** = pełny katalog (evergreen, Nauka) — **zostaje**
- ✅ **`/sitemaps/news.xml`** = tylko świeże news/analysis ≤48h — **nowy child indeksu**
- ❌ Tagi, feedy, `/search` — poza sitemap (reguła z 15.06.2026)

---

## Lista zadań

### Faza A — CMS: typ treści (fundament pod news sitemap)

**Status: kod gotowy lokalnie (16.06.2026)** — migracja DB + smoke przed prod. Handoff: `docs/WSS_CONTENT_KIND_HANDOFF.md`

1. ~~**Spec `contentKind`**~~ ✅
2. ~~**Migracja Prisma**~~ ✅ `20260616120000_article_content_kind`
3. ~~**Backfill**~~ ✅ SQL w migracji + `scripts/backfill-content-kind.ts`
4. ~~**Walidacja publish**~~ ✅
5. ~~**UI edytora**~~ ✅
6. ~~**Lista admin**~~ ✅
7. ~~**RSS ingest**~~ ✅
8. ~~**Testy**~~ ✅ `content-kind.test.ts`

### Faza B — Starty + harmonogram (jeden dział Odkrywaj)

9. **Spec UX `/starty`** — zakładki: **Lista** | **Harmonogram** (opcjonalnie anchor `#harmonogram`)
10. **Przenieść UI z `/kalendarz`** — `OpsTimeline` + lista terminów na `/starty`
11. **Client tabs** — przełączanie Lista / Harmonogram bez osobnej strony
12. **Redirect 301** — `/kalendarz` → `/starty#harmonogram` (`next.config.ts`)
13. **Nav + footer** — jeden link „Starty rakiet”; usunąć osobny „Harmonogram startów”
14. **Cross-linki** — `OpsQuickNav`, homepage ops strip, FAQ w `interactive-tools.ts`
15. **SEO copy** — jeden H1 „Starty rakiet”; skrócić / scalić wpis `launch-calendar` w metadata
16. **Sitemap pages** — usunąć `/kalendarz` z `SEO_SITEMAP_PATHS`; redirect obsługuje stary URL
17. **JSON-LD / GSC priority** — `/starty` tak, `/kalendarz` nie
18. **Test lokalny** — desktop + mobile, odliczanie, pusta lista startów, stary URL `/kalendarz`

### Faza C — Sitemap news (48h)

19. **Endpoint `/sitemaps/news.xml`** — query: `PUBLISHED`, `publishedAt >= now-48h`, `contentKind IN (news, analysis)`, `category.slug != nauka`
20. **Namespace Google News** — `news:news`, publication name „Web Space Station”, język `pl`
21. **Indeks `/sitemap.xml`** — trzeci child: `news.xml` (obok `pages` + `articles`)
22. **`sitemap-builders.test.ts`** — test filtra 48h i wykluczenia Nauki
23. **Revalidate przy publikacji** — dodać `/sitemaps/news.xml` do `revalidate-public-articles.ts`
24. **Opcjonalna jakość** — wykluczyć RSS bez `contextNote` (decyzja po smoke)
25. **Test lokalny** — curl/XML: news tylko świeże; articles.xml nadal pełne

### Faza D — Newsy o nadchodzących startach (pół-automat, Misje)

26. **Szablon redakcyjny zapowiedzi** — co wiemy (NET, rakieta, pad, operator) vs czego nie zgadujemy; źródło LL2
27. **Tag `launch:{launchId}`** — dedup i most do `/starty`
28. **Job `launch-news-candidates`** — starty w oknie T+7d bez powiązanego artykułu
29. **Generator → DRAFT** — kategoria **Misje**, `contentKind: news`, `contentOrigin: EDITORIAL`; **bez auto-publish**
30. **Aktualizacja DRAFT** — przy zmianie NET/statusu, jeśli artykuł nie opublikowany
31. **Sekcja na `/starty`** — „Zapowiedzi i newsy” — artykuły z bridge + tag launch
32. **Rozszerzyć `launch-article-bridge`** — priorytet tagu `launch:{id}` nad fuzzy title match
33. **Test lokalny** — cron dev, brak duplikatów, bridge na karcie startu

### Faza E — Spójność discovery i SEO (po B–D)

34. **Homepage** — „Pełny harmonogram” → `/starty#harmonogram`
35. **`LaunchWssArticleLink`** — wyraźniejszy CTA „Czytaj zapowiedź” na kartach
36. **`/aktualnosci` opcjonalnie** — filtr `?dzial=misje` (bez nowego sluga w nav)
37. **Smoke SEO** — robots, noindex tagów, brak feedów w sitemap, OG `/starty`
38. **Aktualizacja `docs/WSS_SEO_SITEMAP_HANDOFF.md`** — opis trzeciej mapy + reguły CMS

### Faza F — Gate przed prod

39. **`npm run type-check`** — OK  
40. **`npm run build`** — OK  
41. **Checklist manualna** (patrz niżej) — wszystkie punkty ✅  
42. **Dopiero wtedy:** commit + push `main` + weryfikacja prod + ewent. odświeżenie GSC (`sitemap.xml` jako indeks)

---

## Checklist przed prod (Faza F)

- [ ] `/starty` — lista + harmonogram + odliczanie
- [ ] `/kalendarz` → 301 → `/starty#harmonogram`
- [ ] CMS: typ treści działa; Nauka blokuje news
- [ ] `/sitemap.xml` — 3 dzieci (pages, articles, news)
- [ ] `/sitemaps/news.xml` — tylko ≤48h, news/analysis, bez Nauki
- [ ] `/sitemaps/articles.xml` — pełny katalog (evergreen nadal w środku)
- [ ] Launch DRAFT nie duplikuje się; bridge na kartach OK
- [ ] Nav/footer — jeden link startów, bez `/kalendarz`

---

## Od czego zaczynamy

~~**Krok 1 → zadanie nr 1–2** (spec + migracja `contentKind`).~~ **Faza A — kod DONE.**

**Następny krok:** migracja DB lokalnie → smoke CMS → **Faza B** (merge startów, zad. 9–18).

Handoff: `docs/WSS_CONTENT_KIND_HANDOFF.md`

---

## Kolejność sesji (propozycja)

| Sesja | Zadania | Efekt |
|-------|---------|--------|
| **1** | 1–8 | CMS gotowy pod news |
| **2** | 9–18 | Starty + harmonogram = jedna strona |
| **3** | 19–25 | news.xml 48h |
| **4** | 26–33 | Zapowiedzi startów (DRAFT) |
| **5** | 34–42 | Polish + prod |

---

## Czego nie robimy w tym backlogu

- Dział slug `/newsy` lub `/wiadomosci`
- Auto-publish zapowiedzi startów bez redakcji
- Usunięcie pełnej `articles.xml`
- Powrót tagów/feedów do sitemap
- Google News Publisher Center (osobny proces biznesowy, P2)

---

## Mapa CMS — zależności (co dotykamy i co się łączy)

### Rdzeń artykułu

```
Prisma Article
  → lib/server/articles.ts      (CRUD, listy, homepage queries, sitemap entries)
  → lib/server/validation.ts    (parse create/update API)
  → lib/server/article-fields.ts (coverImage, tags)
  → lib/articles/workflow.ts    (validatePublishReady, statusy)
  → articleStateTransition()    (JEDYNY flow publikacji — DRAFT/REVIEW/PUBLISH/SCHEDULE/ARCHIVED)
```

### Admin UI

```
ArticleEditor.tsx     → lib/admin/api.ts → /api/articles/*
ArticlesTable.tsx     → filtry statusów, bulk publish/archive
CategoryManager.tsx   → działy (slugi z lib/categories — nie tworzymy „newsy”)
CoverImageUploader    → sharp WebP → Supabase → coverImage URL
```

### Provenance vs typ (NIE mylić)

| Pole | Znaczenie | Mutowalność |
|------|-----------|-------------|
| `contentOrigin` | RSS / EDITORIAL / AI_DRAFT | **Immutable po create** (`lib/articles/content-origin.ts`) |
| `source` + `originalUrl` | Cytowanie zewnętrzne | Edytowalne; dedupe RSS |
| `cmsArticleTypeLabel` | UI „Artykuł” vs „Źródło zewnętrzne” | Z pól citation, nie z origin |
| **`contentKind`** (NOWE) | news / analysis / evergreen / guide | Edytowalne; reguły vs kategoria |

### Publikacja → co się odświeża

```
PUBLISH (pierwszy raz)
  → refreshArticleRanking (score)
  → revalidatePublicArticleCaches
       → revalidateTag(ARTICLES_TAG)
       → /, /aktualnosci, /{dział}, /aktualnosci/{slug}
       → /sitemap.xml, /sitemaps/pages.xml, /sitemaps/articles.xml, /feed.xml
  → scheduleSocialAutoPostsOnFirstPublish (FB/IG)

Cron publish-scheduled → runScheduledPublish → revalidatePublicArticleCaches
```

**Po dodaniu news sitemap:** dodać `/sitemaps/news.xml` do `SEO_FEED_PATHS` w `revalidate-public-articles.ts`.

### RSS pipeline (osobny od startów LL2)

```
/api/cron/rss → lib/rss/ingest.ts        → DRAFT (contentOrigin: RSS)
             → lib/rss/process-drafts.ts → REVIEW (AI enrich, kategoria)
             → redaktor w CMS           → PUBLISH (ręcznie)
```

### Homepage (sloty CMS)

| Pole | Efekt |
|------|--------|
| `heroPosition` 1–4 | Slider hero |
| `weekTopicPosition` 1–4 | „W centrum uwagi” (klaster newsów) |
| `score` | News Engine ranking (calculateScore) |
| `categoryId` | Sekcje działów na homepage |

`contentKind` **nie zmienia** slotów automatycznie — opcjonalnie później: blokada evergreen w weekTopic.

### SEO / discovery

```
/aktualnosci/[slug]     → metadata, JSON-LD NewsArticle, CoverImage
/sitemaps/articles.xml  → getPublishedSitemapEntries (wszystkie PUBLISHED)
/sitemaps/news.xml      → NOWE: filtr contentKind + 48h + bez nauki
robots.ts               → disallow tag/feed/search; sitemap index
```

### Starty (osobny system — most do artykułów)

```
/api/cron/ops-refresh → OpsCacheEntry (LL2 + ISS)
/starty, /kalendarz   → getCoreOpsData()
launch-article-bridge → dopasowanie istniejących artykułów do startów (nie generuje treści)
```

### Pliki do edycji przy `contentKind` (Faza A)

1. `prisma/schema.prisma` + migracja  
2. `lib/server/validation.ts` — parse create/update  
3. `lib/server/articles.ts` — create/update/select  
4. `lib/admin/types.ts` + `ArticleFormValues`  
5. `components/admin/ArticleEditor.tsx`  
6. `components/admin/ArticlesTable.tsx`  
7. `lib/rss/ingest.ts` (+ ewent. process-drafts)  
8. `lib/articles/workflow.ts` lub nowy `content-kind-rules.ts` — walidacja nauka≠news  
9. Testy: `lib/articles/*.test.ts`, workflow  
10. Później (Faza C): `lib/seo/sitemap-builders.ts`, `lib/server/articles.ts` (query news)

