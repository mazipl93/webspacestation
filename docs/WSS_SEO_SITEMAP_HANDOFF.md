# WSS — SEO / Sitemap / GSC: handoff (sesja 15 czerwca 2026)

**Produkcja:** https://webspacestation.pl  
**Repo:** `mazipl93/webspacestation` · branch `main`  
**Commit SEO sitemap:** `0bbc9a6` — `fix(seo): split sitemap, noindex tags, clean robots for news indexing`  
**Deploy prod:** ręczny `npx vercel --prod --yes` (15.06.2026 ~18:11) — auto-webhook po `git push` **nie odpalił** buildu; prod był na starym deployu do ręcznego pusha.

**GSC (user, 15.06.2026):** `/sitemap.xml` usunięty i dodany ponownie → **Sukces**. „Wykryte strony” 282 = prawdopodobnie stary stan (tagi+feedy); spadnie po ponownym odczycie (1–3 dni).

---

## Problem (diagnoza GSC)

Skok **~141 niezindeksowanych** od ~2 czerwca 2026. Główne kubełki:

| Kubełek GSC | Skala | Przyczyna |
|---|---|---|
| Zeskanowana, nie zindeksowana | ~72 URL | `/tag/*`, `/feed/*` w sitemap + crawl |
| Wykryta, nie zindeksowana | ~63 URL | Artykuły i działy w kolejce (crawl budget zmarnowany na tagi) |

**Root cause w kodzie:** Krok 6 planu OG/SEO (`docs/WSS_OG_SEO_FOLLOWUP_PLAN.md`) **celowo** dodał tagi i feedy RSS do `app/sitemap.ts`. Google crawlował i słusznie odrzucał (thin tag pages, XML feedy).

Dodatkowo: `/sitemap.xml` zwracał **HTTP 500** na prod (jedna wielka mapa + timeout).

---

## Co wdrożono (15.06.2026)

### Struktura sitemap (news portal standard)

```
/sitemap.xml                    ← indeks (JEDYNY wpis w GSC)
├── /sitemaps/pages.xml         ← strony indeksowalne (działy, huby, narzędzia)
└── /sitemaps/articles.xml      ← tylko /aktualnosci/{slug}
```

**❌ NIE używać:** `/sitemap/pages.xml` (bez **s**) — to szablon ChatGPT, u nas folder to **`sitemaps`**.

**❌ Poza sitemap (nigdy nie dodawać z powrotem):**
- `/tag/*`
- `/feed.xml`, `/feed/{dział}`
- `/rss` (landing subskrypcji)

### robots.txt

`Disallow:` `/admin/`, `/api/`, auth, `/profil`, `/notifications`, `/search`, **`/tag/`**, **`/feed/`**

RSS discovery zostaje przez `<link rel="alternate" type="application/rss+xml">` w `app/layout.tsx`.

### noindex (meta)

| Trasa | robots |
|---|---|
| `/tag/[slug]` | `noindex, follow` (`SEO_NOINDEX_FOLLOW`) |
| `/rss` | `noindex, follow` |
| `/search` | już było |

### Redirect

`next.config.ts`: `/index` → `/` (301)

### Usunięte

- `app/sitemap.ts` (monolityczna mapa z tagami i feedami)

### Nowe pliki

| Plik | Rola |
|---|---|
| `lib/seo/sitemap-builders.ts` | Budowa entries + render XML + `sitemapXmlResponse` |
| `lib/seo/sitemap-builders.test.ts` | Testy (node:test) |
| `app/sitemap.xml/route.ts` | GET → `sitemapindex` |
| `app/sitemaps/pages.xml/route.ts` | GET → urlset stron |
| `app/sitemaps/articles.xml/route.ts` | GET → urlset artykułów (DB, dynamic import) |

### Zmodyfikowane

| Plik | Zmiana |
|---|---|
| `app/robots.ts` | Disallow tag/feed/search |
| `app/tag/[slug]/page.tsx` | noindex |
| `app/rss/page.tsx` | noindex |
| `lib/seo/listing-metadata.ts` | opcjonalny param `robots` |
| `lib/seo/public-routes.ts` | `/rss` poza `SEO_SITEMAP_PATHS`; w `SEO_NOINDEX_PUBLIC_PATHS` |
| `lib/cache/revalidate-public-articles.ts` | revalidate child sitemaps |
| `lib/seo/gsc-priority.ts` | tier3 bez `/rss` |
| `next.config.ts` | redirect `/index` |
| `scripts/gsc-priority-urls.ts` | notatka o strukturze indeksu |

---

## Weryfikacja prod (po deployu 15.06.2026)

| URL | Oczekiwany wynik |
|---|---|
| `https://webspacestation.pl/sitemap.xml` | 200, `<sitemapindex>` z 2 dziećmi |
| `https://webspacestation.pl/sitemaps/pages.xml` | 200, `<urlset>`, bez `/tag/`, `/feed/`, `/rss` |
| `https://webspacestation.pl/sitemaps/articles.xml` | 200, `<urlset>` slugów artykułów |
| `https://webspacestation.pl/robots.txt` | Disallow `/tag/`, `/feed/` |

