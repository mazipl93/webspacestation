# WSS — handoff (czerwiec 2026): lajki + GA4 + ostatni stan

---

## PROMPT NA NOWY CZAT (wklej użytkownikowi / agentowi)

```
Czytaj docs/WSS_GA4_LIKES_HANDOFF.md i kontynuuj WSS.

Zasady dla Ciebie (agenta):
1. Testujemy GA4 + lajki w OPOR (incognito, krok po kroku) aż user powie że jest pewny — nie przechodź do commita/produkcji bez potwierdzenia testów.
2. Dawaj instrukcje „jak dla debila” — numerowane kroki, co dokładnie kliknąć w Chrome, co wpisać w filtrze Network, co powinno się pojawić / czego NIE powinno być.
3. Po każdym teście: krótko „OK / nie OK” i co dalej.
4. GA4 NIE w CMS — tylko public layout. Env: G-0DPDC1VHJY.
5. Użytkownik na Windows/PowerShell — nie wklejać promptu PS C:\...>, tylko same komendy.
6. Adblock/Brave często blokuje collect — jeśli brak collect, najpierw test w czystym Chrome incognito bez rozszerzeń.

Pierwsza rzecz: poprowadź pełny test GA4 lokalnie (Tylko niezbędne → brak Google; Akceptuj → gtag + collect + Realtime), potem test lajków (2× incognito).
```

---

## Git / deploy

- **Ostatni push na `main`:** `b9ae981` — FB share-card auto-post + rozdzielenie podtytuł/zajawka w CMS.
- **NIE na GitHubie (lokalnie, niecommitowane):**
  - GA4 + banner RODO (`lib/analytics/`, `components/consent/`, `components/analytics/`)
  - fix lajków (`hooks/useArticleLikes.ts`, usunięty `browser-liked-cache`)
  - polityka prywatności (sekcja GA4)
  - `.env` z `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-0DPDC1VHJY` (**nie commitować**)

---

## Google Analytics 4

| Pole | Wartość |
|------|---------|
| Identyfikator pomiaru | **`G-0DPDC1VHJY`** |
| Strumień | `Web Space Station — prod` → `https://webspacestation.pl` |
| ID strumienia (GA admin) | `15051427275` |

### Env

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-0DPDC1VHJY
```

Lokalnie w `.env` — **Vercel prod jeszcze bez tego env**.

### Architektura (RODO)

- **Nie w CMS** — `app/layout.tsx` → `<SiteAnalytics />`
- `/admin` — bez bannera i bez GA4
- Banner: „Tylko niezbędne” / „Akceptuj analitykę”
- Zgoda: `localStorage` → `wss_cookie_consent` (`analytics: true|false`)
- Stopka: **Ustawienia cookies** → zmiana zgody

### Historia fixów GA (ważne dla testów)

1. `next/script afterInteractive` — **nie ładował** tagu po późnej zgodzie → ręczny inject w `loadGoogleAnalyticsScript()`
2. Po „Akceptuj” widać było `js?id=G-0DPDC1VHJY`, ale **brak `collect`** → bug: `initGtag()` ustawiał `consent: denied` po loadzie
3. **Ostatni fix:** `activateGoogleAnalytics()` — consent od razu `granted` + jawne `gtag('event', 'page_view', …)` w `lib/analytics/gtag.ts`

### Co user już widział w Network (przed fixem collect)

- ✅ `js?id=G-0DPDC1VHJY` (z `gtag.ts`) po „Akceptuj”
- ⚠️ `google-analytics_analytics.js` — możliwa **podmiana przez Brave/uBlock**
- ❌ filtr `collect` — **pusto** (do zweryfikowania po fixie + bez adblocka)

### Kryteria „test OK” (agent ma zweryfikować z userem)

| Scenariusz | Network | Realtime GA4 |
|------------|---------|--------------|
| Tylko niezbędne | brak `googletagmanager`, brak `collect` | brak |
| Akceptuj analitykę | `gtag/js?id=G-0DPDC1VHJY` + **`/g/collect`** | ~1 użytkownik w 30–120 s |
| Ustawienia cookies → Tylko niezbędne | collect przestaje | spada |

**Uwaga:** Realtime na `localhost` bywa zawodne przy adblocku — pewny test też na prod po deploy.

### Pliki GA

- `lib/analytics/consent.ts`, `gtag.ts`
- `components/consent/SiteAnalytics.tsx`, `CookieConsentBanner.tsx`, `CookieSettingsButton.tsx`
- `components/analytics/GoogleAnalytics.tsx`
- `app/polityka-prywatnosci/page.tsx`

---

## Lajki artykułów (fix — niecommitowane)

**Problem:** `localStorage` udawał globalny stan lajka.

**Fix:** Supabase RPC per user / per cookie anon — usunięty `browser-liked-cache.ts`.

**SQL na Supabase:** wdrożone (`user_article_likes`, `anon_article_likes`, `user_article_liked`, transfer on logout).

**Test OK:** 2× incognito → ten sam artykuł → osobne serduszko, wspólny licznik.

---

## Dev server

```powershell
npm run dev
```

Port zajęty:

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force; npm run dev
```

---

## Kolejność po pełnych testach

1. ✅ GA4 lokalnie (collect + Realtime) — **w toku**
2. ✅ Lajki 2× incognito
3. Commit: likes + GA4 + polityka (bez `.env`)
4. Vercel env `NEXT_PUBLIC_GA_MEASUREMENT_ID` + deploy prod
5. Test prod Realtime + lajki prod

---

## Facebook (na prod / git)

- Commit `b9ae981` — share-card + auto-post
- Env: `FACEBOOK_*` na Vercel
