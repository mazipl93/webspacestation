import { normalizeCoverImageUrl } from "@/lib/media/cover-url";
import { isListItemLine } from "@/lib/articles/content-list";

/** Markdown-style image line stored in article content (own paragraph). */
export const CONTENT_IMAGE_MD_RE =
  /^!\[([^\]]*)\]\(\s*(<?[^>\s)]+>?)\s*\)$/;

/** CMS shorthand: `::image https://…` or `::image https://… | podpis` */
export const CONTENT_IMAGE_MARKER_RE =
  /^::image\s+(\S+)(?:\s*\|\s*(.+))?$/i;

export type ContentImageData = {
  src: string;
  caption?: string;
};

export function parseContentImageLine(line: string): ContentImageData | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const md = trimmed.match(CONTENT_IMAGE_MD_RE);
  if (md) {
    const src = normalizeCoverImageUrl(md[2].replace(/^<|>$/g, ""));
    if (!src) return null;
    const caption = md[1].trim() || undefined;
    return { src, caption };
  }

  const marker = trimmed.match(CONTENT_IMAGE_MARKER_RE);
  if (marker) {
    const src = normalizeCoverImageUrl(marker[1]);
    if (!src) return null;
    const caption = marker[2]?.trim() || undefined;
    return { src, caption };
  }

  return null;
}

export function formatContentImageMarkdown(
  src: string,
  caption = ""
): string {
  return `![${caption.trim()}](${src.trim()})`;
}

/** Image URL + caption line(s) in one stored paragraph (caption directly under image). */
export function formatContentImageBlock(src: string, caption: string): string {
  const url = src.trim();
  const c = caption.trim();
  if (!c) return formatContentImageMarkdown(url, "");
  return `![](${url})\n${c}`;
}

export function parseContentImageCaptionLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const marker = trimmed.match(/^::caption\s+(.+)$/i);
  if (marker) return marker[1].trim() || null;
  if (parseContentImageLine(trimmed)) return null;
  if (isListItemLine(trimmed)) return null;
  return trimmed;
}

export type ContentImageInsertResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/** Insert figure markdown at caret (surrounded by blank lines). */
export function insertContentImageAtCaret(
  content: string,
  caretStart: number,
  caretEnd: number,
  src: string,
  caption = ""
): ContentImageInsertResult {
  const line = formatContentImageBlock(src, caption);
  const start = Math.min(caretStart, caretEnd);
  const end = Math.max(caretStart, caretEnd);
  const before = content.slice(0, start);
  const after = content.slice(end);

  const needsLeadBreak = before.length > 0 && !before.endsWith("\n\n");
  const needsTrailBreak = after.length > 0 && !after.startsWith("\n");

  const prefix = before.length === 0 ? "" : needsLeadBreak ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
  const suffix = after.length === 0 ? "" : needsTrailBreak ? "\n\n" : "";

  const insertion = `${prefix}${line}${suffix}`;
  const value = before + insertion + after;
  const pos = before.length + insertion.length;

  return { value, selectionStart: pos, selectionEnd: pos };
}
