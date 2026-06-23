# WSS — Master Plan Naprawy

> Audyt: 23 czerwca 2026 | Aktualizacja: 23 czerwca 2026 21:35 (ISS-1 ✅, ISS-2 ✅, ISS-N2YO ✅, Śledź-ISS ✅, STARTY-1 ✅, CMS-LIST-1 ✅, CMS-LIST-2 ✅, SEO-LOW-1..3 ✅)  
> Supabase: `blpnxcnapirdhjtujimo` (eu-west-1, Postgres 17) | Vercel project ID produkcji: `prj_jweNE6qjFCOMtZkcRboEFf8XpMfI` (team `mazipl93s-projects`)  
> TypeScript check: ✅ 0 błędów (sesja 23.06.2026 wieczór)  
> ⚠️ Vercel: dwa projekty w workspace — `wss` (✅ produkcja, webspacestation.pl) i `project-kk5pd` (❌ stary/błędny). Deploy tylko do `wss`. Sprawdź że `project-kk5pd` nie ma przypiętej domeny ani auto-deploy z gita.  
> ⚠️ Supabase ręczna akcja: Dashboard → Auth → Sign In/Up → Password → włącz **"Prevent use of leaked passwords"** (SUP-SEC-5)

---

## MAPA PRIORYTETÓW — czytaj przed każdą sesją

```
✅ P0       SUP-SEC-1..5     Bezpieczeństwo Supabase — WDROŻONE 23.06.2026
✅ P1 (częściowo)
           CACHE-1..2       Granular cache invalidation — WDROŻONE 23.06.2026
           RSS-1            loadDedupeSets 90-day filter — WDROŻONE 23.06.2026
           DB-1             GIN index — JUŻ ISTNIAŁ

✅ P2       SEO-5/6          Sitemap lastModified + RSS enclosure MIME — WDROŻONE 23.06.2026
           CMS-DEAD-1..2    Usuń /admin/media link + martwy kod rss-display.ts — WDROŻONE 23.06.2026
           CMS-CLEAN-1..3   Wyczyść edytor CMS — WDROŻONE 23.06.2026
           SOCIAL-REMOVE    Usuń FB/IG autopost (3 h — duże, wiele plików)
✅ P3 TERAZ CMS-LAYOUT-1     Profesjonalny redesign edytora CMS (Ghost-style) — WDROŻONE 23.06.2026
✅          CMS-ED-2         Autosave z debouncem — WDROŻONE 23.06.2026
✅ P3 SPRINT ISS-1            Mapa ISS nie skacze — WDROŻONE 23.06.2026
✅          ISS-2            Przeloty niewidoczne latem — WDROŻONE 23.06.2026
✅          ISS-N2YO         N2YO API jako primary source — WDROŻONE 23.06.2026
✅          ISS-LOC          Picker lokalizacji w przelotach ISS — WDROŻONE 23.06.2026
✅          STARTY-1         Usuń harmonogram — WDROŻONE 23.06.2026
✅          CMS-ED-4         datetime-local w harmonogramie CMS — WDROŻONE 23.06.2026 (przy okazji CMS-LAYOUT-1)
           CMS-LIST-1..2    Wyszukiwarka + review queue (3 h)
✅ P4       CMS-LIST-1       Wyszukiwarka + sortowanie na liście artykułów — WDROŻONE 23.06.2026
✅          CMS-LIST-2       Review queue "Co czeka" na dashboardzie — WDROŻONE 23.06.2026
P4 DUŻY    CMS-ED-1         Tiptap editor (8 h)
           CMS-ED-2..3      Autosave + split komponentu (4 h)
           CMS-LIST-3       Soft lock artykułu (3 h)
```

---

## P0 — BEZPIECZEŃSTWO SUPABASE (zrób TERAZ — 30 min)

> Dane z Supabase Advisor na żywo — 23.06.2026. Wszystko to realne błędy produkcyjne.

---

### ✅ SUP-SEC-1 — RLS initplan: auth.uid() ewaluowany dla każdego wiersza — NAPRAWIONE 23.06.2026

**Problem (9 polityk, 3 tabele — WARN):**
`auth.uid()` w `USING/WITH CHECK` jest wywoływany raz per wiersz zamiast raz per zapytanie. Przy 1000 wierszy = 1000× wywołanie funkcji auth zamiast 1×. Zabija wydajność przy większym ruchu.

**Tabele:** `article_comments` (3 polityki), `user_article_likes` (3), `user_department_subscriptions` (3)

**Fix:** W Supabase SQL Editor wykonaj:

```sql
-- article_comments
ALTER POLICY article_comments_delete_own ON public.article_comments
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY article_comments_insert_own ON public.article_comments
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY article_comments_update_own ON public.article_comments
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- user_article_likes
ALTER POLICY user_article_likes_delete_own ON public.user_article_likes
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY user_article_likes_insert_own ON public.user_article_likes
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY user_article_likes_select_own ON public.user_article_likes
  USING ((SELECT auth.uid()) = user_id);

-- user_department_subscriptions
ALTER POLICY dept_sub_delete_own ON public.user_department_subscriptions
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY dept_sub_insert_own ON public.user_department_subscriptions
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY dept_sub_select_own ON public.user_department_subscriptions
  USING ((SELECT auth.uid()) = user_id);
```

**Weryfikacja:** Supabase → Advisors → Performance → powinno zniknąć 9 ostrzeżeń.
Zaktualizuj PLAN_NAPRAWY.md.

---

### ✅ SUP-SEC-2 — SECURITY DEFINER view: article_like_counts — ŚWIADOMIE POZOSTAWIONY 23.06.2026

> **Decyzja projektowa:** Próba zmiany na `security_invoker=true` zepsułaby `fetchArticleLikeCounts()` w `PopularArticles.tsx` — anon user nie widzi `user_article_likes` przez RLS (select_own). Widok eksponuje TYLKO `(slug, count)` — zero danych osobowych — SECURITY DEFINER jest tu bezpieczny i celowy. Advisor nadal flaguje jako ERROR ale to false positive dla widoków agregujących dane publiczne.

**Problem (ERROR):**
Widok `public.article_like_counts` ma `SECURITY DEFINER` — wykonuje się z uprawnieniami TWÓRCY widoku, nie użytkownika który go odpytuje. Oznacza to: RLS jest ignorowane, a każdy może zobaczyć dane których nie powinien.

**Fix:** W Supabase SQL Editor:

```sql
-- Sprawdź aktualną definicję
SELECT pg_get_viewdef('public.article_like_counts', true);

-- Odtwórz widok jako SECURITY INVOKER (domyślne, bezpieczne)
-- Wklej tutaj SELECT z powyższego zapytania, dodaj: WITH (security_invoker = true)
-- Przykład:
CREATE OR REPLACE VIEW public.article_like_counts
  WITH (security_invoker = true)
AS
  SELECT article_slug, COUNT(*) as like_count
  FROM public.user_article_likes
  GROUP BY article_slug;
  -- (zastąp SELECT faktyczną definicją z pg_get_viewdef)
```

Zaktualizuj PLAN_NAPRAWY.md.

---

### ✅ SUP-SEC-3 — anon_article_likes: RLS włączone, zero polityk — NAPRAWIONE 23.06.2026

> Przy okazji: 5/6 funkcji likes przełączone na SECURITY INVOKER (anon_article_liked, toggle_anon_article_like, toggle_article_like, merge_anon_likes, transfer_user_likes_to_anon, user_article_liked) + dodano SET search_path=''. Pozostaje get_article_like_count jako SECURITY DEFINER (musi zliczać wszystkie user_article_likes, RLS blokuje to dla INVOKER).

**Problem (INFO):**
Tabela `anon_article_likes` ma włączone RLS ale zero polityk → wszystkie operacje zablokowane. To bug — tabela nie działa dla nikogo.

**Fix:** W Supabase SQL Editor sprawdź jak tabela powinna działać, a następnie:

```sql
-- Sprawdź strukturę tabeli
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'anon_article_likes';

-- Dodaj politykę SELECT (publiczny odczyt anonimowych polubień)
CREATE POLICY anon_article_likes_select ON public.anon_article_likes
  FOR SELECT USING (true);

-- Dodaj politykę INSERT (anonimowy użytkownik może dodać swoje polubienie)
CREATE POLICY anon_article_likes_insert ON public.anon_article_likes
  FOR INSERT WITH CHECK (true);

-- Dodaj politykę DELETE (anonimowy może usunąć swoje)
CREATE POLICY anon_article_likes_delete ON public.anon_article_likes
  FOR DELETE USING (true);
```

Zaktualizuj PLAN_NAPRAWY.md.

---

### ✅ SUP-SEC-4 — Storage buckets umożliwiają listowanie plików przez wszystkich — NAPRAWIONE 23.06.2026

> article-covers: dodano `AND (storage.foldername(name))[1] IS NOT NULL` (blokuje listing roota). avatars: polityka odtworzona bez zmian (per plan — listing avatarów akceptowalny).

**Problem (WARN):**
Buckety `article-covers` i `avatars` mają szeroką politykę SELECT na `storage.objects` — każdy (niezalogowany) może wylistować WSZYSTKIE pliki (enumeration attack, scraping okładek).

**Fix:** W Supabase SQL Editor:

