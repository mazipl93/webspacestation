import type { ArticleContentBlock } from "@/lib/articles/parse-content-blocks";
import type { HeadingLevel } from "@/lib/articles/content-heading";
import ArticleFigure from "@/components/article/ArticleFigure";
import ArticleVideoEmbed from "@/components/article/ArticleVideoEmbed";
import { renderInlineMarkdown } from "@/lib/articles/render-inline-markdown";
import { cn } from "@/lib/cn";

const BODY_TEXT_STYLE = {
  fontSize: "var(--text-body)",
  lineHeight: 1.8,
} as const;

const HEADING_CLASS: Record<HeadingLevel, string> = {
  2: "mb-4 mt-8 text-[1.35rem] font-extrabold leading-snug text-text-primary sm:text-[1.5rem]",
  3: "mb-3 mt-7 text-[1.15rem] font-bold leading-snug text-text-primary sm:text-[1.25rem]",
  4: "mb-3 mt-6 text-[1.05rem] font-bold leading-snug text-text-primary",
};

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
      {blocks.map((block, i) => {
        if (block.kind === "figure") {
          return (
            <ArticleFigure
              key={`fig-${i}`}
              src={block.src}
              caption={block.caption}
            />
          );
        }
        if (block.kind === "video") {
          return (
            <ArticleVideoEmbed
              key={`vid-${i}`}
              src={block.src}
              caption={block.caption}
            />
          );
        }
        if (block.kind === "heading") {
          const Tag = block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4";
          return (
            <Tag key={`h-${i}`} className={cn(HEADING_CLASS[block.level])}>
              {renderInlineMarkdown(block.text)}
            </Tag>
          );
        }
        if (block.kind === "list") {
          return (
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
          );
        }
        return (
          <p
            key={`p-${i}`}
            className={paragraphClassName}
            style={BODY_TEXT_STYLE}
          >
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </>
  );
}
