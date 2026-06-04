import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_INFO } from "@/lib/categories";
import {
  HOMEPAGE_LAYOUT_V2,
  HOMEPAGE_V2_CATEGORY_SLUGS,
  SITE_CONTAINER,
} from "@/lib/site-layout";
import type { NewsArticle } from "@/types";
import {
  getAllArticles,
  getHeroSlideArticles,
} from "@/lib/articles";
import {
  buildHomepageHeroSlides,
  pickHeroLead,
} from "@/lib/home/hero-slides";
import {
  markSlugsUsed,
  pickHomepageLatest,
  rankImportantNow,
  rankLatest,
  withSectionFallback,
} from "@/lib/home/rank-articles";
import ArticleCard from "@/components/article/ArticleCard";
import CoverImage from "@/components/article/CoverImage";
import HomepageTopZone from "@/components/sections/HomepageTopZone";
import PopularArticles from "@/components/sections/PopularArticles";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";
import { HomeSectionMobileFeed } from "@/components/sections/HomeSectionArticleFeed";
import {
  categorySectionTheme,
  OPS_THEME,
} from "@/lib/home/homepage-section-themes";
import {
  getWeekTopicConfig,
  pickWeekTopicArticles,
} from "@/lib/home/week-topic";
import LaunchCard from "@/components/discover/LaunchCard";
import LaunchCountdown from "@/components/discover/LaunchCountdown";
import OpsMissionMap from "@/components/discover/OpsMissionMap";
import OpsTimeline from "@/components/discover/OpsTimeline";
import { getOpsData } from "@/lib/ops/get-ops-data";
import type { OpsSnapshot } from "@/lib/ops/types";

const IMPORTANT_POOL = 14;
/** Homepage Najnowsze — pełna lista wg publishedAt (hero nie wyklucza). */
const LATEST_FEED_LIMIT = 12;
/** Mobile — pionowa lista pod hero (kilka pozycji od razu widocznych). */
const LATEST_MOBILE_LIST_LIMIT = 6;
// ─── Category presentation ────────────────────────────────────────────────────

const CATEGORY_LAYOUT: Record<
  string,
  {
    variant: "hero-strip" | "accent-bar" | "banner" | "minimal";
    prominent?: boolean;
  }
