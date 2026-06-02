import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import {
  enrichmentToArticleFields,
  splitContentToParagraphs,
  validateRssEnrichment,
} from "@/lib/rss/apply-enrichment";
import {
  enrichRssDrafts,
  mapAiCategoryToSlug,
  reviseRssArticlePolish,
} from "@/lib/rss/enrich-drafts";
import { buildAggregatorSubtitle, buildUniqueSlug } from "@/lib/rss/normalize";
import { fetchRssItemByUrl } from "@/lib/rss/refetch-rss-item";

export type ReprocessRssArticleResult =
  | { ok: true; articleId: string }
  | { ok: false; error: string };

/**
 * Re-run OpenAI B+ enrichment for one RSS article (REVIEW, DRAFT, or PUBLISHED).
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
      content: true,
      contextNote: true,
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
        lead_pl: row.excerpt ?? row.title.slice(0, 300),
        body_pl: splitContentToParagraphs(row.content),
        context_pl: row.contextNote,
        source: row.source,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `OpenAI: ${message}` };
  }

  const validation = validateRssEnrichment(enriched);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const fields = enrichmentToArticleFields(enriched, row.source);

  let categoryId: string | undefined;
  const catSlug = mapAiCategoryToSlug(fields.category);
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
      title: fields.title,
      excerpt: fields.excerpt,
      content: fields.content,
      contextNote: fields.contextNote,
      slug: buildUniqueSlug(fields.title, row.originalUrl),
      subtitle: buildAggregatorSubtitle(row.source),
      tags: normalizeArticleTags(fields.tags),
      readingTime: fields.readingTime ?? 3,
      status: nextStatus,
      ...(categoryId ? { categoryId } : {}),
    },
  });

  return { ok: true, articleId: row.id };
}
