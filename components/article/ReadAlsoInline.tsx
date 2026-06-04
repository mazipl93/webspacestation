import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";

function ReadAlsoCard({ article }: { article: NewsArticle }) {
  const meta = getCategoryInfo(article.category);
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan">
          {article.title}
        </p>
        <span className="mt-2 text-[10px] text-text-muted">{article.timeLabel}</span>
      </div>
      <div
        className="img-sheen relative w-[72px] shrink-0 self-stretch overflow-hidden sm:w-[80px] min-h-[72px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fallbackSeed={article.slug}
          fallbackCategory={article.category}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
        <span
          className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-md"
          style={{
            color: meta.color,
            background: "rgba(0,0,0,0.55)",
          }}
        >
          <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>
    </Link>
  );
}

type Props = {
  articles: NewsArticle[];
  categoryLabel: string;
};

/** Mid-article internal links — same category, after first body paragraphs. */
export default function ReadAlsoInline({ articles, categoryLabel }: Props) {
  if (articles.length === 0) return null;

  return (
    <aside
      className="my-8 rounded-xl border border-hairline bg-glass/40 p-4 sm:p-5"
      aria-labelledby="read-also-heading"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="h-3.5 w-[3px] shrink-0 rounded-full bg-accent-blue"
          style={{ boxShadow: "0 0 10px rgba(47,109,255,0.45)" }}
        />
        <h2 id="read-also-heading" className="overline text-text-secondary">
          Czytaj również
        </h2>
        <span className="text-[11px] text-text-muted">· {categoryLabel}</span>
      </div>
      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <ReadAlsoCard key={article.id} article={article} />
        ))}
      </div>
      <Link
        href={`/${articles[0]?.category ?? "aktualnosci"}`}
        className="group mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-text-tertiary transition-colors duration-300 hover:text-accent-cyan"
      >
        Więcej z tej kategorii
        <ChevronRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </aside>
  );
}
