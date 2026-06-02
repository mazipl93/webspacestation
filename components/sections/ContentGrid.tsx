import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NewsArticle } from "@/types";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";
import ArticleCard from "@/components/article/ArticleCard";
import HeroArticle from "@/components/sections/HeroArticle";
import TopStoriesList from "@/components/sections/TopStoriesList";
import PopularArticles from "@/components/sections/PopularArticles";

// ─── Category presentation ────────────────────────────────────────────────────

const CATEGORY_META: Record<
  string,
  { label: string; color: string; href: string }
> = {
  misje: { label: "Misje", color: "#2f6dff", href: "/misje" },
  astronomia: { label: "Astronomia", color: "#a855f7", href: "/astronomia" },
  technologie: {
    label: "Technologie",
    color: "#38bdf8",
    href: "/technologie",
  },
  "ziemia-z-kosmosu": {
    label: "Ziemia z kosmosu",
    color: "#22c55e",
    href: "/ziemia-z-kosmosu",
  },
  iss: { label: "ISS", color: "#ffb830", href: "/iss" },
};

const CATEGORY_ORDER = [
  "misje",
  "astronomia",
  "technologie",
  "ziemia-z-kosmosu",
  "iss",
] as const;

function SectionHeader({
  label,
  accent = "#2f6dff",
  href,
  cta = "Zobacz wszystkie",
}: {
  label: string;
  accent?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className="h-3.5 w-[3px] shrink-0 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}66` }}
        />
        <h2 className="overline text-text-secondary">{label}</h2>
      </div>
      {href && (
        <a
          href={href}
          className="group flex items-center gap-1 text-[12px] font-medium text-text-tertiary transition-colors duration-300 hover:text-text-primary"
        >
          {cta}
          <ChevronRight
            size={13}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </a>
      )}
    </div>
  );
}

function CategoryRow({
  slug,
  articles,
}: {
  slug: string;
  articles: NewsArticle[];
}) {
  const meta = CATEGORY_META[slug];
  if (!meta || articles.length === 0) return null;

  return (
    <section>
      <SectionHeader
        label={meta.label}
        accent={meta.color}
        href={meta.href}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
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

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="live-dot" />
      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-accent-live">
        Live
      </span>
    </div>
  );
}

function Countdown({ h, m, s }: { h: string; m: string; s: string }) {
  return (
    <div className="flex items-end gap-1.5">
      {[
        { v: h, l: "godz." },
        { v: m, l: "min." },
        { v: s, l: "sek." },
      ].map(({ v, l }, i) => (
        <div key={l} className="flex items-end gap-1.5">
          {i > 0 && (
            <span className="pb-2 text-[18px] font-light leading-none text-text-muted">
              :
            </span>
          )}
          <div className="flex flex-col items-center">
            <span className="tabular-nums text-[26px] font-bold leading-none text-text-primary">
              {v}
            </span>
            <span className="mt-1 text-[8px] uppercase tracking-[0.12em] text-text-muted">
              {l}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveMissionCenter() {
  return (
    <section className="card-surface flex flex-col gap-3 p-5">
      <SectionHeader label="Live Mission Center" accent="#ff453a" />
      <div className="-mt-3 flex items-center gap-1.5">
        <span className="live-breathe h-1.5 w-1.5 rounded-full bg-accent-cyan" />
        <span className="text-[10px] text-text-tertiary">
          Zaktualizowano przed chwilą · strumień na żywo
        </span>
      </div>
      <div className="well flex-1 p-3.5">
        <div className="mb-2">
          <LiveBadge />
        </div>
        <h3 className="text-[15px] font-bold text-text-primary">ISS nad Europą</h3>
        <p className="mt-2 text-[11px] text-text-tertiary">7 astronautów na pokładzie</p>
      </div>
      <div className="well flex-1 p-3.5">
        <div className="mb-2">
          <LiveBadge />
        </div>
        <h3 className="mb-1 text-[15px] font-bold text-text-primary">Start Falcon 9</h3>
        <p className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
          Start za
        </p>
        <Countdown h="02" m="31" s="12" />
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          height: 182,
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
        label="Timeline wydarzeń"
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
    <section className="reveal mt-10 space-y-4 border-t border-hairline pt-10">
      <div className="mb-2">
        <p className="overline text-text-muted">Centrum operacyjne</p>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Starty, misje i wydarzenia — dane na żywo wkrótce
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
  const [articles, ...categoryBuckets] = await Promise.all([
    getAllArticles(),
    ...CATEGORY_ORDER.map((slug) => getArticlesByCategory(slug)),
  ]);

  if (articles.length === 0) {
    return (
      <div className="container-site py-20">
        <div className="card-surface px-8 py-16 text-center">
          <p className="text-[14px] text-text-secondary">
            Brak opublikowanych artykułów.
          </p>
          <Link
            href="/aktualnosci"
            className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-medium text-accent-cyan hover:underline"
          >
            Przejdź do aktualności
          </Link>
        </div>
      </div>
    );
  }

  const lead = articles.find((a) => a.isBreaking) ?? articles[0];
  const usedSlugs = new Set<string>([lead.slug]);

  const topStories = articles
    .filter((a) => !usedSlugs.has(a.slug))
    .slice(0, 4);
  topStories.forEach((a) => usedSlugs.add(a.slug));

  const latest = articles
    .filter((a) => !usedSlugs.has(a.slug))
    .slice(0, 9);

  const categoryArticles = CATEGORY_ORDER.map((slug, i) => ({
    slug,
    articles: (categoryBuckets[i] ?? []).slice(0, 3),
  }));

  const excludeForPopular = [...usedSlugs];

  return (
    <>
      {/* 1. Hero article + 2. Top stories (desktop rail overlays hero scrim) */}
      <div className="relative">
        <HeroArticle article={lead} />
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden xl:block">
          <div className="container-site flex justify-end pt-24">
            <div className="pointer-events-auto w-[300px]">
              <TopStoriesList articles={topStories} />
            </div>
          </div>
        </div>
      </div>

      <div className="container-site mt-4 xl:hidden">
        <TopStoriesList articles={topStories} />
      </div>

      <div className="container-site space-y-10 pb-14 pt-8 sm:space-y-12">
        {/* 3. Latest */}
        {latest.length > 0 && (
          <section>
            <SectionHeader label="Najnowsze" href="/aktualnosci" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Categories */}
        <div className="space-y-10">
          {categoryArticles.map(({ slug, articles: catArticles }) => (
            <CategoryRow key={slug} slug={slug} articles={catArticles} />
          ))}
        </div>

        {/* 5. Popular */}
        <PopularArticles
          articles={articles}
          excludeSlugs={excludeForPopular}
        />

        {/* 6. Widgets */}
        <DashboardWidgets />
      </div>
    </>
  );
}