```sql
-- Sprawdź aktualne polityki
SELECT policyname, cmd, qual FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname IN ('article_covers_public_read', 'avatars_public_read');

-- Zastąp szeroką politykę SELECT restrykcyjną — tylko dostęp przez URL, bez listowania
-- Usuń starą politykę i dodaj nową z filtrem na bucket_id
DROP POLICY IF EXISTS article_covers_public_read ON storage.objects;
CREATE POLICY article_covers_public_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'article-covers'
    AND (storage.foldername(name))[1] IS NOT NULL
  );

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

Zaktualizuj PLAN_NAPRAWY.md.

---

### ✅ SUP-SEC-5 — Auth: wyłączona ochrona przed wyciekłymi hasłami — DO RĘCZNEGO WŁĄCZENIA 23.06.2026

> **Akcja ręczna wymagana:** Supabase Dashboard → Authentication → Sign In / Up → Password → włącz **"Prevent use of leaked passwords"** (HaveIBeenPwned.org check). Nie można włączyć przez SQL/MCP.

**Problem (WARN):**
HaveIBeenPwned.org check wyłączony — redaktorzy mogą ustawiać hasła z bazy wycieków.

**Fix:** Supabase Dashboard → Authentication → Sign In / Up → Password → włącz "**Prevent use of leaked passwords**".

Zaktualizuj PLAN_NAPRAWY.md.

---

## JAK UŻYWAĆ TEGO PLIKU

1. Otwórz nowy czat w Cursor
2. Wklej prompt z wybranego punktu poniżej
3. Po zakończeniu naprawy zmień `⬜` na `✅` i dodaj datę

---

## FAZA 1 — Natychmiast ✅ ZAKOŃCZONA (23.06.2026)

### ✅ CMS-1 — getArticlesForAdmin() ładuje pełną treść wszystkich artykułów
**Wdrożone:** Nowy `articleAdminListSelect` bez `content`. `getArticlesForAdmin()` → `ArticleAdminListItem[]`. `content` opcjonalne w `AdminArticle`.

### ✅ SEO-1 — /zorza bez jakichkolwiek metadanych
**Wdrożone:** `buildToolPageMetadata(TOOL)` + `<ToolPageJsonLd>` w `app/zorza/page.tsx`.

### ✅ VERCEL-1 — remotePatterns wildcard + Image Optimizer bez limitu
**Wdrożone:** `unoptimized` w `GalleryGrid.tsx` i `VideoGrid.tsx`. `remotePatterns` zawężone do konkretnych domen. Usunięty wildcard HTTP.  
**UWAGA:** Jeśli po wdrożeniu brakuje obrazów → Vercel → Logs → filtruj `/_next/image` i dodaj domeny do `next.config.ts`.

---

## FAZA 2 — Ten tydzień (est. 4–6 h)

---

### ✅ CMS-2 — Brak paginacji w liście admina + reload po każdej akcji

**Problem:** `getArticlesForAdmin()` nie ma `take:` — pobiera wszystkie artykuły. Po każdej akcji (publish/archive) UI robi pełny reload listy (`await load(filter)`).

**Pliki do zmiany:**
- `lib/server/articles.ts` — funkcja `getArticlesForAdmin()` (~linia 930 po zmianach z Fazy 1)
- `app/admin/articles/page.tsx` — handlery akcji (publish, archive, bulk)

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-2.

W lib/server/articles.ts:
1. Dodaj pola `take?: number` i `skip?: number` do interfejsu `AdminArticleQuery`.
2. W `getArticlesForAdmin()` użyj `take: query.take ?? 100` i `skip: query.skip ?? 0` w `prisma.article.findMany`.
3. Upewnij się że TypeScript nie pokazuje błędów po zmianie (npx tsc --noEmit).

W app/admin/articles/page.tsx:
4. W funkcji `load()` (useCallback) dodaj obsługę stronnicowania — na razie wystarczy że domyślnie ładuje take:100, skip:0.
5. Po każdej akcji (handlePublish, handleArchive, handleReject, handleBulkPublish, handleBulkArchive) zamiast `await load(filter)` (który pobiera całą listę od nowa) zrób optimistic update: usuń/zaktualizuj artykuł lokalnie w state `articles` i wywołaj tylko `refreshReviewCount()`. Pełny `load` zostaw jako fallback przy błędzie.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-2.
```

---

### ✅ VERCEL-2 — revalidatePublicArticleCaches() generuje ~15 ISR rebuilds naraz

**Problem:** Każda publikacja artykułu wywołuje `revalidatePath` dla ~15 ścieżek jednocześnie (homepage, 6 kategorii, 5 sitemapów, RSS feedy) = 15 Vercel Function invocations. `revalidateTag` rebuiltuje stronę lazy (przy następnym żądaniu, zero extra invocations).

**Plik do zmiany:**
- `lib/cache/revalidate-public-articles.ts`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt VERCEL-2.

W lib/cache/revalidate-public-articles.ts:
1. Usuń wszystkie wywołania revalidatePath() z funkcji revalidatePublicArticleCaches().
2. Zostaw wyłącznie revalidateTag():
   - revalidateTag(ARTICLES_TAG) — zawsze
   - revalidateTag(articleTag(options.articleSlug)) — gdy articleSlug podany
   - revalidateTag(articleTag(options.previousArticleSlug)) — gdy previousArticleSlug podany
   - revalidateTag(categoryTag(options.categorySlug)) — gdy categorySlug podany
3. Usuń nieużywane importy (revalidatePath, CATEGORY_SLUG_ORDER, RSS_CATEGORY_FEEDS, SEO_FEED_PATHS, PUBLIC_LIST_PATHS) jeśli po usunięciu revalidatePath nie są już potrzebne.
4. Zachowaj funkcję publicArticleListPaths() — może być używana gdzie indziej.

Uwaga: revalidateTag nie triggeruje ISR od razu — strona rebuiltuje się przy następnym żądaniu użytkownika. To celowe zachowanie (zero extra Vercel invocations).

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy VERCEL-2.
```

---

### ✅ CMS-3 — ScheduledPublishPoller co 30s na każdą otwartą sesję CMS

**Problem:** Każda otwarta karta CMS w przeglądarce wysyła `POST /api/articles/publish-scheduled` co 30 sekund. 3 edytorzy zalogowani jednocześnie = ~6 zapytań do bazy na minutę, prawie zawsze zwracających 0 wyników.

**Plik do zmiany:**
- `components/admin/ScheduledPublishPoller.tsx`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-3.

W components/admin/ScheduledPublishPoller.tsx:
1. Zmień interwał pollera z 30 000 ms na 120 000 ms (2 minuty).
2. Dodaj obsługę Page Visibility API: poll tylko gdy zakładka jest aktywna (document.visibilityState === "visible"). Gdy zakładka jest w tle — zatrzymaj interval, wznów gdy zakładka wróci na pierwszy plan (nasłuchuj na zdarzenie "visibilitychange").
3. Upewnij się że cleanup (clearInterval) jest prawidłowy przy odmontowaniu komponentu.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-3.
```

---

### ✅ SEO-2 — Hub strony mają błędny sufiks tytułu "misje, starty i odkrycia"

**Problem:** `buildHubMetadata` w `HubPageShell.tsx` hardcoduje sufiks "misje, starty i odkrycia" dla WSZYSTKICH hubów. Strony `/ciemna-materia`, `/egzoplanety`, `/czarne-dziury` mają w Google niepasujący tytuł.

**Plik do zmiany:**
- `components/pages/HubPageShell.tsx`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-2.

W components/pages/HubPageShell.tsx w funkcji buildHubMetadata():
Aktualny kod hardcoduje sufiks "misje, starty i odkrycia" dla wszystkich hub stron.

Zamień hardcoded sufiks na per-hub tagline z konfiguracji. Sprawdź jak wygląda interfejs HubConfig (poszukaj gdzie jest definiowany). Jeśli HubConfig ma pole `tagline` lub `subtitle` — użyj go jako sufiksu tytułu zamiast "misje, starty i odkrycia". Jeśli nie ma takiego pola — dodaj pole `titleSuffix?: string` do HubConfig i wypełnij je dla każdego huba w miejscach gdzie HubConfig jest definiowany (poszukaj wszystkich miejsc przez grep).

Dla hubów astronomicznych/naukowych (ciemna-materia, egzoplanety, czarne-dziury, hubble, jwst) sufiks powinien nawiązywać do nauki/astronomii, nie do misji i startów.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy SEO-2.
```

---

### ✅ SEO-3 — /galeria i /wideo bez openGraph i Twitter card

**Problem:** Obie strony mają tylko `title + description + canonical`. Brak `openGraph` i `twitter` — przy udostępnieniu na FB/X pokazuje się generyczna grafika strony głównej. Infrastruktura OG (wpisy w `OG_PAGE_REGISTRY`) już istnieje.

**Pliki do zmiany:**
- `app/galeria/page.tsx`
- `app/wideo/page.tsx`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-3.

Dla app/galeria/page.tsx i app/wideo/page.tsx:
1. Przeczytaj jak metadata jest zbudowana w podobnych stronach np. app/mapa/page.tsx lub app/starty/page.tsx — sprawdź jakich funkcji używają.
2. Sprawdź czy w lib/seo/ istnieje funkcja resolvePageOgImage() lub podobna obsługująca /galeria i /wideo (poszukaj przez grep "galeria" i "wideo" w katalogu lib/seo/).
3. Dodaj do obu stron:
   - openGraph z url, title, description, images (użyj resolvePageOgImage lub odpowiednika)
   - twitter: { card: "summary_large_image" }
   - keywords: tablica słów kluczowych pasujących do tematyki strony

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy SEO-3.
```

