import { CATEGORY_INFO, type CategorySlug } from "@/lib/categories";

/** Articles per listing page (/aktualnosci + department feeds). */
export const ARTICLE_FEED_PAGE_SIZE = 40;

export type ListingPageQuery = {
  dzial?: string;
};

export function parseListingPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

/** Optional department filter on /aktualnosci (?dzial=misje). */
export function parseListingDepartment(
  raw: string | string[] | undefined,
): CategorySlug | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const slug = value?.trim().toLowerCase() ?? "";
  if (!slug || !(slug in CATEGORY_INFO)) return undefined;
  return slug as CategorySlug;
}

/** Crawlable href for paginated listing pages (page 1 = clean URL). */
export function listingPageHref(
  basePath: string,
  page: number,
  query?: ListingPageQuery,
): string {
  const params = new URLSearchParams();
  if (query?.dzial) params.set("dzial", query.dzial);
  if (page > 1) params.set("strona", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function clampListingPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}
