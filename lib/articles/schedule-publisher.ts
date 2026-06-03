import { ArticleStatus } from "@prisma/client";
import {
  isScheduledPublishDue,
  validatePublishReady,
  type PublishCheckInput,
} from "@/lib/articles/workflow";

export type ScheduledArticleCandidate = PublishCheckInput & {
  id: string;
  slug: string;
  status: ArticleStatus;
  publishAt: Date | null;
  publishedAt: Date | null;
};

export type SchedulePublishItemResult =
  | { id: string; slug: string; ok: true }
  | { id: string; ok: false; reason: string };

export type SchedulePublishRunResult = {
  due: number;
  published: number;
  skipped: number;
  results: SchedulePublishItemResult[];
};

/** Pure gate — due SCHEDULED rows only. */
export function filterDueScheduledArticles<T extends ScheduledArticleCandidate>(
  articles: T[],
  now: Date = new Date()
): T[] {
  return articles.filter((a) => isScheduledPublishDue(a, now));
}

/**
 * Decide if a due article can transition to PUBLISHED.
 * Invalid rows stay SCHEDULED (no throw) — scheduler is idempotent on retry.
 */
export function evaluateScheduledPublish(
  article: ScheduledArticleCandidate
): SchedulePublishItemResult {
  if (!isScheduledPublishDue(article)) {
    return { id: article.id, ok: false, reason: "Not due for scheduled publish." };
  }

  const check = validatePublishReady({
    title: article.title,
    content: article.content,
    categoryId: article.categoryId,
  });
  if (!check.ok) {
    return { id: article.id, ok: false, reason: check.message };
  }

  return { id: article.id, slug: article.slug, ok: true };
}

export function summarizeSchedulePublishRun(
  results: SchedulePublishItemResult[]
): SchedulePublishRunResult {
  const published = results.filter((r): r is Extract<SchedulePublishItemResult, { ok: true }> => r.ok);
  const skipped = results.filter((r) => !r.ok);
  return {
    due: results.length,
    published: published.length,
    skipped: skipped.length,
    results,
  };
}
