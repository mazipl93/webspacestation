/**
 * Artykuł publiczny — ten sam shell co homepage/stopka (--spacing-site-shell).
 * Siatka: treść + sidebar 300px (xl+), jak homepage v2 / stopka.
 */

import { SITE_CONTAINER } from "@/lib/site-layout";

/** Wrapper strony artykułu (zamiast węższego container-site 1240px). */
export const ARTICLE_SHELL = SITE_CONTAINER;

/** Główna siatka: treść | Informacje + Powiązane. */
export const ARTICLE_PAGE_GRID =
  "grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] xl:gap-7";

/** Pusty słupek pod sidebarem (Dyskusja — ta sama szerokość kolumny). */
export const ARTICLE_PAGE_SIDEBAR_STUB = "hidden min-w-0 xl:block";

/** Ramka okładki w shellu — jak hero na stronie głównej. */
export const ARTICLE_HERO_SHELL_WRAP =
  "overflow-hidden rounded-xl border border-hairline";

/** Szerokość bloku czytelniczego (tytuł może być szerszy). */
export const ARTICLE_PROSE_MAX = "max-w-[72ch]";

/** Tytuł / meta pod okładką — pełna szerokość kolumny treści. */
export const ARTICLE_HEADLINE_MAX = "max-w-[min(100%,52rem)]";
