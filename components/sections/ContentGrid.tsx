import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_INFO } from "@/lib/categories";
import { HOMEPAGE_MAIN_SIDEBAR_GRID, SITE_CONTAINER } from "@/lib/site-layout";
import type { NewsArticle } from "@/types";
import { getRankedArticles, getArticlesByCategory } from "@/lib/articles";

const HOMEPAGE_RANK_LIMIT = 20;
import ArticleCard from "@/components/article/ArticleCard";
import CoverImage from "@/components/article/CoverImage";
import HeroArticle from "@/components/sections/HeroArticle";
import TopStoriesList from "@/components/sections/TopStoriesList";
import HomeSidebar from "@/components/sections/HomeSidebar";

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

function CategorySection({
  slug,
  articles,
}: {
  slug: string;
  articles: NewsArticle[];
}) {
  const meta = CATEGORY_META[slug];
  if (!meta || articles.length === 0) return null;

  const header = (
    <div className="mb-5">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href={meta.href}
            className="group inline-flex items-center gap-2 transition-colors hover:text-accent-cyan"
          >
            <h2
              className="text-[1.75rem] font-extrabold uppercase tracking-[0.06em] text-text-primary md:text-[1.75rem] lg:text-[1.875rem]"
              style={{ letterSpacing: "-0.02em" }}
            >
              {meta.label}
            </h2>
            <ChevronRight
              size={22}
              className="text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-cyan md:h-5 md:w-5"
            />
          </Link>
          <p className="mt-2 max-w-none text-[16px] leading-relaxed text-text-tertiary md:max-w-[720px] md:text-[14px]">
            {meta.description}
          </p>
        </div>
        <a
          href={meta.href}
          className="hidden min-h-[44px] items-center text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-primary sm:flex"
        >
          Zobacz wszystkie →
        </a>
      </div>
      <div
        className="h-1 w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${meta.color} 0%, ${meta.color}44 55%, transparent 100%)`,
        }}
      />
    </div>
  );

  if (meta.variant === "hero-strip") {
    const [lead, ...rest] = articles;
    const prominent = meta.prominent ?? false;
    return (
      <section
        className={cn(
          "overflow-hidden rounded-2xl border p-5 sm:p-6",
          prominent && "sm:p-7"
        )}
        style={{
          borderColor: prominent ? `${meta.color}44` : undefined,
          background: prominent
            ? `linear-gradient(135deg, ${meta.color}28 0%, ${meta.color}12 38%, transparent 72%), var(--space-card)`
            : `linear-gradient(135deg, ${meta.color}12 0%, transparent 55%), var(--space-card)`,
          boxShadow: prominent ? `0 0 48px -20px ${meta.color}55` : undefined,
        }}
      >
        {header}
        <div
          className={cn(
            "grid grid-cols-1 gap-5",
            prominent
              ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
          )}
        >
          {lead && (
            <Link
              href={`/aktualnosci/${lead.slug}`}
              className={cn(
                "surface-interactive group relative overflow-hidden rounded-xl border border-hairline",
                prominent ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[240px]"
              )}
            >
              <CoverImage
                src={lead.imageUrl}
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
                    prominent ? "text-[22px] md:text-[22px]" : "text-[20px] md:text-[20px]"
                  )}
                >
                  {lead.title}
                </p>
                <p className="mt-2 line-clamp-2 text-[16px] leading-relaxed text-text-tertiary md:text-[15px]">
                  {lead.excerpt}
                </p>
              </div>
            </Link>
          )}
          <div
            className={cn(
              "grid grid-cols-1 gap-4",
              prominent ? "lg:gap-3" : "sm:grid-cols-2 lg:grid-cols-1"
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
      </section>
    );
  }

  if (meta.variant === "accent-bar") {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-hairline">
        <div
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: meta.color, boxShadow: `0 0 20px ${meta.color}66` }}
        />
        <div className="py-5 pl-6 pr-5 sm:py-6 sm:pl-8 sm:pr-6">
          {header}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (meta.variant === "banner") {
    return (
      <section
        className="overflow-hidden rounded-2xl border border-hairline"
        style={{
          background: `linear-gradient(180deg, ${meta.color}18 0%, transparent 100%)`,
        }}
      >
        <div className="border-b border-hairline-faint px-5 py-4 sm:px-6">
          {header}
        </div>
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    );
  }

  // minimal (ISS)
  return (
    <section className="border-y border-hairline py-8">
      {header}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} compact />
        ))}
      </div>
    </section>
  );
}

