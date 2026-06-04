# WSS — Roadmap Backlog v3 (tracker)

**Cel:** pełny portal informacyjny + CMS + AI + RSS + redakcja  
**Ostatnia aktualizacja:** 4 czerwca 2026 (koniec czat 25)  
**Deploy remote:** `f956ff0` (homepage, profil, mobile nav — patrz handoff MAPA)

| # | ID | Zadanie | Status |
|---|-----|---------|--------|
| 0 | **PROD-QA** | Smoke prod po czacie 25 (homepage, profil, mobile nav, autor CMS) | **Następne** |
| 1 | **OPS** | ~175 REVIEW + revalidate | |
| 2 | **P1-6-QA** | Upload okładek na prod | |
| 3 | **P2-WEEK-TOPIC prod** | weekTopic + revalidate na prod | |

**Zamknięte w czacie 24–25:** UI-HOME-24 `[x]` · P0-AUTHOR-BYLINE `[x]` · UI-PROFIL-25 `[x]` · UI-MOBILE-NAV-25 `[x]` · UI-NO-SUBSCRIBE-LINKS `[x]` · **P1-10 LOGO** wordmark v2 `[x]` (PNG, nav/stopka)

**P2-WEEK-TOPIC:** kod + push `[x]` `3e7139b` · **prod smoke** (weekTopic ON + revalidate) `[ ]`

**P0-HOME-DATES:** `publishedAt` stabilne, CMS bez autosave `[x]` `3e7139b`

**INFRA-LIKES:** `[~]` SQL w repo; user uruchomił na Supabase.

**P2-13:** `[~]` lajki per-user w kodzie; Popularne z `article_like_counts`.

**Nie priorytet:** scheduler zaplanowanych artykułów (kod zostaje, user: luźno).

**Nie priorytet na teraz:** P5-22/23 (architektura menu), P4-20 (ulubione kategorie), P6-27 (scaling), pełny pgvector (P3-16).

---

## P0 — BLOCKER (otwarte)

_(brak)_

## P0 — BLOCKER (zamknięte / domknięcie)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| **P0-AUTHOR-BYLINE** | Prisma Client vs `authorByline` | `[x]` | `4ca8d46` + migracja; generate na dev/prod build |
| **UI-HOME-24** | Homepage motywy, hero, breadcrumb, week topic | `[x]` | `4ca8d46`, `4868232` |
| **UI-PROFIL-25** | Redesign `/profil` | `[x]` | hero, stats, sekcje |
| **UI-MOBILE-NAV-25** | Szukaj + powiadomienia mobile | `[x]` | `nav-overlay-panel.ts` |
| **UI-NO-SUBSCRIBE** | Bez linków Subskrypcje w UI | `[x]` | `06e2d4d` |

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| **P0-SCHED** | Zaplanowana publikacja (`publishAt` → PUBLISHED) | `[x]` | `b7a0ca6` + wcześniejsze `5fde7d4`, `98b3b99`: legacy RSS excerpt OK; panel Publikacja; ScheduledPublishPoller co 30 s; cache fix; `publishedAt = publishAt`. **User OK** lokalnie/prod (P0-SCHED-QA). Vercel Hobby ≠ cron co minutę — bez otwartego CMS może opóźnić. |
| **P0-SCHED-QA** | Smoke zaplanowanej publikacji na prod | `[x]` | User potwierdził OK (zaplanowanie + Najnowsze po Ctrl+F5). |
| **P0-DEPLOY** | Vercel deploy z `main` (Hobby + vercel.json) | `[x]` | Cron `* * * * *` blokował build → usunięty `794d53d` |
| **P0-HOME-LATEST** | Nowy artykuł = #1 w **Najnowsze** (homepage) i **Aktualności** | `[x]` | `6f2882a` + cache fix sesja 18. User potwierdził. |
| **P0-ARCH** | Archiwum CMS + trwałe usuwanie z DB | `[x]` | `5fde7d4`. |

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
| P1-6 | Upload zdjęć (pro) | `[~]` | `31a5525` — API + UI; prod: `SUPABASE_SERVICE_ROLE_KEY` + `article-covers.sql` |
| P2-16 | Temat tygodnia (homepage) | `[~]` | Push `3e7139b`; prod: weekTopic w CMS + `cache:revalidate` |
| P1-7 | Live preview editor | `[~]` | Split + hero URL; QA okładki `[ ]` |
| P1-8 | CMS redesign (The Verge) | `[~]` | Uproszczenie PR7; pełny redesign `[ ]` |
| P1-9 | Hero article UX — kontrast daty/meta | `[x]` | `HeroMetaChip` — user OK (sesja 17) |
| P1-10 | Zmiana logo / favicon | `[~]` | Wordmark v2 PNG w nav/stopce `[x]`; favicon / apple-touch `[ ]` |
| P1-11 | Podpis zdjęcia okładki (coverImageCredit) | `[x]` | `39c8a9e`; migracja `20260603200000`; **prod: sprawdzić db:deploy** |