---

### ✅ SEO-4 — Artykuły OG brakuje publishedTime, modifiedTime, authors, section

**Problem:** `generateMetadata` w stronie artykułu ustawia `type: "article"` w `openGraph` ale nie wypełnia pól artykułowych (`publishedTime`, `modifiedTime`, `authors`, `section`) — czytanych przez Facebook, LinkedIn i Google dla rich snippets.

**Plik do zmiany:**
- `app/aktualnosci/[slug]/page.tsx`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-4.

W app/aktualnosci/[slug]/page.tsx w funkcji generateMetadata():
Znajdź blok openGraph (gdzie type: "article" jest ustawione) i dodaj pola artykułowe:

openGraph: {
  type: "article",
  publishedTime: article.publishedAt?.toISOString(),
  modifiedTime: (article.updatedAt ?? article.publishedAt)?.toISOString(),
  authors: [/* nazwa autora — sprawdź jak jest dostępna na obiekcie article: authorByline, bylineUser?.name, author?.name */],
  section: article.category.name,
  // ... zachowaj istniejące pola (url, title, description, images, locale)
}

Sprawdź typ Next.js Metadata.openGraph.article — pola publishedTime i modifiedTime przyjmują string (ISO) lub Date. Upewnij się że TypeScript nie ma błędów.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy SEO-4.
```

---

## FAZA 3 — Następny sprint (est. 3–4 h)

---

### ✅ CACHE-1 — getPublishedArticles() bez take: — unbounded scan przy cache miss — NAPRAWIONE 23.06.2026

**Problem:** Funkcja w `unstable_cache` — przy cache miss po każdej publikacji pobiera WSZYSTKIE opublikowane artykuły bez limitu.

**Plik:** `lib/server/articles.ts` — funkcja `queryPublishedArticlesFromDb`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CACHE-1.

W lib/server/articles.ts znajdź funkcję queryPublishedArticlesFromDb() (używaną przez getPublishedArticles()).
Dodaj take: 500 do prisma.article.findMany() w tej funkcji.
Upewnij się że zachowujesz orderBy (publishedAt desc, updatedAt desc).

Sprawdź również czy są inne funkcje "get all published" bez take: — jeśli tak, ogranicz je analogicznie.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CACHE-1.
```

---

### ✅ CACHE-2 — ARTICLES_TAG invaliduje wszystkie cache naraz — NAPRAWIONE 23.06.2026

> Usunięto ARTICLES_TAG z category-specific cache-ów w articles.ts (linie getArticlesByCategory, getArticlesByCategoryPage — teraz używają wyłącznie categoryTag). revalidatePublicArticleCaches: gdy categorySlug podany → categoryTag + ARTICLES_TAG (home feed); brak categorySlug → ARTICLES_TAG + wszystkie categoryTag (bulk).

**Problem:** `revalidateTag(ARTICLES_TAG)` kasuje cache dla wszystkich kategorii jednocześnie. Jeden artykuł w "misje" invaliduje cache astronomii, nauki itd.

**Plik:** `lib/cache/revalidate-public-articles.ts`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CACHE-2.

Uwaga: najpierw upewnij się że VERCEL-2 jest wdrożone (revalidatePath usunięte).

W lib/cache/revalidate-public-articles.ts w funkcji revalidatePublicArticleCaches():
Aktualnie zawsze wywołuje revalidateTag(ARTICLES_TAG) — to invaliduje cache home feed, WSZYSTKICH kategorii, sitemapów.

Zmień logikę na bardziej granularną:
- Gdy options.categorySlug jest podany: wywołaj revalidateTag(categoryTag(options.categorySlug)) zamiast ARTICLES_TAG. Wywołaj też revalidateTag(ARTICLES_TAG) tylko dla home feed (homepage zawsze powinien być świeży).
- Gdy categorySlug NIE jest podany (zmiana strukturalna): zachowaj revalidateTag(ARTICLES_TAG).
- Zawsze wywołuj revalidateTag(articleTag) gdy articleSlug podany.

Sprawdź gdzie revalidatePublicArticleCaches jest wywoływane w całym projekcie (grep) i upewnij się że categorySlug jest poprawnie przekazywany we wszystkich wywołaniach.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CACHE-2.
```

---

### ✅ RSS-1 — loadDedupeSets() pełny skan przy każdym cronie — NAPRAWIONE 23.06.2026

> Dodano filtr `where: { publishedAt: { gte: cutoff } }` (cutoff = 90 dni wstecz). Inline calculation bez date-fns (nie w projekcie). originalUrl jest UNIQUE — constraint obsługuje dedup dla artykułów starszych niż 90 dni.

**Problem:** Codziennie ładuje URL/title/slug WSZYSTKICH artykułów do pamięci bez limitu dat. `originalUrl` jest UNIQUE w schemacie — constraint w DB obsługuje dedup URL.

**Plik:** `lib/rss/ingest.ts` — funkcja `loadDedupeSets()`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt RSS-1.

W lib/rss/ingest.ts w funkcji loadDedupeSets():
Aktualnie pobiera wszystkie artykuły bez filtra dat.

1. Dodaj import { subDays } from "date-fns" (sprawdź czy date-fns jest już importowane w pliku, jeśli nie — sprawdź package.json czy jest dostępne, ewentualnie użyj: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).
2. Dodaj filtr: where: { publishedAt: { gte: subDays(new Date(), 90) } } do prisma.article.findMany() w loadDedupeSets().
3. Dodaj komentarz wyjaśniający: originalUrl jest UNIQUE w DB — constraint obsługuje dedup dla artykułów starszych niż 90 dni.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy RSS-1.
```

---

### ✅ SEO-5 — Sitemap pages — lastModified = "teraz" dla statycznych stron — NAPRAWIONE 23.06.2026

**Problem:** Każda regeneracja sitemaps/pages.xml (co 5 min) ustawia `lastModified = now` dla statycznych stron. Googlebot traci crawl budget na strony, które się nie zmieniają.

**Plik:** `lib/seo/sitemap-builders.ts`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-5.

W lib/seo/sitemap-builders.ts w funkcji buildPagesSitemapEntries():
Aktualnie każda strona statyczna dostaje lastModified = now (przekazywane jako parametr).

1. Stwórz mapę dat dla stron statycznych, np.:
   const STATIC_PAGE_DATES: Record<string, string> = {
     "/": new Date().toISOString(), // homepage — zawsze świeża (ma artykuły)
     "/aktualnosci": new Date().toISOString(),
     "/zorza": new Date().toISOString(),   // live data — zawsze świeża
     "/mapa": new Date().toISOString(),
     "/starty": new Date().toISOString(),
     "/kontakt": "2025-01-01T00:00:00.000Z",         // nie zmienia się
     "/polityka-prywatnosci": "2025-01-01T00:00:00.000Z",
     // itd.
   }
2. Dla każdej ścieżki: użyj daty ze STATIC_PAGE_DATES[path] jeśli istnieje, w przeciwnym razie now.
3. Strony kategorii (/misje, /astronomia itd.) powinny dostawać now — zmieniają się przy każdej publikacji.

Przejrzyj SEO_SITEMAP_PATHS żeby wiedzieć jakie ścieżki są w sitemap i odpowiednio sklasyfikuj je.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy SEO-5.
```

---

### ✅ SEO-6 — RSS enclosure hardcoded image/jpeg + length="0" — NAPRAWIONE 23.06.2026

**Problem:** Artykuły z obrazami WebP/PNG mają błędny MIME. `length="0"` niezgodny z RSS 2.0 spec.

**Plik:** `lib/feed-xml.ts`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-6.

W lib/feed-xml.ts znajdź miejsce gdzie generowany jest tag <enclosure> (szukaj "enclosure").

1. Zastąp hardcoded "image/jpeg" funkcją wykrywającą MIME z rozszerzenia URL:
   function mimeFromUrl(url: string): string {
     if (/\.webp(\?|$)/i.test(url)) return "image/webp";
     if (/\.png(\?|$)/i.test(url)) return "image/png";
     if (/\.gif(\?|$)/i.test(url)) return "image/gif";
     if (/\.svg(\?|$)/i.test(url)) return "image/svg+xml";
     return "image/jpeg"; // fallback
   }
2. Usuń length="0" z tagu enclosure (lub ustaw pomijanie enclosure gdy długość nieznana — sprawdź czy RSS readery tego wymagają; bezpieczniej pominąć enclosure niż podać length=0).

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy SEO-6.
```

---

### ✅ CMS-DEAD-1 — /admin/media stub w sidebarze — NAPRAWIONE 23.06.2026

**Problem:** Link do `/admin/media` w sidebarze CMS prowadzi do "Coming soon" strony.

**Plik:** `components/admin/AdminSidebar.tsx`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-DEAD-1.

