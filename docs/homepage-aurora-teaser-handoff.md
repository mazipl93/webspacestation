# Homepage — teaser Zorzy / Aurora Terminal (handoff do nowego czatu)

**Repo:** `webspacestation` · branch `main`  
**Cel:** Na stronie głównej dodać **„wędkę”** — box z live Kp / mini-wykresem, który kusi kliknięcie i prowadzi do pełnego terminala `/zorza`.  
**Pełny terminal:** https://webspacestation.pl/zorza (lokalnie: `localhost:3000/zorza`)

---

## Co user chce (intencja)

- Box **jak misje / ISS / zorza** w Centrum operacyjnym — spójny wizualnie z `ops-widget-*`
- W środku: **licznik Kp** (gauge lub duża liczba) albo **mini wykres** (np. Bz / Kp 3h)
- **CTA:** przycisk typu „Wejdź do Aurora Terminal” / „Otwórz panel zorzy”
- **Krótki opis:** np. „Śledź zorzę na żywo — Kp, wiatr słoneczny, warunki u Ciebie”
- Ma **intrygować**, nie duplikować całego `/zorza` — to teaser + funnel

**Lokalizacja — do decyzji w czacie (oba OK):**
1. **Wewnątrz** `HomepageOpsStrip` — obok ISS / pod startem (trzeci box w `ops-widget-side` lub nowy wiersz pod gridem)
2. **Poza** stripsem — np. między Centrum operacyjnym a `LatestShowcase`, osobna sekcja `homepage-aurora-teaser`

User: „obojętnie” — wybierz layout który nie psuje mobile i nie ściska startu + ISS.

---

## Stan homepage (nie przebudowywać bez powodu)

```
HomepageTopZone
  ├── HomepageHeroSlider
  ├── HomepageOpsStrip          ← Centrum operacyjnne
  │     ├── OpsLaunchShowcase   (następny start)
  │     └── ops-widget-side
  │           ├── OpsIssShowcase (ISS live — wzorzec boxa)
  │           └── OpsQuickNav    (skrót /zorza już jest — mały link „Zorza”)
  ├── LatestShowcase
  └── WeekTopicSection
```

**Wzorzec do naśladowania:** `components/discover/OpsIssShowcase.tsx`
- Cały box = `<Link>` lub karta z wyraźnym CTA na dole
- Live dane + chipy + `ChevronRight`
- Klasy: `ops-iss-showcase`, `ops-widget-shell`, `well`, `glass`

**Istniejące linki do /zorza (nie usuwać):**
- `Hero.tsx` — CTA „Terminal zorzy polarnej” (target `_blank`)
- `OpsQuickNav` — ikona Sparkles, `/zorza`, `newTab: true`

Nowy box = **główny funnel wizualny**, QuickNav zostaje jako skrót.

---

## Stan terminala /zorza (do reużycia, nie kopiować 1:1)

| Asset | Plik | Uwagi |
|-------|------|--------|
| Kp gauge SVG | `components/aurora/KpGauge.tsx` | `kp`, `size` — można użyć w wersji `size={120}` |
| Logika Kp | `lib/aurora/api.ts` → `getDisplayKp()`, `getKpColor()`, `getKpLabel()` | Ta sama semantyka co terminal |
| Fetch NOAA | `components/aurora/useAuroraData.ts` | Ciężki — **nie** ciągnąć całego hooka na homepage |
| Pełny UI | `components/aurora/AuroraTerminal.tsx` | Tylko link docelowy |

**Ostatnie fixy (lokalnie, może nie być na prod):**
- RTSW mag+wind, abort/retry, linia Ziemia na wykresach
- `app/zorza/ZorzaClient.tsx` — `ssr: false` (hydration)
- `AuroraMap.tsx` — fix Leaflet double-init
- `SunspotRegionsPanel` — dedupe regionów (duplicate key)

---

## Propozycja techniczna (dla implementera)

### 1. Nowy komponent

`components/discover/OpsAuroraShowcase.tsx` (lub `HomepageAuroraTeaser.tsx`)

**Props (przykład):**
```ts
type Props = {
  initialKp?: number;      // SSR snapshot
  kpTrend?: "up" | "down" | "flat";
  stormy?: boolean;        // Kp >= 5
  className?: string;
};
```

**UI (szkic):**
```
┌─────────────────────────────────────┐
│ ✦ ZORZA NA ŻYWO          [LIVE?]   │
│                                     │
│   [mini KpGauge lub 4.2]           │
│   Spokojnie / Aktywnie / Burza G1   │
│                                     │
│   Bz @ Ziemia: -2.1 nT  (opcjonal) │
│                                     │
│   Śledź warunki geomagnetyczne      │
│   i szansę zorzy u siebie.          │
│                                     │
│   [ Wejdź do Aurora Terminal → ]   │
└─────────────────────────────────────┘
```

**CTA:** `Link href="/zorza"` — rozważyć **bez** `target="_blank"` na homepage (user zostaje w portalu); hero może dalej otwierać nową kartę.

### 2. Skąd dane na homepage?

**Opcja A (zalecana na start):** lekki **API route** + cache

