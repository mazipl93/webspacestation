import { Clock } from "lucide-react";
import type { NewsArticle } from "@/types";
import { cn } from "@/lib/cn";
import DepartmentSubscribeButton from "@/components/departments/DepartmentSubscribeButton";

type Props = {
  article: NewsArticle;
  categoryLabel: string;
  categoryColor: string;
  className?: string;
};

/** Kategoria, data publikacji, czas czytania — panel boczny artykułu. */
export default function ArticleInfoPanel({
  article,
  categoryLabel,
  categoryColor,
  className,
}: Props) {
  const fullDate = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={cn("article-panel card-surface p-5", className)}>
      <h2 className="overline mb-4 text-text-tertiary">Informacje</h2>
      <dl className="flex flex-col gap-3.5">
        <div>
          <dt className="mb-1 text-[10px] uppercase tracking-[0.1em] text-text-muted">
            Kategoria
          </dt>
          <dd
            className="flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: categoryColor }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: categoryColor }}
            />
            {categoryLabel}
          </dd>
          <div className="mt-3">
            <DepartmentSubscribeButton
              categorySlug={article.category}
              className="w-full max-w-none"
            />
          </div>
        </div>

        <span className="h-px" style={{ background: "var(--hairline)" }} />

        <div>
          <dt className="mb-1 text-[10px] uppercase tracking-[0.1em] text-text-muted">
            Opublikowano
          </dt>
          <dd className="capitalize text-[12px] leading-snug text-text-secondary">
            {fullDate}
          </dd>
        </div>

        <span className="h-px" style={{ background: "var(--hairline)" }} />

        <div>
          <dt className="mb-1 text-[10px] uppercase tracking-[0.1em] text-text-muted">
            Czas czytania
          </dt>
          <dd className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <Clock size={12} className="text-text-muted" />
            {article.readTime ?? 3} min
          </dd>
        </div>
      </dl>
    </div>
  );
}
