import Link from "next/link";
import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_INFO, CATEGORY_SLUG_ORDER } from "@/lib/categories";
import { HOMEPAGE_LAYOUT_V2, SITE_CONTAINER } from "@/lib/site-layout";
import type { NewsArticle } from "@/types";
import type { HomepageContent } from "@/lib/home/homepage-content";
import ArticleCard from "@/components/article/ArticleCard";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import CoverImage from "@/components/article/CoverImage";
import HomepageTopZone from "@/components/sections/HomepageTopZone";
import PopularArticles from "@/components/sections/PopularArticles";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";
import { HomeSectionMobileFeed } from "@/components/sections/HomeSectionArticleFeed";
import {
  categorySectionTheme,
  type SectionThemeConfig,
} from "@/lib/home/homepage-section-themes";

// ─── Category presentation ────────────────────────────────────────────────────

const CATEGORY_LAYOUT: Record<
  string,
  {
    variant: "hero-strip" | "accent-bar" | "banner" | "minimal";
    prominent?: boolean;
  }
> = {
  misje: { variant: "hero-strip", prominent: true },
  astronomia: { variant: "accent-bar", prominent: true },
  nauka: { variant: "hero-strip", prominent: true },
  technologie: { variant: "hero-strip" },
  iss: { variant: "accent-bar" },
  "ziemia-z-kosmosu": { variant: "banner" },
};

const CATEGORY_META = Object.fromEntries(
  Object.entries(CATEGORY_INFO).map(([slug, info]) => [
    slug,
    {
      ...info,
      ...CATEGORY_LAYOUT[slug],
    },
  ])
) as Record<
  string,
  {
    label: string;
    color: string;
    href: string;
    description: string;
    variant: "hero-strip" | "accent-bar" | "banner" | "minimal";
    prominent?: boolean;
  }
>;

const CATEGORY_ORDER = CATEGORY_SLUG_ORDER;


function CategorySplitLeadDesktop({
  meta,
  lead,
  rest,
}: {
  meta: (typeof CATEGORY_META)[string];
  lead: NewsArticle;
  rest: NewsArticle[];
}) {
  return (
    <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-5">
      <Link
        href={`/aktualnosci/${lead.slug}`}
        className="surface-interactive group relative min-h-[260px] overflow-hidden rounded-xl border border-hairline"
      >
        <CoverImage
          src={lead.image}
          alt={lead.title}
          fill
          quality={80}
          sizes="(max-width: 1320px) 58vw, 720px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.92) 0%, rgba(5,7,9,0.35) 55%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="mb-2">
            <ArticleMetaChips article={lead} compact hideCategory />
          </div>
          <span
            className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: meta.color }}
            />
            {meta.label}
          </span>
          <p className="text-[20px] font-bold leading-snug text-text-primary">
            {lead.title}
          </p>
          <p className="mt-2 line-clamp-2 text-[16px] leading-relaxed text-text-tertiary md:text-[15px]">
            {lead.excerpt}
          </p>
        </div>
      </Link>
      <div className="grid grid-cols-1 gap-4">
        {rest.map((article) => (
          <ArticleCard key={article.id} article={article} compact />
        ))}
      </div>
    </div>
  );
}

