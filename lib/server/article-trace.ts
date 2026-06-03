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

export function traceArticleStatusChange(
  id: string,
  from: ArticleStatus,
  to: ArticleStatus,
  via: string
): void {
  if (!devOnly()) return;
  console.log("ARTICLE_STATUS_CHANGE:", { id, from, to, via });
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