Komunikat przeglądarki *„This XML file does not appear to have any style information…”* przy XML — **normalny**, nie błąd.

---

## GSC — co zrobił user / co robić dalej

### Zrobione (15.06.2026)

- Mapy witryn → tylko `sitemap.xml` → **Sukces**

### Nie robić

- ❌ Osobno dodawać `pages.xml` / `articles.xml` w GSC
- ❌ `npm run gsc:ping-sitemap` — Google **deprecated ping 2023** (404); Bing 410
- ❌ Validate fix na `/tag/*` — same z czasem znikną z raportu
- ❌ Spam Request indexing (>10–12 URL/dzień)

### Opcjonalnie za 2–3 dni

Inspekcja URL → Request indexing (tier z `lib/seo/gsc-priority.ts`):
- `/aktualnosci`, `/mapa`, `/technologie`, `/galeria`…

### Oczekiwany timeline

| Kiedy | Efekt |
|---|---|
| 1–3 dni | GSC: nowy „Ostatni odczyt”, mniejsza liczba „Wykryte strony” |
| 1–2 tyg. | Przestaną przybywać `/tag/*`, `/feed/*` w problemach |
| 2–4 tyg. | Więcej artykułów w indeksie, spadek szarego słupka (~141) |

---

## Deploy — pułapka Vercel

Po `git push origin main` build **może nie wystartować** (webhook). Sprawdź:

```powershell
npx vercel ls
```

Jeśli ostatni deploy jest **starszy** niż `git log -1` → ręcznie:

```powershell
npx vercel --prod --yes
```

Projekt Vercel: `mazipl93s-projects/wss` · alias prod: `webspacestation.pl`

---

## Reguły dla przyszłych czatów (MUST)

1. **Sitemap = tylko kanoniczne, indeksowalne strony** — artykuły + pages. Nigdy tagi, feedy, search, auth.
2. **Tagi = `noindex, follow`** — linkowanie wewnętrzne OK, indeks nie.
3. **Nie przywracać** monolitycznego `app/sitemap.ts` z `getPublishedTags()` — funkcja w `lib/server/articles.ts` zostaje do innych celów, nie do sitemap.
4. **GSC:** jeden wpis `sitemap.xml` (indeks).
5. **sitemap_news.xml** — tylko jeśli portal w Google News Publisher Center (P2, nie wdrożone).
6. **Architektura treści:** `docs/WSS_CONTENT_ARCHITECTURE.md` — bez zmian.

---

## Powiązane dokumenty

| Dokument | Relacja |
|---|---|
| `docs/WSS_OG_SEO_FOLLOWUP_PLAN.md` | Krok 6 dodał feedy do sitemap — **cofnięte** tą sesją |
| `docs/WSS_CONTENT_ARCHITECTURE.md` | Działy, redirecty legacy |
| `lib/seo/gsc-priority.ts` | Tier URL do Request indexing |
| `scripts/gsc-priority-urls.ts` | Checklista GSC (`npm run gsc:priority-urls`) |

---

## STARTING PROMPT (kopiuj do nowego czatu)

```
Projekt: WSS, prod https://webspacestation.pl, repo mazipl93/webspacestation, main

SEO sitemap (docs/WSS_SEO_SITEMAP_HANDOFF.md) — DONE 15.06.2026:
- Commit 0bbc9a6 · deploy ręczny vercel --prod
- /sitemap.xml = indeks → /sitemaps/pages.xml + /sitemaps/articles.xml
- Tagi/feedy POZA sitemap, noindex tagów, robots Disallow /tag/ /feed/
- GSC: sitemap.xml Sukces (user odświeżył 15.06)

NIE RUSZAĆ bez explicit OK usera:
- Nie dodawać tagów/feedów do sitemap
- Nie pingować sitemap (deprecated)
- Commit/push tylko po OK usera

Otwarte (obserwacja, nie kod):
- GSC „Wykryte strony” 282 → powinno spaść po recrawlu
- Kubełek ~141 niezindeksowanych → 2–4 tyg. po cleanup
- Opcjonalnie: tier-2 GSC Request indexing (/technologie, /iss…)

Architektura: docs/WSS_CONTENT_ARCHITECTURE.md
```

---

## Log

| Data | Kto | Uwagi |
|---|---|---|
| 2026-06-15 | user + agent | Diagnoza GSC, implementacja sitemap split, commit 0bbc9a6 |
| 2026-06-15 | user | push main; webhook Vercel nie zadziałał |
| 2026-06-15 | agent | `npx vercel --prod --yes` — prod OK |
| 2026-06-15 | user | GSC sitemap.xml usunięty + dodany → Sukces |