`app/api/aurora/snapshot/route.ts`
- Fetch: `planetary_k_index_1m.json` + `noaa-planetary-k-index.json` (jak w terminalu)
- Zwraca: `{ kp, label, stormy, updatedAt, bzAtEarth? }`
- `revalidate: 60` lub `unstable_cache` 60s — **nie** uderzać w NOAA z każdego SSR

**Opcja B:** client-only polling co 60s w showcase (`"use client"`) — prostsze, gorsze SEO/LCP

**Opcja C:** rozszerzyć cron ops o snapshot Kp w Supabase — overkill na MVP

**Nie:** montować `useAuroraData` na homepage (11 endpointów, ciężki bundle).

### 3. Wpięcie w layout

**Wariant A — w stripie:**

`components/sections/HomepageOpsStrip.tsx` → w `ops-widget-side` pod `OpsIssShowcase`:

```tsx
<OpsIssShowcase initialIss={iss} />
<OpsAuroraShowcase initialKp={auroraSnapshot?.kp} />
<OpsQuickNav exclude={["/mapa"]} />
```

Wymaga: `getHomepageOpsData()` lub osobny `getHomepageAuroraSnapshot()` w loaderze stripa.

**Wariant B — osobna sekcja:**

`HomepageTopZone.tsx` — między `<HomepageOpsStrip />` a `<LatestShowcase />`:

```tsx
<HomepageAuroraTeaser />
```

### 4. Style

- Reuse `ops-iss-showcase` / `well` / border `hairline` — **nie** ciemny terminal theme z `/zorza` (portal jest jaśniejszy)
- Akcent zorzy: `#44ff88` (jak `OpsQuickNav` i CTA w Hero)
- Przy Kp ≥ 5: subtelny pulse / badge „Burza G1” (jak storm badge w `AuroraTerminal`)

### 5. Mobile

- Box pełnej szerokości pod ISS lub pod całym stripsem
- Gauge max ~100px wysokości — nie dominuje nad startem

---

## Copy PL (propozycje — do akceptacji usera)

| Element | Tekst |
|---------|--------|
| Nagłówek | **Zorza na żywo** |
| Sub | Indeks Kp · warunki geomagnetyczne |
| Opis | Śledź aktywność słońca i sprawdź, czy dziś nocą możesz zobaczyć zorzę polarną. |
| CTA | **Wejdź do Aurora Terminal** |
| Alt CTA | Otwórz panel zorzy → |

Unikać: „Popularnonaukowe”, osobny dział newsowy — `/zorza` to **terminal**, nie artykuł.

---

## Checklist implementacji

- [ ] Komponent showcase + test wizualny desktop/mobile
- [ ] API snapshot lub lekki fetch (max 1–2 endpointy NOAA)
- [ ] Wpięcie w `HomepageOpsStrip` **lub** `HomepageTopZone`
- [ ] Link `/zorza` + dostępność (aria-label, focus)
- [ ] Nie psuć LCP homepage (lazy load gauge jeśli client)
- [ ] Spójność Kp z terminalem (`getDisplayKp`)
- [ ] **Nie commitować / nie pushować bez explicit OK usera**

---

## Prompt do wklejenia w nowy czat

```
Zadanie: Homepage teaser Aurora / Zorza

Repo: webspacestation, branch main.
Przeczytaj: docs/homepage-aurora-teaser-handoff.md

Cel: Na stronie głównej dodać box-teaser (jak OpsIssShowcase / OpsLaunchShowcase) z live Kp 
(lub mini gauge/wykres), krótkim opisem „śledź zorzę” i CTA „Wejdź do Aurora Terminal” → /zorza.

Kontekst:
- Centrum operacyjne: components/sections/HomepageOpsStrip.tsx
- Wzorzec boxa ISS: components/discover/OpsIssShowcase.tsx
- Kp gauge: components/aurora/KpGauge.tsx, logika: lib/aurora/api.ts (getDisplayKp, getKpColor)
- Pełny terminal: /zorza (AuroraTerminal) — NIE duplikować, tylko funnel
- /zorza już linkowane z Hero i OpsQuickNav — nowy box = główna „wędka”

Zrób:
1. OpsAuroraShowcase (nazwa dowolna) — wizualnie spójny z ops-widget
2. Lekkie dane Kp (API route + cache 60s lub minimalny client fetch)
3. Wpięcie w strip OBOK ISS lub jako sekcja pod stripsem — wybierz lepsze na mobile
4. CTA + opis PL

Zasady WSS: bez commit/push bez OK usera. /zorza = terminal, nie news.
```

---

## Powiązane pliki

- `components/sections/HomepageOpsStrip.tsx`
- `components/sections/HomepageTopZone.tsx`
- `components/discover/OpsIssShowcase.tsx`
- `components/discover/OpsLaunchShowcase.tsx`
- `components/discover/OpsQuickNav.tsx`
- `components/sections/Hero.tsx`
- `components/aurora/KpGauge.tsx`
- `lib/aurora/api.ts`
- `app/zorza/` · `docs/zorza-handoff-nastepny-czat.md`
