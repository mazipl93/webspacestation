import { ArticleStatus } from "@prisma/client";

/**
 * Single source of truth for public article visibility.
 * Every public read MUST use this filter (or a helper that includes it).
 */
export const PUBLISHED_ARTICLE_WHERE = {
  status: ArticleStatus.PUBLISHED,
} as const;
