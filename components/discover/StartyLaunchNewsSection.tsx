import Link from "next/link";
import { ChevronRight, Newspaper } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import { toNewsArticle } from "@/lib/articles";
import type { ArticleListItem } from "@/lib/server/articles";

type Props = {
  articles: ArticleListItem[];
  variant?: "default" | "embedded";
};

export default function StartyLaunchNewsSection({
  articles,
  variant = "default",
}: Props) {
  if (articles.length === 0) return null;

  const cards = articles.map(toNewsArticle);
  const embedded = variant === "embedded";

  return (
    <section
      className={embedded ? undefined : "mt-10 border-t border-hairline pt-8"}
      aria-labelledby="starty-launch-news-heading"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-cyan">
            Misje
          </p>
          <h2
            id="starty-launch-news-heading"
            className="mt-1 flex items-center gap-2 text-[18px] font-semibold text-text-primary sm:text-[20px]"
          >
            <Newspaper size={18} className="text-accent-cyan" aria-hidden />
            Zapowiedzi i newsy
          </h2>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-text-tertiary">
            Artykuły powiązane z nadchodzącymi startami — po publikacji w CMS pojawią się też na kartach harmonogramu.
          </p>
        </div>
        <Link
          href="/aktualnosci?dzial=misje"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-cyan hover:underline"
        >
          Wszystkie z Misji
          <ChevronRight size={14} aria-hidden />
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}
