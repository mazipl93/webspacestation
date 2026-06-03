# WSS — Roadmap Backlog v3 (tracker)

**Cel:** pełny portal informacyjny + CMS + AI + RSS + redakcja  
**Ostatnia aktualizacja pliku:** 3 czerwca 2026 (koniec sesji 15 — blocker scheduler)  
**Źródło planu:** Roadmap Backlog v3 (PRODUCTION NEWSROOM SYSTEM) + audyt vs `docs/WSS_NEXT_CHAT_HANDOFF.md`

---

## Jak czytać statusy

| Symbol | Znaczenie |
|--------|-----------|
| `[x]` | **Zrobione** — pewność ~110% (kod na `main`/prod **lub** testy automatyczne + spójność z handoffem; bez znanych regresji) |
| `[~]` | **Częściowo** — fundament jest, brakuje domknięcia / QA / prod |
| `[ ]` | **Nie zrobione** |
| `[?]` | **W kodzie lokalnie** — fix jest w repo, **bez** pełnego QA w przeglądarce → **nie** oznaczamy `[x]` |

**Reguła:** nowy `[x]` dopiero po weryfikacji (testy + sensowny smoke w CMS/przeglądarce). Agent aktualizuje ten plik na końcu sesji.

**Deploy:** remote `b2e6ea6` + lokalne zmiany sesji 13–15 — **nie na prod**, dopóki nie ma commit + push + QA.

---

## P0 — BLOCKER (następny czat)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| **P0-SCHED** | **Zaplanowana publikacja w wybranej minucie** (`publishAt` → auto PUBLISHED) | `[~]` | Cron `* * * * *` w vercel.json; cron `publishedAt = publishAt`; dev: `npm run publish:scheduled:watch`. **QA na Vercel** (Hobby może ograniczać częstotliwość crona). |

**Implementacja docelowa (propozycja):** cron co 1 min (Pro / zewnętrzny ping) → `runScheduledPublish()`; test E2E: zaplanuj +2 min → PUBLISHED bez klikania.

---

## Zasady architektury (NIE ZMIENIAĆ)

| # | Zasada | Status |
|---|--------|--------|
| A1 | Jeden model Article (NO DUPLICATION) | `[x]` |
| A2 | RSS = input do CMS (NIE osobny system) | `[x]` |
| A3 | AI = asystent (NIE blocker) | `[x]` |
| A4 | Manual = identyczny workflow jak RSS | `[x]` |
| A5 | Jeden editor dla wszystkiego | `[x]` |
| A6 | Public UI ≠ Admin UI separation | `[x]` |

---

## P0 — Blokery (najpierw)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P0-1 | **Unifikacja CMS** — jeden editor; wszystkie pola edytowalne; bez readonly RSS; bez osobnego RSS editora | `[x]` | Unified `ArticleEditor`, PR1/2B, handoff sesja 3.06 |
| P0-2 | **Źródło na froncie** — sekcja „Źródło”, link, pod artykułem | `[x]` | `SourceAttribution`, PR5/PR-H5 |
| P0-3 | **RSS page cleanup** — bez XML/debug; lista kanałów + UX | `[x]` | `/rss` → Subskrypcje (PR5) |
| P0-4 | **AI nie blokuje edycji** — draft, bez nadpisywania ręcznej edycji | `[x]` | Autosave bez statusu; B+ autosave RSS nie czyści AI pól |
| P0-5 | **Mobile CMS fix** — sidebar, full width, brak poziomego scrolla | `[~]` | PR12 collapsible sidebar `[x]`; pełny mobile UX editora — **nie zweryfikowany** |

---

## P1 — Core CMS (profesjonalny newsroom)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P1-6 | **Upload zdjęć (pro)** — dysk, drag&drop, WEBP, resize, Supabase/S3 | `[ ]` | Okładka = URL w edytorze; upload tylko avatary |
| P1-7 | **Live preview editor** — split, title/lead/content/images/context | `[~]` | PR11 split + fix hero `[?]` lokalnie (sesja 14) — **QA okładki w CMS wymagany** |
| P1-8 | **CMS redesign (The Verge)** — typografia, spacing, editor-first | `[~]` | PR7 uproszczenie; brak pełnego redesignu |
| P1-9 | **Hero article UX** — kontrast daty/meta, glassmorphism | `[ ]` | Nie domknięte |
| P1-10 | **Zmiana logo** — light/dark, favicon | `[ ]` | Backlog |

