import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import type { NewsArticle } from "@/types";

/** Vertical headline rail with thumbnails — sits beside the hero on desktop. */
export default function TopStoriesList({ articles }: { articles: NewsArticle[] }) {
  const items = articles.slice(0, 5);
  if (items.length === 0) return null;

  return (
    <aside className="card-surface flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="h-4 w-[3px] shrink-0 rounded-full bg-accent-live"
          style={{ boxShadow: "0 0 10px rgba(255,69,58,0.55)" }}
        />
        <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-text-secondary sm:text-[11px]">
          Ważne teraz
        </h2>
      </div>

      <ol className="flex flex-1 flex-col gap-0 divide-y divide-hairline-faint">
        {items.map((article, i) => (
            <li key={article.id}>
              <Link
                href={`/aktualnosci/${article.slug}`}
                className="surface-interactive group flex gap-3.5 py-4 first:pt-0 last:pb-0 sm:gap-3 sm:py-3.5"
              >
                <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg border border-hairline-faint sm:h-16 sm:w-16">
                  <Image
                    src={article.imageUrl}
                    alt=""
                    fill
                    sizes="88px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className="tabular-nums text-[13px] font-bold text-text-muted sm:text-[11px]"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <ArticleMetaChips article={article} compact />
                  </div>
                  <p className="line-clamp-3 text-[17px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan sm:text-[14px] sm:line-clamp-2">
                    {article.title}
                  </p>
                  <span className="mt-2 block text-[13px] text-text-muted sm:mt-1.5 sm:text-[11px]">
                    {article.timeLabel}
                  </span>
                </div>
              </Link>
            </li>
        ))}
      </ol>

      <Link
        href="/aktualnosci"
        className="mt-4 flex min-h-[48px] items-center justify-center gap-1 border-t border-hairline-faint pt-4 text-[15px] font-medium text-text-tertiary transition-colors hover:text-accent-cyan sm:min-h-[44px] sm:text-[13px]"
      >
        Wszystkie aktualności
        <ChevronRight size={16} className="sm:h-3.5 sm:w-3.5" />
      </Link>
    </aside>
  );
}
