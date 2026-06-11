import { getSiteUrl } from "@/lib/site-url";

/** Bump when FB share-card layout changes — busts Meta CDN cache on photo url. */
export const SHARE_CARD_CACHE_VERSION = "1";

/** Bump when IG card layout changes — busts Meta CDN cache on image_url. */
export const INSTAGRAM_CARD_CACHE_VERSION = "2";

export function getShareCardUrl(
  slug: string,
  options?: { forMetaPublish?: boolean },
): string {
  const base = `${getSiteUrl()}/api/social/share-card/${encodeURIComponent(slug)}`;
  if (options?.forMetaPublish) {
    return `${base}?v=${SHARE_CARD_CACHE_VERSION}`;
  }
  return base;
}

export function getInstagramCardUrl(
  slug: string,
  options?: { forMetaPublish?: boolean },
): string {
  const base = `${getSiteUrl()}/api/social/instagram-card/${encodeURIComponent(slug)}`;
  if (options?.forMetaPublish) {
    return `${base}?v=${INSTAGRAM_CARD_CACHE_VERSION}`;
  }
  return base;
}

export function getPublicArticleUrl(slug: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(slug)}`;
}