// ─── Dashboard widgets (demoted below editorial content) ───────────────────────

const IMG = {
  falcon: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  launchHue: (h: number) => `
    radial-gradient(ellipse at 50% 90%, hsla(${h},80%,56%,0.46) 0%, hsla(${h},66%,36%,0.2) 22%, transparent 48%),
    linear-gradient(180deg, #060b14 0%, #08111f 100%)`,
};

function PreviewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-glass px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
      Podgląd
    </span>
  );
}

function LiveMissionCenter() {
  return (
    <section className="card-surface flex flex-col gap-3 p-5">
      <SectionHeader label="Centrum misji na żywo" accent="#ff453a" />
      <p className="-mt-3 text-[10px] text-text-muted">
        Integracja ze strumieniem na żywo — wkrótce
      </p>
      <div className="well flex-1 p-3.5">
        <div className="mb-2">
          <PreviewBadge />
        </div>
        <h3 className="text-[15px] font-bold text-text-primary">ISS nad Europą</h3>
        <p className="mt-2 text-[11px] text-text-tertiary">7 astronautów na pokładzie · przelot za ~90 min</p>
      </div>
      <div className="well flex-1 p-3.5">
        <div className="mb-2">
          <PreviewBadge />
        </div>
        <h3 className="text-[15px] font-bold text-text-primary">Nadchodzący start Falcon 9</h3>
        <p className="mt-2 text-[11px] text-text-tertiary">
          SLC-40, Cape Canaveral · szczegóły w sekcji startów
        </p>
        <Link
          href="/starty"
          className="mt-3 inline-flex text-[11px] font-medium text-accent-cyan transition-colors hover:text-accent-cyan/80"
        >
          Zobacz odliczanie →
        </Link>
      </div>
    </section>
  );
}

type LaunchData = {
  provider: string;
  mission: string;
  prefix?: string;
  h: string;
  m: string;
  s: string;
  site: string;
  hue: number;
  image: string;
};

const LAUNCHES: LaunchData[] = [
  {
    provider: "SpaceX",
    mission: "Falcon 9",
    h: "02",
    m: "31",
    s: "12",
    site: "SLC-40, Cape Canaveral",
    hue: 212,
    image:
      "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=520&q=70",
  },
  {
    provider: "SpaceX",
    mission: "Starship Flight 14",
    prefix: "5 dni",
    h: "14",
    m: "22",
    s: "41",
    site: "Starbase, Teksas",
    hue: 26,
    image:
      "https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=520&q=70",
  },
  {
    provider: "ArianeGroup",
    mission: "Ariane 6",
    prefix: "12 dni",
    h: "06",
    m: "11",
    s: "07",
    site: "Kourou, Gujana Fr.",
    hue: 156,
    image:
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=520&q=70",
  },
  {
    provider: "Blue Origin",
    mission: "New Glenn",
    prefix: "18 dni",
    h: "03",
    m: "45",
    s: "32",
    site: "LC-36, Cape Canaveral",
    hue: 268,
    image:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=520&q=70",
  },
];

function LaunchCard({
  provider,
  mission,
  prefix,
  h,
  m,
  s,
  site,
  hue,
  image,
}: LaunchData) {
  return (
    <a
      href="/starty"
      className="surface-interactive group flex flex-col overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div
        className="img-sheen relative h-[84px] shrink-0 overflow-hidden"
        style={{ background: IMG.launchHue(hue) }}
      >
        <Image
          src={image}
          alt={`${provider} ${mission}`}
          fill
          sizes="260px"
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.08]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
        <span className="absolute bottom-2 left-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/75">
          {provider}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <p className="mb-3 text-[12.5px] font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan">
          {mission}
        </p>
        <div>
          <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.14em] text-text-muted">
            Start za
          </p>
          <p className="tabular-nums text-[13px] font-bold leading-none text-text-primary">
            {prefix && (
              <span className="mr-1 font-semibold text-text-secondary">
                {prefix},
              </span>
            )}
            {h}:{m}:{s}
          </p>
          <p className="mt-1.5 truncate text-[9.5px] text-text-muted">{site}</p>
        </div>
      </div>
    </a>
  );
}

