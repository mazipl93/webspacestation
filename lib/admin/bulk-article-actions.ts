import type { ArticleStatus } from "@/lib/admin/types";

export function isBulkPublishableStatus(status: ArticleStatus): boolean {
  return status === "DRAFT" || status === "REVIEW" || status === "SCHEDULED";
}

export function isBulkArchivableStatus(status: ArticleStatus): boolean {
  return status !== "ARCHIVED";
}
