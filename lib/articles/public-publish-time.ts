import { ArticleStatus } from "@prisma/client";

/** Polska etykieta względna — liczona przy renderze strony od stałej daty w DB. */
export function formatRelativePublishLabel(date: Date, nowMs = Date.now()): string {
  const diffMs = nowMs - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "przed chwilą";
  if (min < 60) return `${min} min temu`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "wczoraj";
  if (days < 7) return `${days} dni temu`;
  if (days < 14) return "tydzień temu";
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type PublishTimeInput = {
  status: ArticleStatus;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  /** Nigdy nie używaj do etykiety na froncie — zmienia się przy każdym PATCH. */
  updatedAt?: Date | string | null;
};

/**
 * Jedyny moment „wrzucenia na portal” = pierwsze Opublikuj (`publishedAt`).
 * Brak publishedAt u PUBLISHED → createdAt (awaryjnie), nigdy updatedAt.
 */
export function resolvePublicPublishTime(input: PublishTimeInput): Date {
  if (input.publishedAt != null) {
    return new Date(input.publishedAt);
  }

  const created = new Date(input.createdAt);
  if (input.status === ArticleStatus.PUBLISHED && process.env.NODE_ENV === "development") {
    console.warn(
      "[resolvePublicPublishTime] PUBLISHED without publishedAt — using createdAt for display",
      { createdAt: created.toISOString() }
    );
  }
  return created;
}
