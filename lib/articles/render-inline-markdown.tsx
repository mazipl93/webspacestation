import { Fragment, type ReactNode } from "react";

/** Minimal inline Markdown: `**bold**` → <strong> (treść redakcyjna w DB). */
export function renderInlineMarkdown(text: string): ReactNode {
  if (!text.includes("**")) return text;

  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    nodes.push(<strong key={match.index}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  if (nodes.length === 0) return text;
  if (nodes.length === 1) return nodes[0];

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}
