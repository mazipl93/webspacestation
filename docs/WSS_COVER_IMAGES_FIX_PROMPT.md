# WSS — Naprawa okładek artykułów (prompt na nowy czat)

**Data:** 4 czerwca 2026 (po czacie 46; aktualizacja czat 47)  
**Priorytet:** P0 — zepsute okładki na **całym** froncie, nie tylko artykuły redakcyjne  
**Reguła sesji:** jeden krok · raport · test · **CZEKAJ OK** · commit/push tylko po explicit OK usera

**Czat 47 (DONE lokalnie, bez commita):** krok 1 globalnego override — gaming wycięty do `lib/editorial/rozrywka.ts`; `EDITORIAL_COVER_NASA_ID` = 14 slugów (misje/astronomia); State of Play z DB. **Otwarte:** krok 2 tematyczne NASA dla 14 slugów; własne okładki gier (P1-6). **Handoff ogólny:** `docs/WSS_NEXT_CHAT_HANDOFF.md` (STARTING PROMPT).

---

## Co poszło nie tak (czat 46)

Przy naprawie „wszędzie to samo zdjęcie” wprowadzono logikę, która **nadpisuje okładkę każdego artykułu** po `slug`, także artykułów **spoza** partii redakcyjnej 21 szt.

### Bug #1 — globalny override (KRYTYCZNY)

Plik: `lib/editorial/resolve-editorial-cover.ts`

```ts
// BŁĄD: dla KAŻDEGO slug zwraca editorialCoverForSlug(slug)
if (slug) {
  return editorialCoverForSlug(slug);
}
```

Plik: `lib/editorial/nasa-cover.ts`

```ts
// BŁĄD: nieznany slug → domyślnie PIA25236 (cleanroom NASA/JPL)
const id = EDITORIAL_COVER_NASA_ID[slug] ?? "PIA25236";
```

**Skutek:** artykuł np. *„PlayStation State of Play 2026”* (własny slug, własna okładka w DB) dostaje **zdjęcie laboratorium NASA** zamiast oryginalnej grafiki. User to zgłosił wprost.

`resolve-image.ts` woła `resolveEditorialCoverImage` **przed** odczytem `coverImage` z DB → DB jest ignorowane dla wszystkich slugów.

### Bug #2 — losowe / niepasujące NASA ID w mapie redakcyjnej

Plik: `lib/editorial/editorial-cover-ids.ts`

- Dla wielu slugów gaming/technologie przypisano **ten sam** `PIA25236` lub `carina_nebula` „bo działa HTTP 200”, **bez związku z tematem** (NMS, Roman, Europa Clipper = to samo zdjęcie cleanroomu).
- To nie jest „losowe z API”, ale **mapa ręczna złych ID** — efekt dla usera ten sam: okładka nie pasuje do tytułu.

### Bug #3 — wcześniejszy stan (czat 45, nadal istotny)

- Stare URL-e w DB (`nasa.gov/wp-content`, `esa.int/pillars`, `apod`) → **404**.
- Fallback Unsplash w `cover-fallbacks` też mógł dawać 404.
- Seed `--update` często **nie poszedł** (`max clients` Supabase przy działającym `npm run dev`).

### Co było OK (częściowo)

- Miniaturki sidebar: brak wysokości kontenera → pasek (naprawione `self-stretch min-h` w `RelatedMiniCard`, `ReadAlsoInline`).
- Format `~medium.jpg` z `images-assets.nasa.gov` — sensowny **jeśli** ID pasuje do tematu i **tylko** dla slugów redakcyjnych.

---

## Czego NIE robić

1. **Nie** nadpisywać okładek artykułów spoza listy 21 slugów redakcyjnych (`EDITORIAL_COVER_NASA_ID`).
2. **Nie** używać domyślnego `PIA25236` (ani żadnego jednego NASA ID) dla nieznanych slugów.
3. **Nie** podmieniać okładki State of Play / RSS / ręcznie ustawionej w CMS bez zgody — najpierw przywrócić `coverImage` z DB gdy URL działa.
4. **Nie** `--publish` / `cache:revalidate` na prod bez explicit OK usera.
5. **Nie** wstawiać `<a>` ręcznie w treści artykułów (linki = `weave-internal-links` przy renderze).

---

## Co zrobić (kolejność dla agenta)

### Krok 1 — Cofnąć globalny override (must-have)

- `resolveEditorialCoverImage`: nadpisuj **tylko** gdy `slug` jest w `EDITORIAL_COVER_NASA_ID` (21 kluczy).
- W przeciwnym razie: `coverImage` z DB; jeśli `isBrokenCoverUrl()` → dopiero wtedy `pickCategoryCoverFallback(category, slug)` (bez NASA cleanroom jako default dla wszystkiego).
- `editorialCoverForSlug`: **bez** fallback `?? "PIA25236"` — rzucić błąd lub zwrócić tylko z mapy.

