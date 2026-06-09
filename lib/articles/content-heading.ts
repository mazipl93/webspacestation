import type { CaretInsertResult } from "@/lib/articles/content-link";

export type HeadingLevel = 2 | 3 | 4;

/** Markdown heading line: `#` → H2, `##` → H3, `###` → H4 (H1 = tytuł artykułu). */
export const HEADING_LINE_RE = /^(#{1,3})\s+(.+)$/;

export function headingLevelFromHashes(hashCount: number): HeadingLevel {
  if (hashCount <= 1) return 2;
  if (hashCount === 2) return 3;
  return 4;
}

export function headingMarker(level: HeadingLevel): string {
  const hashes = level === 2 ? 1 : level === 3 ? 2 : 3;
  return `${"#".repeat(hashes)} `;
}

export function parseHeadingLine(
  line: string
): { level: HeadingLevel; text: string } | null {
  const trimmed = line.trim();
  const match = trimmed.match(HEADING_LINE_RE);
  if (!match) return null;
  const text = match[2].trim();
  if (!text) return null;
  return {
    level: headingLevelFromHashes(match[1].length),
    text,
  };
}

/** Insert a heading line at caret (own paragraph, blank lines around). */
export function insertHeadingAtCaret(
  content: string,
  caretStart: number,
  caretEnd: number,
  level: HeadingLevel = 2
): CaretInsertResult {
  const start = Math.min(caretStart, caretEnd);
  const end = Math.max(caretStart, caretEnd);
  const before = content.slice(0, start);
  const after = content.slice(end);
  const line = `${headingMarker(level)}Nagłówek`;

  const prefix =
    before.length === 0 ? "" : before.endsWith("\n\n") ? "" : "\n\n";
  const suffix = after.length === 0 ? "" : after.startsWith("\n\n") ? "" : "\n\n";

  const insertion = `${prefix}${line}${suffix}`;
  const value = before + insertion + after;
  const titleStart = before.length + prefix.length + headingMarker(level).length;
  const titleEnd = titleStart + "Nagłówek".length;

  return {
    value,
    selectionStart: titleStart,
    selectionEnd: titleEnd,
  };
}
