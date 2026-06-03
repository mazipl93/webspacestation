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
 * SCHEDULED does not stamp publishedAt (scheduler not implemented).
 */
export function publishedAtPatchForStatusTransition(
  nextStatus: ArticleStatus,
  existing: { status: ArticleStatus; publishedAt: Date | null }
): { publishedAt?: Date | null } {
  if (nextStatus === ArticleStatus.PUBLISHED) {
    return existing.publishedAt ? {} : { publishedAt: new Date() };
  }
  if (existing.status === ArticleStatus.PUBLISHED) {
    return { publishedAt: null };
  }
  return {};
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
