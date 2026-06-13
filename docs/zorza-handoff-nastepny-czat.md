# Terminal Zorzy (`/zorza`) — handoff na następny czat

**Repo:** `webspacestation` · branch `main` · prod: https://webspacestation.pl/zorza  
**Stack:** Next.js 15, TS, Tailwind 4, Recharts, Leaflet, NOAA SWPC (client fetch), Open-Meteo  
**Porównanie UX:** https://spaceweatherlive.com/en.html

---

## CO ZROBIONO W POPRZEDNICH CZATACH (nie cofać bez powodu)

### Fix danych NOAA (krytyczny)
- **Wycofane endpointy** `mag-2-hour.json` / `plasma-2-hour.json` (SCN 26-21, ~IV 2026) zwracały tylko header → puste panele.
- **Migracja na RTSW:** `rtsw_mag_1m.json` + `rtsw_wind_1m.json`, filtr `active: true`, merge mag+wind po minucie.
- **Stale merge** w `setState` — pusty tick nie kasuje poprzednich danych (częściowo).

### Fix zgodności ze SpaceWeatherLive
- **`getDisplayKp()`** (`lib/aurora/api.ts`) — max(oficjalny 3h Kp, max estimated_kp w bieżącym oknie UTC 3h). Gauge/header/map/toasty spójne z wykresem 72h.
- **`getEarthSolarWindPoint()`** — Bz/Bt/By @ Ziemia (L1 minus propagacja ~1.5M km / speed). Header + duży numer w `SolarWindPanel`.
- **Nie ruszać** linii Bz=0 na wykresie (revert commit `3e4ea08`).

### Diagnostyka (dev)
- `[aurora-diag]` w konsoli, panel `<details>` tylko `NODE_ENV=development`.
- `?aurora-debug` / `localStorage aurora-debug=1` → logi na prod bez UI.

### Pliki dotknięte
- `components/aurora/useAuroraData.ts`
- `lib/aurora/api.ts`
- `components/aurora/AuroraTerminal.tsx`
- `components/aurora/SolarWindPanel.tsx`
- `components/aurora/GeomagneticPanel.tsx`

---

## 🔴 PRIORYTET #1 — Niestabilność danych na żywo (BLOKUJĄCE)

**Objawy zgłoszone przez usera (nadal występują po fixach RTSW):**
- Co chwilę **znika pozioma/pionowa linia „Ziemia”** na wykresie Bz.
- **Mapa** czasem nie pokazuje tego, co powinna (owale / Kp / marker).
- Panele puste, wartości `—`, czasem wraca po odświeżeniu.
- Problem na **localhost i prod**.

**Prawdopodobne przyczyny do zbadania (kolejność):**

1. **`getSolarWindPropagationDelayMin()` zwraca `null`** gdy `speed ≤ 100` lub `speed === 0` (brak merge plazmy na danym minucie) → **cały Earth marker znika** (`earthKey`, `ReferenceLine`, żółta strefa).
2. **Tick 60s + pełny `setState`** — mimo stale merge, krótki fetch/parse może dać `solarWind: []` lub za mało punktów → brak linii Ziemi.
3. **`parseRtswSolarWind`** — tylko `slice(-120)` (~2h); gappy w `active` satelitach; merge `minuteKey` może zostawiać `speed=0` na wierszu Ziemi.
4. **`safeFetch` / brak retry** — timeout 10s, błąd → `[]` bez UI błędu.
5. **Race / unmount** — `mountedRef` OK, ale brak anulowania starego fetcha (stary response może nadpisać nowy? — sprawdzić).
6. **Mapa (`AuroraMap.tsx`)** — zależy od `kp` z props; jeśli Kp=0 lub Leaflet init fail, owale wyglądają źle.

**Co zrobić w następnym czacie (diagnoza → fix):**
- [ ] Odtworzyć: Network + `[aurora-diag]` — które ticki dają `solarWindPoints=0`, `speed=0`, `delayMin=null`.
- [ ] **Nie ukrywać markera Ziemi** gdy speed chwilowo 0 — fallback delay z ostatniego znanego speed lub stałe ~45 min.
- [ ] **Request generation / abort** w `fetchAll` — ignorować stale responses.
- [ ] **Retry 1×** na failed endpoint z backoff.
- [ ] Opcjonalnie: **proxy `/api/aurora/*`** na Vercel (cache 30–60s) — mniej flappingu u userów.
- [ ] Mapa: defensive render gdy `solarWind.length < N` lub `kp` invalid — nie czyścić owali.

