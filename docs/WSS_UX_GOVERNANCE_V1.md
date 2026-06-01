# Web Space Station — UX Governance Specification
**Version:** 1.0 — Baseline Lock
**Date:** 1 June 2026
**Status:** ✅ FROZEN — no interaction additions without explicit sign-off

---

## 1. System State Declaration

The WSS interaction system has completed its consolidation phase. All motion layers have been audited, all signal semantics validated, and all animation conflicts resolved. This document freezes that state as the v1 baseline.

**Scope:** All interaction behaviour in `app/`, `components/layout/`, `components/sections/`, `components/article/` and `app/globals.css`.

---

## 2. Motion Inventory

Every animation in the system falls into exactly one of three categories. No element may carry more than one animation from the same category simultaneously.

### 2a. Entry — one-shot reveal

| Animation | Class / Implementation | Where | Trigger |
|---|---|---|---|
| Article hero materialise | `reveal-fade` keyframe, 0.04–0.28s stagger | `ArticleHero` breadcrumb → badge → headline → deck → meta | Page load |
| Content grid reveal | `.reveal` (scroll-driven, `animation-timeline: view()`) | ContentGrid GROUP B, GROUP C | Scroll entry |
| Article body reveal | `.reveal` (scroll-driven) | `ArticleBody` wrapper (`#article-body`) | Scroll entry |
| Read-also strip reveal | `.reveal` (scroll-driven) | `ReadAlso` | Scroll entry |
| Hero content exit | `.hero-fade` → `hero-defocus` keyframe (scroll-driven) | Homepage hero content | Scroll exit |
| Sticky bar slide-in | `opacity + translateY`, 0.45s `ease-out-soft` | `StickyArticleBar` | `scrollY > 360` |

**Rule:** Entry animations are one-shot per page view. They are not looped and not retriggered by hover.

---

### 2b. State — user-triggered transitions

| Animation | Duration | Easing | Where |
|---|---|---|---|
| Card hover lift | `transform: translateY(-2px)` + shadow, 0.4s | `ease-out-soft` | All `.surface-interactive` |
| Image zoom | `scale(1.05–1.08)`, 0.7s | `ease-out-soft` | All card images on hover |
| Light sheen sweep | `translateX(-120% → 120%)`, 0.9s | `ease-out-soft` | `.img-sheen` on `.group:hover` |
| Nav link colour | `color`, 0.3s | ease | Desktop nav links |
| Navbar scroll state | `background + border-color`, 0.5s | ease | Navbar after 12px scroll |
| "Więcej" chevron | `rotate(180deg)`, 0.3s | ease | Dropdown trigger |
| CTA button shadow | `box-shadow`, 0.3s | ease | Primary buttons |
| Button press | `scale(0.97)`, 0.11s | ease | All `active:scale-[0.97]` buttons |
| Progress bar width | `width`, 0.18s | `ease-out-soft` | `StickyArticleBar` progress |
| ChevronRight nudge | `translateX(0.5px)`, 0.3s | ease | "Wszystkie artykuły" link |

**Rule:** State transitions are reversible and proportional to input energy (hover = gentle, press = snappy).

---

### 2c. Ambient — continuous background loops

| Animation | Duration | Where | Purpose |
|---|---|---|---|
| `hero-drift` | 42s alternate | Homepage hero image layer | Spatial depth — imperceptible moment-to-moment |
| `hero-glow-drift` | 28s alternate | Homepage hero gradient layer | Atmospheric colour shift |
| `live-dot::after` ping | 1.8s infinite | Breaking badge, LiveBadge components | Live / breaking state signal |
| `live-breathe` (cyan) | 3.6s infinite | LiveMissionCenter status line | System heartbeat — last-updated indicator |
| `live-breathe` (red) | 3.6s infinite | "24/7 Live" stat in LiveMissionCenter | Operational live signal |

**Rule:** No element may carry two simultaneous ambient animations. Ambient animations are reserved for semantic state only — never decorative.

---

## 3. Signal Semantics

### Colour → meaning mapping (strict)

| Colour | Hex | Semantic meaning | Permitted uses |
|---|---|---|---|
| Red (`accent-live`) | `#ff453a` | Editorial urgency / live broadcast | Breaking badge (article + homepage card), LiveBadge in mission wells, 24/7 Live stat, `SectionHeader` accent for "Live Mission Center" |
| Blue (`accent-blue`) | `#2f6dff` | Primary action / Misje category | CTA buttons, Misje category label, progress bar (Misje articles), sidebar "Powiązane" rule, logo, Timeline active dot |
| Cyan (`accent-cyan`) | `#38bdf8` | System / informational / Technologie | Card title hover, hero eyebrow, WSS tagline, Technologie category, LiveMissionCenter heartbeat dot, progress bar (Technologie), "Czytaj również" rule |
| Amber (`accent-amber`) | `#ffb830` | ISS category | ISS category label, progress bar (ISS articles) |
| Purple | `#a855f7` | Astronomia category | Astronomia label, progress bar (Astronomia) |
| Green | `#22c55e` | Ziemia z kosmosu category | ZzK label, progress bar (ZzK), trend-up indicators in stats strip |

