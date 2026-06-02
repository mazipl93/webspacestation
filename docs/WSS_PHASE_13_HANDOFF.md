# WSS — Phase 13 (UI polish editorial + full-width + mobile scale) — HANDOFF
**Status:** Wdrożone lokalnie na `main` @ `aafffbf` (commit message: „msg” — warto poprawić przy pushu). Build zielony (`tsc` + `next build`). **Date:** 2 June 2026

---

## READ FIRST

1. **Ten plik** — Phase 13: audyt UI, polish homepage, full-width layout, mobile typography
2. `docs/WSS_PHASE_12_HANDOFF.md` — Homepage V2, auth fix, powiadomienia popover, UI PL, Technologie hero-strip
3. `docs/WSS_PHASE_11_HANDOFF.md` — ISR (revalidate 300) + homepage news-first
4. `docs/WSS_PHASE_10_HANDOFF.md` — performance audit Prio 3–7 (NIE wdrożone)

---

## CO ZROBIONO W TEJ FAZIE (Phase 13)

### A. Audyt wizualny homepage (ANALIZA — bez commitu osobnego)

Ocena ogólna **7.6/10**. Oceny sekcji i priorytety P1–P4 omówione w czacie — większość P1–P2 wdrożona poniżej.

### B. Wspólna warstwa layoutu + kategorii (WDROŻONE)

| Plik | Rola |
|------|------|
| `lib/site-layout.ts` | `SITE_CONTAINER` — **pełna szerokość** viewportu, cienkie guttery (`max-w-none`, `px-3` → `2xl:px-10`) |
| `lib/categories.ts` | Jedno źródło prawdy: label, kolor, href, opis, fallback BG obrazków |
| `components/article/CoverImage.tsx` | Client fallback przy 404 CDN (Unsplash) |

### C. Homepage editorial polish (WDROŻONE)

**Layout / szerokość:**
- Navbar, Footer, ContentGrid, ArticleFeedSection → `SITE_CONTAINER` (edge-to-edge)
- Sidebar desktop: `320px` (lg) → `340px` (xl); większe gapy w gridzie

**Hero + lead:**
- Badge: breaking = czerwone „Ważne”, zwykły lead = niebieskie „Główny temat”
- Mobile: niższy hero, większy h1 (`clamp` od 1.875rem), pełnoszeroki CTA 48px
- `CoverImage` z fallbackiem

**Najnowsze wiadomości:**
- Pierwsza karta **featured** (`sm:col-span-2`, layout poziomy od sm)
- Separator `border-t` przed sekcją

**Sekcje kategorii:**
- **Technologie** — `hero-strip` + `prominent: true` (cyan glow)
- **Misje** — `hero-strip` (lead + 3 compact)
- **ISS** — `accent-bar` (amber), zamiast `minimal`
- Astronomia / Ziemia z kosmosu — bez zmian variantu

**Sidebar (`HomeSidebar.tsx`):**
- Usunięty placeholder „Najnowsze komentarze”
- **Popularne** — liczniki polubień z Supabase
- **Na czasie / Najnowsze** — jeden blok „Redakcyjny feed” z zakładkami

**Ważne teraz (`TopStoriesList`):**
- Max 5 pozycji + link „Wszystkie aktualności”

**Centrum operacyjne:**
- Badge „Podgląd” zamiast fałszywego „Na żywo”
- Usunięty duplikat countdown Falcon 9 w live center
- Mapa misji 240px; sekcja w kontenerze `bg-space-card/40`
- Launch cards: 1 kolumna na wąskim mobile → 2 → 4

### D. Strony kategorii (WDROŻONE)

- `ArticleFeedSection` — opis z `lib/categories.ts`, `SITE_CONTAINER`, pierwszy artykuł **featured** (`lg:col-span-2`)

### E. Mobile scale-up (WDROŻONE — ostatnia iteracja czatu)

