import { Fragment, type ReactNode } from "react";
import React from "react";

const INLINE_RE =
  /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<>\[\]()]+)/g;

const TRAILING_PUNCT = /[.,;:!?)]+$/;

function trimAutolinkHref(href: string): string {
  return href.replace(TRAILING_PUNCT, "");
}

function trimAutolinkTrail(href: string, full: string): string {
  const trimmed = trimAutolinkHref(href);
  return full.slice(trimmed.length);
}

const LINK_CLASS =
  "font-medium text-accent-cyan underline decoration-accent-cyan/35 underline-offset-2 transition-colors hover:text-accent-blue hover:decoration-accent-blue/50";

type InlinePart =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "link"; label: string; href: string }
  | { kind: "autolink"; href: string; trail: string };

function parseInlineParts(text: string): InlinePart[] {
  if (!text) return [];

  const parts: InlinePart[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ kind: "text", value: text.slice(last, match.index) });
    }

    if (match[1] !== undefined) {
      parts.push({ kind: "bold", value: match[1] });
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const href = match[3].trim().replace(/^<|>$/g, "");
      parts.push({ kind: "link", label: match[2], href });
    } else if (match[4] !== undefined) {
      const href = trimAutolinkHref(match[4]);
      const trail = trimAutolinkTrail(match[4], match[4]);
      parts.push({ kind: "autolink", href, trail });
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ kind: "text", value: text.slice(last) });
  }

  return parts;
}

function renderExternalLink(href: string, label: ReactNode, key: string | number) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return (
      <a key={key} href={href} className={LINK_CLASS}>
        {label}
      </a>
    );
  }
  return (
    <a
      key={key}
      href={href}
      className={LINK_CLASS}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}

/** Inline markdown: `**bold**`, `[label](url)`, bare `https://…` autolinks. */
export function renderInlineMarkdown(text: string): ReactNode {
  const parts = parseInlineParts(text);
  if (parts.length === 0) return text;
  if (
    parts.length === 1 &&
    parts[0].kind === "text"
  ) {
    return text;
  }

  const nodes: ReactNode[] = [];

  parts.forEach((part, i) => {
    switch (part.kind) {
      case "text":
        nodes.push(part.value);
        break;
      case "bold":
        nodes.push(<strong key={`b-${i}`}>{part.value}</strong>);
        break;
      case "link":
        nodes.push(renderExternalLink(part.href, part.label, `l-${i}`));
        break;
      case "autolink":
        nodes.push(renderExternalLink(part.href, part.href, `a-${i}`));
        if (part.trail) nodes.push(part.trail);
        break;
      default:
        break;
    }
  });

  if (nodes.length === 1) return nodes[0];

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}
