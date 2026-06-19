import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getArticlesByCategoryPage,
  getLatestArticlesPage,
} from "@/lib/articles";
import {
  ARTICLE_FEED_PAGE_SIZE,
  clampListingPage,
  listingPageHref,
  type ListingPageQuery,
} from "@/lib/seo/article-listing";
import { CATEGORY_SLUG_ORDER, getCategoryInfo } from "@/lib/categories";
import { SITE_CONTAINER } from "@/lib/site-layout";
import ArticleCard from "@/components/article/ArticleCard";
import DepartmentSubscribeButton from "@/components/departments/DepartmentSubscribeButton";
import ArticleFeedPagination from "@/components/sections/ArticleFeedPagination";
import CategoryOpsLaunchBanner from "@/components/discover/CategoryOpsLaunchBanner";
import { cn } from "@/lib/cn";

const FEED_FILTERS = [
  { label: "Wszystkie", href: "/aktualnosci", key: null },
  ...CATEGORY_SLUG_ORDER.map((slug) => ({
    label: getCategoryInfo(slug).label,
    href: getCategoryInfo(slug).href,
    key: slug,
  })),
] as const;

type Props = {
  /** Omit for the "all articles" feed; pass a category slug for filtered views. */
  category?: string;
  page?: number;
  basePath: string;
  /** Preserved in pagination on /aktualnosci (?dzial=). */
  listingQuery?: ListingPageQuery;
};

export default async function ArticleFeedSection({
  category,
  page = 1,
  basePath,
  listingQuery,
}: Props) {
  const feed = category
    ? await getArticlesByCategoryPage(category, page, ARTICLE_FEED_PAGE_SIZE)
    : await getLatestArticlesPage(page, ARTICLE_FEED_PAGE_SIZE);

  if (page > 1 && feed.totalPages > 0 && page > feed.totalPages) {
    redirect(listingPageHref(basePath, feed.totalPages, listingQuery));
  }
  if (page > 1 && feed.totalPages === 0) {
    redirect(listingPageHref(basePath, 1, listingQuery));
  }

  const safePage = clampListingPage(page, feed.totalPages || 1);
  const articles = feed.items;

  const meta = category ? getCategoryInfo(category) : null;
  const accent = meta?.color ?? "#2f6dff";
  const title = meta?.label ?? "Najnowsze";
  const showFeatured = Boolean(category && safePage === 1 && articles.length > 0);
  const featured = showFeatured ? articles[0] : null;
  const rest = showFeatured ? articles.slice(1) : articles;
  const useAktualnosciFilters = basePath === "/aktualnosci";

  return (
    <>
      <div
        className="border-b border-hairline"
        style={{
          background: `radial-gradient(ellipse 70% 140% at 0% 0%, ${accent}22 0%, transparent 58%), transparent`,
        }}
      >
        <div className={cn(SITE_CONTAINER, "pb-5 pt-28")}>
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
              {category ? (
                <div className="mt-4">
                  <DepartmentSubscribeButton categorySlug={category} />
                </div>
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
                  {feed.total}{" "}
                  {feed.total === 1 ? "artykuł" : "artykułów"}
                  {feed.totalPages > 1 ? (
                    <span className="text-text-muted">
                      {" "}
                      · strona {safePage}/{feed.totalPages}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={SITE_CONTAINER}>
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
            {FEED_FILTERS.map((f) => {
              const isActive = f.key === (category ?? null);
              const href = useAktualnosciFilters
                ? f.key
                  ? listingPageHref("/aktualnosci", 1, { dzial: f.key })
                  : "/aktualnosci"
                : f.href;
              return (
                <Link
                  key={f.href}
                  href={href}
                  className={cn(
                    "mb-3 mt-1 flex shrink-0 items-center rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-text-secondary hover:bg-glass-hover hover:text-text-primary",
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
        {category === "misje" && safePage === 1 ? (
          <CategoryOpsLaunchBanner />
        ) : null}
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
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
              {showFeatured && featured ? (
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
            <ArticleFeedPagination
              basePath={basePath}
              page={safePage}
              totalPages={feed.totalPages}
              listingQuery={listingQuery}
            />
          </>
        )}
      </div>
    </>
  );
}
