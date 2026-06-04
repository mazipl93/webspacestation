import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getArticlesByCategory, getLatestArticles } from "@/lib/articles";
import { rankLatest } from "@/lib/home/rank-articles";

const LATEST_FEED_LIMIT = 40;
import { getCategoryInfo } from "@/lib/categories";
import { SITE_CONTAINER } from "@/lib/site-layout";
import ArticleCard from "@/components/article/ArticleCard";
import { cn } from "@/lib/cn";

// Category filter strip — each entry routes to a real page
const FEED_FILTERS = [
  { label: "Wszystkie",        href: "/aktualnosci",      key: null               },
  { label: "Misje",            href: "/misje",            key: "misje"            },
  { label: "Astronomia",       href: "/astronomia",       key: "astronomia"       },
  { label: "Technologie",      href: "/technologie",      key: "technologie"      },
  { label: "AI",               href: "/ai",               key: "ai"               },
  { label: "Ziemia z kosmosu", href: "/ziemia-z-kosmosu", key: "ziemia-z-kosmosu" },
  { label: "ISS",              href: "/iss",              key: "iss"              },
] as const;

type Props = {
  /** Omit for the "all articles" feed; pass a category slug for filtered views. */
  category?: string;
};

export default async function ArticleFeedSection({ category }: Props) {
  const articles = category
    ? rankLatest(await getArticlesByCategory(category), LATEST_FEED_LIMIT)
    : await getLatestArticles(LATEST_FEED_LIMIT);

  const meta   = category ? getCategoryInfo(category) : null;
  const accent = meta?.color ?? "#2f6dff";
  const title  = meta?.label ?? "Najnowsze";

  const subtitle = category ? (meta?.description ?? null) : null;

  const featured = category && articles.length > 0 ? articles[0] : null;
  const rest = category && articles.length > 0 ? articles.slice(1) : articles;

  return (
    <>
      <div
        className="border-b border-hairline"
        style={{
          background: `radial-gradient(ellipse 70% 140% at 0% 0%, ${accent}22 0%, transparent 58%), transparent`,
        }}
      >
        <div className={cn(SITE_CONTAINER, "pb-5 pt-[96px]")}>
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-1.5 text-[11px] text-text-tertiary"
          >
            <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
              WSS
            </Link>
            <ChevronRight size={11} className="opacity-40" />
            {category ? (
              <>
                <Link
                  href="/aktualnosci"
                  className="transition-colors duration-200 hover:text-text-primary"
                >
                  Aktualności
                </Link>
                <ChevronRight size={11} className="opacity-40" />
                <span style={{ color: accent }}>{meta?.label}</span>
              </>
            ) : (
              <span className="text-text-secondary">Aktualności</span>
            )}
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[720px]">
              {category && (
                <span
                  className="overline mb-2 block"
                  style={{ color: accent }}
                >
                  Kategoria
                </span>
              )}
              <h1
                className="font-extrabold text-text-primary"
                style={{
                  fontSize: "clamp(1.875rem, 5vw, 2.25rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.06,
                }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-[16px] leading-relaxed text-text-tertiary md:text-[14px]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5"
                style={{ background: "var(--glass-fill)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: accent }}
                />
                <span className="text-[12px] font-medium text-text-secondary">
                  {articles.length}{" "}
                  {articles.length === 1 ? "artykuł" : "artykułów"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={SITE_CONTAINER}>
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
            {FEED_FILTERS.map((f) => {
              const isActive = f.key === (category ?? null);
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className={cn(
                    "mb-3 mt-1 flex shrink-0 items-center rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-text-secondary hover:bg-glass-hover hover:text-text-primary"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: accent,
                          boxShadow: `0 4px 16px -6px ${accent}99`,
                        }
                      : {}
                  }
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className={cn(SITE_CONTAINER, "py-9")}>
        {articles.length === 0 ? (
          <div className="card-surface px-8 py-16 text-center">
            <p className="text-[14px] text-text-secondary">
              Brak artykułów w tej kategorii.
            </p>
            <Link
              href="/aktualnosci"
              className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-medium text-accent-cyan hover:underline"
            >
              Zobacz wszystkie artykuły
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
            {category && featured ? (
              <>
                <ArticleCard
                  article={featured}
                  featured
                  className="lg:col-span-2"
                />
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </>
            ) : (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
