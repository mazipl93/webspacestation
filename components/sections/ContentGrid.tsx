import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ChevronRight, Globe, Map, Rocket } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_INFO, CATEGORY_SLUG_ORDER } from "@/lib/categories";
import { HOMEPAGE_LAYOUT_V2, SITE_CONTAINER } from "@/lib/site-layout";
import type { NewsArticle } from "@/types";
import type { HomepageContent } from "@/lib/home/homepage-content";
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
  type SectionThemeConfig,
} from "@/lib/home/homepage-section-themes";
import LaunchCard from "@/components/discover/LaunchCard";
import OpsCenterExplainer from "@/components/discover/OpsCenterExplainer";
import OpsScheduleList from "@/components/discover/OpsScheduleList";
import OpsPreviewBadge from "@/components/discover/OpsPreviewBadge";
import { getHomepageOpsData } from "@/lib/ops/get-ops-data";
import { formatIssForReader } from "@/lib/ops/format-ops-display";
import type { OpsSnapshot } from "@/lib/ops/types";

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
  misje: { variant: "hero-strip", prominent: true },
  astronomia: { variant: "accent-bar", prominent: true },
  nauka: { variant: "hero-strip", prominent: true },
  technologie: { variant: "hero-strip" },
  iss: { variant: "accent-bar" },
  "ziemia-z-kosmosu": { variant: "banner" },
  rozrywka: { variant: "minimal" },
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
  const iss = formatIssForReader(ops.iss);
  return (
    <section className="card-surface flex flex-col gap-3 p-5">
      <SectionHeader label="Stacja ISS" accent="#38bdf8" href="/mapa" cta="Mapa" />
      {!ops.live ? (
        <div>
          <OpsPreviewBadge />
        </div>
      ) : null}
      <div className="well flex-1 p-4">
        <p className="text-[11px] leading-relaxed text-text-tertiary">
          Międzynarodowa Stacja Kosmiczna krąży ~400 km nad Ziemią. Poniżej punkt na globie,
          nad którym jest teraz.
        </p>
        <p className="mt-3 text-[20px] font-bold tracking-tight text-accent-cyan">{iss.coords}</p>
        <Link
          href="/mapa"
          className="mt-4 inline-flex text-[11px] font-medium text-accent-cyan hover:text-accent-cyan/80"
        >
          Zobacz ISS na mapie →
        </Link>
      </div>
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
      <p className="-mt-2 mb-4 text-[12px] leading-relaxed text-text-tertiary">
        Kolejne rakiety w kosmos — kliknij kartę, aby zobaczyć pełny harmonogram.
      </p>
      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {ops.launches.slice(0, 4).map((launch) => (
          <LaunchCard key={launch.id} launch={launch} href="/starty" />
        ))}
      </div>
    </section>
  );
}

function MapaStartow({ ops }: { ops: OpsSnapshot }) {
  const iss = formatIssForReader(ops.iss);
  const upcomingCount = ops.launches.length;
  const padCount = ops.mapPins.filter((p) => p.kind === "pad").length;

  return (
    <section className="homepage-ops-panel card-surface overflow-hidden p-5">
      <SectionHeader
        label="Gdzie to się dzieje?"
        accent="#a78bfa"
        href="/mapa"
        cta="Pełna mapa"
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="well relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-xl p-5 sm:min-h-[220px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 85% 70% at 72% 28%, rgba(56,189,248,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 18% 78%, rgba(167,139,250,0.18) 0%, transparent 50%), linear-gradient(145deg, rgba(8,12,20,0.4) 0%, rgba(5,7,9,0.85) 100%)",
            }}
          />
          <Globe
            aria-hidden
            size={120}
            strokeWidth={0.75}
            className="pointer-events-none absolute -right-6 -top-4 text-accent-cyan/[0.12] sm:right-2 sm:top-0"
          />
          <p className="relative text-[13px] leading-relaxed text-text-secondary">
            Satelitarna mapa Ziemi: orbita ISS, pozycja stacji na żywo i platformy startowe
            nadchodzących rakiet — wszystko w jednym widoku.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="well grid gap-3 p-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-cyan">
                <Map size={12} />
                ISS teraz
              </p>
              <p className="mt-2 text-[18px] font-bold tracking-tight text-text-primary">
                {iss.coords}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-tertiary">
                Punkt na globie bezpośrednio pod stacją.
              </p>
            </div>
            <div>
              <p
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: "#a78bfa" }}
              >
                <Rocket size={12} />
                Na mapie
              </p>
              <p className="mt-2 text-[18px] font-bold tracking-tight text-text-primary">
                {upcomingCount > 0
                  ? `${upcomingCount} ${upcomingCount === 1 ? "start" : upcomingCount < 5 ? "starty" : "startów"}`
                  : "Brak zaplanowanych"}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-tertiary">
                {padCount > 0
                  ? `${padCount} ${padCount === 1 ? "platforma" : padCount < 5 ? "platformy" : "platform"} startowych.`
                  : "Platformy startowe pojawią się po odświeżeniu danych."}
              </p>
            </div>
          </div>

          <Link
            href="/mapa"
            className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-5 py-3 text-[13px] font-semibold text-text-primary transition-all duration-300 active:scale-[0.98]"
            style={{
              borderColor: "rgba(167,139,250,0.35)",
              background: "rgba(167,139,250,0.1)",
            }}
          >
            Zobacz mapę na żywo
            <ChevronRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ color: "#a78bfa" }}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimelineWydarzen({ ops }: { ops: OpsSnapshot }) {
  return (
    <section className="card-surface p-5">
      <SectionHeader label="Kolejne terminy" href="/kalendarz" cta="Cały kalendarz" />
      <OpsScheduleList events={ops.calendar} limit={5} />
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
        <OpsCenterExplainer />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <NadchodzaceStarty ops={ops} />
          <LiveMissionCenter ops={ops} />
        </div>
        <div className="mt-4">
          <MapaStartow ops={ops} />
        </div>
        <div className="mt-4 max-w-xl">
          <TimelineWydarzen ops={ops} />
        </div>
      </DepartmentSectionFrame>
    </section>
  );
}

function OpsDashboardSkeleton() {
  return (
    <div
      className="homepage-ops-panel card-surface animate-pulse space-y-4 p-5"
      aria-hidden
    >
      <div className="h-5 w-48 rounded bg-white/10" />
      <div className="h-[180px] rounded-xl bg-white/5" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-xl bg-white/5" />
        <div className="h-24 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

async function HomepageOpsDashboardLoader() {
  const ops = await getHomepageOpsData();
  return <DashboardWidgets ops={ops} />;
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

        <Suspense fallback={<OpsDashboardSkeleton />}>
          <HomepageOpsDashboardLoader />
        </Suspense>
      </div>
    </div>
  );
}