- **ArticleCard:** zdjęcie 220px, tytuł 20px, excerpt 16px na mobile (nie kurczyć na małych ekranach)
- **TopStoriesList:** miniaturki 88px, tytuł 17px
- **Navbar mobile:** większe logo, tagline widoczny, menu 17px
- **Category headers:** tytuł 1.75rem, opis 16px na mobile

### F. Dane (WDROŻONE)

- `data/news.json` — naprawiony martwy URL obrazu Mars Sample Return
- Runtime: `CoverImage` łapie 404 także dla URL-i w DB

### G. Znany problem dev — biały ekran (DIAGNOZA, nie bug kodu)

**Objaw:** biały ekran na `localhost:3000` po `npm run build` przy działającym `npm run dev`.

**Przyczyna:** `next build` nadpisuje `.next`; stary dev traci manifesty (`ENOENT: app-build-manifest.json`).

**Fix:**
```powershell
# Ctrl+C na wszystkich dev serwerach, potem:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
Sprawdź port w logu (może być 3001/3002/3003 jeśli 3000 zajęty).

---

## STAN GIT

- Branch **`main`**, ostatni commit: **`aafffbf`** „msg"
- **`origin/main`** — sprawdź `git status` / `git log origin/main..HEAD` przed push (Phase 13 może nie być na remote)
- Phase 12 baseline: `3d3e920`

---

## PLIKI — SKRÓT Phase 13

| Obszar | Pliki |
|--------|-------|
| Layout | `lib/site-layout.ts`, `lib/categories.ts` |
| Obrazy | `components/article/CoverImage.tsx`, `ArticleCard.tsx` |
| Homepage | `ContentGrid.tsx`, `HeroArticle.tsx`, `TopStoriesList.tsx`, `HomeSidebar.tsx` |
| Nav/Footer | `Navbar.tsx`, `Footer.tsx` |
| Kategorie | `ArticleFeedSection.tsx` |
| Seed | `data/news.json` |

---

## NIE ZROBIONO (z audytu / backlog)

| Prio | Temat | Status |
|------|-------|--------|
| — | Strony artykułu / search / profil → `SITE_CONTAINER` (nadal `container-site` ~1240px) | NIE |
| — | Komentarze w sidebarze (real data z DB) | NIE |
| — | Performance audit Phase 10 Prio 3–7 | NIE |
| — | Poprawa commit message `aafffbf` przed push | TODO |

---

## ZASADY (bez zmian)

- **`app/globals.css` ZAMROŻONY**
- Walidacja: `npx tsc --noEmit` → `npm run build`
- Deploy: `git push origin main` → Vercel auto
- PowerShell: commit przez `git commit -m "..."` (bez heredoc)

---

## STARTING PROMPT FOR THE NEXT CHAT

Skopiuj poniżej do nowego czatu:

```
Kontynuujemy WSS (Next.js 15, Supabase, Prisma, Tailwind v4). Przeczytaj docs/WSS_PHASE_13_HANDOFF.md (potem Phase 12/11/10 w razie potrzeby).

Stan: main @ aafffbf — Phase 13 UI polish: SITE_CONTAINER full-width, lib/categories.ts, CoverImage fallback, featured cards, sidebar z zakładkami, kategorie Misje/ISS hero-strip/accent-bar, mobile scale-up (większe karty/typografia). ISR 5 min bez zmian. globals.css nietknięty.

Sprawdź: czy aafffbf jest na origin/main; jeśli nie — push przed dalszą pracą.

Zadanie: [TU DOPISZ CO ROBIMY]

Zasady: NIE modyfikuj app/globals.css. Minimalny scope. tsc + build przed commitem. Deploy: git push origin main.
```

---

## SUGESTIE NA KOLEJNY KROK (Phase 14?)

1. **`container-site` → `SITE_CONTAINER`** na stronie artykułu, search, profil (spójna szerokość całego portalu)
2. **Commit + push** Phase 13 z sensownym message
3. **Performance** — Prio 3–7 z Phase 10 handoff
4. **Sidebar komentarze** — real feed z DB gdy gotowe API