W components/admin/AdminSidebar.tsx znajdź link do /admin/media.
Ukryj go warunkowo lub usuń do czasu implementacji media library.
Opcja A (zalecana): usuń link z sidebara całkowicie — strona /admin/media zostaje ale nie jest linkowana.
Opcja B: dodaj atrybut title="Wkrótce" i wyłącz klikanie (pointer-events-none, opacity-50).

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-DEAD-1.
```

---

### ✅ CMS-DEAD-2 — Martwy kod w lib/admin/rss-display.ts — NAPRAWIONE 23.06.2026

**Problem:** Trzy funkcje eksportowane ale nigdzie nieużywane w CMS.

**Plik:** `lib/admin/rss-display.ts`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-DEAD-2.

W lib/admin/rss-display.ts:
1. Sprawdź przez grep w całym projekcie czy isRawRssDraftArticle, isAiEnrichedRssArticle, isLegacyRssReviewArticle są gdziekolwiek importowane (poza samym plikiem).
2. Jeśli nigdzie — usuń te trzy funkcje.
3. Zachowaj isRssAggregatorArticle — jest używana w lib/rss/image-credit.ts.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-DEAD-2.
```

---

---

### ✅ CMS-LAYOUT-1 — Profesjonalny redesign edytora (Ghost-style split layout) — WDROŻONE 23.06.2026

**Problem:** Edytor ma układ "stacked form" z 2015 roku — scrollowane sekcje z numerkami, metadane przemieszane z treścią, przyciski zapisu zakopane w dole. Najlepsze portale (Ghost, Substack, WordPress Gutenberg, Linear) od dawna używają split-panel z bocznym sidebar i sticky topbarem.

**Cel:** Zamienić obecny układ na profesjonalny edytor klasy Ghost bez zmiany funkcjonalności, API ani logiki. Tylko CSS/JSX reorganizacja.

---

#### Nowy układ (schemat)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← │ [SZKIC] Tytuł artykułu (skr.)  │ Zapisano 20:32 │ [Zapisz] [Publikuj] │  ← sticky topbar h-14
├─────────────────────────────────────┬────────────────────────────┤
│                                     │ [Meta] [Okładka] [Publish] │  ← sidebar tabs
│  Tytuł artykułu                     │                            │
│  ──────────────────────────────     │  TAB META:                 │
│                                     │  Slug                      │
│  Podtytuł / dek                     │  Kategoria                 │
│  ──────────────────────────────     │  Typ treści                │
│                                     │  Tagi                      │
│  [H2][Link][Lista][Img][Wideo]      │  Czas czytania             │
│  ──────────────────────────────     │  Featured / Hero pos.      │
│  ████████████████████████████       │  WeekTopic                 │
│  ████  Treść artykułu  ███████      │  Autor / byline            │
│  ████████████████████████████       │                            │
│  ████████████████████████████       │  TAB OKŁADKA:              │
│                                     │  Upload / URL              │
│  Zajawka (excerpt)                  │  Podpis zdjęcia            │
│  ──────────────────────────────     │  Podgląd kreditu           │
│                                     │                            │
│  [Preview ▾] toggle                 │  TAB PUBLIKACJA:           │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │  Status badge              │
│  ░░░  Live preview (collapsible) ░  │  Harmonogram               │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  Linki podgląd/portal      │
└─────────────────────────────────────┴────────────────────────────┘
```

---

#### Szczegóły techniczne

**Pliki do zmiany:**
- `components/admin/ArticleEditor.tsx` — główny plik (reorganizacja JSX, nowy layout)
- `components/admin/EditorSection.tsx` — zachować lub zastąpić prostszym komponentem sekcji sidebara
- `components/admin/EditorFieldPanel.tsx` — zachować (używany w sidebarze)
- Nowy plik: `components/admin/EditorTopBar.tsx` — sticky command bar
- Nowy plik: `components/admin/EditorSidebar.tsx` — tabbed sidebar z Radix Tabs lub własny

**NIE zmieniać:** logika save/publish, API calls, walidacja, stan formularza, `toForm`, `toPayload` — tylko JSX/layout.

---

#### Layout CSS

Zewnętrzny wrapper:
```tsx
<div className="flex h-dvh flex-col overflow-hidden bg-space-bg">
  <EditorTopBar ... />  {/* h-14, border-b, sticky */}
  <div className="flex min-h-0 flex-1 overflow-hidden">
    {/* Content area */}
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-6 py-8 lg:px-12 lg:py-10">
      ...
    </main>
    {/* Sidebar */}
    <aside className="hidden w-[320px] shrink-0 border-l border-hairline overflow-y-auto lg:flex lg:flex-col">
      ...
    </aside>
  </div>
</div>
```

**Na mobile:** sidebar zwinięty, dostępny przez przycisk w topbarze (drawer/sheet).

---

#### EditorTopBar — sticky command bar

```tsx
// components/admin/EditorTopBar.tsx
// Zawiera:
// - Link ← "Artykuły" (ArrowLeft)
// - [status badge] + tytuł artykułu (max 60 znaków, skrócony)
// - "Zapisano HH:MM" lub "Niezapisany" (tekst szary)
// - Button "Zapisz zmiany" (ghost, tylko gdy !PUBLISHED)
// - Button "Zapisz szkic" (ghost)  
// - Button "Publikuj" (primary, tylko gdy canPublish i nie PUBLISHED)
// - Mobile: hamburger → otwiera sidebar jako drawer
```

---

#### Tabbed Sidebar

3 taby z ikonami (lucide-react: `Settings2`, `Image`, `Send`):

**Tab "Meta"** (domyślny):
- Slug, Kategoria + hint, Typ treści + hint, Tagi, Czas czytania, Featured toggle, Hero position (tylko gdy featured), WeekTopic toggle + position, Author/Byline (AuthorBylineField)

**Tab "Okładka"**:
- CoverImageUploader, URL input (coverImage), Podpis (coverImageCredit), Podgląd kreditu

**Tab "Publikacja"**:
- Status badge + opis
- Harmonogram datetime-local (uprość od razu — `<input type="datetime-local">` zamiast dropdownów — to jest CMS-ED-4)
- Link "Podgląd na portalu" / "Preview publikacji"
- Przyciski: Wyślij do review / Archiwizuj / Cofnij do szkicu / Opublikuj teraz — w zależności od statusu

---

#### Obszar treści (content area) — Ghost-style

Bez EditorSection ramek — czyste pola z minimalnym chromem:

```tsx
{/* Tytuł — duże, czyste */}
<TextInput
  id="title"
  value={form.title}
  placeholder="Tytuł artykułu"
  className="border-none bg-transparent text-3xl font-bold text-text-primary placeholder:text-text-muted/40 focus:ring-0 px-0"
  onChange={...}
/>
{/* Divider */}
<div className="border-b border-hairline-faint my-1" />

{/* Podtytuł */}
<TextInput
  id="subtitle"  
  value={form.subtitle}
  placeholder="Podtytuł (opcjonalny)"
  className="border-none bg-transparent text-lg text-text-secondary placeholder:text-text-muted/40 focus:ring-0 px-0"
  onChange={...}
/>

{/* Slug — inline pod tytułem, małą czcionką */}
<div className="flex items-center gap-1 text-caption text-text-muted">
  <span>webspacestation.pl/aktualnosci/</span>
  <span className="text-text-tertiary">{form.slug || "slug-artykulu"}</span>
  <button ... title="Edytuj slug"><Pencil className="h-3 w-3"/></button>
</div>

{/* Toolbar formatowania (istniejące przyciski) */}
<div className="flex gap-1 border-y border-hairline-faint py-2 my-2">
  [H2][Link][Lista][Img][Wideo]
</div>

{/* Treść — large textarea */}
<TextArea
  id="content"
  rows={24}
  value={form.content}
  placeholder="Zacznij pisać…"
  className="border-none bg-transparent text-[15px] leading-relaxed text-text-secondary placeholder:text-text-muted/40 focus:ring-0 px-0 resize-none font-mono"
  onChange={...}
/>

{/* Separator */}
<div className="border-b border-hairline-faint my-4" />

{/* Zajawka */}
<Field label="Zajawka (lead)" htmlFor="excerpt" hint="...">
  <TextArea id="excerpt" rows={3} value={form.excerpt} ... />
</Field>

{/* Live preview toggle */}
<button ...>▾ Live Preview</button>
{showPreview && <ArticleEditorPreviewPane ... />}
```

---

#### Autosave (CMS-ED-2) — dodaj przy okazji

W `ArticleEditor.tsx`:
```tsx
// useEffect z debounce 3000ms
useEffect(() => {
  if (!dirty.current || !currentId || status === "PUBLISHED") return;
  const timer = setTimeout(async () => {
    try {
      await adminApi.saveArticle(currentId, toDraftPayload(form));
      setLastSavedAt(new Date());
      dirty.current = false;
    } catch {
      // silent fail — user sees "Niezapisany"
    }
  }, 3000);
  return () => clearTimeout(timer);
}, [form, currentId, status]);
```

`lastSavedAt` pokazuje w `EditorTopBar` jako "Zapisano 20:32".

---

#### Supabase + Vercel — brak nowych queries

Redesign jest **czystym frontendem** — nie dodaje żadnych nowych Supabase queries ani Vercel invocations. Autosave używa istniejącego PATCH `/api/articles/[id]`.

---

#### Kolejność pracy

1. Utwórz `components/admin/EditorTopBar.tsx` (standalone, bez zależności)
2. Utwórz `components/admin/EditorSidebar.tsx` (3 taby z istniejącymi polami)  
3. Zmień layout w `ArticleEditor.tsx` — nowy wrapper, przepnij pola do sidebara i content area
4. Dodaj autosave useEffect (CMS-ED-2)
5. npx tsc --noEmit — napraw błędy
6. Zaktualizuj PLAN_NAPRAWY.md

**Prompt na następny czat:** ← patrz niżej

---

#### Prompt na następny czat (CMS-LAYOUT-1 + CMS-ED-2)

```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-LAYOUT-1 + CMS-ED-2.

