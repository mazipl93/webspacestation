import "server-only";

import { toNewsArticle } from "@/lib/articles";
import type { ArticleWithRelations } from "@/lib/server/articles";
import type { NewsArticle } from "@/types";

/** Admin „Preview publikacji” — hero only from DB `coverImage` (no public fallbacks). */
export function articleRowToCmsPreviewArticle(
  row: ArticleWithRelations
): NewsArticle {
  const article = toNewsArticle(row);
  return {
    ...article,
    image: row.coverImage?.trim() || "",
  };
}
