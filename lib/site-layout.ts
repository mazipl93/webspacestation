/**
 * Homepage layout — szybki revert:
 * ustaw `HOMEPAGE_LAYOUT_V2 = false` → układ hero + rail + Temat tygodnia w kolumnie (legacy).
 *
 * Shell ~1320px: na Full HD i 4K treść jest wyśrodkowana z marginesami bocznymi (bez rozciągania na cały monitor).
 */

/** `true` = strefa redakcyjna v2 (hero full width, Najnowsze pod hero, 3 działy split-lead). */
export const HOMEPAGE_LAYOUT_V2 = true;

/** Centered editorial shell — side margins on wide viewports (see --spacing-site-shell). */
export const SITE_CONTAINER =
  "mx-auto w-full max-w-[min(100%,var(--spacing-site-shell))] px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10";

/** Ten sam odstęp pod fixed Navbar co homepage (ContentGrid). */
export const BELOW_FIXED_NAV_OFFSET_CLASS = "pt-[4.5rem] sm:pt-24";

// ─── Legacy (HOMEPAGE_LAYOUT_V2 = false) ─────────────────────────────────────

/** Homepage: main editorial column + right rail (Najnowsze). */
export const HOMEPAGE_MAIN_SIDEBAR_GRID =
  "lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px]";

/** Hero + Najnowsze rail; Temat tygodnia w lewej kolumnie pod hero. */
export const HOMEPAGE_HERO_DOUBLE_GRID =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)]";

/** Popularne legacy — kolumny z capem (puste luki przy justify-center). */
export const HOMEPAGE_FOUR_CARD_GRID =
  "hidden gap-5 lg:grid lg:justify-center lg:[grid-template-columns:repeat(4,minmax(0,min(100%,var(--homepage-card-max))))]";

// ─── V2 editorial stack ──────────────────────────────────────────────────────

/** Najnowsze — rząd pod hero (desktop). */
export const LATEST_DESKTOP_STRIP_LIMIT = 5;

/** Działy na homepage v2 (krótszy scroll; reszta w nav). */
export const HOMEPAGE_V2_CATEGORY_SLUGS = [
  "technologie",
  "astronomia",
  "misje",
] as const;

/** Popularne v2 — 4 kolumny na pełną szerokość shellu. */
export const HOMEPAGE_FOUR_CARD_GRID_V2 =
  "hidden gap-4 lg:grid lg:grid-cols-4 lg:gap-5";

/** Liczba kart w sekcji Popularne (desktop). */
export const HOMEPAGE_POPULAR_LIMIT = 4;

export function homepageFourCardGrid(): string {
  return HOMEPAGE_LAYOUT_V2 ? HOMEPAGE_FOUR_CARD_GRID_V2 : HOMEPAGE_FOUR_CARD_GRID;
}