Kontekst projektu:
- Next.js 15 App Router, TypeScript, Tailwind CSS (dark space theme)
- Supabase (blpnxcnapirdhjtujimo, eu-west-1) + Vercel (project: wss)
- CMS dla redaktorów portalu WSS — artykuły, kategorie, użytkownicy
- P0..P2 wdrożone (TypeScript: 0 błędów)
- SOCIAL-REMOVE zostawiamy na osobną sesję

Cel: Przeprojektować ArticleEditor.tsx na Ghost-style split layout.
NIE zmieniać: logika save/publish, API calls, toForm/toPayload, Supabase queries.
TYLKO: reorganizacja JSX i CSS.

Zacznij od przeczytania tych plików (wszystkie naraz):
- components/admin/ArticleEditor.tsx (CAŁY plik — to jest 1400 linii)
- components/admin/EditorSection.tsx
- components/admin/EditorFieldPanel.tsx
- components/admin/primitives.tsx
- lib/admin/types.ts (ArticleFormValues, AdminArticle)
- app/admin/articles/page.tsx (żeby zobaczyć jak ArticleEditor jest używany)

KROK 1 — EditorTopBar (nowy plik components/admin/EditorTopBar.tsx):
Sticky command bar, h-14, border-b border-hairline, bg-space-surface/95 backdrop-blur.
Zawiera:
- Link ← do /admin/articles (ArrowLeft z lucide-react)
- StatusBadge (istniejący komponent) + tytuł artykułu skrócony do 52 znaków
- "Zapisano HH:MM" gdy lastSavedAt podany, "Niezapisany" gdy dirty (tekst text-text-muted text-caption)
- Przyciski: "Zapisz" (ghost, gdy status !== PUBLISHED), "Zapisz szkic" (ghost), "Publikuj" (primary, gdy canPublish i status !== PUBLISHED)
- Props: { title: string; status: ArticleStatus; lastSavedAt: Date | null; dirty: boolean; saving: boolean; canPublish: boolean; onSave(): void; onSaveDraft(): void; onPublish(): void; onOpenMobileSidebar(): void }
- Na mobile (lg:hidden): przycisk Settings2 → otwiera sidebar

KROK 2 — EditorSidebar (nowy plik components/admin/EditorSidebar.tsx):
3 taby: Meta (Settings2), Okładka (Image), Publikacja (Send) — ikony z lucide-react.
Własna implementacja tabów (bez zewnętrznej biblioteki — prosty useState activeTab).
Styl tabów: flex border-b border-hairline, każdy tab: px-3 py-2.5 text-meta font-medium text-text-tertiary border-b-2 border-transparent hover:text-text-primary, active: text-text-primary border-accent-blue.
Zawartość każdego taba — patrz specyfikacja w PLAN_NAPRAWY.md.
Props: { form: ArticleFormValues; ... wszystkie pola potrzebne do renderowania tab content ... update: fn; categories: AdminCategory[]; ... (identyczne co obecne pole po polu) }

TAB "Meta" zawiera pola: Slug (TextInput + hint), Kategoria (Select), Typ treści (Select), Tagi (TextInput), Czas czytania (number input), Featured toggle (Toggle z EditorControlPanel), Hero position (number, tylko gdy featured), WeekTopic toggle, WeekTopic position, AuthorBylineField

TAB "Okładka" zawiera: CoverImageUploader, TextInput coverImage URL, TextArea coverImageCredit, opcjonalny podgląd CoverImageCredit

TAB "Publikacja" zawiera: StatusBadge + opis statusu słownie, harmonogram datetime-local (ZAMIEŃ istniejące dropdown-y na <input type="datetime-local"> — to jest CMS-ED-4 przy okazji), linki Podgląd/Portal, przyciski akcji zależne od statusu (publishedSlug, currentId, status, canPublish itd.)

KROK 3 — Nowy layout ArticleEditor.tsx:
Zastąp obecny wrapper <div> nowym:

Outer:
<div className="flex h-dvh flex-col overflow-hidden bg-space-bg">
  <EditorTopBar ... />
  <div className="flex min-h-0 flex-1 overflow-hidden">
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      {/* content area */}
    </main>
    {/* Desktop sidebar */}
    <aside className="hidden w-[320px] shrink-0 border-l border-hairline overflow-y-auto lg:block">
      <EditorSidebar ... />
    </aside>
    {/* Mobile sidebar drawer */}
    {mobileSidebarOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-black/60" onClick={closeMobileSidebar} />
        <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-space-surface overflow-y-auto border-l border-hairline">
          <EditorSidebar ... />
        </div>
      </div>
    )}
  </div>
</div>

Content area (main): px-6 py-8 lg:px-14 lg:py-10 max-w-3xl mx-auto w-full
Pola w content area:
1. Tytuł — TextInput bez border, text-[2rem] font-bold, placeholder="Tytuł artykułu"
2. Slug inline preview — "/aktualnosci/{slug}" małą czcionką, klikalny Pencil do edycji
3. Podtytuł — TextInput bez border, text-lg, placeholder="Podtytuł (opcjonalny)"
4. Separator border-b border-hairline-faint
5. Toolbar formatowania (istniejące przyciski H2, Link, Lista, Img, Wideo)
6. Treść — TextArea bez border, min-h-[400px] resize-none, text-[15px] leading-[1.75], font-mono placeholder="Zacznij pisać…"
7. Separator
8. Zajawka (Excerpt) — Field + TextArea 3 rows

9. LivePreview — collapsible toggle button "▾ Podgląd artykułu" / "▸ Podgląd artykułu", otwiera <ArticleEditorPreviewPane> pod spodem (nie z prawej)

Styl TextInput/TextArea bez ramki:
className="w-full border-none bg-transparent shadow-none outline-none focus:ring-0 focus:outline-none px-0 py-1 placeholder:text-text-muted/40"

KROK 4 — Autosave (CMS-ED-2):
Dodaj w ArticleEditor.tsx (wewnątrz komponentu):
- Stan: lastSavedAt (już istnieje), nowy: autosavePending (ref, nie state — nie triggeruje re-render)
- useEffect z cleanup:
  if (!dirty.current || !currentId || status === "PUBLISHED" || savingRef.current) return;
  const timer = setTimeout(async () => {
    if (!dirty.current || savingRef.current) return;
    try {
      await adminApi.saveArticle(currentId, toDraftPayload(form));
      dirty.current = false;
      setLastSavedAt(new Date());
    } catch { /* silent */ }
  }, 3000);
  return () => clearTimeout(timer);
  deps: [form, currentId, status]
- Sprawdź czy adminApi ma metodę saveArticle (PATCH) — jeśli jest patch/update, użyj jej

EditorTopBar pokazuje "Zapisano HH:MM" gdy lastSavedAt, "Niezapisany" gdy dirty.current.
UWAGA: dirty.current to ref (boolean) — nie możesz go bezpośrednio użyć w JSX (nie triggeruje re-render). Przekaż go jako prop do EditorTopBar ALBO dodaj osobny useState isDirtyDisplay który aktualizujesz przy update() i przy autozapisu.

KROK 5 — npx tsc --noEmit
Napraw wszystkie błędy TypeScript zanim przejdziesz dalej.

KROK 6 — Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-LAYOUT-1 i CMS-ED-2.

ZASADY:
- NIE deployuj, NIE pushuj
- Testuj na bieżąco (tsc po każdym kroku)
- Jeśli zmiana dotyczy > 5 plików — najpierw wylistuj zależności
- Używaj istniejących tokenów Tailwind: space-bg, space-surface, space-card, text-primary, text-secondary, text-muted, text-tertiary, hairline, hairline-faint, accent-blue, accent-cyan
- SOCIAL-REMOVE (pola facebookPostId etc.) zostawiamy na osobną sesję
```

---

## FAZA 4 — CMS przebudowa (est. 12–20 h)

> Cel: profesjonalne narzędzie redaktorskie. Priorytet od najwyższego wpływu.

---

### ⬜ CMS-ED-1 — Wymiana textarea na Tiptap (rich text editor)

**Problem:** Treść artykułu to zwykły `<textarea>` z własną mini-składnią (`# heading`, `::image URL`). Edytorzy muszą znać markup — nieprofesjonalne, podatne na błędy.

**Co zrobić:**
1. Zainstaluj `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`
2. Zastąp `<textarea>` komponentem `<TiptapEditor>` — toolbar: Bold, Italic, H2, H3, Link, Image insert, BulletList
3. Format zapisu: HTML (string) lub JSON — wybierz JSON (łatwiej walidować, renderować po stronie publicznej)
4. Zaktualizuj `ArticlePageBodyMain` żeby renderował `tiptap-json` albo HTML zamiast custom markup
5. Migracja starych artykułów: skrypt `scripts/migrate-markup-to-tiptap.ts` który parsuje stary format → Tiptap JSON

**Pliki:** `components/admin/ArticleEditor.tsx`, `lib/admin/preview-article.ts`, renderer artykułu

---

### ✅ CMS-ED-2 — Autosave z debouncem — WDROŻONE 23.06.2026

