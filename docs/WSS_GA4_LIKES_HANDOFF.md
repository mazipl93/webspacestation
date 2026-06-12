# WSS — handoff (czerwiec 2026): lajki + GA4 + ostatni stan

---

## PROMPT NA NOWY CZAT (wklej)

```
Czytaj docs/WSS_GA4_LIKES_HANDOFF.md i kontynuuj WSS.

Lokalne testy GA4 + lajki OK (commit 68c2487 na main). Teraz: deploy prod.

Zrób po kolei:
1. Vercel env NEXT_PUBLIC_GA_MEASUREMENT_ID=G-0DPDC1VHJY (Production + Preview)
2. Deploy / poczekaj na build z main
3. Test prod: incognito, adblock OFF → webspacestation.pl → Akceptuj → Network collect 204 + GA Realtime
4. Test prod: lajki 2× incognito

Instrukcje krok po kroku jak dla debila. Po każdym kroku OK/nie OK.
Windows/PowerShell — same komendy, bez PS C:\...>.
Nie commituj bez prośby usera.
```

---

## Git / deploy

- **Ostatni push na `main`:** `68c2487` — GA4 + RODO banner + fix lajków + polityka GA4.
- **Lokalne testy:** OK (collect 204, Realtime, lajki 2× incognito). Adblock musi być wyłączony przy teście GA.
- **Vercel prod:** env `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-0DPDC1VHJY` — **jeszcze do ustawienia**.
- `.env` lokalny z GA ID — **nie commitować**.

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

## Kolejność

1. ✅ GA4 lokalnie
2. ✅ Lajki 2× incognito
3. ✅ Commit + push `68c2487`
4. ⏳ Vercel env + deploy prod
5. ⏳ Test prod Realtime + lajki

---

## Facebook (na prod / git)

- Commit `b9ae981` — share-card + auto-post
- Env: `FACEBOOK_*` na Vercel