### Krok 2 — Mapa okładek tylko dla 21 artykułów redakcyjnych

Dla każdego sluga z `lib/editorial/editorial-june-2026-all.ts`:

- Okładka **tematyczna** (Roman → Roman/telesope, MAVEN → Mars, Starlink → start, NMS → kosmos/planeta, **nie** cleanroom Sony/PS).
- URL: `images-assets.nasa.gov` `~medium.jpg`, **HTTP 200**, proporcje **poziome** (width ≥ height w metadanych API).
- Opcjonalnie: skrypt weryfikacji `curl -sI` + wymiary z `images-api.nasa.gov/search?q=...`.
- Gaming: jeśli brak sensownego NASA — **zostaw** placeholder kategorii lub upload P1-6; **nie** podstawiaj zdjęcia z innego artykułu.

### Krok 3 — Przywrócić okładki poza redakcją

- Artykuły typu State of Play: **wyłącznie** `article.coverImage` z DB (po kroku 1).
- Jeśli URL martwy — naprawić **ten konkretny** rekord w CMS/DB, nie globalną mapę.

### Krok 4 — DB sync (lokalnie)

```bash
# Zatrzymaj npm run dev (pool Supabase)
npm run editorial:fix-covers
# lub
npm run editorial:seed-test -- --update
```

Tylko 21 slugów redakcyjnych — **nie** masowa zmiana innych artykułów.

### Krok 5 — Test usera

- Hero slider: State of Play = **własna** grafika (nie NASA cleanroom).
- Karty Najnowsze: różne, pasujące miniatury, `object-cover`, bez pionowych pasków.
- Artykuł redakcyjny Roman: okładka teleskopu / misji, nie gaming.
- CMS podgląd = front.

---

## Pliki do ruszenia

| Plik | Rola |
|------|------|
| `lib/editorial/resolve-editorial-cover.ts` | **Główny bug** — ograniczyć do 21 slugów |
| `lib/editorial/nasa-cover.ts` | Usunąć domyślne PIA25236 |
| `lib/editorial/editorial-cover-ids.ts` | Przepisać mapę: temat + landscape |
| `lib/articles/resolve-image.ts` | Kolejność: editorial map → DB → broken → category fallback |
| `lib/cover-fallbacks.ts` | Fallbacki tylko dla RSS/brak okładki, nie nadpisuj CMS |
| `scripts/fix-editorial-covers.ts` | Sync DB tylko 21 slugów |
| `components/article/CoverImage.tsx` | `unoptimized` dla NASA OK; nie psuć innych |
| `app/aktualnosci/[slug]/page.tsx` | RelatedMiniCard — zostawić min-h/self-stretch |

**Nie ruszać bez potrzeby:** treść artykułów, weave links, publish workflow.

---

## STARTING PROMPT — SKOPIUJ DO NOWEGO CZATU

**Użyj głównego promptu z `docs/WSS_NEXT_CHAT_HANDOFF.md`** (sekcja STARTING PROMPT) — tam jest pełny stan Rozrywka + sitemap + okładki.

Skrót okładek (jeśli ten czat tylko o grafikach):
1) Krok 1 override — DONE lokalnie (rozrywka map + 14 slugów + DB).
2) Krok 2: przepisać `editorial-cover-ids.ts` tematycznie (14 slugów, bez gamingu).
3) Rozrywka: docelowo P1-6 / press kity zamiast stock NASA.
4) `npm run editorial:fix-covers` (dev OFF) · bez --publish · CZEKAJ OK przed commit.

---

## Przykład regresji (do testu)

| Artykuł | Oczekiwane | Obecny błąd (czat 46) |
|---------|------------|------------------------|
| PlayStation State of Play 2026 | Okładka z DB (gaming/Sony) | NASA cleanroom PIA25236 |
| Roman Space Telescope | Teleskop / misja Roman | Często to samo PIA25236 co inne |
| No Man's Sky The Swarm | Kosmos / gra (lub neutral space) | Cleanroom NASA |

---

## Kontekst repo

- **21 slugów redakcyjnych:** `lib/editorial/editorial-june-2026-all.ts`
- **Prod:** https://webspacestation.pl · main @ `e422838` (bez commita fixów okładek)
- **Publikacja redakcji:** dopiero na końcu partii (`--publish`) — user

---

*Po naprawie: skróć lub zarchiwizuj ten plik w handoff; nie duplikuj długich promptów w wielu miejscach.*