**Problem:** Brak autosave = utrata pracy przy zamknięciu karty. Redaktorzy muszą klikać "Zapisz" manualnie.

**Co zrobić:**
1. `useEffect` z `setTimeout(3000)` po każdej zmianie formularza (jeśli `dirty.current`)
2. Ciche `PATCH` do API ze statusem DRAFT — bez zmiany statusu, bez toastu błędu (tylko w konsoli)
3. Drobny toast `"Zapisano automatycznie o 14:32"` w dolnym rogu przez 2s
4. Blokada autosave gdy artykuł jest PUBLISHED — żeby nie niechcący "brudzić" opublikowanego

**Pliki:** `components/admin/ArticleEditor.tsx`

---

### ⬜ CMS-ED-3 — Split ArticleEditor.tsx (1613 linii → moduły)

**Problem:** Jeden komponent 1613 linii — nieczytelny, niemożliwy do testowania, wolny do kompilacji.

**Co zrobić:**
Podzielić na:
- `components/admin/editor/ArticleEditorForm.tsx` — główny formularz (layout + sekcje)
- `components/admin/editor/ArticleEditorMeta.tsx` — slug, kategoria, tagi, contentKind, featured
- `components/admin/editor/ArticleEditorContent.tsx` — body + toolbar
- `components/admin/editor/ArticleEditorMedia.tsx` — okładka, autor, źródło
- `components/admin/editor/ArticleEditorPublish.tsx` — panel publikacji + harmonogram
- `hooks/useArticleEditor.ts` — cały stan formularza, dirty tracking, API calls, walidacja

---

### ✅ CMS-ED-4 — Datetime-local zamiast dropdown-ów na harmonogram — WDROŻONE 23.06.2026 (przy CMS-LAYOUT-1)

**Problem:** Planowanie publikacji używa osobnych dropdown-ów (dzień, miesiąc, rok, godzina, minuta) — ~50 linii kodu i nieprzyjazne UX.

**Co zrobić:**
1. Zastąp wszystkie dropdowny jednym `<input type="datetime-local">` z `min={now}` (przeglądarka renderuje natywny date-picker)
2. Zachowaj `isPublishScheduleDue()` i walidację ≥1 min w przyszłości
3. Zaktualizuj `lib/admin/schedule-datetime.ts` — uprość `combineScheduleDateTime`

**Pliki:** `components/admin/ArticleEditor.tsx`, `lib/admin/schedule-datetime.ts`

---

### ✅ CMS-LIST-1 — Wyszukiwarka i sortowanie na liście artykułów — WDROŻONE 23.06.2026

**Problem:** Lista 100+ artykułów bez możliwości filtrowania po tytule lub sortowania po kolumnach.

**Co zrobić:**
1. Dodaj input `<TextInput placeholder="Szukaj po tytule…">` nad tabelą — klient-side filter na `articles` state (toLowerCase includes)
2. Klikalne nagłówki kolumn z ikoną ↑↓ — sortowanie po `title`, `createdAt`, `updatedAt`, `status`
3. Toggle `Tylko moje` (filtruje po `author.id === userId` z `useAdminAuth`) — widoczny dla AUTHOR roli
4. Persystuj aktywny sort w `localStorage`

**Pliki:** `app/admin/articles/page.tsx`, `components/admin/ArticlesTable.tsx`

---

### ✅ CMS-LIST-2 — Widok "Co czeka" — priorytetyzacja review queue — WDROŻONE 23.06.2026

**Problem:** Artykuły czekające na review > 24h giną w liście. Redaktor naczelny nie wie co jest pilne.

**Co zrobić:**
1. Na dashboardzie: sekcja "Czeka na review" — karty artykułów z czasem oczekiwania, badge gdy > 24h
2. Na liście artykułów w widoku `review`: sortuj domyślnie po `createdAt ASC` (najstarsze pierwsze), oznacz artykuły > 24h czerwoną ikoną zegara
3. Opcjonalnie: badge na ikonę "Do sprawdzenia" w sidebarze gdy queue > 0

**Pliki:** `app/admin/dashboard/page.tsx`, `components/admin/ArticlesTable.tsx`, `components/admin/AdminSidebar.tsx`

---

### ⬜ CMS-LIST-3 — "Kto edytuje teraz" — soft lock artykułu

**Problem:** Dwóch redaktorów może otworzyć ten sam artykuł jednocześnie — drugi nadpisze zmiany pierwszego.

**Co zrobić:**
1. `POST /api/articles/:id/lock` przy otwarciu edytora — zapisuje `{ userId, lockedAt }` w Redis lub DB (kolumna `editingByUserId` + `editingAt` w `Article`)
2. `DELETE /api/articles/:id/lock` przy zamknięciu (beforeunload + useEffect cleanup)
3. Przy otwarciu artykułu który ma lock < 10 min stary: banner "Edytuje [Jan Kowalski] od 5 min" + przycisk "Przejmij"
4. Lock automatycznie wygasa po 10 min bez aktywności (heartbeat co 5 min lub po prostu TTL)

**Pliki:** Nowe API route, `components/admin/ArticleEditor.tsx`, nowa kolumna w Prisma schema

---

### ⬜ SOCIAL-REMOVE — Usuń automatyzację postów na FB i Instagram

**Problem:** Przy każdej publikacji artykułu odpala się `scheduleSocialAutoPostsOnFirstPublish()` w `after()` — wywołuje zewnętrzne API Facebooka i Instagrama. Zintegrowanie jest głęboko — pola w DB, typy, API routes, kilkanaście plików w `lib/social/`.

**Zakres usunięcia** (auto-posting, nie sharing dla czytelników):

Pliki do **usunięcia całkowicie:**
- `lib/social/facebook-publish.ts`
- `lib/social/instagram-publish.ts`
- `lib/social/facebook-config.ts`
- `lib/social/instagram-config.ts`
- `lib/social/instagram-caption.ts`
- `lib/social/facebook-caption.ts`
- `lib/social/share-card-fonts.ts` *(jeśli używane tylko przez publish)*
- `scripts/test-facebook-auto-post.ts`
- `scripts/test-social-post-by-slug.ts`
- `scripts/test-fb-misje-share-card.ts`
- `scripts/test-fb-astronomia-share-card.ts`
- `scripts/test-fb-hashtags-live.ts`
- `scripts/fb-backfill-and-test-future.ts`
- `scripts/repost-fb-share-card.ts`
- `app/api/social/instagram-card/[slug]/route.tsx` *(jeśli tylko do postowania)*
- `app/api/social/share-card/[slug]/route.tsx` *(jeśli tylko do postowania)*

**Pliki do zmiany** (usunąć fragmenty, zostawić resztę):
- `lib/server/articles.ts` — usunąć `scheduleSocialAutoPostsOnFirstPublish()` i importy
- `lib/admin/types.ts` — usunąć `facebookPostId`, `instagramPostId`, `facebookPostedAt`, `instagramPostedAt`
- `components/admin/ArticleEditor.tsx` — usunąć pola social z formularza (jeśli są widoczne)
- `lib/server/validation.ts` — usunąć pola social z `ArticleCreateInput`/`ArticleUpdateInput`
- `prisma/schema.prisma` — usunąć kolumny `facebookPostId`, `instagramPostId`, `facebookPostedAt`, `instagramPostedAt` z modelu `Article` + migracja

**Zachować** (dla czytelników):
- `lib/social/share-card-copy.ts` — copy dla ShareBar
- `lib/social/social-card-urls.ts` — URL-e do udostępniania
- `lib/social/wss-social-links.ts` — linki do profili WSS
- `components/article/ShareBar.tsx`
- `components/social/*` — follow CTA, ikony

**Uwaga:** Przed usunięciem sprawdź `npx tsc --noEmit` po każdej grupie plików. Migracja Prisma wymagać będzie `supabase db push` lub `prisma migrate dev`.

---

## Niska priorytetyzacja (zrób przy okazji)

### ✅ SEO-LOW-1 — robots.txt brakuje /zapomnialem-hasla i /reset-hasla — WDROŻONE 23.06.2026
**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-LOW-1.
W app/robots.ts dodaj "/zapomnialem-hasla" i "/reset-hasla" do tablicy disallow.
Uruchom: npx tsc --noEmit. Zaktualizuj PLAN_NAPRAWY.md.
```

### ✅ SEO-LOW-2 — OG image dimensions assumed 1280×720 w artykułach — WDROŻONE 23.06.2026
**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-LOW-2.
W app/aktualnosci/[slug]/page.tsx w generateMetadata() w bloku openGraph.images:
Usuń hardcoded width: 1280, height: 720 z obiektu obrazu (lub nie deklaruj wymiarów gdy nie są pewne).
Next.js zaakceptuje { url: article.image } bez wymiarów.
Uruchom: npx tsc --noEmit. Zaktualizuj PLAN_NAPRAWY.md.
```

