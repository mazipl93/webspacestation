# WSS — Roadmap Backlog v3 (tracker)

**Cel:** pełny portal informacyjny + CMS + AI + RSS + redakcja  
**Ostatnia aktualizacja pliku:** 3 czerwca 2026 (sesja 16–17 — scheduler, Najnowsze, hero meta)  
**Źródło planu:** Roadmap Backlog v3 (PRODUCTION NEWSROOM SYSTEM) + audyt vs `docs/WSS_NEXT_CHAT_HANDOFF.md`

---

## Jak czytać statusy

| Symbol | Znaczenie |
|--------|-----------|
| `[x]` | **Zrobione** — pewność ~110% (kod na `main`/prod **lub** testy + potwierdzenie usera / smoke) |
| `[~]` | **Częściowo** — fundament jest, brakuje domknięcia / QA / prod |
| `[ ]` | **Nie zrobione** |
| `[?]` | **W kodzie** — na `main` lub lokalnie, **bez** pełnego zamknięcia QA → nie `[x]` |

**Reguła:** nowy `[x]` po weryfikacji (testy + sensowny smoke). Agent aktualizuje ten plik na końcu sesji.

**Deploy:** remote `6f2882a` (`main`). Lokalnie niezacommitowane: **P1-9** hero meta chips (`HeroMetaChip.tsx`).

---

## Priorytety teraz (kolejność pracy)

| # | ID | Zadanie | Dlaczego teraz |
|---|-----|---------|----------------|
| 1 | **P0-SCHED-QA** | Weryfikacja zaplanowanej publikacji na prod | Hobby ≠ cron co minutę; poller CMS — **potwierdzić** |
| 2 | **P1-6** | Upload okładek (pro) | Największy brak w newsroomie vs „tylko URL” |
| 3 | **OPS** | Publikacja ~175 REVIEW + `cache:revalidate` | Treść na portal |
| 4 | **P1-7** | Live preview — domknięcie QA okładki CMS | `[~]` — testy OK, brak formalnego smoke |
| 5 | **P6-24** | SEO (canonical, OG, schema, sitemap) | Widoczność przed skalowaniem ruchu |
| 6 | **P0-5** | Mobile CMS — pełny smoke edytora | Sidebar OK; edycja na telefonie niezweryfikowana |
| 7 | **P6-25** | RODO / cookies | Legal przed kampanią / Ads |
| 8 | **P2-13** | Popularne / engagement | Ranking częściowy |
| 9 | **INFRA** | `article_likes` 404 (Supabase SQL) | Likes proxy |

**Workflow następnego czatu:** jeden wiersz tabeli na raz → raport → test usera → pytanie „kolejny punkt?”.

**Zrobione przed tą kolejką:** P1-9 hero meta; homepage Najnowsze **9 kart** (3×3).

**Nie priorytet na teraz:** P5-22/23 (architektura menu), P4-20 (ulubione kategorie), P6-27 (scaling), pełny pgvector (P3-16).

---

## P0 — BLOCKER (zamknięte / domknięcie)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| **P0-SCHED** | Zaplanowana publikacja (`publishAt` → PUBLISHED) | `[~]` | `5fde7d4` + `98b3b99`: tick przy ruchu + **ScheduledPublishPoller** co 30 s w CMS; `publishedAt = publishAt`. Vercel Hobby **nie** uruchamia crona co minutę — bez otwartego CMS / ruchu na stronie może opóźnić. Opcja: zewnętrzny ping `/api/cron/publish-scheduled`. |
| **P0-HOME-LATEST** | Nowy artykuł = #1 w **Najnowsze** (homepage) i **Aktualności** | `[x]` | `6f2882a`: `pickHomepageLatest` bez wykluczania hero; `revalidatePath('/')`. User potwierdził. |
| **P0-ARCH** | Archiwum CMS + trwałe usuwanie z DB | `[x]` | Zakładka w `/admin/articles`; `POST /api/articles/permanent-delete`. `5fde7d4`. |

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

## P0 — Blokery (rdzeń)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P0-1 | Unifikacja CMS | `[x]` | `ArticleEditor` |
| P0-2 | Źródło na froncie | `[x]` | `SourceAttribution` |
| P0-3 | RSS page cleanup | `[x]` | `/rss` → Subskrypcje |
| P0-4 | AI nie blokuje edycji | `[x]` | Autosave, enrichment |
| P0-5 | Mobile CMS fix | `[~]` | PR12 sidebar `[x]`; edytor mobile — smoke `[ ]` |

---

## P1 — Core CMS (profesjonalny newsroom)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P1-6 | Upload zdjęć (pro) | `[ ]` | Okładka = URL; upload tylko avatary |
| P1-7 | Live preview editor | `[~]` | Split + hero URL; QA okładki `[ ]` |
| P1-8 | CMS redesign (The Verge) | `[~]` | Uproszczenie PR7; pełny redesign `[ ]` |
| P1-9 | Hero article UX — kontrast daty/meta | `[x]` | `HeroMetaChip` — user OK (sesja 17) |
| P1-10 | Zmiana logo / favicon | `[ ]` | Backlog |

---

## P2 — Content system (logika portalu)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P2-11 | Statusy workflow (+ SCHEDULED) | `[~]` | Zapis + auto-publish `[~]` (P0-SCHED); reszta `[x]` |
| P2-12 | Redakcyjny feed | `[~]` | Lista CMS + filtry + archiwum |
| P2-13 | Popularne / Ważne teraz | `[~]` | PR8 ranking; views/engagement słabe |
| P2-14 | Homepage layout | `[~]` | Najnowsze chronologia `[x]`; **9 kart 3×3** `[x]`; slider `[ ]` |
| P2-15 | Komentarze fix (mobile) | `[?]` | Pod treścią — mobile nie sprawdzony |

