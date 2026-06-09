import type { CaretInsertResult } from "@/lib/articles/content-link";
import { isListItemLine } from "@/lib/articles/content-list";

/** CMS shorthand: `::video https://youtube.com/...` or with `| podpis` */
export const CONTENT_VIDEO_MARKER_RE =
  /^::video\s+(\S+)(?:\s*\|\s*(.+))?$/i;

export type ContentVideoData = {
  src: string;
  caption?: string;
};

export function parseContentVideoLine(line: string): ContentVideoData | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const match = trimmed.match(CONTENT_VIDEO_MARKER_RE);
  if (!match) return null;
  const src = match[1].trim();
  if (!/^https?:\/\//i.test(src)) return null;
  const caption = match[2]?.trim() || undefined;
  return { src, caption };
}

export function parseContentVideoCaptionLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const marker = trimmed.match(/^::caption\s+(.+)$/i);
  if (marker) return marker[1].trim() || null;
  if (parseContentVideoLine(trimmed)) return null;
  if (isListItemLine(trimmed)) return null;
  return trimmed;
}

/** YouTube / Vimeo → iframe embed URL. Returns null when unsupported. */
export function resolveVideoEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname.startsWith("/embed/")) {
      return `https://www.youtube.com${url.pathname}${url.search}`;
    }
    const id = url.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
    return url.toString();
  }

  return null;
}

export function formatContentVideoBlock(src: string, caption = ""): string {
  const url = src.trim();
  const c = caption.trim();
  if (!c) return `::video ${url}`;
  return `::video ${url}\n${c}`;
}

export function insertContentVideoAtCaret(
  content: string,
  caretStart: number,
  caretEnd: number,
  src: string,
  caption = ""
): CaretInsertResult {
  const line = formatContentVideoBlock(src, caption);
  const start = Math.min(caretStart, caretEnd);
  const end = Math.max(caretStart, caretEnd);
  const before = content.slice(0, start);
  const after = content.slice(end);

  const prefix =
    before.length === 0 ? "" : before.endsWith("\n\n") ? "" : "\n\n";
  const suffix = after.length === 0 ? "" : after.startsWith("\n\n") ? "" : "\n\n";

  const insertion = `${prefix}${line}${suffix}`;
  const value = before + insertion + after;
  const pos = before.length + insertion.length;

  return { value, selectionStart: pos, selectionEnd: pos };
}
