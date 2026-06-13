import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getArticlesByTagPage } from "@/lib/articles";
import {
  ARTICLE_FEED_PAGE_SIZE,
  clampListingPage,
  listingPageHref,
  parseListingPage,
} from "@/lib/seo/article-listing";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";
import { buildListingPageJsonLd } from "@/lib/seo/json-ld";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_CONTAINER } from "@/lib/site-layout";
import { cn } from "@/lib/cn";
import ArticleCard from "@/components/article/ArticleCard";
import ArticleFeedPagination from "@/components/sections/ArticleFeedPagination";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export type HubRelated = {
  label: string;
  href: string;
};

export type HubConfig = {
  /** Slug trasy, np. "nasa" */
  slug: string;
  /** Wyświetlana nazwa, np. "NASA" */
  title: string;
  /** Krótki podtytuł pod tytułem */
  tagline: string;
  /** SEO description */
  description: string;
  /** Kolor akcentu (hex) */
  accent: string;
  /** Tagi do filtrowania artykułów (hasSome) */
  tags: string[];
  /** Treść edytorska jako akapity */
  intro: string[];
  /** Linki do powiązanych hubów */
  related: HubRelated[];
};

type PageProps = {
  searchParams: Promise<{ strona?: string }>;
};

export async function buildHubMetadata(
  config: HubConfig,
  searchParams: PageProps["searchParams"],
): Promise<Metadata> {
  const page = parseListingPage((await searchParams).strona);
  return buildListingPageMetadata({
    title: `${config.title} · misje, starty i odkrycia`,
    description: config.description,
    path: `/${config.slug}`,
    page,
  });
}

export default async function HubPageShell({
  config,
  searchParams,
}: {
  config: HubConfig;
  searchParams: PageProps["searchParams"];
}) {
  const page = parseListingPage((await searchParams).strona);

  const feed = await getArticlesByTagPage(config.tags, page, ARTICLE_FEED_PAGE_SIZE);

  if (page > 1 && feed.totalPages > 0 && page > feed.totalPages) {
    redirect(listingPageHref(`/${config.slug}`, feed.totalPages));
  }
  if (page > 1 && feed.totalPages === 0) {
    redirect(`/${config.slug}`);
  }

  const safePage = clampListingPage(page, feed.totalPages || 1);
  const basePath = `/${config.slug}`;

  const showFeatured = safePage === 1 && feed.items.length > 0;
  const featured = showFeatured ? feed.items[0] : null;
  const rest = showFeatured ? feed.items.slice(1) : feed.items;

  return (
    <>
      <JsonLd
        data={buildListingPageJsonLd(
          `${config.title} — misje, starty i odkrycia`,
          config.description,
          `/${config.slug}`,
          [
            { name: "Strona główna", path: "/" },
            { name: config.title, path: `/${config.slug}` },
          ],
        )}
      />
      <Navbar />
      <main className="min-h-screen">
        {/* Hub header */}
        <div
          className="border-b border-hairline"
          style={{
            background: `radial-gradient(ellipse 80% 160% at 0% 0%, ${config.accent}1a 0%, transparent 55%), transparent`,
          }}
        >
          <div className={cn(SITE_CONTAINER, "pb-8 pt-28")}>
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-1.5 text-[11px] text-text-tertiary"
            >
              <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
                WSS
              </Link>
              <ChevronRight size={11} className="opacity-40" />
              <span style={{ color: config.accent }}>{config.title}</span>
            </nav>

            <div className="max-w-[760px]">
              {/* Title */}
              <h1
                className="font-extrabold text-text-primary"
                style={{
                  fontSize: "clamp(2rem, 6vw, 2.75rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  color: config.accent,
                }}
              >
                {config.title}
              </h1>
              <p className="mt-2 text-[15px] font-medium text-text-secondary">
                {config.tagline}
              </p>

              {/* Editorial intro */}
              <div className="mt-5 space-y-3 text-[14px] leading-relaxed text-text-secondary">
                {config.intro.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Related hubs */}
              {config.related.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
                    Zobacz też
                  </span>
                  {config.related.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      className="rounded-full border border-hairline px-3 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                      style={{ background: "var(--glass-fill)" }}
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Article count */}
            {feed.total > 0 && (
              <div className="mt-6">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5"
                  style={{ background: "var(--glass-fill)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: config.accent }}
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
            )}
          </div>
        </div>

        {/* Article feed */}
        <div className={cn(SITE_CONTAINER, "py-9")}>
          {feed.items.length === 0 ? (
            <div className="card-surface px-8 py-16 text-center">
              <p className="text-[14px] text-text-secondary">
                Brak artykułów w tej sekcji.
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
