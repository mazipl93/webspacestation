# WSS — Handoff: Mapa kosmodromów (/mapa)

**Data:** 13 czerwca 2026  
**Repo:** `mazipl93/webspacestation` · prod https://webspacestation.pl  
**Architektura:** `docs/WSS_CONTENT_ARCHITECTURE.md` · `.cursor/rules/wss-content-architecture.mdc`

---

## Cel

Warstwa stała 15 kosmodromów + popupy (lead, 3 fakty, zdjęcie obiektu) na `/mapa`.  
Ton jak `ISS_SPOTLIGHT` / `cosmodrome-photos.ts`. **Bez em dash (—)** w copy UI/SEO. **Bez** `map_image` z LL2.

---

## ✅ Zrobione w sesji (NIEZCOMMITOWANE — sprawdź `git status`)

### Copy spotlightów (15 kosmodromów)

- `lib/ops/major-cosmodromes.ts` — stałe pinezki: krótki lead, 3 fakty, bez —
- `lib/ops/cosmodrome-photos.ts` — zsynchronizowane reguły `SITES[]` dla dynamicznych padów

### 4 podmiany zdjęć (Wikimedia, URL zweryfikowane API Commons)

| ID | Plik / URL |
|----|------------|
| SLC-41 | `commons/5/5c/Atlas_V_launch_complex_LC41.jpg` (NASA KSC-05PD-2401) |
| Wostochny | `commons/c/c3/Soyuz-2.1a_..._Vostochny_Launch_Centre.jpg` (kremlin.ru CC BY 4.0) |
| Jiuquan | `commons/f/ff/Shenzhou-12_roll_out_01.png` (CC BY 4.0) |
| Sriharikota | `commons/f/f3/PSLV_C-35_at_the_launch_pad.jpg` (ISRO GODL) |

Lokalne zdjęcia WSS (`public/images/ops-pads/`): SLC-40, Vandenberg SLC-4E, Tanegashima LP-2, Wenchang LC-101, ISS, Rocket Lab LC-2 Wallops.

### Fallback i dopasowanie

- Usunięto copy „Miejsce z harmonogramu Launch Library” z FALLBACK
- `map-pin-spotlight.ts`: geo-match `matchPadToMajorCosmodrome()` gdy brak `siteId`
- Reguła **Wostochny** dodana do `SITES[]`
- `normalizePadHaystack()` — ignoruje „· start w harmonogramie”

---

## ❌ Do naprawy w kolejnej sesji

### Problem: pinezki LL2 bez reguły → FALLBACK

Kolorowe pinezki (`kind: "pad"`) spoza 15 kosmodromów (lub rozjazd współrzędnych >110 km) dostają:

- **Opis:** „[nazwa] to rampa startowa w harmonogramie WSS. Operator: …”
- **Czy wiesz, że?** meta o mapie (NET, szare pinezki, kolorowa pinezka) — **nie o obiekcie**
- **Zdjęcie:** SLC-41 placeholder z FALLBACK

### Pinezki zgłoszone przez usera

| Nazwa LL2 | Czym jest | Status reguły |
|-----------|-----------|---------------|
| **Orbital Launch Pad** | Rocket Lab LC-1, Mahia (NZ) — alias w API | ❌ reguła wymaga `mahia` \| `launch complex 1`, nie łapie „Orbital Launch Pad” |
| **Launch Complex 2 (LC-2)** | Rocket Lab LC-2, Wallops (VA) | ✅ jeśli operator = Rocket Lab; ❌ inaczej |
| **Kwajalein Atoll** | Reagan Test Site, Marshall Islands | ❌ brak reguły |
| **Haiyang offshore launch location** | Port morski Haiyang (Shandong), starty CZ-11H / Jielong / Ceres z morza | ❌ brak reguły |
| **Offshore launch platform** | Pływająca platforma/statek (Chiny, Żółte/EWS/Południowe Morze) | ❌ brak reguły |