> = {
  technologie: { variant: "hero-strip", prominent: true },
  misje: { variant: "hero-strip" },
  astronomia: { variant: "accent-bar" },
  "ziemia-z-kosmosu": { variant: "banner" },
  iss: { variant: "accent-bar" },
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

const CATEGORY_ORDER = [
  "technologie",
  "astronomia",
  "misje",
  "ziemia-z-kosmosu",
  "iss",
] as const;

function SectionHeader({
  label,
  accent = "#2f6dff",
  href,
  cta = "Zobacz wszystkie",
  large = false,
}: {
  label: string;
  accent?: string;
  href?: string;
  cta?: string;
  large?: boolean;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className="h-4 w-[3px] shrink-0 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}66` }}
        />
        <h2
          className={cn(
            "font-bold uppercase tracking-[0.14em] text-text-secondary",
            large ? "text-[15px] md:text-[14px]" : "text-[13px] md:text-[12px]"
          )}
        >
          {label}
        </h2>
      </div>
      {href && (
        <a
          href={href}
          className="group flex min-h-[44px] items-center gap-1 text-[14px] font-medium text-text-tertiary transition-colors duration-300 hover:text-text-primary md:text-[13px]"
        >
          {cta}
          <ChevronRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </a>
      )}
    </div>
  );
}

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

function CategorySection({
  slug,
  articles,
  desktopLayout = "legacy",
}: {
  slug: string;
  articles: NewsArticle[];
  desktopLayout?: "legacy" | "split-lead";
}) {
  const meta = CATEGORY_META[slug];
  if (!meta || articles.length === 0) return null;

  const themeConfig = categorySectionTheme(slug, meta);

  const header = <DepartmentSectionHeader config={themeConfig} />;

  let body: ReactNode;

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
                sizes="(max-width: 1024px) 100vw, 50vw"
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

// ─── Dashboard widgets (demoted below editorial content) ───────────────────────

function LiveMissionCenter({ ops }: { ops: OpsSnapshot }) {
  const next = ops.launches[0];
  const issLabel = ops.iss
    ? `${ops.iss.latitude.toFixed(1)}°, ${ops.iss.longitude.toFixed(1)}°`
    : "pozycja niedostępna";

  return (
    <section className="card-surface flex flex-col gap-3 p-5">
      <SectionHeader label="Centrum operacyjne" accent="#ff453a" />
      <p className="-mt-3 text-[10px] text-text-muted">
        {ops.live ? "ISS + najbliższy start · cache 5 min" : "Dane zapasowe — API offline"}
      </p>
      <div className="well flex-1 p-3.5">
        <h3 className="text-[15px] font-bold text-text-primary">ISS na orbicie</h3>
        <p className="mt-2 text-[11px] text-text-tertiary">{issLabel}</p>
        <Link
          href="/mapa"
          className="mt-3 inline-flex text-[11px] font-medium text-accent-cyan hover:text-accent-cyan/80"
        >
          Mapa →
        </Link>
      </div>
      {next && (
        <div className="well flex-1 p-3.5">
          <h3 className="text-[15px] font-bold text-text-primary">{next.mission}</h3>
          <p className="mt-2 text-[11px] text-text-tertiary">{next.site}</p>
          <div className="mt-2">
            <LaunchCountdown net={next.net} />
          </div>
          <Link
            href="/starty"
            className="mt-3 inline-flex text-[11px] font-medium text-accent-cyan hover:text-accent-cyan/80"
          >
            Wszystkie starty →
          </Link>
        </div>
      )}
    </section>
  );
}

function NadchodzaceStarty({ ops }: { ops: OpsSnapshot }) {
  return (
    <section className="homepage-ops-panel card-surface p-5">
      <SectionHeader
        label="Nadchodzące starty"
        accent="#38bdf8"
        href="/starty"
      />
      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {ops.launches.slice(0, 4).map((launch) => (
          <LaunchCard key={launch.id} launch={launch} href="/starty" />
        ))}
      </div>
    </section>
  );
}

function AktyweneMisje({ ops }: { ops: OpsSnapshot }) {
  const issLabel = ops.iss
    ? `${ops.iss.latitude.toFixed(2)}°, ${ops.iss.longitude.toFixed(2)}°`
    : undefined;

  return (
    <section className="homepage-ops-panel card-surface p-5">
      <SectionHeader label="Mapa operacyjna" href="/mapa" cta="Mapa kosmosu" />
      <OpsMissionMap pins={ops.mapPins} issCoords={issLabel} height={240} />
    </section>
  );
}

function TimelineWydarzen({ ops }: { ops: OpsSnapshot }) {
  return (
    <section className="card-surface p-5">
      <SectionHeader
        label="Oś czasu wydarzeń"
        href="/kalendarz"
        cta="Zobacz kalendarz"
      />
      <OpsTimeline events={ops.calendar} variant="strip" />
    </section>
  );
}

function DashboardWidgets({ ops }: { ops: OpsSnapshot }) {
  return (
    <section className="reveal">
      <DepartmentSectionFrame
        theme={OPS_THEME.theme}
        accent={OPS_THEME.accent}
        accentAlt={OPS_THEME.accentAlt}
      >
        <DepartmentSectionHeader config={OPS_THEME} />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <NadchodzaceStarty ops={ops} />
          <LiveMissionCenter ops={ops} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <AktyweneMisje ops={ops} />
          <TimelineWydarzen ops={ops} />
        </div>
      </DepartmentSectionFrame>
    </section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default async function ContentGrid() {
  const [allPublished, cmsHeroSlides, ops] = await Promise.all([
    getAllArticles(),
    getHeroSlideArticles(),
    getOpsData(),
  ]);

  if (allPublished.length === 0) {
    return (
      <div className={cn(SITE_CONTAINER, "py-20")}>
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

  const importantRanked = rankImportantNow(allPublished, IMPORTANT_POOL);
  let heroSlides = buildHomepageHeroSlides(cmsHeroSlides, importantRanked);
  if (heroSlides.length === 0) {
    const fallback =
      pickHeroLead(importantRanked) ?? rankLatest(allPublished, 1)[0];
    if (fallback) heroSlides = [fallback];
  }
  const usedSlugs = new Set<string>();
  markSlugsUsed(heroSlides, usedSlugs);

  const weekTopicConfig = getWeekTopicConfig();
  const weekTopicPick = pickWeekTopicArticles(
    allPublished,
    usedSlugs,
    weekTopicConfig
  );
  markSlugsUsed(weekTopicPick.articles, usedSlugs);

  // Najnowsze = wyłącznie publishedAt desc; slot hero to osobne wyróżnienie (bez deduplikacji).
  const latest = pickHomepageLatest(allPublished, LATEST_FEED_LIMIT);
  markSlugsUsed(latest, usedSlugs);

  const homepageCategorySlugs = HOMEPAGE_LAYOUT_V2
    ? HOMEPAGE_V2_CATEGORY_SLUGS
    : CATEGORY_ORDER;

  const categoryArticles = homepageCategorySlugs.map((slug) => {
    const fromPublished = allPublished.filter((a) => a.category === slug);
    const ranked = rankLatest(fromPublished, 4);
    return {
      slug,
      articles: withSectionFallback(
        ranked,
        fromPublished.length > 0 ? fromPublished : allPublished,
        4
      ),
    };
  });

  const excludeForPopular = [...usedSlugs];

  return (
    <div className={cn(SITE_CONTAINER, "relative z-[1]")}>
      <HomepageTopZone
        heroSlides={heroSlides}
        latest={latest}
        weekTopicPick={weekTopicPick}
        weekTopicConfig={weekTopicConfig}
      />

      {/* Popularne + kategorie + widgety */}
      <div className="mt-10 space-y-14 pb-14 md:mt-12 md:space-y-14">
        <PopularArticles
          articles={allPublished}
          excludeSlugs={excludeForPopular}
        />

        <div className="space-y-12 md:space-y-14">
          {categoryArticles.map(({ slug, articles: catArticles }) => (
            <CategorySection
              key={slug}
              slug={slug}
              articles={catArticles}
              desktopLayout={HOMEPAGE_LAYOUT_V2 ? "split-lead" : "legacy"}
            />
          ))}
        </div>

        <DashboardWidgets ops={ops} />
      </div>
    </div>
  );
}
