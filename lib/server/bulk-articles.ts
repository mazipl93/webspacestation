import "server-only";

import { ArticleStatus } from "@prisma/client";
import { revalidatePublicArticleCaches } from "@/lib/cache/revalidate-public-articles";
import { ARTICLES_TAG, articleTag, categoryTag } from "@/lib/cache/tags";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  archiveArticle,
  articleStateTransition,
  ArticleWorkflowError,
} from "@/lib/server/articles";
import { isBulkArchivableStatus, isBulkPublishableStatus } from "@/lib/admin/bulk-article-actions";
import type { ArticleStatus as UiArticleStatus } from "@/lib/admin/types";

export type BulkArticleItemResult = {
  id: string;
  ok: boolean;
  reason?: string;
};

export type BulkArticlesResult = {
  requested: number;
  succeeded: number;
  failed: BulkArticleItemResult[];
};

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => typeof id === "string" && id.length > 0))];
}

export async function bulkPublishArticles(ids: string[]): Promise<BulkArticlesResult> {
  const list = uniqueIds(ids);
  const failed: BulkArticleItemResult[] = [];
  let succeeded = 0;
  const slugsToRevalidate: string[] = [];
  const categorySlugs = new Set<string>();

  for (const id of list) {
    try {
      const row = await prisma.article.findUnique({
        where: { id },
        select: { status: true, slug: true, category: { select: { slug: true } } },
      });
      if (!row) {
        failed.push({ id, ok: false, reason: "Nie znaleziono artykułu." });
        continue;
      }
      if (!isBulkPublishableStatus(row.status as UiArticleStatus)) {
        failed.push({
          id,
          ok: false,
          reason: "Ten status nie pozwala na publikację (już opublikowany lub w archiwum).",
        });
        continue;
      }
      const article = await articleStateTransition({ id, action: "PUBLISH" });
      if (!article) {
        failed.push({ id, ok: false, reason: "Nie znaleziono artykułu." });
        continue;
      }
      succeeded++;
      slugsToRevalidate.push(article.slug);
      categorySlugs.add(article.category.slug);
    } catch (e) {
      const reason =
        e instanceof ArticleWorkflowError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Publikacja nie powiodła się.";
      failed.push({ id, ok: false, reason });
    }
  }

  if (succeeded > 0) {
    revalidatePublicArticleCaches();
    revalidateTag(ARTICLES_TAG);
    for (const slug of slugsToRevalidate) {
      revalidateTag(articleTag(slug));
    }
    for (const cat of categorySlugs) {
      revalidateTag(categoryTag(cat));
    }
  }

  return { requested: list.length, succeeded, failed };
}

export async function bulkArchiveArticles(ids: string[]): Promise<BulkArticlesResult> {
  const list = uniqueIds(ids);
  const failed: BulkArticleItemResult[] = [];
  let succeeded = 0;
  const slugsToRevalidate: string[] = [];
  const categorySlugs = new Set<string>();

  for (const id of list) {
    try {
      const row = await prisma.article.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!row) {
        failed.push({ id, ok: false, reason: "Nie znaleziono artykułu." });
        continue;
      }
      if (row.status === ArticleStatus.ARCHIVED) {
        failed.push({ id, ok: false, reason: "Artykuł jest już w archiwum." });
        continue;
      }
      if (!isBulkArchivableStatus(row.status as UiArticleStatus)) {
        failed.push({ id, ok: false, reason: "Nie można zarchiwizować." });
        continue;
      }
      const article = await archiveArticle(id);
      if (!article) {
        failed.push({ id, ok: false, reason: "Nie znaleziono artykułu." });
        continue;
      }
      succeeded++;
      slugsToRevalidate.push(article.slug);
      categorySlugs.add(article.category.slug);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Archiwizacja nie powiodła się.";
      failed.push({ id, ok: false, reason });
    }
  }

  if (succeeded > 0) {
    revalidatePublicArticleCaches();
    revalidateTag(ARTICLES_TAG);
    for (const slug of slugsToRevalidate) {
      revalidateTag(articleTag(slug));
    }
    for (const cat of categorySlugs) {
      revalidateTag(categoryTag(cat));
    }
  }

  return { requested: list.length, succeeded, failed };
}
