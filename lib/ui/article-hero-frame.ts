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

 * Ramka okładki — wysokości jak HomepageHeroSlider (pełne zdjęcie, object-cover).

 * Media queries (lg), nie container queries — hero jest pełnej szerokości viewport.

 */

export const ARTICLE_HERO_FRAME_CLASS = [

  "relative w-full shrink-0 overflow-hidden",

  "max-lg:h-[clamp(40svh,46svh,50svh)] max-lg:max-h-[min(52svh,480px)] max-lg:min-h-[200px]",

  "lg:aspect-[2/1] lg:h-[min(58vh,500px)] lg:min-h-[400px] lg:max-h-[min(68svh,780px)]",

].join(" ");



export const ARTICLE_HERO_FRAME_DESKTOP_CLASS =

  "relative w-full shrink-0 overflow-hidden aspect-[2/1] h-[min(58vh,500px)] min-h-[400px] max-h-[min(68svh,780px)]";



export const ARTICLE_HERO_FRAME_MOBILE_CLASS =

  "relative w-full shrink-0 overflow-hidden h-[clamp(40svh,46svh,50svh)] max-h-[min(52svh,480px)] min-h-[200px]";



export const ARTICLE_HERO_COPY_SHELL_CLASS =

  "pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden flex-col justify-end max-lg:hidden lg:inset-0 lg:flex";



export const ARTICLE_HERO_COPY_SHELL_DESKTOP_CLASS =

  "pointer-events-none absolute inset-0 z-10 flex flex-col justify-end";



export const ARTICLE_HERO_COPY_SHELL_MOBILE_CLASS = "hidden";



export const ARTICLE_HERO_COPY_INNER_CLASS =

  "pointer-events-auto w-full container-site px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:pb-12";



export const ARTICLE_HERO_COPY_INNER_DESKTOP_CLASS =

  "pointer-events-auto w-full container-site px-4 pb-12 sm:px-6";



export const ARTICLE_HERO_GRADIENT_CLASS =

  "pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden h-[48%] max-lg:hidden lg:block";



export const ARTICLE_HERO_GRADIENT_DESKTOP_CLASS =

  "pointer-events-none absolute inset-x-0 bottom-0 z-[2] block h-[48%]";



export const ARTICLE_HERO_GRADIENT_MOBILE_CLASS = "hidden";



export const ARTICLE_HERO_MOBILE_META_CLASS =
  "container-site border-b border-hairline bg-[#05070d] px-4 pb-5 pt-4 max-lg:block lg:hidden";

export const ARTICLE_HERO_BREADCRUMB_NAV_CLASS =
  "pointer-events-auto absolute inset-x-0 top-0 z-20 container-site hidden max-lg:hidden lg:block lg:px-4 lg:pt-4";



export const ARTICLE_HERO_BREADCRUMB_NAV_DESKTOP_CLASS =

  "absolute inset-x-0 top-0 z-20 container-site flex flex-wrap items-center gap-2 px-4 pt-3";



export const ARTICLE_HERO_BREADCRUMB_NAV_MOBILE_CLASS = "hidden";



export type ArticleHeroPreviewLayout = "mobile" | "desktop";