### Rules

1. **Red = real urgency only.** No decorative or persistent use of `accent-live` anywhere in the chrome (navbars, utility icons, affordances). The Bell notification dot has been removed.
2. **Each article category owns exactly one accent colour.** No two categories share a colour.
3. **Progress bar colour = category colour.** The reading progress bar is always the current article's category accent. This is the strongest possible connection between the indicator and the content.
4. **Glow opacity ceiling:** Static glows on structural chrome elements (section header rules, mission pins, timeline dots) are capped at `66` hex alpha (40%). Glows on live/breaking elements (live-dot shadow, breaking badge) may exceed this as they are the intended focal point.

---

## 4. Concurrency Rules

**The one rule:** A single visible element may not carry more than one ambient animation simultaneously.

| Pattern | Status | Notes |
|---|---|---|
| `breaking-pulse` + `live-dot` on same element | ❌ Resolved | Was present on article hero badge and homepage FeaturedCard — both removed |
| `live-breathe` + `live-dot` on same element | ❌ Not permitted | Would create compounded visual noise on a single indicator |
| Entry stagger on different sibling elements | ✅ Permitted | Multiple siblings can animate in sequence (stagger), not simultaneously |
| Hover state + ambient loop on same element | ✅ Permitted | The `live-dot` ping is not interrupted by hover; they run on different properties |
| Two `.reveal` sections on the same scroll timeline | ✅ Permitted | Each section is a separate scroll-observed target |

---

## 5. Reduced-Motion Contract

The following animations are suppressed under `prefers-reduced-motion: reduce` (enforced in `globals.css`):

- `.hero-drift` and `.hero-glow-drift`
- `.live-breathe`
- `.breaking-pulse` (already removed from all elements, but rule remains)
- `.live-dot::after`
- `.img-sheen` transition

The following are **not** suppressed because they are one-shot entry animations that carry spatial orientation value:

- `.reveal` (scroll-driven, conditional on `prefers-reduced-motion: no-preference`)
- `.hero-fade` (same block as `.reveal`)
- Article hero stagger (these are `both` fill — they will simply snap to their final state instantly)

---

## 6. What Was Changed to Reach This State

| Change | File | Reason |
|---|---|---|
| Removed `breaking-pulse` from article hero badge | `app/aktualnosci/[slug]/page.tsx` | Eliminated double-ambient on same element |
| Removed `breaking-pulse` from homepage FeaturedCard | `components/sections/ContentGrid.tsx` | Same rule, same fix — consistency |
| Removed Bell notification red dot | `components/layout/Navbar.tsx` | Removed decorative use of urgency-reserved colour |
| Softened progress bar glow: `99` → `44` alpha | `components/article/StickyArticleBar.tsx` | Passive indicator should not pulse visibly during scroll |
| Progress bar transition: `0.12s linear` → `0.18s ease-out-soft` | `components/article/StickyArticleBar.tsx` | Matches system easing token; bar tracks without oscillating |

---

## 7. System Lock Conditions

The following interaction patterns are now **frozen**. Changes require explicit written justification tied to a measurable UX problem:

1. The number of ambient animations per visible element (max: 1)
2. The semantic meaning of each accent colour
3. The article reading stack: Navbar → StickyArticleBar → ArticleHero stagger → body reveal
4. The entry stagger timing (0.04 → 0.28s) and duration (0.75s)
5. The `StickyArticleBar` visibility threshold (360px), transition duration (0.45s), and structure (back link / category / title / progress bar)
6. The `hero-drift` 42s loop and `hero-glow-drift` 28s loop durations

---

## 8. Pre-conditions for Next Phase

The system is ready for product expansion when the following hold:

| Condition | Status |
|---|---|
| No competing ambient animations | ✅ Clean |
| Red reserved for real editorial urgency only | ✅ Clean |
| All motion in one of three governance categories | ✅ Clean |
| Reduced-motion fallback enforced | ✅ Clean |
| Progress bar passive and non-distracting | ✅ Clean |
| Reading flow uninterrupted by chrome motion | ✅ Clean |

**Next phase candidates (from checkpoint):** `/aktualnosci` list page, category filter pages, CMS integration. None of these require interaction additions — they inherit the existing system.

Any new component added in next-phase work must declare its motion intent against the three categories in this document before implementation.

---

*This document is the companion to `WSS_CHECKPOINT_PHASE_1.md` and should be updated whenever the interaction layer is deliberately changed.*
