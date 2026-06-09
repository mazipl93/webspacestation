import {
  isListItemLine,
  stripListItemMarker,
} from "@/lib/articles/content-list";
import {
  parseContentImageCaptionLine,
  parseContentImageLine,
} from "@/lib/articles/content-image";
import { parseHeadingLine, type HeadingLevel } from "@/lib/articles/content-heading";
import {
  parseContentVideoCaptionLine,
  parseContentVideoLine,
} from "@/lib/articles/content-video";

export type ArticleContentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "figure"; src: string; caption?: string }
  | { kind: "heading"; level: HeadingLevel; text: string }
  | { kind: "video"; src: string; caption?: string };

function figureFromImageLines(lines: string[]): ArticleContentBlock | null {
  const image = parseContentImageLine(lines[0]);
  if (!image) return null;

  const captionLines = lines
    .slice(1)
    .map(parseContentImageCaptionLine)
    .filter((c): c is string => Boolean(c));

  const caption =
    image.caption ||
    (captionLines.length > 0 ? captionLines.join("\n") : undefined);

  return { kind: "figure", src: image.src, caption };
}

function videoFromVideoLines(lines: string[]): ArticleContentBlock | null {
  const video = parseContentVideoLine(lines[0]);
  if (!video) return null;

  const captionLines = lines
    .slice(1)
    .map(parseContentVideoCaptionLine)
    .filter((c): c is string => Boolean(c));

  const caption =
    video.caption ||
    (captionLines.length > 0 ? captionLines.join("\n") : undefined);

  return { kind: "video", src: video.src, caption };
}

/**
 * Split one stored paragraph (may contain single `\n` lines) into paragraph / list blocks.
 * Fixes legacy CMS input like `-gra1\n-gra2` without blank lines between items.
 */
export function parseParagraphToContentBlocks(paragraph: string): ArticleContentBlock[] {
  const lines = paragraph
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  if (lines.length === 1) {
    const only = lines[0];
    if (isListItemLine(only)) {
      return [{ kind: "list", items: [stripListItemMarker(only)] }];
    }
    const heading = parseHeadingLine(only);
    if (heading) {
      return [{ kind: "heading", level: heading.level, text: heading.text }];
    }
    const loneFigure = figureFromImageLines(lines);
    if (loneFigure) return [loneFigure];
    const loneVideo = videoFromVideoLines(lines);
    if (loneVideo) return [loneVideo];
    return [{ kind: "paragraph", text: only }];
  }

  const blocks: ArticleContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    if (isListItemLine(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && isListItemLine(lines[i])) {
        items.push(stripListItemMarker(lines[i]));
        i += 1;
      }
      if (items.length > 0) {
        blocks.push({ kind: "list", items });
      }
      continue;
    }

    const heading = parseHeadingLine(lines[i]);
    if (heading) {
      blocks.push({ kind: "heading", level: heading.level, text: heading.text });
      i += 1;
      continue;
    }

    if (parseContentImageLine(lines[i])) {
      const imageLines = [lines[i]];
      i += 1;
      while (i < lines.length) {
        if (
          isListItemLine(lines[i]) ||
          parseContentImageLine(lines[i]) ||
          parseHeadingLine(lines[i]) ||
          parseContentVideoLine(lines[i])
        ) {
          break;
        }
        const caption = parseContentImageCaptionLine(lines[i]);
        if (!caption) break;
        imageLines.push(lines[i]);
        i += 1;
      }
      const figure = figureFromImageLines(imageLines);
      if (figure) blocks.push(figure);
      continue;
    }

    if (parseContentVideoLine(lines[i])) {
      const videoLines = [lines[i]];
      i += 1;
      while (i < lines.length) {
        if (
          isListItemLine(lines[i]) ||
          parseContentImageLine(lines[i]) ||
          parseHeadingLine(lines[i]) ||
          parseContentVideoLine(lines[i])
        ) {
          break;
        }
        const caption = parseContentVideoCaptionLine(lines[i]);
        if (!caption) break;
        videoLines.push(lines[i]);
        i += 1;
      }
      const video = videoFromVideoLines(videoLines);
      if (video) blocks.push(video);
      continue;
    }

    const textLines: string[] = [];
    while (
      i < lines.length &&
      !isListItemLine(lines[i]) &&
      !parseContentImageLine(lines[i]) &&
      !parseContentVideoLine(lines[i]) &&
      !parseHeadingLine(lines[i])
    ) {
      textLines.push(lines[i]);
      i += 1;
    }
    if (textLines.length > 0) {
      blocks.push({ kind: "paragraph", text: textLines.join("\n") });
    }
  }

  return blocks;
}

export function parseArticleBodyBlocks(paragraphs: string[]): ArticleContentBlock[] {
  const blocks = paragraphs.flatMap((p) => parseParagraphToContentBlocks(p));
  const merged: ArticleContentBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];

    if (
      block.kind === "figure" &&
      !block.caption?.trim() &&
      next?.kind === "paragraph" &&
      !next.text.includes("\n")
    ) {
      const caption = parseContentImageCaptionLine(next.text);
      if (caption) {
        merged.push({ ...block, caption });
        i += 1;
        continue;
      }
    }

    if (
      block.kind === "video" &&
      !block.caption?.trim() &&
      next?.kind === "paragraph" &&
      !next.text.includes("\n")
    ) {
      const caption = parseContentVideoCaptionLine(next.text);
      if (caption) {
        merged.push({ ...block, caption });
        i += 1;
        continue;
      }
    }

    merged.push(block);
  }

  return merged;
}