---

## P2 — Content system (logika portalu)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P2-11 | **Statusy workflow** — DRAFT → AI_ENRICHED → REVIEW → PUBLISHED (+ SCHEDULED) | `[~]` | SCHEDULED zapis OK; **auto-publish w `publishAt` — `[ ]` (P0-SCHED)** |
| P2-12 | **Redakcyjny feed** — centralny RSS + manual + AI, statusy | `[~]` | Lista CMS + filtry; brak jednego „feedu” jak w planie |
| P2-13 | **Popularne / Ważne teraz** — views+engagement vs recency+featured+score | `[~]` | PR8 ranking `[x]`; views słabe; engagement = likes proxy opcjonalnie |
| P2-14 | **Homepage layout fix** — stałe sloty, slider, mobile-first | `[~]` | Fallback pustych sekcji `[x]`; slider / stała siatka — `[ ]` |
| P2-15 | **Komentarze fix (mobile)** — pod artykułem, nie na dole strony | `[?]` | `ArticleInteractions` pod treścią — **mobile nie sprawdzony** |

---

## P3 — AI system

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P3-16 | **Internal linking (AI)** — pgvector, relatedArticles[], UI | `[~]` | PR9 tag-based related `[x]`; embeddings — scaffold, nie prod |
| P3-17 | **AI article enrichment** — lead, body, contextNote, bez wymyślania faktów | `[x]` | B+ hybryda, strict JSON, `apply-enrichment` |
| P3-18 | **Content scoring** — recency, views, engagement, featured | `[~]` | `aiScore` on-the-fly w API; ranking częściowy |

---

## P4 — Portal features (user side)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P4-19 | **Powiadomienia** — zalogowani, reply, nowy artykuł w kategorii | `[~]` | UI istnieje; pełne eventy/backend — niepewne |
| P4-20 | **Ulubione kategorie** — follow + feed + notifications | `[ ]` | — |
| P4-21 | **Newsletter (decision)** — A email / B usuń / C placeholder | `[~]` | Placeholder w footerze — decyzja otwarta |

---

## P5 — Portal structure

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P5-22 | **Działy portalu** — tools vs content vs secondary menu | `[ ]` | Decyzja architektoniczna otwarta |
| P5-23 | **Centrum operacyjne** — nie główny blok homepage | `[ ]` | Do decyzji |

---

## P6 — SEO / legal / infra

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P6-24 | **SEO** — canonical, OG, schema NewsArticle, sitemap, index | `[~]` | Fragmenty OG; brak pełnego systemu |
| P6-25 | **RODO / legal** — cookies, privacy, GDPR | `[ ]` | — |
| P6-26 | **Bezpieczeństwo / infra** — Supabase, Vercel, rate limits, cache | `[~]` | MVP OK; rate limits / cache strategy — backlog |
| P6-27 | **Scaling** — CDN, Redis, edge RSS, pre-render | `[ ]` | Przyszłość |

---

## Dev vs User UI cleanup (warstwa UX)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| UX-1 | Public bez RSS/XML/debug/API w copy | `[x]` | PR5–7 |
| UX-2 | CMS bez terminologii pipeline (RSS/AI/Typ/Jakość) | `[x]` | PR6/6.1/7 |
| UX-3 | Premium newsroom feel (bez „interfejsu systemu”) | `[~]` | Postęp; upload, SEO, RODO zostają |

---

## Sesja 13–14 — fixy lokalne (osobna tabela QA)

