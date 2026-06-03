import type { AdminArticle } from "@/lib/admin/types";

/** Dev-only CMS render trace — must match API row shape (no local filtering). */
export function traceArticleCmsRender(articles: AdminArticle[]): void {
  if (process.env.NODE_ENV !== "development") return;
  console.log("ARTICLE_CMS_RENDER:", {
    count: articles.length,
    rows: articles.map((a) => ({
      id: a.id,
      status: a.status,
      coverImage: a.coverImage,
      title: a.title,
    })),
  });
}