function NadchodzaceStarty() {
  return (
    <section className="card-surface p-5">
      <SectionHeader
        label="Nadchodzące starty"
        accent="#38bdf8"
        href="/starty"
      />
      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {LAUNCHES.map((l) => (
          <LaunchCard key={l.mission} {...l} />
        ))}
      </div>
    </section>
  );
}

type MissionPin = {
  name: string;
  planet: string;
  color: string;
  style: React.CSSProperties;
};

const MISSION_PINS: MissionPin[] = [
  { name: "Perseverance", planet: "Mars", color: "#e0683a", style: { top: "12%", right: "30%" } },
  { name: "Europa Clipper", planet: "Jowisz", color: "#2f6dff", style: { top: "14%", right: "7%" } },
  { name: "Artemis II", planet: "Księżyc", color: "#a3afc7", style: { top: "56%", right: "42%" } },
  { name: "ISS", planet: "Ziemia", color: "#38bdf8", style: { top: "52%", left: "30%" } },
  { name: "Solar Orbiter", planet: "Słońce", color: "#ffb830", style: { top: "44%", right: "2%" } },
];

function AktyweneMisje() {
  return (
    <section className="card-surface p-5">
      <SectionHeader label="Aktywne misje" href="/mapa" cta="Mapa kosmosu" />
      <div
        className="relative overflow-hidden rounded-xl border border-hairline-faint"
        style={{
          height: 240,
          background:
            "radial-gradient(ellipse at 92% 50%, rgba(255,165,35,0.16) 0%, transparent 36%), #060a12",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 16,
            height: 16,
            left: "30%",
            top: "52%",
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle at 35% 32%, #4fc0ff, #0055a8)",
            boxShadow: "0 0 12px rgba(56,189,248,0.6)",
          }}
        />
        {MISSION_PINS.map((pin) => (
          <div
            key={pin.name}
            className="absolute flex flex-col items-center"
            style={pin.style}
          >
            <div
              className="mb-1 h-2 w-2 rounded-full"
              style={{ background: pin.color, boxShadow: `0 0 8px ${pin.color}aa` }}
            />
            <span
              className="whitespace-nowrap text-[10px] font-bold leading-none text-text-primary"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}
            >
              {pin.planet}
            </span>
            <span
              className="mt-1 flex items-center gap-1 whitespace-nowrap text-[8px] leading-none text-text-tertiary"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}
            >
              <span className="h-1 w-1 rounded-full" style={{ background: pin.color }} />
              {pin.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

type TimelineEvent = { quarter: string; title: string; active?: boolean };

const EVENTS: TimelineEvent[] = [
  { quarter: "Q1", title: "Starship\nFlight 14", active: true },
  { quarter: "Q2", title: "Artemis II\nMisja załogowa" },
  { quarter: "Q2", title: "Ariane 6\nKuiper Launch" },
  { quarter: "Q3", title: "Lunar Gateway\nElementy" },
  { quarter: "Q4", title: "Mars Sample\nReturn" },
];

function TimelineWydarzen() {
  return (
    <section className="card-surface p-5">
      <SectionHeader
        label="Oś czasu wydarzeń"
        href="/kalendarz"
        cta="Zobacz kalendarz"
      />
      <div className="flex items-start gap-6 overflow-x-auto pb-1 scrollbar-none">
        <div className="shrink-0 pt-2">
          <span
            className="text-[28px] font-extrabold leading-none text-text-primary"
            style={{ letterSpacing: "-0.03em" }}
          >
            2026
          </span>
        </div>
        <div className="relative min-w-0 flex-1 pt-2">
          <div
            className="absolute left-0 right-0 top-[19px] h-px"
            style={{ background: "var(--hairline)" }}
          />
          <div className="relative flex gap-6">
            {EVENTS.map((ev, i) => (
              <div
                key={i}
                className="flex shrink-0 flex-col items-center"
                style={{ minWidth: 88 }}
              >
                <div
                  className={cn(
                    "z-10 mb-2.5 h-2.5 w-2.5 rounded-full border-2",
                    ev.active
                      ? "border-accent-blue bg-accent-blue shadow-[0_0_12px_rgba(47,109,255,0.7)]"
                      : "border-space-muted bg-space-surface"
                  )}
                />
                <span className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-text-tertiary">
                  {ev.quarter}
                </span>
                <p className="whitespace-pre-line text-center text-[10.5px] leading-snug text-text-secondary">
                  {ev.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardWidgets() {
  return (
    <section className="reveal mt-4 space-y-4 rounded-2xl border border-hairline bg-space-card/40 px-5 py-10 sm:px-6">
      <div className="mb-2">
        <p className="overline text-text-muted">Centrum operacyjne</p>
        <p className="mt-1 text-[14px] text-text-tertiary sm:text-[13px]">
          Podgląd startów, misji i wydarzeń — pełne dane na żywo wkrótce
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <NadchodzaceStarty />
        <LiveMissionCenter />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <AktyweneMisje />
        <TimelineWydarzen />
      </div>
    </section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default async function ContentGrid() {
  const [ranked, ...categoryBuckets] = await Promise.all([
    getRankedArticles(HOMEPAGE_RANK_LIMIT),
    ...CATEGORY_ORDER.map((slug) => getArticlesByCategory(slug)),
  ]);

  if (ranked.length === 0) {
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

  const isEditorial = (a: NewsArticle) => !a.source || !a.originalUrl;

  const lead =
    ranked.find((a) => isEditorial(a) && a.isTopPriority) ??
    ranked.find((a) => isEditorial(a)) ??
    ranked[0];
  const usedSlugs = new Set<string>([lead.slug]);

  const topStories = ranked
    .filter((a) => !usedSlugs.has(a.slug))
    .slice(0, 6);
  topStories.forEach((a) => usedSlugs.add(a.slug));

  const rankedRest = ranked.filter((a) => !usedSlugs.has(a.slug));

  const categoryArticles = CATEGORY_ORDER.map((slug, i) => ({
    slug,
    articles: (categoryBuckets[i] ?? []).slice(0, 4),
  }));

  const excludeForSidebar = [...usedSlugs];

  return (
    <div className={SITE_CONTAINER}>
      {/* 1. Hero + Ważne teraz — side-by-side on desktop */}
      <div
        className={cn(
          "grid grid-cols-1 items-stretch gap-5 pt-[4.5rem] sm:pt-24 lg:gap-6",
          HOMEPAGE_MAIN_SIDEBAR_GRID
        )}
      >
        <HeroArticle article={lead} topPriority={lead.isTopPriority} />
        <div className="hidden lg:block">
          <TopStoriesList articles={topStories} />
        </div>
      </div>

      {/* Mobile: Ważne teraz below hero */}
      <div className="mt-5 lg:hidden">
        <TopStoriesList articles={topStories} />
      </div>

      {/* Main editorial + sticky sidebar */}
      <div
        className={cn(
          "mt-8 grid grid-cols-1 gap-8 pb-14 lg:gap-8",
          HOMEPAGE_MAIN_SIDEBAR_GRID
        )}
      >
        <div className="min-w-0 space-y-14 md:space-y-14">
          {/* 2. Ranked newsroom grid (top 20 by score) */}
          {rankedRest.length > 0 && (
            <section className="border-t border-hairline pt-8 md:pt-12">
              <SectionHeader
                label="Ważne teraz — ranking"
                href="/aktualnosci"
                large
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-5">
                {rankedRest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* 3. Categories — visually distinct blocks */}
          <div className="space-y-12 md:space-y-14">
            {categoryArticles.map(({ slug, articles: catArticles }) => (
              <CategorySection key={slug} slug={slug} articles={catArticles} />
            ))}
          </div>

          {/* 4. Space widgets — demoted */}
          <DashboardWidgets />
        </div>

        <HomeSidebar articles={ranked} excludeSlugs={excludeForSidebar} />
      </div>
    </div>
  );
}