---

## P2 — Content system (logika portalu)

| ID | Zadanie | Status | Uwagi / dowód |
|----|---------|--------|----------------|
| P2-11 | Statusy workflow (+ SCHEDULED) | `[x]` | Zapis + auto-publish via poller — user OK (sesja 18) |
| P2-12 | Redakcyjny feed | `[~]` | Lista CMS + filtry + archiwum |
| P2-13 | Popularne / Ważne teraz | `[~]` | PR8 ranking + slidery sesja 18; views/engagement słabe |
| P2-14 | Homepage layout | `[~]` | Sesja 18 slidery prod; **sesja 19 WIP:** hero + rail desktop / slidery mobile — lokalnie, bez commita |
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
| UX-3 | Premium newsroom feel | `[~]` | Kolory WIP; **UX-BG** tło jaśniejsze — następny czat |

---

## Sesja 19 — czat (WIP / deploy)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| S19-1 | Fix deploy Vercel (vercel.json cron) | `[x]` | `794d53d` |
| S19-2 | db:deploy prod | `[x]` | Wszystkie migracje OK |
| S19-3 | Homepage hero + panel boczny | `[~]` | Lokalnie, bez commita |
| S19-4 | SiteBackground (ciemne tło) | `[~]` | WIP — user: przerobić na **jaśniejsze** (UX-BG) |
| S19-5 | cache:revalidate fix | `[~]` | Lokalnie |

## Sesja 18 — zamknięte w czacie (QA)

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| S18-1 | P0-SCHED-QA — zaplanowana publikacja | `[x]` | User OK lokalnie/prod |
| S18-2 | Homepage layout (slidery Najnowsze + Ważne teraz) | `[x]` | `cff809b`…`241ba6e`; bez duplikatów sidebar |
| S18-3 | HorizontalScrollSlider (strzałki, scroll, klik w artykuł) | `[x]` | `504c779`, `241ba6e` |
| S18-4 | coverImageCredit — podpis zdjęcia okładki CMS | `[x]` | `39c8a9e`; db:deploy prod — sprawdzić |
| S18-5 | Scheduler QA (legacy RSS excerpt, cache fix) | `[x]` | `b7a0ca6` |

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
| Migracje: SCHEDULED, publishAt, contentOrigin, coverImageCredit | `[x]` kod / `[~]` prod deploy coverImageCredit |
| Cron RSS 1×/dzień (Hobby) | `[x]` | |
| Commit + push sesji 16–19 | `[~]` | `794d53d` remote; layout/kolory/tło **lokalnie** |
| Zaplanowana publikacja (poller CMS) | `[~]` | Nie priorytet user; kod zostaje |
| ~175 artykułów REVIEW | `[ ]` | Do ręcznej publikacji |
| `article_likes` 404 | `[ ]` | Supabase SQL |
| Pełna treść RSS na stronie | `[x]` NIE (świadomie) | Hybryda B+ + link |

---

## Postęp (szacunek)

| Priorytet | `[x]` | `[~]` | `[ ]` |
|-----------|-------|-------|-------|
| P0 rdzeń + blockery | 9 | 1 | 0 |
| P1 | 1 | 2 | 3 |
| P2 | 2 | 2 | 0 |
| P3 | 1 | 2 | 0 |
| P4–P6 | 0 | 4 | 5 |
| Architektura A1–A6 | 6 | 0 | 0 |

**Szacunek:** rdzeń newsrooma (publish + feed + CMS) ≈ **88%**; pełny backlog v3 ≈ **42–47%**.

---

## Historia zmian tego pliku

| Data | Zmiana |
|------|--------|
| 3.06.2026 | Utworzenie trackera |
| 3.06.2026 | Sesja 15: P0-SCHED blocker |
| 3.06.2026 | Sesja 16–17: P0-HOME-LATEST, P0-ARCH, scheduler poller; P1-9; **Priorytety teraz** |
| 3.06.2026 | Sesja 18: P0-SCHED-QA, homepage slidery, coverImageCredit |
| 3.06.2026 | Sesja 19: P0-DEPLOY `794d53d`; layout rail WIP; **UX-BG** następny czat |

---

## Następny krok (skrót)

**Reguła:** 1 priorytet → meldunek → test usera → „kolejny punkt?”

1. **UX-BG** — tło jaśniejsze / ciekawsze  
2. **P1-6** upload okładek (po QA layoutu WIP)  
3. Dalej wg tabeli „Priorytety teraz”

*Koniec trackera — jeden plik prawdy obok `docs/WSS_NEXT_CHAT_HANDOFF.md`.*
