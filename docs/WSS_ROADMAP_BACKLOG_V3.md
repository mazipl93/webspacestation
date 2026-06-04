# WSS — Roadmap Backlog v3 (tracker)

**Cel:** pełny portal informacyjny + CMS + AI + RSS + redakcja  
**Ostatnia aktualizacja:** 4 czerwca 2026 (czat 37 — backlog krok po kroku czat 38)  
**Deploy remote:** `976c55d`  
**Plan:** `docs/WSS_STEP_BY_STEP_BACKLOG.md`

## Priorytety teraz (krok po kroku — czat 39)

| Krok | ID | Zadanie | Status |
|------|-----|---------|--------|
| **0** | **COMMIT-WIP** | Logo C + tło flat + article-panel (bez dev UI) | `[x]` `eb6fc60` |
| **WIP-CMS** | **CMS-HERO-BYLINE** | Hero meta, bulk CMS, edytor, byline, profil admin | `[x]` `f93415a` |
| **1** | **CLEAN-WAZNE-TERAZ** | Usunąć ImportantNowSlider, HomeSidebar, TopStoriesList, HeroEditorialCluster | `[x]` |
| **2** | **CMS-REVIEW-COUNT** | Licznik REVIEW w CMS | `[x]` `e16931b` |
| **3** | **COMMENTS-SUPABASE** | Komentarze w DB zamiast localStorage | `[x]` `14d1675` |
| **4** | **SEO-SITEMAP-JSONLD** | Sitemap + structured data artykułów | `[ ]` **START** |
| **5** | **ODKRYWAJ-SECTIONS** | /starty, /mapa, /kalendarz, /galeria, /wideo — real content | `[ ]` |
| **6** | **OPS-API** | Homepage ops z API (nie LAUNCHES[] mock) | `[ ]` |
| — | **OPS-REVIEW** | User publikuje ~175 w CMS | `[ ]` redakcja |
| **2** | **CMS-OPS-UX** | Dev | Licznik REVIEW + bulk publish | `[ ]` opcjonalnie |
| **2** | **P1-6-QA** | User+Dev | Upload okładek prod (`SUPABASE_SERVICE_ROLE_KEY`, bucket) | `[ ]` |
| **3** | **P2-WEEK-TOPIC** | User | `weekTopic` ON na 1–3 artykułach + revalidate + smoke | `[ ]` |
| **4** | **DOCS-SYNC** | Dev | Checkboxy roadmap vs prod (`a5ab17c`) | `[~]` |

**Jak OPS (user):** `/admin/articles` → **„Do sprawdzenia”** → edytuj → **Opublikuj** → po partii `npm run cache:revalidate`.

**Zamknięte czat 32:** weave links `[x]` `a5ab17c` · audyt OPS (pipeline OK)

**Zamknięte czat 31:** UI-ARTICLE-DISCUSSION `[x]` · COMMIT-WIP-30 `[x]` · PROD-QA `[x]`

**Zamknięte czat 26–30 (prod):** hero slider · mobile depts · read-next · footer · CMS listy · hero breadcrumb · heroPosition · internal links (reguły)

**Zamknięte wcześniej:** UI-HOME-24 · P0-AUTHOR-BYLINE · UI-PROFIL-25 · UI-MOBILE-NAV-25 · P1-10 LOGO wordmark v2

**P2-WEEK-TOPIC:** kod `[x]` · prod smoke (toggle + revalidate) `[ ]`

**P3-16 internal linking:** reguły w treści (tagi, dział, archiwum) `[x]` `a5ab17c` · embeddings AI `[ ]`

**INFRA-LIKES:** `[~]` user uruchomił `user_article_likes.sql`

**Nie priorytet:** auto-publish RSS · pełny RSS body · scheduler co minutę · pgvector

---

## P0 — BLOCKER (otwarte)

_(brak)_

## P0 — BLOCKER (zamknięte — skrót)

P0-SCHED · P0-SCHED-QA · P0-DEPLOY · P0-HOME-LATEST · P0-ARCH · P0-AUTHOR-BYLINE · UI-HOME-24 · UI-PROFIL-25 · UI-MOBILE-NAV-25 · UI-NO-SUBSCRIBE

---

## Zasady architektury (NIE ZMIENIAĆ)

| # | Zasada | Status |
|---|--------|--------|
| A1 | Jeden model Article | `[x]` |
| A2 | RSS = input do CMS | `[x]` |
| A3 | AI = asystent | `[x]` |
| A4 | Manual = ten sam workflow | `[x]` |
| A5 | Jeden editor | `[x]` |
| A6 | Public ≠ Admin UI | `[x]` |

---

## P1 — Core CMS

| ID | Zadanie | Status | Uwagi |
|----|---------|--------|-------|
| P1-6 | Upload okładek | `[~]` | Kod OK; prod: service role + bucket |
| P1-11 | Listy w treści CMS | `[x]` | Parser + `<ul>` na prod |
| P1-7 | Live preview | `[x]` | Split mobile/desktop |
| UI-ARTICLE-DISCUSSION | Dyskusja mobile | `[x]` | czat 31 |
| UI-ARTICLE-READ-NEXT | Czytaj dalej lista | `[x]` | |
| UI-FOOTER | Stopka nav | `[x]` | |
| UI-HOME-DEPTS | Działy homepage mobile | `[x]` | |
| P1-10 | Logo wordmark | `[x]` | favicon `[ ]` |
| P1-8 | CMS redesign pełny | `[ ]` | |

---

## P2 — Content system

| ID | Zadanie | Status |
|----|---------|--------|
| P2-11 | Workflow SCHEDULED | `[x]` |
| P2-14 | Homepage layout (slider, działy) | `[x]` |
| P2-16 | Temat tygodnia | `[~]` kod `[x]` prod smoke `[ ]` |
| P2-13 | Popularne / lajki | `[~]` |
| P2-15 | Komentarze | `[~]` Supabase WIP (`article_comments.sql`) |

---

## P3 — AI

| ID | Zadanie | Status |
|----|---------|--------|
| P3-16 | Internal linking | `[~]` reguły `[x]` · AI embeddings `[ ]` |
| P3-17 | AI enrichment B+ | `[x]` |
| P3-18 | Content scoring | `[~]` |

---

## Infrastruktura / operacje

| Temat | Status |
|-------|--------|
| Vercel deploy z `main` | `[x]` |
| News Engine pipeline | `[x]` |
| ~175 REVIEW kolejka | `[ ]` **redakcja user** |
| Cron RSS 1×/dobę | `[x]` |
| Komentarze Supabase | `[ ]` |
| getRelatedArticles full scan | tech debt |

---

## Następny krok (skrót)

**Reguła:** 1 priorytet → meldunek → test usera → „kolejny punkt?”

1. **OPS-REVIEW** — user publikuje partiami w CMS  
2. **CMS-OPS-UX** — jeśli user chce ułatwienie (bulk + licznik)  
3. **P1-6** → **P2-WEEK-TOPIC**

*Koniec trackera — jeden plik prawdy obok `docs/WSS_NEXT_CHAT_HANDOFF.md`.*
