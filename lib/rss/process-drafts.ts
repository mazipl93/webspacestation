/**
 * AI layer: unprocessed DRAFT (raw RSS) → OpenAI enrich → REVIEW.
 * Never sets PUBLISHED. REVIEW/PUBLISHED are never selected or updated.
 */
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import { getOpenAIEnrichmentModel } from "@/lib/rss/openai-config";
import { enrichRssDrafts, mapAiCategoryToSlug } from "@/lib/rss/enrich-drafts";
import { MIN_SUMMARY_PL_LENGTH } from "@/lib/rss/reprocess-rss-article";
import { isSummaryDuplicateOfTitle } from "@/lib/rss/summary-quality";
import {
  buildAggregatorSubtitle,
  buildUniqueSlug,
} from "@/lib/rss/normalize";
import { unprocessedRssDraftWhere } from "@/lib/rss/pipeline";
import {
  isRssTranslationEnabled,
  requireOpenAIKey,
  RssTranslationConfigError,
} from "@/lib/rss/translate";

const PROCESS_BATCH_SIZE = Math.min(
  20,
  Math.max(1, Number(process.env.RSS_PROCESS_BATCH_SIZE) || 10)
);

export type ProcessDraftsResult = {
  queued: number;
  processed: number;
  skipped: number;
  failed: number;
  openaiModel: string;
  errors: string[];
};

export async function runRssDraftProcessing(): Promise<ProcessDraftsResult> {
  const result: ProcessDraftsResult = {
    queued: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    openaiModel: getOpenAIEnrichmentModel(),
    errors: [],
  };

  if (!isRssTranslationEnabled()) {
    result.errors.push(
      "Przetwarzanie wyłączone (RSS_TRANSLATE_PL) — szkice RSS pozostają DRAFT."
    );
    return result;
  }

  try {
    requireOpenAIKey();
  } catch (err) {
    const message =
      err instanceof RssTranslationConfigError
        ? err.message
        : err instanceof Error
          ? err.message
          : String(err);
    result.errors.push(message);
    return result;
  }

  const drafts = await prisma.article.findMany({
    where: unprocessedRssDraftWhere(),
    select: {
      id: true,
      title: true,
      excerpt: true,
      originalUrl: true,
      source: true,
    },
    orderBy: { createdAt: "asc" },
    take: PROCESS_BATCH_SIZE,
  });

  result.queued = drafts.length;
  if (drafts.length === 0) return result;

  const inputs = drafts.map((d) => ({
    title: d.title,
    excerpt: d.excerpt ?? d.title.slice(0, 200),
    source: d.source,
  }));

  let enriched;
  try {
    enriched = await enrichRssDrafts(inputs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`OpenAI enrichment: ${message}`);
    result.failed = drafts.length;
    return result;
  }

  const slugCache = new Map<string, string | null>();

  for (let i = 0; i < drafts.length; i++) {
    const row = drafts[i];
    const e = enriched[i];
    const source = row.source ?? "źródło";
    const originalUrl = row.originalUrl!;

    if (!e?.title_pl?.trim() || !e?.summary_pl?.trim()) {
      result.failed += 1;
      result.errors.push(`${originalUrl}: puste wzbogacenie — pozostaje DRAFT`);
      continue;
    }

    if (e.summary_pl.trim().length < MIN_SUMMARY_PL_LENGTH) {
      result.failed += 1;
      result.errors.push(
        `${originalUrl}: streszczenie za krótkie (${e.summary_pl.trim().length} zn.) — pozostaje DRAFT`
      );
      continue;
    }

    if (isSummaryDuplicateOfTitle(e.title_pl, e.summary_pl)) {
      result.failed += 1;
      result.errors.push(
        `${originalUrl}: streszczenie powtarza tytuł — pozostaje DRAFT (ponów AI w CMS)`
      );
      continue;
    }

    let categoryId: string | undefined;
    const catSlug = mapAiCategoryToSlug(e.category);
    if (catSlug) {
      let id = slugCache.get(catSlug);
      if (id === undefined) {
        const cat = await prisma.category.findUnique({
          where: { slug: catSlug },
          select: { id: true },
        });
        id = cat?.id ?? null;
        slugCache.set(catSlug, id);
      }
      if (id) categoryId = id;
    }

    try {
      const updated = await prisma.article.updateMany({
        where: { id: row.id, ...unprocessedRssDraftWhere() },
        data: {
          title: e.title_pl,
          excerpt: e.summary_pl,
          slug: buildUniqueSlug(e.title_pl, originalUrl),
          subtitle: buildAggregatorSubtitle(source),
          tags: normalizeArticleTags(e.tags),
          readingTime: e.reading_time_min ?? 1,
          status: ArticleStatus.REVIEW,
          ...(categoryId ? { categoryId } : {}),
        },
      });

      if (updated.count === 0) {
        result.skipped += 1;
        continue;
      }

      result.processed += 1;
    } catch (err) {
      result.failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`${originalUrl}: ${message}`);
    }
  }

  return result;
}
