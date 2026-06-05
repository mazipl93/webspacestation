/** Wysokość fixed nav — 4.25rem mobile, h-16 (4rem) od sm. */

export const FIXED_NAV_PADDING_CLASS = "pt-[4.25rem] sm:pt-16";

/** Wysokość paska nav (do podglądu CMS w flow). */
export const ARTICLE_NAV_HEIGHT_CLASS = "h-[4.25rem] sm:h-16";

/**
 * Odstęp <main> artykułu pod fixed nav — na sm+ bez luki pod h-16 (homepage: pt-24).
 */
export const ARTICLE_PAGE_MAIN_OFFSET_CLASS = "pt-[4.5rem] sm:pt-16";

/** Sekcja hero — offset nav przez ARTICLE_PAGE_MAIN_OFFSET_CLASS na <main>. */
export const ARTICLE_HERO_SECTION_CLASS =
  "relative isolate flex w-full flex-col overflow-hidden";

export const ARTICLE_HERO_SECTION_EMBEDDED_CLASS =
  "relative isolate flex w-full flex-col overflow-hidden";

/**
 * Okładka — 16:9, pełna szerokość shellu (jak homepage hero, bez limitu 1080px).
 */
export const ARTICLE_HERO_FRAME_CLASS = [
  "relative w-full shrink-0 overflow-hidden",
  "max-lg:h-[clamp(40svh,46svh,50svh)] max-lg:max-h-[min(52svh,480px)] max-lg:min-h-[200px]",
  "lg:aspect-[16/9] lg:h-auto lg:w-full lg:max-w-none lg:max-h-[min(56vh,580px)] lg:min-h-[300px]",
].join(" ");

export const ARTICLE_HERO_FRAME_DESKTOP_CLASS =
  "relative w-full shrink-0 overflow-hidden aspect-[16/9] h-auto max-h-[min(56vh,580px)] min-h-[300px]";

export const ARTICLE_HERO_FRAME_MOBILE_CLASS =
  "relative w-full shrink-0 overflow-hidden h-[clamp(40svh,46svh,50svh)] max-h-[min(52svh,480px)] min-h-[200px]";

/** @deprecated Overlay na zdjęciu wyłączony — tekst w ArticleHeroMobileMeta pod okładką. */
export const ARTICLE_HERO_COPY_SHELL_CLASS = "hidden";

export const ARTICLE_HERO_COPY_SHELL_DESKTOP_CLASS = "hidden";

export const ARTICLE_HERO_COPY_SHELL_MOBILE_CLASS = "hidden";

export const ARTICLE_HERO_COPY_INNER_CLASS = "hidden";

export const ARTICLE_HERO_COPY_INNER_DESKTOP_CLASS = "hidden";

export const ARTICLE_HERO_GRADIENT_CLASS = "hidden";

export const ARTICLE_HERO_GRADIENT_DESKTOP_CLASS = "hidden";

export const ARTICLE_HERO_GRADIENT_MOBILE_CLASS = "hidden";

/** Legacy — meta pod okładką w siatce artykułu. */
export const ARTICLE_HERO_MOBILE_META_CLASS =
  "border-b border-hairline bg-[#05070d] px-4 pb-5 pt-4";

export const ARTICLE_HERO_BREADCRUMB_NAV_CLASS = "hidden";

export const ARTICLE_HERO_BREADCRUMB_NAV_DESKTOP_CLASS = "hidden";

export const ARTICLE_HERO_BREADCRUMB_NAV_MOBILE_CLASS = "hidden";

export type ArticleHeroPreviewLayout = "mobile" | "desktop";