### ✅ SEO-LOW-3 — /nauka description używa wewnętrznego języka — WDROŻONE 23.06.2026
**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt SEO-LOW-3.
Znajdź gdzie jest zdefiniowany opis strony /nauka (grep "bez newsów z 24h" w projekcie).
Zmień "Przewodniki bez newsów z 24h" na "Przewodniki i wyjaśnienia — bez bieżących newsów".
Uruchom: npx tsc --noEmit. Zaktualizuj PLAN_NAPRAWY.md.
```

### ✅ DB-1 — Brak indeksu GIN na kolumnie tags — JUŻ ISTNIEJE 23.06.2026

> Indeks `articles_tags_gin_idx` już istnieje w DB (tabela `public.articles`). Nic do roboty.
**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt DB-1.
W Supabase → SQL Editor wykonaj:
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_tags_gin_idx ON "Article" USING GIN(tags);
Sprawdź czy istnieje już indeks przez: SELECT indexname FROM pg_indexes WHERE tablename = 'Article';
Zaktualizuj PLAN_NAPRAWY.md.
```

---

## FAZA 5 — ISS Tracker + Starty (est. 3–5 h)

---

### ✅ ISS-1 — Mapa ISS skacze przy każdej aktualizacji pozycji — WDROŻONE 23.06.2026

**Problem (3 przyczyny):**
1. Gdy `initialIss` jest `null` przy SSR, mapa startuje wycentrowana na `[20, 0]` → pierwszy poll po 5s przesuwa widok do ISS — widoczny skok
2. `MapViewController` co 5s wywołuje `map.panTo()` z `animate: true` — ciągłe małe przesunięcia mapy (może wyglądać jak drżenie)
3. Linie orbity pojawiają się z opóźnieniem (~2 klatki po załadowaniu mapy) powodując repaint

**Plik:** `components/discover/OpsLiveMap.tsx`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt ISS-1.

W components/discover/OpsLiveMap.tsx napraw trzy przyczyny skakania mapy:

**Przyczyna 1 — null center przy SSR:**
W `MapViewController`, gdy `initDoneRef.current === false`:
- Sprawdź czy `iss` jest truthy zanim wywołasz `map.setView()`
- Jeśli `initialIss` (prop z SSR) jest dostępny, użyj go jako initial center w `<MapContainer>` zamiast `[20, 0]` — tak żeby mapa od razu startowała we właściwym miejscu, nie czekając na poll

**Przyczyna 2 — panTo co 5s:**
Obecny kod: `map.panTo([iss.latitude, iss.longitude], { animate: true, duration: 2 })` gdy `followIss === true`.
Zmień na: tylko aktualizuj pozycję markera ISS (przez `markerRef.current?.setLatLng(...)`) — NIE ruszaj widoku mapy przy każdej aktualizacji pozycji. Mapa powinna pozostać nieruchoma, tylko marker się przesuwa.
Zachowaj `map.setView()` tylko przy pierwszym załadowaniu (`!initDoneRef.current`) — bez `animate: false` → to też usuń skakanie przy inicjalizacji.

**Przyczyna 3 — opóźnione linie orbity:**
Dodaj `opacity: 0` → `opacity: 1` CSS transition na kontenerze orbit polylines zamiast warunkowego `showOrbit` który powoduje flash. Alternatywnie renderuj orbit polylines od razu (bez warunku `orbitReady`), ale z `opacity: 0` dopóki `orbitReady === false`.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy ISS-1.
```

---

### ✅ ISS-2 — Przeloty nad Polską pokazują tylko dzienne (niewidoczne) przeloty — WDROŻONE 23.06.2026

**Problem (rozpoznany):**
`classifyObservation()` w `lib/ops/iss-poland-passes.ts` ustawia `visible: true` tylko gdy:
1. `maxElevationDeg >= 15°` ORAZ
2. `sunEl < ISS_VISIBLE_SUN_MAX_DEG` (czyli słońce poniżej -6° — zmierzch cywilny)

W polskim lecie (czerwiec-sierpień) słońce nad Polską NIGDY nie schodzi poniżej -6° przez całą noc → **wszystkie przeloty dostają `observationKind: "daylight"` i `visible: false`**.

Brakuje też sprawdzenia czy ISS jest oświetlona przez słońce (jest w jego zasięgu, nie w cieniu Ziemi) — bez tego nawet poprawna noc da `visible: false` jeśli ISS jest w cieniu.

**Plik:** `lib/ops/iss-poland-passes.ts`

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt ISS-2.

W lib/ops/iss-poland-passes.ts:

**Krok 1 — Obniż próg słońca:**
Zmień `ISS_VISIBLE_SUN_MAX_DEG` z `-6` na `-12` (zmierzch nautyczny).
Uzasadnienie: obserwator widzi ISS gdy niebo jest ciemne, a zmierzch nautyczny (-12°) to realny próg "ciemnego nieba" w Polsce. Zmierzch cywilny (-6°) to jeszcze jasne niebo o tej porze roku.

**Krok 2 — Dodaj sprawdzenie czy ISS jest oświetlona:**
W funkcji `scanPassMetrics()` (lub nowej helper funkcji) dodaj sprawdzenie czy ISS jest w stożku cienia Ziemi przy momencie max elevation.
Użyj `satellite.js` — biblioteka jest już zaimportowana. Oblicz wektor pozycji ISS (ECI) i sprawdź czy ISS jest po stronie oświetlonej Ziemi (prosty test: czy odległość ISS od osi Ziemia-Słońce > promień Ziemi).

Uproszczony algorytm:
```ts
function isIssInSunlight(issEci: satellite.EciVec3<number>, sunEci: number[]): boolean {
  // Promień Ziemi: 6371 km
  // ISS jest oświetlona gdy nie jest w cieniu — cylindryczny model cienia
  const earthRadius = 6371;
  // Projekcja ISS na oś Ziemia-Słońce
  const sunDist = Math.sqrt(sunEci[0]**2 + sunEci[1]**2 + sunEci[2]**2);
  const sunUnit = sunEci.map(v => v / sunDist);
  const issDotSun = issEci.x * sunUnit[0] + issEci.y * sunUnit[1] + issEci.z * sunUnit[2];
  if (issDotSun > 0) return true; // ISS po stronie słońca — zawsze oświetlona
  // ISS po ciemnej stronie — sprawdź czy w cylindrycznym cieniu
  const perpDist = Math.sqrt(
    (issEci.x - issDotSun * sunUnit[0])**2 +
    (issEci.y - issDotSun * sunUnit[1])**2 +
    (issEci.z - issDotSun * sunUnit[2])**2
  );
  return perpDist > earthRadius;
}
```

**Krok 3 — Zaktualizuj classifyObservation():**
Dodaj parametr `issInSunlight: boolean`:
- `visible: true` gdy: `maxEl >= 10°` AND `sunEl < -12` AND `issInSunlight === true`
- Zmień próg max elevation z 15° na 10° — przeloty 10-15° są rzadkie ale obserwowalne
- `observationKind: "visible"` tylko w powyższym przypadku
- `observationKind: "daylight"` gdy `sunEl >= -12`
- `observationKind: "low"` gdy `maxEl < 10°` i ciemno
- `observationKind: "shadow"` (nowe) gdy ciemno, ale ISS w cieniu Ziemi

**Krok 4 — W UI (sprawdź components/discover/ gdzie renderowane są przeloty):**
Pokaż TYLKO przeloty z `visible: true` lub `observationKind !== "daylight"`. Ukryj `"daylight"` przeloty — lub pokaż je wyszarzone z etykietą "niewidoczny (dzień)".

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy ISS-2.
```

---

### ✅ STARTY-1 — Usuń zakładkę "Harmonogram" ze strony startów — WDROŻONE 23.06.2026

**Problem:** Strona startów ma dwie zakładki: "Nadchodzące starty" (z odliczaniem — świetne) i "Harmonogram" (kwartalny kalendarz NET — zbędny duplikat, dezorientuje użytkownika). Zostawiamy tylko odliczanie.

**Pliki do zmiany:**
- `app/starty/page.tsx` — usuń `harmonogramPanel` i import `OpsTimeline`
- `components/discover/StartyPageTabsClient.tsx` — usuń zakładkę "Harmonogram", zmień komponent na single-panel (bez tabs) lub zostaw strukturę ale z jednym panelem

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt STARTY-1.

W app/starty/page.tsx:
1. Usuń zmienną `harmonogramPanel` i jej JSX (blok z OpsTimeline i opisem)
2. Usuń import OpsTimeline (jeśli nie używany nigdzie indziej na tej stronie)
3. Zmień `<StartyPageTabsClient listaPanel={listaPanel} harmonogramPanel={harmonogramPanel}>` → `<StartyPageTabsClient listaPanel={listaPanel}>`

