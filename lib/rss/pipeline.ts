import { ArticleStatus, type Prisma } from "@prisma/client";

/** Subtitle marker set at ingest — only these rows are eligible for AI. */
export const RSS_RAW_SUBTITLE_MARKER = "RSS (surowe)";

export function buildRawRssSubtitle(source: string): string {
  return `${source} · ${RSS_RAW_SUBTITLE_MARKER}`;
}

export function isUnprocessedRssDraft(subtitle: string | null | undefined): boolean {
  return Boolean(subtitle?.includes(RSS_RAW_SUBTITLE_MARKER));
}

/** Strict AI input filter: DRAFT + external RSS + not yet enriched. */
export function unprocessedRssDraftWhere(): Prisma.ArticleWhereInput {
  return {
    status: ArticleStatus.DRAFT,
    source: { not: null },
    originalUrl: { not: null },
    subtitle: { contains: RSS_RAW_SUBTITLE_MARKER },
  };
}
