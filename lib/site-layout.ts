/** Full-width editorial shell — edge-to-edge with minimal gutters. */
export const SITE_CONTAINER =
  "mx-auto w-full max-w-none px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10";

/** Ten sam odstęp pod fixed Navbar co homepage (ContentGrid). */
export const BELOW_FIXED_NAV_OFFSET_CLASS = "pt-[4.5rem] sm:pt-24";

/** Homepage: main editorial column + right rail (Najnowsze). */
export const HOMEPAGE_MAIN_SIDEBAR_GRID =
  "lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px]";

/** Homepage hero row: Temat tygodnia (L) · slider (środek) · Najnowsze (P). */
export const HOMEPAGE_HERO_TRIPLE_GRID =
  "lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,340px)] lg:gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,380px)] xl:gap-7 2xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,400px)]";

/** Gdy brak Tematu tygodnia — hero + Najnowsze (jak wcześniej). */
export const HOMEPAGE_HERO_DOUBLE_GRID =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)]";
