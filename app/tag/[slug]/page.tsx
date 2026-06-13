import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Tag } from "lucide-react";
import { getArticlesByTagPage } from "@/lib/articles";
import {
  ARTICLE_FEED_PAGE_SIZE,
  clampListingPage,
  listingPageHref,
  parseListingPage,
} from "@/lib/seo/article-listing";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";
import { SITE_CONTAINER } from "@/lib/site-layout";
import { cn } from "@/lib/cn";
import ArticleCard from "@/components/article/ArticleCard";
import ArticleFeedPagination from "@/components/sections/ArticleFeedPagination";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ strona?: string }>;
};

function formatTagLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = parseListingPage((await searchParams).strona);
  const label = formatTagLabel(slug);
  return buildListingPageMetadata({
    title: `#${label} · artykuły`,
    description: `Artykuły i newsy kosmiczne oznaczone tagiem "${label}" w serwisie Web Space Station.`,
    path: `/tag/${slug}`,
    page,
  });
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = parseListingPage((await searchParams).strona);

  const feed = await getArticlesByTagPage(slug, page, ARTICLE_FEED_PAGE_SIZE);

  // Tag nie istnieje (0 wyników na stronie 1) — 404
  if (feed.total === 0 && page === 1) {
    notFound();
  }

  // Poza zakresem paginacji
  if (page > 1 && feed.totalPages > 0 && page > feed.totalPages) {
    redirect(listingPageHref(`/tag/${slug}`, feed.totalPages));
  }
  if (page > 1 && feed.totalPages === 0) {
    redirect(`/tag/${slug}`);
  }

  const safePage = clampListingPage(page, feed.totalPages || 1);
  const label = formatTagLabel(slug);
  const basePath = `/tag/${slug}`;

  const showFeatured = safePage === 1 && feed.items.length > 0;
  const featured = showFeatured ? feed.items[0] : null;
  const rest = showFeatured ? feed.items.slice(1) : feed.items;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="border-b border-hairline">
          <div className={cn(SITE_CONTAINER, "pb-5 pt-28")}>
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-5 flex items-center gap-1.5 text-[11px] text-text-tertiary"
            >
              <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
                WSS
              </Link>
              <ChevronRight size={11} className="opacity-40" />
              <Link
                href="/aktualnosci"
                className="transition-colors duration-200 hover:text-text-primary"
              >
                Aktualności
              </Link>
              <ChevronRight size={11} className="opacity-40" />
              <span className="text-text-secondary">#{label}</span>
            </nav>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[720px]">
                <div className="mb-2 flex items-center gap-2">
                  <Tag size={14} className="text-text-tertiary" />
                  <span className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                    Temat
                  </span>
                </div>
                <h1
                  className="font-extrabold text-text-primary"
                  style={{
                    fontSize: "clamp(1.875rem, 5vw, 2.25rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.06,
                  }}
                >
                  #{label}
                </h1>
              </div>

              <div
                className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5"
                style={{ background: "var(--glass-fill)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
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

        {/* Feed */}
        <div className={cn(SITE_CONTAINER, "py-9")}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
            {showFeatured && featured ? (
              <>
                <ArticleCard article={featured} featured className="lg:col-span-2" />
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </>
            ) : (
              feed.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
          <ArticleFeedPagination
            basePath={basePath}
            page={safePage}
            totalPages={feed.totalPages}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
