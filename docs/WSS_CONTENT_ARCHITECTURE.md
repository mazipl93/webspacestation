# WSS — architektura treści i działów (SEO + redakcja)

> **Źródło prawdy** dla kategorii, homepage, mixu news/evergreen i „Tematu tygodnia”.  
> Każdy agent / czat przy pracy nad CMS, kategoriami, nav lub homepage **stosuje ten dokument** i przypomina userowi o proporcjach treści, jeśli odbiegają od planu.

Ostatnia aktualizacja: 2026-06-05 (wdrożenie v1 w repo).

---

## Model serwisu

**Portal kosmiczny z codziennymi newsami + warstwa evergreen pod SEO.**

| Warstwa | Udział | Rola |
|---------|--------|------|
| Newsy | ~80–90% | Codzienny ruch, świeżość, Discover |
| Evergreen / analizy | ~10–20% | Ruch z Google przez lata, autorytet |

Przy ~20 artykułach/tydz.: **15–17 newsów + 2–3 evergreeny/analizy**.

Kategoria = **temat**. Typ treści (docelowo pole CMS) = **format**: `news` | `analysis` | `evergreen` | `guide`.  
**Nie** tworzymy działu „Newsy”.

---

## Działy — kolejność menu (`orderIndex`)

| # | Nazwa | Slug | SEO | Co publikować | Czego NIE |
|---|-------|------|-----|---------------|-----------|
| 0 | Misje | `misje` | ⭐⭐⭐⭐⭐ | NASA, ESA, SpaceX, starty, sondy, Artemis | wyjaśnienia „jak działa”, gry |
| 1 | Astronomia | `astronomia` | ⭐⭐⭐⭐⭐ | JWST, egzoplanety, czarne dziury, kosmologia | newsy IT |
| 2 | Popularnonaukowe | `popularnonaukowe` | ⭐⭐⭐⭐⭐ | greencosy: „Jak działa ISS”, orbita, rakiety | bieżące newsy 24h |
| 3 | Technologie kosmiczne | `technologie` | ⭐⭐⭐⭐ | Starship, Falcon, satelity, teleskopy; **AI w kosmosie** | Copilot, Apple, ogólne IT |
| 4 | ISS i załogi | `iss` | ⭐⭐⭐⭐ | załogi, EVA, eksperymenty, życie na stacji | — |
| 5 | Ziemia z kosmosu | `ziemia-z-kosmosu` | ⭐⭐⭐⭐ | satelity, huragany, zorze, klimat z orbity | — |
| 6 | Rozrywka | `rozrywka` | ⭐⭐ | sci-fi, filmy, gry | rdzeń serwisu, hero |

### Usunięte / scalone

- **`ai`** — nie osobny dział. Artykuły → `technologie`. Tag `AI` w CMS. URL `/ai` → redirect `/technologie`.

---

## Homepage (kolejność sekcji)

1. **Hero (4 sloty CMS)** — newsy + evergreeny/analizy (nie rozrywka)
2. **Najnowsze** — chronologia (codzienny ruch)
3. **W centrum uwagi** (`weekTopic`) — klaster **bieżących** newsów wokół gorącego wątku; auto-ukrywa się gdy pusto
4. **Popularne** — engagement
5. **Działy na homepage v2** (krótki scroll): `misje`, `astronomia`, `popularnonaukowe`
6. **Centrum operacyjne** — mapa, starty, ISS

Reszta działów tylko w nav (`technologie`, `iss`, `ziemia-z-kosmosu`, `rozrywka`).

---

## Temat tygodnia (`weekTopic`)

- **Zostaje** — nie usuwać z CMS.
- **Rola:** kuratorski klaster newsów (np. tydzień Starship), **nie** evergreeny.
- Evergreeny → kategoria **Popularnonaukowe**.
- Etykieta domyślna: **„W centrum uwagi”** (`NEXT_PUBLIC_WEEK_TOPIC_LABEL`).
- Przy małej redakcji: nie używać flagi, dopóki nie ma sensownego wątku.

---

## Plan tygodnia (redakcja)

| Dzień | Publikacje |
|-------|------------|
| Pon–Pt | 2–3 newsy/dzień (Misje, Astronomia, ISS, Ziemia…) |
| Wt + Pt | +1 evergreen lub analiza |
| Weekend | podsumowanie + większy artykuł popularnonaukowy |
| Ad hoc | 4–6 artykułów z `weekTopic` przy gorącym wątku |

---

## RSS / News Engine

- Bucket `AI` w RSS → slug **`technologie`** (nie `ai`).
- Evergreen z RSS raczej ręcznie / redakcyjnie w `popularnonaukowe`.

---

## Przypomnienie dla agenta

Gdy user pyta o kategorie, homepage lub strategię treści:

1. Odwołaj się do tego pliku.
2. Przypomnij proporcję **80–90% news / 10–20% evergreen**.
3. Nie proponuj przywrócenia działu `ai` ani działu „Newsy”.
4. `popularnonaukowe` to magazyn greencosów, `weekTopic` to klaster newsów.
