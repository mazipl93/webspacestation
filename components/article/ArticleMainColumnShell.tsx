import {
  ARTICLE_PAGE_GRID,
  ARTICLE_PAGE_SIDEBAR_STUB,
  ARTICLE_SHELL,
} from "@/lib/ui/article-editorial-layout";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  shellClassName?: string;
  as?: "div" | "section";
  "aria-label"?: string;
};

/**
 * Aligns bottom-of-article blocks (Koniec, Czytaj dalej, Powiązane)
 * to the same main column width as Dyskusja / ArticleBody.
 */
export default function ArticleMainColumnShell({
  children,
  className,
  shellClassName,
  as: Tag = "div",
  "aria-label": ariaLabel,
}: Props) {
  return (
    <Tag className={cn(ARTICLE_SHELL, shellClassName)} aria-label={ariaLabel}>
      <div className={ARTICLE_PAGE_GRID}>
        <div className={cn("min-w-0", className)}>{children}</div>
        <div aria-hidden className={ARTICLE_PAGE_SIDEBAR_STUB} />
      </div>
    </Tag>
  );
}
