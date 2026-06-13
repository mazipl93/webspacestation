# Terminal Zorzy Polarnej — Dalsze Etapy

## KONTEKST PROJEKTU

Next.js 15, TypeScript, Tailwind 4, Recharts, Leaflet, Supabase, Vercel.
Terminal działa pod `/zorza` — live space weather dashboard pobierający dane z NOAA SWPC.

## CO JEST GOTOWE (NIE RUSZAJ)

- `lib/aurora/api.ts` — helpery, kolory, kalkulacje
- `components/aurora/useAuroraData.ts` — hook, DST z geospace_dst_7_day.json, solar_regions
- `components/aurora/KpGauge.tsx` — gauge SVG Kp 0-9
- `components/aurora/GeomagneticPanel.tsx` — wykresy Kp/DST/SYM-H (bez AE, bez duplikatu na dole)
- `components/aurora/SolarWindPanel.tsx` — Bz/Bt/speed/density + Earth marker (SWL semantics)
- `components/aurora/SolarDataPanel.tsx` — X-ray flux, flares, sunspots
- `components/aurora/ForecastPanel.tsx` — prognoza Kp 3-dni + alerty z tłumaczeniami PL (OpenAI)
- `components/aurora/AuxPanel.tsx` — warunki obserwacyjne, czas, księżyc, pogoda
- `components/aurora/AuroraMap.tsx` — Leaflet mapa z owałami auroralnymi (polyline, Mercator-safe)
- `components/aurora/SunspotRegionsPanel.tsx` — regiony AR, SDO, tabela ze scrollem
- `components/aurora/AuroraTerminal.tsx` — główny kontener, mobile bottom nav
- `components/aurora/ToastSystem.tsx` — toasty Kp≥5
- `components/aurora/useLocation.ts` — geolokalizacja + Open-Meteo pogoda
- `app/zorza/page.tsx` + `layout.tsx`
- `app/api/aurora/translate/route.ts` — OpenAI tłumaczenie alertów

## INTEGRACJA Z PORTALEM ✅

- Nav: **Więcej → Terminal zorzy polarnej** (`NAV_MORE_LINKS`, otwarcie w nowej karcie)
- Hero strony głównej: przycisk CTA „Terminal zorzy polarnej” (nowa karta)
- Centrum operacyjne: skrót **Zorza** w `OpsQuickNav` (nowa karta)
- Footer: sekcja Odkrywaj → link do `/zorza` (nowa karta)
- Sitemap: `/zorza` w `SEO_SITEMAP_PATHS`

## ZASADY OGÓLNE

- NIGDZIE nie używamy dev-tekstów, długich myślników w UI
- Wszystkie wskaźniki mają być zrozumiałe dla laika
- Po każdym kroku ZATRZYMAJ SIĘ i zapytaj czy kontynuować

---

## CHECK-LISTA — DO ZROBIENIA (kolejność)

### KROK 0 — Porządek w wykresach ✅
- Usunięto duplikat `GeomagneticPanel` na dole strony
- Usunięto AE index (brak danych w publicznym API NOAA)

### KROK 1 — Panel plam słonecznych (SunspotRegionsPanel) ✅
- Fetch `solar_regions.json` w `useAuroraData`
- Tabela AR z kolorowaniem klasy magnetycznej + obraz SDO HMI/AIA 171
- Panel w prawym sidebarze (desktop) i zakładce Słońce (mobile)
- Tabela: `max-h-48` + scroll (desktop i mobile)

### KROK 2 — Responsywność mobilna ✅
- Mapa: `h-52 sm:h-64 lg:h-80`
- KpGauge: SVG skaluje się do szerokości kontenera
- SolarWindPanel: mniejsze fonty Bz i grid na wąskim ekranie
- Header: kompaktowy status bar
- Mobile bottom nav: `fixed bottom-0 z-[1100]`, safe-area

### KROK 3 — Animacja igły KpGauge ⏳ NASTĘPNY
W `KpGauge.tsx` dodaj CSS transition dla rotacji igły:
- `transition: transform 1s ease-in-out` na SVG element igły
- Nie używaj Framer Motion (za ciężkie), tylko CSS transform

### KROK 4 — Web Push API (powiadomienia Kp)
- `app/api/aurora/push/subscribe/route.ts` — zapis subskrypcji do Supabase
- `app/api/aurora/push/notify/route.ts` — wysyłka gdy Kp ≥ próg
- `public/sw.js` — service worker obsługujący push
- UI w AuxPanel: przycisk "Powiadom mnie gdy Kp ≥ X" (suwak 4-8)
- Wymagane: tabela `push_subscriptions` w Supabase (endpoint, p256dh, auth, threshold, created_at)

### KROK 5 — "Gdzie w Polsce widac zorzę?" mapa
Nowy komponent `PolandAuroraMap.tsx`:
- SVG lub canvas mapa Polski z województwami
- Kolorowy overlay: zielony/żółty/czerwony na podstawie bieżącego Kp
- Minimalne Kp dla każdego województwa (wzór: Kp_min ≈ 10 - lat/9)
- Tooltip po hover: nazwa woj., wymagane Kp, aktualny status

### KROK 6 — SEO i metadata `/zorza`
W `app/zorza/layout.tsx`:
- og:title, og:description, og:image (static /og-zorza.jpg)
- Structured data: WebPage + Dataset schema
- canonical URL
- keywords meta
Stwórz statyczny og:image 1200x630 z gradientem aurora + tytuł "Terminal Zorzy Polarnej"

---

## FORMAT DANYCH (zweryfikowane)

```
json/solar_regions.json → [{region:"3664", latitude:15, longitude:-45,
  mag_class:"beta-gamma-delta", num_spots:42, area:600,
  first_date:"2024-05-07", last_date:"2024-05-12"}, ...]
```

SDO images:
- `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIC.jpg` (HMI Intensitygram, 512px)
- `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg` (1024px, klikalne)
- `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0171.jpg` (AIA 171Å, koronalne)

---

## STOS

Next.js 15 App Router, TypeScript, Tailwind CSS 4, Recharts, Leaflet/react-leaflet,
openai@6.42.0 (zainstalowane), Supabase (klient już w projekcie).
