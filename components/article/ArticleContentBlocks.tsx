import type { ArticleContentBlock } from "@/lib/articles/parse-content-blocks";
import ArticleFigure from "@/components/article/ArticleFigure";
import { renderInlineMarkdown } from "@/lib/articles/render-inline-markdown";

const BODY_TEXT_STYLE = {
  fontSize: "var(--text-body)",
  lineHeight: 1.8,
} as const;

type ArticleContentBlocksProps = {
  blocks: ArticleContentBlock[];
  paragraphClassName?: string;
  listClassName?: string;
  itemClassName?: string;
};

export default function ArticleContentBlocks({
  blocks,
  paragraphClassName = "mb-6 text-text-secondary",
  listClassName = "mb-6 list-disc space-y-2 pl-6 text-text-secondary",
  itemClassName = "leading-relaxed",
}: ArticleContentBlocksProps) {
  return (
    <>
      {blocks.map((block, i) =>
        block.kind === "figure" ? (
          <ArticleFigure
            key={`fig-${i}`}
            src={block.src}
            caption={block.caption}
          />
        ) : block.kind === "list" ? (
          <ul
            key={`list-${i}`}
            className={listClassName}
            style={BODY_TEXT_STYLE}
          >
            {block.items.map((item, j) => (
              <li key={j} className={itemClassName}>
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        ) : (
          <p
            key={`p-${i}`}
            className={paragraphClassName}
            style={BODY_TEXT_STYLE}
          >
            {renderInlineMarkdown(block.text)}
          </p>
        )
      )}
    </>
  );
}