| ID | Zadanie | W kodzie | `[x]` prod-ready |
|----|---------|----------|------------------|
| S13-1 | `publishedAt` tylko przy „Opublikuj”; RSS ingest bez daty | `[?]` | `[ ]` — wymaga push + sprawdzenia dat na prod |
| S13-2 | Zapisz szkic REVIEW → DRAFT | `[?]` | `[ ]` — smoke CMS |
| S13-3 | Lista CMS `updatedAt desc` | `[?]` | `[ ]` |
| S13-4 | Backfill `npm run db:fix-published-at` | `[?]` lokalnie 39 szt. | `[ ]` na prod |
| S14-1 | Okładka live preview + Preview publikacji (hero z-index, native img) | `[?]` | `[ ]` — **testy OK, brak QA w przeglądarce** |
| S14-2 | Najnowsze chronologicznie (homepage + `/aktualnosci`) | `[?]` | `[ ]` — testy OK; smoke po push |
| S15-1 | Preview okładka = pole URL (bez RSS fallback w CMS) | `[?]` | User potwierdził OK w czacie |
| S15-2 | Zaplanuj UI 24h (dzień/miesiąc PL/rok/godz/min) | `[?]` | Zapis terminu OK; **auto-publish `[ ]`** |
| S15-3 | `schedule-datetime.ts` + testy + `isPublishScheduleDue` | `[?]` | |
| S15-4 | Workaround POST publish-scheduled + przyciski CMS | `[?]` | **Nie zamyka P0-SCHED** |

---

## Infrastruktura / operacje (poza roadmapą, ale krytyczne)

| Temat | Status | Uwagi |
|-------|--------|-------|
| Next.js 15 + Vercel deploy z `main` | `[x]` | |
| Prisma + Supabase (pooler/direct) | `[x]` | |
| Migracje: contextNote, contentOrigin, SCHEDULED, publishAt | `[x]` | `db:deploy` wcześniej |
| Cron RSS 1×/dzień (Hobby) | `[x]` | |
| Commit + push sesji 13–15 | `[ ]` | Remote nadal `b2e6ea6` |
| **P0-SCHED** cron o dokładnej minucie | `[~]` | Kod: co 1 min + stamp `publishAt`; weryfikacja prod |
| **P0-ARCH** Panel Archiwum + trwałe usuwanie z DB | `[?]` | `/admin/archive`, bulk delete API |
| ~175 artykułów REVIEW do ręcznej publikacji | `[ ]` | Workflow OK |
| `article_likes` 404 (Supabase SQL) | `[ ]` | |
| Pełna treść RSS na stronie (cel produktowy) | `[x]` NIE (świadomie) | Hybryda B+ + link |

---

## Postęp (liczniki)

*Aktualizuj ręcznie przy zmianie `[x]`.*

| Priorytet | Zrobione `[x]` | Częściowe `[~]` | Otwarte `[ ]` |
|-----------|----------------|-----------------|---------------|
| P0 | 4 | 1 | 1 |
| P1 | 0 | 2 | 3 |
| P2 | 0 | 4 | 1 |
| P3 | 1 | 2 | 0 |
| P4 | 0 | 2 | 1 |
| P5 | 0 | 0 | 2 |
| P6 | 0 | 2 | 2 |
| Architektura A1–A6 | 6 | 0 | 0 |

**Szacunek ogólny:** rdzeń newsrooma (P0 + pipeline B+) ≈ **75–80%**; pełny backlog v3 ≈ **35–40%**.

---

## Historia zmian tego pliku

| Data | Zmiana |
|------|--------|
| 3.06.2026 | Utworzenie trackera z Roadmap v3; audyt planów |
| 3.06.2026 | Sesja 15: P0-SCHED blocker; S15-* w tabeli QA; priorytet następnego czatu |

---

## Następny krok

1. **P0-SCHED:** publikacja w dokładnej minucie `publishAt` (cron co 1 min lub zewnętrzny worker)  
2. `git commit` + `push` sesji 13–15  
3. Smoke: zaplanuj +2 min → auto PUBLISHED; Najnowsze na górze  
4. `npm run cache:revalidate` po deploy

*Koniec trackera — jeden plik prawdy dla backlogu v3 obok `docs/WSS_NEXT_CHAT_HANDOFF.md`.*