function CategoryEmptyPlaceholder({
  meta,
}: {
  meta: { label: string; color: string; href: string };
}) {
  return (
    <div
      className="mt-4 rounded-xl border border-dashed px-6 py-10 text-center sm:px-10 sm:py-12"
      style={{ borderColor: `${meta.color}33`, background: `${meta.color}06` }}
    >
      <p className="text-[15px] text-text-secondary">Brak artykułów.</p>
      <Link
        href={meta.href}
        className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-medium transition-opacity hover:opacity-80"
        style={{ color: meta.color }}
      >
        Zobacz dział
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function CategorySection({
  slug,
  articles,
  desktopLayout = "legacy",
  themeOverride,
  showWhenEmpty = false,
}: {
  slug: string;
  articles: NewsArticle[];
  desktopLayout?: "legacy" | "split-lead";
  themeOverride?: Partial<SectionThemeConfig>;
  /** Pokaż nagłówek sekcji bez artykułów (np. Nauka przed pierwszą publikacją). */
  showWhenEmpty?: boolean;
}) {
  const meta = CATEGORY_META[slug];
  if (!meta) return null;
  if (articles.length === 0 && !showWhenEmpty) return null;

  const themeConfig = { ...categorySectionTheme(slug, meta), ...themeOverride };

  const header = <DepartmentSectionHeader config={themeConfig} />;

  let body: ReactNode;

  if (articles.length === 0) {
    body = <CategoryEmptyPlaceholder meta={meta} />;
  } else {
    const prominent = meta.variant === "hero-strip" && (meta.prominent ?? false);

    if (desktopLayout === "split-lead") {
      const [lead, ...rest] = articles;
      body = lead ? (
        <>
          <HomeSectionMobileFeed
            articles={articles}
            accent={meta.color}
            categoryLabel={meta.label}
          />
          <CategorySplitLeadDesktop meta={meta} lead={lead} rest={rest} />
        </>
      ) : null;
    } else if (meta.variant === "hero-strip") {
      const [lead, ...rest] = articles;
      body = (
        <>
          <HomeSectionMobileFeed
            articles={articles}
            accent={meta.color}
            categoryLabel={meta.label}
            prominent={prominent}
          />
          <div
            className={cn(
              "hidden grid-cols-1 gap-5 lg:grid",
              prominent
                ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
                : "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]",
            )}
          >
            {lead ? (
              <Link
                href={`/aktualnosci/${lead.slug}`}
                className={cn(
                  "surface-interactive group relative overflow-hidden rounded-xl border border-hairline",
                  prominent ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[240px]",
                )}
              >
                <CoverImage
                  src={lead.image}
                  alt={lead.title}
                  fill
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 660px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: prominent
                      ? "linear-gradient(to top, rgba(5,7,9,0.94) 0%, rgba(5,7,9,0.35) 55%, transparent 100%)"
                      : "linear-gradient(to top, rgba(5,7,9,0.92) 0%, transparent 60%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="mb-2">
                    <ArticleMetaChips article={lead} compact hideCategory />
                  </div>
                  <span
                    className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: meta.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: meta.color }}
                    />
                    {meta.label}
                  </span>
                  <p
                    className={cn(
                      "font-bold leading-snug text-text-primary",
                      prominent ? "text-[22px]" : "text-[20px]",
                    )}
                  >
                    {lead.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[16px] leading-relaxed text-text-tertiary md:text-[15px]">
                    {lead.excerpt}
                  </p>
                </div>
              </Link>
            ) : null}
            <div
              className={cn(
                "grid grid-cols-1 gap-4",
                prominent ? "lg:gap-3" : "sm:grid-cols-2 lg:grid-cols-1",
              )}
            >
              {rest.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  compact={prominent}
                />
              ))}
            </div>
          </div>
        </>
      );
    } else if (meta.variant === "banner") {
      body = (
        <>
          <HomeSectionMobileFeed
            articles={articles}
            accent={meta.color}
            categoryLabel={meta.label}
          />
          <div className="hidden grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      );
    } else {
      body = (
        <>
          <HomeSectionMobileFeed
            articles={articles}
            accent={meta.color}
            categoryLabel={meta.label}
          />
          <div
            className={cn(
              "hidden grid-cols-1 gap-5 lg:grid",
              meta.variant === "minimal"
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-2 xl:grid-cols-4",
            )}
          >
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                compact={meta.variant === "minimal"}
              />
            ))}
          </div>
        </>
      );
    }
  }

  return (
    <section className="reveal">
      <DepartmentSectionFrame
        theme={themeConfig.theme}
        accent={themeConfig.accent}
        accentAlt={themeConfig.accentAlt}
      >
        {header}
        {body}
      </DepartmentSectionFrame>
    </section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type ContentGridProps = {
  homepage: HomepageContent;
};

export default function ContentGrid({ homepage }: ContentGridProps) {
  const { allPublished, derived } = homepage;

  if (allPublished.length === 0) {
    return (
      <div className={cn(SITE_CONTAINER, "relative z-[1] py-20")}>
        <div className="card-surface px-8 py-16 text-center">
          <p className="text-[15px] text-text-secondary">
            Brak opublikowanych artykułów.
          </p>
          <Link
            href="/aktualnosci"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-accent-cyan hover:underline"
          >
            Przejdź do aktualności
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(SITE_CONTAINER, "relative z-[1]")}>
      <HomepageTopZone
        heroSlides={derived.heroSlides}
        latest={derived.latest}
        weekTopicPick={derived.weekTopicPick}
        weekTopicConfig={derived.weekTopicConfig}
      />

      <div className="mt-10 space-y-14 pb-14 md:mt-12 md:space-y-14">
        <PopularArticles
          articles={allPublished}
          excludeSlugs={derived.excludeForPopular}
        />

        <div className="space-y-12 md:space-y-14">
          {HOMEPAGE_LAYOUT_V2 && (
            <CategorySection
              slug="nauka"
              articles={derived.naukaFeatured}
              desktopLayout="split-lead"
              showWhenEmpty
            />
          )}
          {derived.categoryArticles.map(({ slug, articles: catArticles }) => (
            <CategorySection
              key={slug}
              slug={slug}
              articles={catArticles}
              desktopLayout={HOMEPAGE_LAYOUT_V2 ? "split-lead" : "legacy"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
