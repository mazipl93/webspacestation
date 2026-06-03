import { ArticleStatus } from "@prisma/client";

/**
 * Article lifecycle — status is the ONLY workflow driver.
 * No heuristics from source, originalUrl, or contentOrigin.
 */

/** Primary editorial workflow states (CMS list filters). */
export const WORKFLOW_STATUSES: readonly ArticleStatus[] = [
  ArticleStatus.DRAFT,
  ArticleStatus.REVIEW,
  ArticleStatus.PUBLISHED,
  ArticleStatus.SCHEDULED,
] as const;

/** Soft-delete / archive — outside default CMS workflow filters. */
export const ARCHIVE_STATUS = ArticleStatus.ARCHIVED;

export type PublishCheckInput = {
  title: string;
  content: string | null;
  categoryId: string;
};

export type WorkflowValidation =
  | { ok: true }
  | { ok: false; message: string };

/** Resolve status on create — defaults to DRAFT; never inferred from content fields. */
export function resolveCreateStatus(
  requested: ArticleStatus | undefined
): ArticleStatus {
  return requested ?? ArticleStatus.DRAFT;
}

/** PUBLISHED requires title, body, and category. */
export function validatePublishReady(
  input: PublishCheckInput
): WorkflowValidation {
  if (!input.title.trim()) {
    return { ok: false, message: "Tytuł jest wymagany przed publikacją." };
  }
  if (!input.content?.trim()) {
    return { ok: false, message: "Treść jest wymagana przed publikacją." };
  }
  if (!input.categoryId.trim()) {
    return { ok: false, message: "Kategoria jest wymagana przed publikacją." };
  }
  return { ok: true };
}

/**
 * publishedAt side effects — only when status is explicitly transitioned.
 * SCHEDULED does not stamp publishedAt (scheduler sets it on auto-publish).
 */
export function publishedAtPatchForStatusTransition(
  nextStatus: ArticleStatus,
  existing: { status: ArticleStatus; publishedAt: Date | null }
): { publishedAt?: Date | null } {
  if (nextStatus === ArticleStatus.PUBLISHED) {
    return existing.publishedAt ? {} : { publishedAt: new Date() };
  }
  if (nextStatus === ArticleStatus.SCHEDULED) {
    return {};
  }
  if (existing.status === ArticleStatus.PUBLISHED) {
    return { publishedAt: null };
  }
  return {};
}

/** SCHEDULED requires a future publishAt. */
export function validateScheduleTime(
  publishAt: Date,
  now: Date = new Date()
): WorkflowValidation {
  if (!Number.isFinite(publishAt.getTime())) {
    return { ok: false, message: "Nieprawidłowa data zaplanowanej publikacji." };
  }
  if (publishAt.getTime() <= now.getTime()) {
    return {
      ok: false,
      message: "Data zaplanowanej publikacji musi być w przyszłości.",
    };
  }
  return { ok: true };
}

/** True when scheduler may attempt auto-publish for this row. */
export function isScheduledPublishDue(
  article: { status: ArticleStatus; publishAt: Date | null },
  now: Date = new Date()
): boolean {
  return (
    article.status === ArticleStatus.SCHEDULED &&
    article.publishAt != null &&
    article.publishAt.getTime() <= now.getTime()
  );
}

export function isWorkflowListStatus(
  status: ArticleStatus | "ALL"
): status is ArticleStatus | "ALL" {
  return (
    status === "ALL" ||
    (WORKFLOW_STATUSES as readonly string[]).includes(status) ||
    status === ARCHIVE_STATUS
  );
}
