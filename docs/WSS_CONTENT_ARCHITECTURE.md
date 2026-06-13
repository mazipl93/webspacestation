# WSS — architektura treści (fundament portalu)

> **Źródło prawdy** dla każdego czatu, agenta i decyzji redakcyjnej.  
> **Czytaj przed** zmianami kategorii, nav, homepage, CMS lub strategii publikacji.  
> **Koryguj usera**, gdy miesza news z evergreenem albo wraca do starych nazw (`popularnonaukowe`, `wyjasniamy`, `wiedza` jako slug).

Ostatnia aktualizacja: 2026-06-05 (spec usera — model od zera).

---

## Czym jest Web Space Station

| Filar | Opis |
|-------|------|
| 🚀 **Kosmos** | Główny temat — misje, astronomia, ISS, Ziemia z orbity |
| 🧠 **Nauka** | Popularna nauka jako **rozszerzenie** kosmosu (fizyka, chemia, biologia…) |
| 📰 **Newsy** | Dużo świeżych treści codziennie — Discover, świeżość |
| 📈 **SEO** | Evergreeny w **Nauce** — artykuły żyjące lata |

**Najważniejsza zasada redakcyjna:**

Nie pytaj: *„który dział jest newsowy?”*  
Pytaj: *„czy ten temat to **aktualność**, czy **wiedza**?”*

| Temat | Dział | Typ |
|-------|-------|-----|
| JWST odkrył nową galaktykę | Astronomia | News |
| Jak działa JWST | **Nauka** | Evergreen |
| Nowy eksperyment na ISS | ISS | News |
| Jak wygląda dzień astronauty na ISS | ISS | Evergreen |
| Nowy silnik rakietowy | Technologie | News |
| Jak działa napęd jonowy | **Nauka** | Evergreen |

---

## Proporcje całego serwisu

Przy ~100 artykułach / miesiąc:

| Typ | Udział |
|-----|--------|
| Newsy | 65–75 |
| Analizy | 15–20 |
| Evergreeny | 10–15 |

Daje: świeżość (Discover) + codzienny ruch + bazę SEO na lata.

**Nie tworzymy działu „Newsy”.** Typ treści docelowo w CMS: `news` | `analysis` | `evergreen` | `guide`.

---

## Działy — menu (`orderIndex`)

| # | Nazwa | Slug | Mix treści | Publikujesz | Nie publikujesz |
|---|-------|------|------------|-------------|-------------------|
| 0 | **Misje** | `misje` | 90% news · 10% analizy | Starty, NASA, ESA, SpaceX, Blue Origin, Chiny, Indie, Artemis, Księżyc, Mars | Evergreeny typu „Jak działa rakieta?” → **Nauka** |
| 1 | **Astronomia** | `astronomia` | 70% news · 20% analizy · 10% evergreen | JWST, egzoplanety, czarne dziury, galaktyki, kosmologia | Ogólne IT |
| 2 | **Nauka** | `nauka` | **100% evergreen** | Fizyka, chemia, biologia, geologia, astronomia/astronautyka od podstaw | **Newsy** — zero |
| 3 | **Technologie** | `technologie` | 60% news · 20% analizy · 20% evergreen | Rakiety, teleskopy, satelity, Starlink, **AI w nauce**, robotyka, napędy | Copilot, Apple, ogólne IT bez kosmosu |
| 4 | **ISS** | `iss` | 70% news · 30% evergreen | Załogi, EVA, eksperymenty, życie na stacji | — |
| 5 | **Ziemia z kosmosu** | `ziemia-z-kosmosu` | 80% news · 20% evergreen | Satelity, huragany, pożary, zorze, klimat z orbity | — |

### Scalone / usunięte slugi

| Stary slug | Status |
|------------|--------|
| `ai` | → `technologie` + tag AI. `/ai` redirect |
| `popularnonaukowe` | → **`nauka`**. Redirect |
| `wyjasniamy` | **Błąd — nie używać.** → `nauka`. Redirect |
| `wiedza` | Nazwa koncepcyjna usera; **slug w repo: `nauka`** |
| `rozrywka` | **Likwidacja 06/2026** — off-topic gaming. `/rozrywka` → `/technologie` |

---

## Nauka — silnik SEO

**Slug:** `/nauka` · **Etykieta:** Nauka

Przykłady (żyją 5+ lat):

- Jak działa grawitacja?
- Czym jest czasoprzestrzeń?
- Jak działa ISS?
- Dlaczego gwiazdy świecą?
- Jak powstają pierwiastki?
- Co to jest fuzja jądrowa?

❌ Żadnych newsów w tym dziale.  
✅ Tylko evergreeny i przewodniki.

---

## Homepage

### Hero (4 sloty CMS)

1. Największy news dnia  
2. Największy news dnia  
3. Mocny artykuł z **Nauki** (evergreen)  
4. Mocny artykuł z **Astronomii** lub **Nauki**

Nie: off-topic gaming, czyste gaming newsy.

### Sekcje (kolejność)

1. **Najnowsze** — wszystko chronologicznie  
2. **W centrum uwagi** (`weekTopic`) — klaster **bieżących newsów** przy gorącym wątku; nie evergreeny  
3. **Popularne** — engagement  
4. **Polecane z Nauki** — evergreeny z `nauka` (widoczne także bez artykułów — placeholder)  
5. **Misje** → **Astronomia** → **ISS** → **Ziemia z kosmosu** → **Technologie**  
6. **Centrum operacyjne** — starty, ISS, mapa

**Zasada techniczna:** sekcja działu pokazuje **tylko artykuły z tego slugu**. Pusty dział = brak sekcji. **Nigdy** fallback z całego serwisu (bug z Gothiciem pod złym nagłówkiem).

---

## Temat tygodnia (`weekTopic`)

- Etykieta: **„W centrum uwagi”**
- Rola: kuratorski klaster **newsów**, nie Nauka
- Evergreeny → zawsze **`nauka`**

---

## Plan tygodnia (redakcja)

| Dzień | Publikacje |
|-------|------------|
| Pon–Pt | 2–3 newsy/dzień (Misje, Astronomia, ISS, Ziemia…) |
| Wt + Pt | +1 analiza |
| Weekend | podsumowanie + 1–2 evergreeny w **Nauce** |
| Ad hoc | 4–6 artykułów `weekTopic` przy gorącym wątku |

---

## RSS / News Engine

- Bucket `AI` → `technologie`
- Evergreen z RSS → ręcznie do **`nauka`**, nie auto-ingest newsów do Nauki

---

## Obowiązek agenta

1. Przed zmianami struktury — ten plik + `.cursor/rules/wss-content-architecture.mdc`
2. **Koryguj usera**, gdy:
   - chce news w Nauce lub evergreen w Misjach (zamiast w Nauce)
   - proponuje `wyjasniamy`, `popularnonaukowe`, slug `wiedza`
   - chce off-topic gaming w Technologiach (bez kosmosu/sci-fi)
   - myli dział tematyczny z typem treści
3. Przypominaj proporcje **65–75 news / 15–20 analiz / 10–15 evergreen** miesięcznie
4. Nie przywracaj działu `ai` ani „Newsy”
