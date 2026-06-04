import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import { HomeSectionListRow } from "@/components/sections/HomeSectionArticleFeed";

type Props = {
  articles: NewsArticle[];
  /** Slug działu bieżącego artykułu — link pod listą. */
  category: string;
};

/** Czytaj dalej — pionowa lista + przejście do całego działu. */
export default function ReadNextSection({ articles, category }: Props) {
  if (articles.length === 0) return null;

  const cat = getCategoryInfo(category);

  return (
    <section className="container-site pb-8 reveal" aria-label="Czytaj dalej">
      <div className="card-surface overflow-hidden p-0">
        <div className="flex items-center gap-2.5 border-b border-hairline px-5 py-4">
          <span
            className="h-3.5 w-[3px] shrink-0 rounded-full bg-accent-blue"
            style={{ boxShadow: "0 0 10px rgba(47,109,255,0.45)" }}
          />
          <h2 className="overline text-text-secondary">Czytaj dalej</h2>
        </div>

        <div className="divide-y divide-hairline-faint border-t border-hairline-faint px-4 sm:px-5">
          {articles.map((article) => (
            <HomeSectionListRow key={article.id} article={article} />
          ))}
        </div>

        <div
          className="border-t border-hairline-faint px-4 py-4 sm:px-5 sm:py-5"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          <Link
            href={cat.href}
            className="surface-interactive group flex w-full min-h-[48px] items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300 hover:border-hairline-strong active:scale-[0.99] sm:px-5"
            style={{
              borderColor: `${cat.color}44`,
              background: `linear-gradient(135deg, ${cat.color}14 0%, ${cat.color}06 55%, transparent 100%)`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px -20px ${cat.color}55`,
            }}
          >
            <span className="min-w-0 text-left">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Ten sam temat
              </span>
              <span className="mt-0.5 block text-[14px] font-semibold leading-snug text-text-primary sm:text-[14.5px]">
                Zobacz wszystkie artykuły z działu{" "}
                <span style={{ color: cat.color }}>{cat.label}</span>
              </span>
            </span>
            <span
              className="flex shrink-0 items-center gap-1 rounded-full border border-hairline-faint px-3 py-1.5 text-[12px] font-semibold transition-all group-hover:border-hairline-strong"
              style={{
                color: cat.color,
                background: "var(--glass-fill)",
              }}
            >
              Przejdź
              <ChevronRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
