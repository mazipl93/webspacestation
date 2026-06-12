# WSS — Handoff: jakość obrazów + mobile perf (następny czat)

**Data:** 8 czerwca 2026 (wieczór, po sesji perf+SEO)  
**Repo:** `mazipl93/webspacestation` · branch `main` · prod zsynchronizowany  
**Prod:** https://webspacestation.pl  
**Ostatni commit:** `34f7127` — `fix(images): sharper desktop covers while keeping mobile LCP preload light`

---

## Stan PageSpeed (user, 8 cze 2026)

| Urządzenie | Wydajność | Uwagi |
|------------|-----------|--------|
| **Desktop (PC)** | **~99** | Świetnie po optymalizacji |
| **Mobile (Moto G / Lighthouse)** | **~73–76** | OK, nie tragedia |
| **SEO** | **100** | |
| **CLS** | **0** | |

**LCP mobile (seria usera):** 5,1 · 5,7 · 5,8 · 5,2 s (średnia ~5,5 s). Ostatni pełny raport: **6,8 s**, perf **76**.

---

## Problem na następny czat (PRIORYTET)

**User:** na PC wydajność **99**, ale **zdjęcia nadal wyglądają brzydko** (rozmyte / skompresowane / „jak gówno”).  
**Cel:** **ostre, ładne okładki na desktopie** przy zachowaniu **mobile LCP ~5–7 s** i **perf mobile ~73+**.

To **nie** jest już problem wielomegabajtowych hotlinków (naprawione w `be98daf` — domyślny `/_next/image`).

### Podejrzenia (do weryfikacji)

1. **`quality` 72–76** — nadal za nisko wizualnie na dużym hero / leadach?
2. **`sizes` / srcset** — desktop może nadal brać za mały wariant mimo `34f7127` (hero do 1320px)?
3. **Hero = client component** (`HomepageHeroSlider`) — hydracja / opóźnienie ostrości?
4. **Strona artykułu** — `CoverImage` bez podniesionego `quality` / `sizes`?
5. **Źródła RSS** — NASA `assets.science.nasa.gov` dynamic resize URL z parametrami `w=4537` — optimizer może dostać ogromny source?
6. **Format** — WebP q74 vs oryginał PNG/JPEG — artefakty na gradientach kosmosu?

---

## Co już zrobiono w sesji perf+SEO (nie cofać)

| Commit | Zmiana |
|--------|--------|
| `2017418` | Mapa Leaflet OFF na homepage → blok CTA `/mapa` |
| `2017418` | `ArticleCard` quality/sizes, mniejsze karty |
| `a1d7295` | ESA/NASA przez optimizer; hero preload; eager LCP |
| `be98daf` | **Wszystkie remote covers → `/_next/image` domyślnie** (flip `shouldBypassImageOptimizer`) |
| `be98daf` | SEO: tytuły działów, canonical, OG 1200×630, alt na kartach |
| `34f7127` | Hero: osobny preload mobile (q62, 640px) vs display (q74, do 1320px); karty q72–76 |

**Nie ruszać:** auth, CMS, middleware, cron, RLS, ops na `/mapa`.

---

## Kluczowe pliki (obrazy)

| Obszar | Pliki |
|--------|--------|
| Hero LCP | `lib/home/hero-lcp.ts`, `app/page.tsx`, `components/sections/HomepageHeroSlider.tsx` |
| Karty | `components/article/ArticleCard.tsx`, `CoverImage.tsx` |
| Homepage sekcje | `ContentGrid.tsx`, `LatestShowcase.tsx`, `HomeSectionArticleFeed.tsx` |
| Optimizer | `lib/media/cover-url.ts` |
| Artykuł | `app/aktualnosci/[slug]/page.tsx` |

---

## Prompt na nowy czat (skopiuj poniżej)

```
Projekt: WSS (Next.js 15, Vercel Hobby, Prisma/Supabase) — https://webspacestation.pl
Repo: C:\Users\dawid\Desktop\wss-nowa · branch main · prod zsynchronizowany
Ostatni commit: 34f7127 — fix(images): sharper desktop covers while keeping mobile LCP preload light

Przeczytaj: docs/WSS_PERF_CHAT_HANDOFF.md

## Stan PageSpeed (user, 8 cze 2026)
- Desktop PC: wydajność ~99 — super, nie psuć
- Mobile: ~73–76, LCP średnio 5,1–5,8 s (OK)
- SEO 100, CLS 0

## Problem do naprawy (PRIORYTET)
Zdjęcia na komputerze nadal wyglądają BRZYDKO (rozmyte / skompresowane) mimo perf 99.
User chce: ŁADNE, ostre okładki na desktopie + zachować mobile LCP ~5–7 s i perf mobile ~73+.

## Co już jest (NIE cofać)
- Mapa Leaflet tylko na /mapa
- Wszystkie okładki RSS przez /_next/image (cover-url domyślnie optimize)
- Hero: preload mobile lekki (q62, 640px), display q74, sizes do 1320px (commit 34f7127)
- SEO: tytuły, canonical, OG, alt

## Zadanie
1. Zdiagnozuj DLACZEGO desktop nadal wygląda źle (DevTools: jaki src/srcset, rozmiar pliku, quality, czy upscaling)
2. Napraw jakość wizualną — sensowne podejście:
   - wyższe quality TYLKO na desktop (np. sizes + quality 80 na lg) LUB osobne breakpointy
   - strona artykułu — hero okładka
   - ewentualnie normalize URL NASA (strip huge w/h z query) przed optimizerem
   - NIE wracać do unoptimized multi-MB hotlinków
3. Zweryfikuj że mobile LCP nie skacze >8 s (preload hero zostaje lekki)
4. npm run build — zielony

## Zasady
- Minimalny diff, bez commit/push/deploy bez prośby usera
- Nie ruszać auth, CMS, middleware, cron

Na końcu: co było przyczyną brzydkich zdjęć + co zmieniłeś + „do wdrożenia: push”.
```
