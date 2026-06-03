import { ArticleContentOrigin } from "@prisma/client";

/**
 * HARD RULE (system-wide): `contentOrigin` is immutable after creation.
 * - RSS ingest + process-drafts → `RSS`
 * - CMS manual create → `EDITORIAL`
 * - `updateArticle` must never change `contentOrigin`
 * - Do NOT infer provenance from `source` / `originalUrl` on read/write paths
 */

export type { ArticleContentOrigin };

export const ARTICLE_CONTENT_ORIGINS: ArticleContentOrigin[] = [
  ArticleContentOrigin.EDITORIAL,
  ArticleContentOrigin.RSS,
  ArticleContentOrigin.AI_DRAFT,
];

/**
 * @deprecated Do not use on CMS create/update paths. Provenance is not derived from
 * citation fields (`source` / `originalUrl`). Kept for one-off scripts only.
 */
export function inferContentOriginFromArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
}): ArticleContentOrigin {
  const source = article.source?.trim();
  const originalUrl = article.originalUrl?.trim();
  if (source && originalUrl) return ArticleContentOrigin.RSS;
  return ArticleContentOrigin.EDITORIAL;
}

export function isArticleContentOrigin(
  value: unknown
): value is ArticleContentOrigin {
  return (
    typeof value === "string" &&
    (ARTICLE_CONTENT_ORIGINS as string[]).includes(value)
  );
}
