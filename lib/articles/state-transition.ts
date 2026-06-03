import { ArticleStatus } from "@prisma/client";

/** Editorial status actions — single transition entry point. */
export type ArticleStateAction = "DRAFT" | "REVIEW" | "PUBLISH" | "SCHEDULE";

export function actionToStatus(action: ArticleStateAction): ArticleStatus {
  switch (action) {
    case "DRAFT":
      return ArticleStatus.DRAFT;
    case "REVIEW":
      return ArticleStatus.REVIEW;
    case "PUBLISH":
      return ArticleStatus.PUBLISHED;
    case "SCHEDULE":
      return ArticleStatus.SCHEDULED;
  }
}

/** Map DB status to transition action (editorial workflow only). */
export function statusToAction(
  status: ArticleStatus
): ArticleStateAction | null {
  switch (status) {
    case ArticleStatus.DRAFT:
      return "DRAFT";
    case ArticleStatus.REVIEW:
      return "REVIEW";
    case ArticleStatus.PUBLISHED:
      return "PUBLISH";
    case ArticleStatus.SCHEDULED:
      return "SCHEDULE";
    default:
      return null;
  }
}
