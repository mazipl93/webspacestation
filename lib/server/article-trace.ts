import type { ArticleStateAction } from "@/lib/articles/state-transition";
import type { ArticleStatus } from "@prisma/client";

function devOnly(): boolean {
  return process.env.NODE_ENV === "development";
}

export function traceArticleWriteInput(
  op: "create" | "update",
  payload: Record<string, unknown>
): void {
  if (!devOnly()) return;
  const { content, ...rest } = payload;
  console.log("ARTICLE_WRITE_INPUT:", {
    op,
    keys: Object.keys(payload),
    hasStatus: "status" in payload,
    status: rest.status,
    coverImage: rest.coverImage,
    title: rest.title,
    contentLength: typeof content === "string" ? content.length : undefined,
  });
}

export function traceArticleWriteOutput(row: {
  id: string;
  status: ArticleStatus;
  coverImage: string | null;
  title: string;
}): void {
  if (!devOnly()) return;
  console.log("ARTICLE_WRITE_OUTPUT:", {
    id: row.id,
    status: row.status,
    coverImage: row.coverImage,
    title: row.title,
  });
}

export function traceArticleStateTransition(
  id: string,
  from: ArticleStatus,
  action: ArticleStateAction
): void {
  if (!devOnly()) return;
  console.log("ARTICLE_STATE_TRANSITION:", { id, from, action });
}

/** @deprecated Use traceArticleStateTransition */
export function traceArticleStatusChange(
  id: string,
  from: ArticleStatus,
  to: ArticleStatus,
  via: string
): void {
  if (!devOnly()) return;
  console.log("ARTICLE_STATE_TRANSITION:", { id, from, action: via, to });
}

export function traceArticleApiResponse(
  context: string,
  rows: Array<{
    id: string;
    status: ArticleStatus;
    coverImage: string | null;
    title: string;
  }>
): void {
  if (!devOnly()) return;
  console.log("ARTICLE_API_RESPONSE:", {
    context,
    count: rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      status: r.status,
      coverImage: r.coverImage,
      title: r.title,
    })),
  });
}

export function traceArticleFetchCms(query: {
  status?: string;
  count: number;
}): void {
  if (!devOnly()) return;
  console.log("ARTICLE_FETCH_CMS:", query);
}

export function traceArticleFetchPublic(query: {
  scope: string;
  count: number;
}): void {
  if (!devOnly()) return;
  console.log("ARTICLE_FETCH_PUBLIC:", query);
}
