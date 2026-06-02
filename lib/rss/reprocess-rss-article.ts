import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import {
  enrichRssDrafts,
  mapAiCategoryToSlug,
  reviseRssArticlePolish,
} from "@/lib/rss/enrich-drafts";
import { buildAggregatorSubtitle, buildUniqueSlug } from "@/lib/rss/normalize";
import { fetchRssItemByUrl } from "@/lib/rss/refetch-rss-item";
import { isSummaryDuplicateOfTitle } from "@/lib/rss/summary-quality";

/** Reject summaries that look broken (e.g. lone "S." from U.S.). */
export const MIN_SUMMARY_PL_LENGTH = 48;

export type ReprocessRssArticleResult =
  | { ok: true; articleId: string }
  | { ok: false; error: string };

/**
 * Re-run OpenAI enrichment for one RSS article (REVIEW or DRAFT).
 * Refetches EN title/snippet from feeds when the URL is still listed.
 */
export async function reprocessRssArticle(
  articleId: string
): Promise<ReprocessRssArticleResult> {
  const row = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      status: true,
      source: true,
      originalUrl: true,
      title: true,
      excerpt: true,
    },
  });

  if (!row) return { ok: false, error: "Nie znaleziono artykułu." };
  if (!row.source?.trim() || !row.originalUrl?.trim()) {
    return { ok: false, error: "To nie jest artykuł RSS (brak source/originalUrl)." };
  }

  const fresh = await fetchRssItemByUrl(row.originalUrl);

  let enriched;
  try {
    if (fresh) {
      [enriched] = await enrichRssDrafts([
        {
          title: fresh.title,
          excerpt: fresh.excerpt,
          source: row.source,
        },
      ]);
    } else {
      enriched = await reviseRssArticlePolish({
        title_pl: row.title,
        summary_pl: row.excerpt ?? row.title.slice(0, 300),
        source: row.source,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `OpenAI: ${message}` };
  }

  if (!enriched?.title_pl?.trim() || !enriched?.summary_pl?.trim()) {
    return { ok: false, error: "OpenAI zwróciło puste tytuł lub streszczenie." };
  }

  if (enriched.summary_pl.trim().length < MIN_SUMMARY_PL_LENGTH) {
    return {
      ok: false,
      error: `Streszczenie za krótkie (${enriched.summary_pl.trim().length} znaków). Spróbuj ponownie lub edytuj ręcznie.`,
    };
  }

  if (isSummaryDuplicateOfTitle(enriched.title_pl, enriched.summary_pl)) {
    return {
      ok: false,
      error:
        "Streszczenie jest prawie identyczne z tytułem. RSS mógł nie mieć dodatkowego opisu — uzupełnij streszczenie ręcznie.",
    };
  }

  let categoryId: string | undefined;
  const catSlug = mapAiCategoryToSlug(enriched.category);
  if (catSlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: catSlug },
      select: { id: true },
    });
    if (cat) categoryId = cat.id;
  }

  const nextStatus =
    row.status === ArticleStatus.PUBLISHED
      ? ArticleStatus.PUBLISHED
      : ArticleStatus.REVIEW;

  await prisma.article.update({
    where: { id: row.id },
    data: {
      title: enriched.title_pl,
      excerpt: enriched.summary_pl,
      slug: buildUniqueSlug(enriched.title_pl, row.originalUrl),
      subtitle: buildAggregatorSubtitle(row.source),
      tags: normalizeArticleTags(enriched.tags),
      readingTime: enriched.reading_time_min ?? 1,
      status: nextStatus,
      ...(categoryId ? { categoryId } : {}),
    },
  });

  return { ok: true, articleId: row.id };
}