**Nie commitować bez explicit OK usera** (chyba że poprosi).

---

## PRIORYTET #2 — UX wzorowany na SWL (analiza GPT, odfiltrowane)

Pełna analiza w czacie: GPT ~60% trafne. Poniżej **tylko sensowne**, bez przebudowy portalu na „TradingView”.

### Faza A — duży zysk, mały koszt
1. **Osobny wysoki wykres tylko Bz** (250–350px), nie Bz+Bt w 110px.
2. **Dynamiczna oś Y** z widocznego okna + **tła stref** −5 / −10 / −15 nT (ReferenceArea).
3. **Clamp spokój:** min ±20 gdy dane wąskie; przy burzy skala rośnie (Bz do −40+).
4. **Czas ujemnego Bz** pod liczbą: „ujemny od XX min” (wygładzenie 5-min, uniknąć szumu 1-min).
5. **Przełącznik okna:** 1h / 3h / 6h (domyślnie **3h amator, 6h desktop**). Wymaga fetch >120 punktów RTSW (dziś `slice(-120)`).
6. **Hero amator** (opcjonalnie u góry): Bz @ Ziemia + trend + chmury (`AuxPanel`) + score — **score z Bz/Bt/V/Kp/clouds**, nie fake „85%” bez OVATION.

### Faza B — zbliżenie do SWL
7. Małe wykresy Speed / Density / Bt **pod** Bz (wspólna oś czasu; **jedna** legenda opóźnienia L1, nie 4 markery Earth).
8. **OVATION** (`ovation_aurora_latest.json`) na mapie — prawdziwe HP/oval, nie wymyślone %.

### Odłożyć / nie robić
- Layout „45% ekranu = Bz”, osobna app TradingView.
- Earth marker na każdym z 4 wykresów osobno.
- Aurora Score 0–100 jako osobny wykres historyczny bez definicji naukowej.
- Kroki 3–6 z `docs/zorza-next-steps.md` (push, Polska SVG, SEO) **bez pytania usera**.

---

## STAN vs SpaceWeatherLive (skrót)

| Element | SWL | WSS teraz |
|---|---|---|
| Bz @ Ziemia (liczba) | tak | tak (po fixie) |
| Earth marker | duży wykres | tak, **110px, znika przy speed=0** |
| Opóźnienie L1 | widoczne | tak (~XX min) |
| Osobne wykresy V/n/Bt/Bz | tak | nie |
| Dynamiczna skala + strefy Bz | tak | auto Y, bez stref |
| Trend / czas ujemnego Bz | częściowo | nie |
| Kp gauge 3h | tak | tak (getDisplayKp) |
| Chmury lokalne | słabo | **AuxPanel — plus PL** |
| Okno czasu | regulowane | stałe ~2h |

---

## ARCHitektURA (nie przebudowywać)

```
components/aurora/useAuroraData.ts  — fetch 60s, Promise.all, RTSW
components/aurora/AuroraTerminal.tsx — layout, mobile tabs
lib/aurora/api.ts — typy, getDisplayKp, getEarthSolarWindPoint, kolory
SolarWindPanel, GeomagneticPanel, AuroraMap, AuxPanel, …
app/zorza/page.tsx — force-dynamic, revalidate=0
```

Endpointy NOAA (aktualne):
- `json/rtsw/rtsw_mag_1m.json`
- `json/rtsw/rtsw_wind_1m.json`
- `json/planetary_k_index_1m.json`
- `products/noaa-planetary-k-index.json`
- (deprecated puste: `products/solar-wind/mag-2-hour.json`)

---

## CHECKLISTA `docs/zorza-next-steps.md`

Kroki **0–2 ✅** · **Krok 3 ⏳** (animacja igły Kp) · **4–6** — nie ruszać bez OK.

---

## REGUŁY WSS

- `/zorza` = terminal, nie mieszać z architekturą newsów.
- Bez dev-tekstów w UI prod.
- Commit/push tylko na explicit OK usera.
