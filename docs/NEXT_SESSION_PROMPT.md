# Prompt na kolejny czat — WSS (stan: 23.06.2026 ~22:30)

Przeczytaj `docs/PLAN_NAPRAWY.md` zanim zaczniesz.

---

## Kontekst projektu

- **Next.js 15 App Router**, TypeScript, Tailwind CSS (dark space theme)
- **Supabase** (`blpnxcnapirdhjtujimo`, eu-west-1) + **Vercel** (project: `wss`, prod: webspacestation.pl)
- CMS dla redaktorów portalu WSS — artykuły, kategorie, użytkownicy
- **TypeScript: ✅ 0 błędów** (sprawdzone po każdej zmianie)

---

## Co wdrożono w ostatniej sesji (23.06.2026 wieczór)

### SEO
- **SEO-LOW-1** ✅ — `app/robots.ts`: dodano `/zapomnialem-hasla` i `/reset-hasla` do disallow
- **SEO-LOW-2** ✅ — `app/aktualnosci/[slug]/page.tsx`: usunięto hardcoded `width:1280, height:720` z OG images
- **SEO-LOW-3** ✅ — `app/nauka/page.tsx`: "Przewodniki bez newsów z 24h" → "Przewodniki i wyjaśnienia — bez bieżących newsów"

### Starty
- **STARTY-1** ✅ — Usunięto zakładkę "Harmonogram" ze strony startów
  - `components/discover/StartyPageTabsClient.tsx` → uproszczony do renderowania `listaPanel` bezpośrednio
  - `app/starty/page.tsx` → usunięto `harmonogramPanel` + import `OpsTimeline`

### ISS — mapa i przeloty
- **ISS-1** ✅ — Mapa ISS nie skacze przy aktualizacji pozycji (`OpsLiveMap.tsx`)
- **ISS-2** ✅ — Przeloty widoczne latem: próg słońca `-6°` → `-12°`, nowy kind `shadow`, elewacja `15°` → `10°`
- **ISS-N2YO** ✅ — Integracja z N2YO API jako primary source (`lib/ops/iss-passes-n2yo.ts`)
  - `N2YO_API_KEY="H8WG56-3XZAEQ-7FXPFF-5NSB"` — dodano do Vercel env vars + lokalnego `.env`
  - N2YO zwraca 20 widocznych przelotów (vs 0 z SGP4 fallback latem)
- **ISS-LOC** ✅ — Picker lokalizacji do przelotów ISS:
  - `components/discover/IssLocationPicker.tsx` — nowy komponent: input + Nominatim geocoding + GPS
  - `hooks/useIssPolandPasses.ts` — dodano `lat`/`lon` parametry, re-fetch przy zmianie
  - `app/api/ops/iss-passes/route.ts` — przyjmuje `?lat=&lon=` query params
  - `lib/ops/iss-passes-n2yo.ts` i `lib/ops/iss-poland-passes.ts` — opcjonalny `observer` param
  - Dropdown `position: fixed + z-index:9999` — nie jest przycinany przez parent containers
  - Placeholder: "wpisz swoją lokalizację" (półprzezroczysty kursywą)

### CMS — lista artykułów
- **CMS-LIST-1** ✅ — Wyszukiwarka i sortowanie na liście artykułów
- **CMS-LIST-2** ✅ — Review queue "Co czeka" na dashboardzie

---

## Stan plików kluczowych (zmodyfikowane w tej sesji)

```
app/robots.ts                              SEO-LOW-1
app/aktualnosci/[slug]/page.tsx            SEO-LOW-2
app/nauka/page.tsx                         SEO-LOW-3
app/starty/page.tsx                        STARTY-1
app/mapa/page.tsx                          ISS-N2YO (N2YO primary)
app/api/ops/iss-passes/route.ts            ISS-N2YO + ISS-LOC (lat/lon params)
app/admin/articles/page.tsx               CMS-LIST-1
app/admin/dashboard/page.tsx              CMS-LIST-2

components/discover/StartyPageTabsClient.tsx   STARTY-1
components/discover/OpsLiveMap.tsx             ISS-1
components/discover/OpsIssPolandPasses.tsx     ISS-2 + ISS-N2YO + ISS-LOC
components/discover/IssLocationPicker.tsx      ISS-LOC (NOWY PLIK)
components/admin/ArticlesTable.tsx             CMS-LIST-1 + CMS-LIST-2

lib/ops/solar-elevation.ts                     ISS-2 (próg -12°)
lib/ops/iss-poland-passes.types.ts             ISS-2 (shadow kind)
lib/ops/iss-poland-passes.ts                   ISS-2 + ISS-LOC (observer param)
lib/ops/iss-passes-n2yo.ts                     ISS-N2YO + ISS-LOC (NOWY PLIK)
lib/ops/format-iss-pass.ts                     ISS-2 (shadow badge)
hooks/useIssPolandPasses.ts                    ISS-LOC (lat/lon params)
app/globals.css                                ISS-2 (shadow badge) + ISS-LOC (picker styles)
.env.example                                   N2YO_API_KEY dokumentacja
docs/PLAN_NAPRAWY.md                           aktualizacja statusów
```

---

## Co jeszcze do zrobienia (priorytety)

### ⬜ P2 — SOCIAL-REMOVE (osobna sesja, ~3h)
Usuń automatyzację postów FB/IG. Szczegóły w PLAN_NAPRAWY.md → SOCIAL-REMOVE.
Zakres: `lib/social/facebook-publish.ts`, `lib/social/instagram-publish.ts` + powiązane,
usunięcie `scheduleSocialAutoPostsOnFirstPublish()` z `lib/server/articles.ts`,
usunięcie pól `facebookPostId`, `instagramPostId` z Prisma schema (wymaga migracji DB).

### ⬜ P4 — CMS-LIST-3 — Soft lock artykułu (3h)
Blokada gdy dwóch redaktorów otwiera ten sam artykuł.
- `POST /api/articles/:id/lock` + `DELETE` przy zamknięciu
- Banner "Edytuje [Jan Kowalski] od 5 min" + przycisk "Przejmij"
- Lock wygasa po 10 min (kolumna `editingByUserId` + `editingAt` w Prisma)

### ⬜ P4 DUŻY — CMS-ED-1 — Tiptap rich text editor (8h)
Zamiana `<textarea>` na Tiptap. Wymaga migracji treści artykułów.

### ⬜ P4 — CMS-ED-3 — Split ArticleEditor.tsx (4h)
Plik 1600+ linii → moduły (form, meta, content, media, publish, useArticleEditor hook).

---

## Zasady (nie zmieniają się)

- **NIE deployuj, NIE pushuj** bez explicit OK
- `npx tsc --noEmit` po każdym kroku
- Tokeny Tailwind: `space-bg`, `space-surface`, `space-card`, `text-primary`, `text-secondary`, `text-muted`, `text-tertiary`, `hairline`, `hairline-faint`, `accent-blue`, `accent-cyan`
- **SOCIAL-REMOVE** — osobna sesja, nie ruszaj
- Deploy tylko do projektu `wss` (nie do `project-kk5pd`)