W components/discover/StartyPageTabsClient.tsx:
4. Usuń tab "Harmonogram" z tablicy tabs i z renderowania
5. Usuń prop `harmonogramPanel` z interfejsu Props
6. Jeśli po usunięciu zostaje tylko jeden panel (listaPanel) — opcjonalnie usuń całą strukturę tabs i renderuj `listaPanel` bezpośrednio (prostszy komponent). Sprawdź czy `#harmonogram` hash gdzieś linkuje z zewnątrz — jeśli tak, dodaj redirect w useEffect.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy STARTY-1.
```

---

## FAZA 4 — CMS przebudowa (est. 12–20 h)

> Cel: profesjonalne narzędzie redaktorskie. Priorytet od najwyższego wpływu.

---

### ✅ CMS-CLEAN-1 — Usuń "Kontekst WSS" z edytora (contextNote) — NAPRAWIONE 23.06.2026

**Problem:** Pole `contextNote` ("Ramowanie redakcyjne pod treścią") jest widoczne w edytorze CMS ale redaktorzy go nie używają — treść kontekstu powinna być częścią artykułu, nie osobnym polem. Pole może być wyświetlane na publicznej stronie artykułu.

**WAŻNE — przed usunięciem sprawdź:**
1. Czy `contextNote` jest renderowany na publicznej stronie artykułu (grep w `components/article/` i `app/aktualnosci/`)
2. Jeśli tak — usuń renderowanie z komponentu publicznego PRZED usunięciem z edytora
3. Pole w DB (kolumna `contextNote` w `Article`) — zostaje bez zmian (Prisma schema nie ruszamy). Tylko UI.

**Zakres usunięcia:**
- `components/admin/ArticleEditor.tsx` — usuń EditorSection step 3 ("Kontekst WSS") + pole `contextNote` z formularza
- `lib/admin/types.ts` — usuń `contextNote` z `AdminArticle` i `ArticleFormValues` jeśli pole nie ma innego zastosowania
- `lib/server/validation.ts` — usuń `contextNote` z `ArticleCreateInput` / `ArticleUpdateInput` tylko jeśli nie jest używane przez RSS ingest
- Publiczny renderer artykułu — usuń renderowanie jeśli istnieje

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-CLEAN-1.

Krok 1 — Sprawdź ekspozycję publiczną:
Przeszukaj projekt (grep) dla "contextNote" we wszystkich plikach poza edytorem i typami admina.
Sprawdź szczególnie: components/article/, app/aktualnosci/[slug]/page.tsx, lib/seo/json-ld.ts

Krok 2 — Usuń z publicznego renderera (jeśli istnieje):
Jeśli contextNote jest wyświetlany na publicznej stronie artykułu — usuń ten fragment z renderera.
WAŻNE: nie usuwaj kolumny z DB ani z Prisma schema — istniejące dane zostają.

Krok 3 — Usuń z edytora CMS:
W components/admin/ArticleEditor.tsx usuń:
- EditorSection z title="Kontekst WSS" (cały blok z TextArea contextNote)
- Pole `contextNote` z wartości formularza (useState/useReducer)
- Pole `contextNote` z funkcji zapisu/ładowania artykułu w edytorze

Krok 4 — Usuń z typów admina:
W lib/admin/types.ts usuń `contextNote` z AdminArticle i ArticleFormValues.
W lib/server/validation.ts sprawdź czy contextNote jest używane przez RSS ingest (grep "contextNote" w lib/rss/) — jeśli nie, usuń z validation schema.

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-CLEAN-1.
```

---

### ✅ CMS-CLEAN-2 — Usuń "Źródło zewnętrzne" z edytora + "Dopracuj tekst" — NAPRAWIONE 23.06.2026

**Problem:** Sekcja "Źródło zewnętrzne" (pola `sourceName` + `sourceUrl`) jest w edytorze dla artykułów tworzonych ręcznie. Redaktorzy piszą źródła bezpośrednio w tekście artykułu na końcu. Pola te są też podstawą dla przycisku "Dopracuj tekst" (re-process RSS) — który razem z sekcją znika.

**WAŻNE — NIE usuwać z RSS ingest:**
Kolumny `source` i `originalUrl` w DB i ich obsługa w `lib/rss/ingest.ts` ZOSTAJĄ. Tylko formularz edytora traci te pola. Artykuły z RSS nadal będą miały `source`/`originalUrl` wypełnione przez ingest.

**Zakres:**
- `components/admin/ArticleEditor.tsx` — usuń EditorSection step 6 ("Źródło zewnętrzne") + blok "Dopracuj tekst" (`showRefinePanel`) + powiązany stan (`reprocessing`, `handleRefineText`, `showRefinePanel`)
- `lib/admin/types.ts` / `ArticleFormValues` — usuń `sourceName`, `sourceUrl` z form values (pola UI, nie DB)
- `lib/admin/api.ts` — sprawdź czy `reprocessRssArticle()` jest używane gdziekolwiek poza edytorem — jeśli nie, usuń
- **NIE ruszać:** `lib/rss/ingest.ts`, `lib/server/articles.ts` (source/originalUrl w DB), `lib/admin/rss-display.ts` (`getRssSourceHostname()`)

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-CLEAN-2.

W components/admin/ArticleEditor.tsx:
1. Usuń EditorSection z title="Źródło zewnętrzne" (cały blok step 6 z polami sourceName i sourceUrl)
2. Usuń kartę "Dopracuj tekst" (blok showRefinePanel — Card z buttonem handleRefineText)
3. Usuń stan: `reprocessing`, `showRefinePanel`, `canRefineContent`, `handleRefineText`
4. Usuń pola `sourceName` i `sourceUrl` z form state i z payload wysyłanego do API
5. ZOSTAW: wszelkie odwołania do `source` i `originalUrl` które CZYTAJĄ dane — np. wyświetlanie linka do źródła RSS w nagłówku artykułu w edytorze (jeśli istnieje). Tylko edycja znika, wyświetlanie zostaje.

W lib/admin/types.ts:
6. Usuń `sourceName` i `sourceUrl` z ArticleFormValues (to są pola UI, nie DB)
7. ZOSTAW: `source`, `originalUrl` w AdminArticle (te są z DB i potrzebne do wyświetlania)

W lib/admin/api.ts:
8. Sprawdź czy `reprocessRssArticle()` jest używane gdziekolwiek poza usuniętym handlerem — jeśli nie, usuń funkcję z api.ts

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-CLEAN-2.
```

---

### ✅ CMS-CLEAN-3 — Usuń pola social card (FB/IG) z edytora — NAPRAWIONE 23.06.2026

**Problem:** Pola `socialCardTitle` i `socialCardHook` w sekcji "Tytuł i lead" służą do generowania grafik na FB/IG. Po usunięciu automatyzacji postowania (SOCIAL-REMOVE) stają się zbędne w edytorze.

**WAŻNE — sprawdź przed usunięciem:**
- Czy `socialCardTitle` / `socialCardHook` są używane przez `app/api/social/share-card/` route (OG obrazki dla czytelników przy udostępnianiu)
- Jeśli tak — te pola muszą zostać w DB i w AdminArticle type, tylko formularz CMS traci możliwość edycji (wartości zostaną null/pusty string, share card użyje `title` artykułu)

**Zakres:**
- `components/admin/ArticleEditor.tsx` — usuń dwa EditorFieldPanel z `socialCardTitle` i `socialCardHook`
- Usuń stałe `SOCIAL_CARD_TITLE_MAX`, `SOCIAL_CARD_HOOK_MAX`, `clampSocialCardTitle`, `clampSocialCardHook` jeśli używane tylko tutaj
- `lib/admin/types.ts` — usuń z `ArticleFormValues` (pola formularza). ZOSTAW w `AdminArticle` jeśli share-card API je czyta.
- Zaktualizuj hint przy `tagsText` — usuń wzmiankę o Facebooku

**Prompt:**
```
Przeczytaj docs/PLAN_NAPRAWY.md. Implementuję punkt CMS-CLEAN-3.

Krok 1 — Sprawdź czy socialCardTitle/socialCardHook są używane przez publiczne API:
Grep "socialCardTitle\|socialCardHook" w app/api/ i lib/social/ — sprawdź czy share-card route ich używa.
Jeśli tak — ZOSTAW je w AdminArticle type i w API, tylko usuń z formularza edytora.

Krok 2 — Usuń z edytora CMS (components/admin/ArticleEditor.tsx):
- Usuń EditorFieldPanel z polem socialCardTitle (nagłówek na grafice social)
- Usuń EditorFieldPanel z polem socialCardHook (linia pod nagłówkiem)
- Usuń stałe SOCIAL_CARD_TITLE_MAX, SOCIAL_CARD_HOOK_MAX i funkcje clampSocialCardTitle, clampSocialCardHook jeśli nigdzie indziej nieużywane
- W polu tagsText zaktualizuj hint — usuń wzmiankę o Facebooku i hashtagach

Krok 3 — Usuń z ArticleFormValues (lib/admin/types.ts):
- Usuń socialCardTitle i socialCardHook z ArticleFormValues (pola formularza)
- ZOSTAW w AdminArticle jeśli wymagane przez share-card

Po zmianach uruchom: npx tsc --noEmit
Zaktualizuj docs/PLAN_NAPRAWY.md — zmień ⬜ na ✅ przy CMS-CLEAN-3.
```

---

## Co działa dobrze — nie ruszać

- `unstable_cache` z tag-based revalidation dla publicznych zapytań ✅
- ISR (`revalidate: 300`) na stronach artykułów ✅
- `articleListSelect` vs `articleSelect` — podział istnieje ✅
- `CoverImage` z `unoptimized={true}` — okładki artykułów nie palą limitu Vercel ✅
- Supabase Storage bypass w `shouldBypassImageOptimizer` ✅
- Artykuły: pełny `generateMetadata`, `NewsArticle` JSON-LD, canonical URL ✅
- Sitemap: index + podmapy (pages + articles + Google News) ✅
- `robots.txt` blokuje admin, API, auth, search, tagi ✅
- RSS: autodiscovery w layout + feedy per kategoria ✅
- Przekierowania 301 dla starych URL (`/ai`, `/popularnonaukowe` itd.) ✅
- Google News sitemap: tylko 48h, wyklucza `/nauka` (evergreen) ✅
- Cały CMS działa poza mediabibliotką — nie ma "porzuconych projektów" ✅