### Inne luki (opcjonalnie, tylko jeśli user chce)

- **Taiyuan**, **Xichang** — nie ma w 15 stałych kosmodromach
- FALLBACK: rozdzielić **facts** od meta-mapowych (meta tylko dla naprawdę nieznanych padów)
- Rozważyć rozszerzenie `localizePadLabel` / reguł pod polskie etykiety LL2

---

## Pliki kluczowe

```
lib/ops/major-cosmodromes.ts      # 15 stałych kosmodromów
lib/ops/cosmodrome-photos.ts      # SITES[], FALLBACK, matchCosmodromeSpotlight()
lib/ops/map-pin-spotlight.ts      # resolveMapPinSpotlight()
lib/ops/map-geo.ts                # buildMapPins(), merge pad → major (110 km)
lib/ops/launch-pads.ts            # fetchLaunchPadCoords() z LL2
lib/ops/localize-ops.ts           # localizePadLabel() — ang. → pol.
components/discover/OpsMapPinDetail.tsx   # UI: opis + „Czy wiesz, że?” = spotlight.facts
public/images/ops-pads/           # lokalne zdjęcia ramp
```

---

## Wzorzec copy (must-follow)

```typescript
spotlight: {
  title: "Nazwa (Region, kraj) · operator",  // bez —
  description: "2 zdania: czym jest + rola dziś.",
  imageUrl: WIKI lub `${OPS_PAD}/...`,
  imageCredit: "Autor · licencja",
  facts: [ "3 konkretne fakty o obiekcie/misjach." ],  // NIE meta o mapie
}
```

---

## Reguły sesji (user)

1. **Jeden krok / sesja** — STOP na OK usera  
2. **Commit tylko po explicit OK**  
3. Bez długich myślników (—) w copy UI/SEO  
4. Zdjęcia: `public/images/ops-pads/` lub Wikimedia/NASA z `imageCredit`

---

## Prompt do kolejnego czatu (copy-paste)

```
Projekt: WSS, prod https://webspacestation.pl, repo mazipl93/webspacestation

Kontekst: docs/WSS_MAP_COSMODROME_HANDOFF.md (pełny stan). Sesja poprzednia zaktualizowała copy 15 kosmodromów i 4 zdjęcia — zmiany mogą być niezcommitowane (git status).

Zadanie — jeden krok, STOP na OK, commit tylko po explicit OK:

1. Dodać reguły spotlight w lib/ops/cosmodrome-photos.ts (+ ewent. sync major-cosmodromes) dla pinezek LL2 bez opisu:
   - Orbital Launch Pad → Rocket Lab LC-1 Mahia (alias: orbital launch pad + rocket lab)
   - Launch Complex 2 (LC-2) → Rocket Lab LC-2 Wallops (bez wymogu wallops w nazwie jeśli jest lc-2 + rocket lab)
   - Kwajalein Atoll → Reagan Test Site (Marshall Islands)
   - Haiyang offshore launch location → chiński port morski Haiyang, starty z morza (CZ-11H, Jielong, Ceres)
   - Offshore launch platform → pływająca platforma startowa Chin (Żółte Morze / region Haiyang)

2. Każda reguła: lead 2 zdania, 3 fakty merytoryczne (nie meta o szarych pinezkach), bez —, zdjęcie Wikimedia/NASA jeśli brak w public/images/ops-pads/

3. Poprawić FALLBACK: facts tylko ogólne o nieznanej rampie (NET, operator); usunąć „szare pinezki / kolorowa pinezka” z facts — to myli przy kolorowych pinach.

4. Opcjonalnie: test mentally matchCosmodromeSpotlight() dla etykiet po localizePadLabel().

Pliki: lib/ops/cosmodrome-photos.ts, lib/ops/major-cosmodromes.ts, lib/ops/map-pin-spotlight.ts, components/discover/OpsMapPinDetail.tsx

Reguły: docs/WSS_CONTENT_ARCHITECTURE.md, bez em dash w UI.
```