---

## P3 — AI system

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P3-16 | Internal linking (AI) | `[~]` | Tag-based related `[x]`; embeddings scaffold |
| P3-17 | AI article enrichment | `[x]` | B+ hybryda |
| P3-18 | Content scoring | `[~]` | `aiScore` + ranking częściowy |

---

## P4 — Portal features (user side)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P4-19 | Powiadomienia | `[~]` | UI istnieje; backend niepewny |
| P4-20 | Ulubione kategorie | `[ ]` | — |
| P4-21 | Newsletter (decision) | `[~]` | Placeholder — decyzja otwarta |

---

## P5 — Portal structure

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P5-22 | Działy portalu | `[ ]` | Decyzja otwarta |
| P5-23 | Centrum operacyjne | `[ ]` | Na homepage placeholder — do decyzji |

---

## P6 — SEO / legal / infra

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P6-24 | SEO | `[~]` | Fragmenty OG; brak pełnego systemu |
| P6-25 | RODO / legal | `[ ]` | — |
| P6-26 | Bezpieczeństwo / infra | `[~]` | MVP OK; rate limits backlog |
| P6-27 | Scaling | `[ ]` | Przyszłość |

---

## Dev vs User UI cleanup

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| UX-1 | Public bez RSS/XML/debug w copy | `[x]` | |
| UX-2 | CMS bez terminologii pipeline | `[x]` | |
| UX-3 | Premium newsroom feel | `[~]` | Hero meta + Najnowsze; upload/SEO/RODO zostają |

---

## Sesja 16–17 — zamknięte w czacie (QA)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| S16-1 | Scheduler + archiwum CMS | `[x]` | `5fde7d4`, `98b3b99` |
| S16-2 | Archiwum w zakładce Artykuły (nie osobna strona) | `[x]` | User request |
| S17-1 | Najnowsze homepage = Aktualności (#1 każdy nowy) | `[x]` | `6f2882a`, user potwierdził |
| S17-2 | Hero: czytelna data + czas czytania (`HeroMetaChip`) | `[x]` | User OK |
| S17-3 | Najnowsze: 9 okienek (3×3) | `[x]` | `LATEST_LIMIT = 9` |
| S15-1 | Preview okładka = URL | `[x]` | User potwierdził wcześniej |
| S15-2 | Zaplanuj UI 24h | `[x]` | Zapis + auto via poller |
| S14-2 | Najnowsze chronologicznie | `[x]` | Domknięte S17-1 |

---

## Sesja 13–15 — starsze fixy (QA prod)

| ID | Zadanie | Na main | Prod smoke |
|----|---------|---------|------------|
| S13-1 | `publishedAt` tylko przy Opublikuj | `[?]` | `[ ]` |
| S13-2 | Zapisz szkic REVIEW → DRAFT | `[?]` | `[ ]` |
| S13-3 | Lista CMS `updatedAt desc` | `[?]` | `[ ]` |
| S13-4 | Backfill `db:fix-published-at` | `[?]` | `[ ]` na prod |
| S14-1 | Okładka live preview CMS | `[?]` | `[ ]` |

---

## Infrastruktura / operacje

| Temat | Status | Uwagi |
|-------|--------|-------|
| Next.js 15 + Vercel deploy z `main` | `[x]` | |
| Prisma + Supabase | `[x]` | |
| Migracje: SCHEDULED, publishAt, contentOrigin | `[x]` | |
| Cron RSS 1×/dzień (Hobby) | `[x]` | |
| Commit + push sesji 16–17 | `[~]` | `6f2882a` na remote; P1-9 lokalnie |
| Zaplanowana publikacja (bez Pro cron) | `[~]` | Poller CMS + `maybeTickScheduledPublish` |
| ~175 artykułów REVIEW | `[ ]` | Do ręcznej publikacji |
| `article_likes` 404 | `[ ]` | Supabase SQL |
| Pełna treść RSS na stronie | `[x]` NIE (świadomie) | Hybryda B+ + link |

---

## Postęp (szacunek)

| Priorytet | `[x]` | `[~]` | `[ ]` |
|-----------|-------|-------|-------|
| P0 rdzeń + blockery | 7 | 2 | 0 |
| P1 | 0 | 2 | 3 |
| P2 | 1 | 4 | 0 |
| P3 | 1 | 2 | 0 |
| P4–P6 | 0 | 4 | 5 |
| Architektura A1–A6 | 6 | 0 | 0 |

**Szacunek:** rdzeń newsrooma (publish + feed + CMS) ≈ **85%**; pełny backlog v3 ≈ **40–45%**.

---

## Historia zmian tego pliku

| Data | Zmiana |
|------|--------|
| 3.06.2026 | Utworzenie trackera |
| 3.06.2026 | Sesja 15: P0-SCHED blocker |
| 3.06.2026 | Sesja 16–17: P0-HOME-LATEST, P0-ARCH, scheduler poller; P1-9; **Priorytety teraz** |

---

## Następny krok (skrót)

**Reguła:** 1 priorytet → meldunek → test usera → „kolejny punkt?”

1. **P0-SCHED-QA** na prod  
2. **P1-6** upload okładek  
3. Dalej wg tabeli „Priorytety teraz”

*Koniec trackera — jeden plik prawdy obok `docs/WSS_NEXT_CHAT_HANDOFF.md`.*
