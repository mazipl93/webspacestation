/** Articles per listing page (/aktualnosci + department feeds). */
export const ARTICLE_FEED_PAGE_SIZE = 40;

export function parseListingPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

/** Crawlable href for paginated listing pages (page 1 = clean URL). */
export function listingPageHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  return `${basePath}?strona=${page}`;
}

export function clampListingPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}
