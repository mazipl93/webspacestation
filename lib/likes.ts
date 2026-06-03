// Legacy localStorage likes — retired Krok 2 (Supabase user_article_likes).
export { LIKES_CHANGE_EVENT } from "@/lib/likes/events";

/** @deprecated Use Supabase user_article_likes */
export function getLikedSlugs(): string[] {
  return [];
}

/** @deprecated */
export function hasLikedLocal(_slug: string): boolean {
  return false;
}

/** @deprecated */
export function addLikedLocal(_slug: string): void {
  /* no-op */
}
