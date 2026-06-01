import Image from "next/image";
import { ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NewsArticle } from "@/types";
import { getAllArticles } from "@/lib/articles";

// ─── Category presentation (label + accent + image fallback) ─────────────────

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje: { label: "Misje", color: "#2f6dff" },
  astronomia: { label: "Astronomia", color: "#a855f7" },
  technologie: { label: "Technologie", color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss: { label: "ISS", color: "#ffb830" },
};

function catMeta(c: string) {
  return CATEGORY_META[c] ?? { label: c, color: "#2f6dff" };
}

// ─── CSS gradient "images" (placeholders until real photography) ─────────────

const IMG = {
  starship: `
    radial-gradient(ellipse at 50% 92%, rgba(255,130,30,0.72) 0%, rgba(225,70,0,0.34) 15%, transparent 40%),
    radial-gradient(ellipse at 52% 82%, rgba(255,190,60,0.26) 0%, transparent 24%),
    radial-gradient(ellipse at 28% 18%, rgba(12,34,86,0.55) 0%, transparent 46%),
    radial-gradient(ellipse at 78% 28%, rgba(8,20,54,0.6) 0%, transparent 42%),
    linear-gradient(180deg, #060c16 0%, #0a1320 52%, #07090c 100%)
  `,
  europa: `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    radial-gradient(circle at 66% 40%, rgba(90,190,255,0.16) 0%, transparent 22%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)
  `,
  jwst: `
    radial-gradient(ellipse at 56% 46%, rgba(168,20,240,0.46) 0%, rgba(90,10,205,0.22) 28%, transparent 56%),
    radial-gradient(ellipse at 32% 62%, rgba(245,70,10,0.18) 0%, transparent 34%),
    radial-gradient(circle at 72% 22%, rgba(20,180,255,0.16) 0%, transparent 28%),
    linear-gradient(135deg, #05070f 0%, #0b0514 100%)
  `,
  falcon: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    radial-gradient(ellipse at 76% 42%, rgba(200,205,225,0.07) 0%, transparent 40%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)
  `,
  launchHue: (h: number) => `
    radial-gradient(ellipse at 50% 90%, hsla(${h},80%,56%,0.46) 0%, hsla(${h},66%,36%,0.2) 22%, transparent 48%),
    linear-gradient(180deg, #060b14 0%, #08111f 100%)
  `,
};

// Gradient shown beneath every photo — also the graceful fallback if an image
// fails to load, so a card never collapses into an empty block.
const CATEGORY_FALLBACK: Record<string, string> = {
  misje: IMG.starship,
  astronomia: IMG.jwst,
  technologie: IMG.falcon,
  "ziemia-z-kosmosu": IMG.europa,
  iss: IMG.europa,
};

function catFallback(c: string) {
  return CATEGORY_FALLBACK[c] ?? IMG.falcon;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function CategoryLabel({
  label,
  color = "#2f6dff",
  className,
}: {
  label: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]",
        className
      )}
      style={{ color }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// ─── DZISIAJ W KOSMOSIE ───────────────────────────────────────────────────────

function FeaturedCard({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  return (
    <a
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border border-hairline"
    >
      <div className="img-sheen relative flex-1 overflow-hidden" style={{ background: catFallback(article.category) }}>
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 600px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
        {article.isBreaking && (
          <div className="absolute left-3.5 top-3.5 z-10">
            <span className="flex items-center gap-1.5 rounded-md bg-accent-live px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              <span className="live-dot" style={{ background: "#fff" }} />
              Najważniejsze
            </span>
          </div>
        )}
        {/* gradient scrim for text legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, #0c1018 6%, rgba(12,16,24,0.2) 55%, transparent 100%)" }}
        />
      </div>

      <div className="relative -mt-px border-t border-hairline bg-space-card px-4 pb-4 pt-3.5">
        <div className="mb-2 flex items-center justify-between">
          <CategoryLabel label={meta.label} color={meta.color} />
          <span className="text-[10px] text-text-muted">{article.timeLabel}</span>
        </div>
        <h3
          className="mb-1.5 font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan line-clamp-2"
          style={{ fontSize: "var(--text-title-sm)" }}
        >
          {article.title}
        </h3>
        <p className="text-[12px] leading-relaxed text-text-tertiary line-clamp-2">
          {article.excerpt}
        </p>
      </div>
    </a>
  );
}

function SideCard({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  return (
    <a
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex min-h-0 flex-1 overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
        <div>
          <CategoryLabel label={meta.label} color={meta.color} className="mb-2" />
          <h3 className="text-[12.5px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan line-clamp-2">
            {article.title}
          </h3>
        </div>
        <span className="mt-2 text-[10px] text-text-muted">{article.timeLabel}</span>
      </div>
      <div className="img-sheen relative w-[96px] shrink-0 overflow-hidden" style={{ background: catFallback(article.category) }}>
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
      </div>
    </a>
  );
}

function DzisiajWKosmosie({ articles }: { articles: NewsArticle[] }) {
  const featured = articles.find((n) => n.isBreaking) ?? articles[0];
  const side = articles.filter((n) => n.id !== featured?.id).slice(0, 2);
  if (!featured) return null;
  return (
    <section className="card-surface p-5">
      <SectionHeader label="Dzisiaj w kosmosie" href="/aktualnosci" />
      {/*
        Editorial proportion: the lead story gets ~62% of the row so it reads as
        the single second focal point (after the Hero). The stacked stories on the
        right are clearly supporting, not co-equal cards.
      */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.62fr_1fr]" style={{ minHeight: 308 }}>
        <FeaturedCard article={featured} />
        <div className="flex flex-col gap-4">
          {side.map((article) => (
            <SideCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LIVE MISSION CENTER ──────────────────────────────────────────────────────

function AvatarRow({ count }: { count: number }) {
  return (
    <div className="mt-3 flex items-center">
      <div className="flex -space-x-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-6 rounded-full ring-2 ring-[#0c1018]"
            style={{
              background: `radial-gradient(circle at 38% 32%, hsl(${198 + i * 12},30%,58%) 0%, hsl(${198 + i * 9},24%,30%) 100%)`,
            }}
          />
        ))}
      </div>
      <span className="ml-2.5 text-[11px] text-text-tertiary">
        7 astronautów na pokładzie
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
            <span className="pb-2 text-[18px] font-light leading-none text-text-muted">:</span>
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

      {/* Live context: gentle breathing status, not a blink */}
      <div className="-mt-3 flex items-center gap-1.5">
        <span className="live-breathe h-1.5 w-1.5 rounded-full bg-accent-cyan" />
        <span className="text-[10px] text-text-tertiary">
          Zaktualizowano przed chwilą · strumień na żywo
        </span>
      </div>

      {/* ISS card */}
      <div className="well flex-1 p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <LiveBadge />
          <button
            type="button"
            disabled
            title="Wkrótce"
            aria-label="Następna misja"
            className="flex h-5 w-5 cursor-not-allowed items-center justify-center rounded text-text-muted opacity-50"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <h3 className="text-[15px] font-bold text-text-primary">ISS nad Europą</h3>
        <AvatarRow count={7} />
      </div>

      {/* Falcon 9 countdown card */}
      <div className="well flex-1 p-3.5">
        <div className="mb-2">
          <LiveBadge />
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="mb-1 text-[15px] font-bold text-text-primary">Start Falcon 9</h3>
            <p className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
              Start za
            </p>
            <Countdown h="02" m="31" s="12" />
          </div>
          <div
            className="h-[74px] w-[62px] shrink-0 overflow-hidden rounded-xl border border-hairline"
            style={{ background: IMG.falcon }}
          />
        </div>
      </div>

      {/* Stats strip — with subtle trend refinement */}
      <div className="mt-auto grid grid-cols-4 gap-2 pt-0.5">
        {[
          { v: "17", l: "Aktywne", trend: "up" },
          { v: "8", l: "Starty", trend: "up" },
          { v: "3", l: "Spacewalk", trend: null },
          { v: "24/7", l: "Live", trend: "live" },
        ].map(({ v, l, trend }) => (
          <div key={l} className="well flex flex-col items-center px-1 py-2.5">
            <span className="flex items-center gap-0.5 tabular-nums text-[16px] font-bold leading-none text-text-primary">
              {v}
              {trend === "up" && (
                <ChevronUp size={11} strokeWidth={3} className="text-[#22c55e]" aria-hidden="true" />
              )}
              {trend === "live" && (
                <span className="live-breathe h-1.5 w-1.5 rounded-full bg-accent-live" aria-hidden="true" />
              )}
            </span>
            <span className="mt-1.5 text-center text-[8.5px] uppercase tracking-[0.08em] text-text-muted leading-tight">
              {l}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CATEGORY TABS ────────────────────────────────────────────────────────────

const TABS = [
  { icon: "🚀", label: "Misje", href: "/misje" },
  { icon: "🌠", label: "Astronomia", href: "/astronomia" },
  { icon: "🛠️", label: "Technologie", href: "/technologie" },
  { icon: "🌍", label: "Ziemia z kosmosu", href: "/ziemia-z-kosmosu" },
  { icon: "🛸", label: "ISS", href: "/iss" },
] as const;

function CategoryTabs() {
  return (
    <nav>
      <div className="card-surface flex items-center gap-1 overflow-x-auto p-1.5 scrollbar-none">
        {TABS.map((tab) => (
          <a
            key={tab.label}
            href={tab.href}
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-text-secondary transition-all duration-300 hover:bg-glass-hover hover:text-text-primary"
          >
            <span aria-hidden="true" className="text-[14px]">{tab.icon}</span>
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── NADCHODZĄCE STARTY ────────────────────────────────────────────────────────

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
  { provider: "SpaceX", mission: "Falcon 9", h: "02", m: "31", s: "12", site: "SLC-40, Cape Canaveral", hue: 212, image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=520&q=70" },
  { provider: "SpaceX", mission: "Starship Flight 14", prefix: "5 dni", h: "14", m: "22", s: "41", site: "Starbase, Teksas", hue: 26, image: "https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=520&q=70" },
  { provider: "ArianeGroup", mission: "Ariane 6", prefix: "12 dni", h: "06", m: "11", s: "07", site: "Kourou, Gujana Fr.", hue: 156, image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=520&q=70" },
  { provider: "Blue Origin", mission: "New Glenn", prefix: "18 dni", h: "03", m: "45", s: "32", site: "LC-36, Cape Canaveral", hue: 268, image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=520&q=70" },
];

function LaunchCard({ provider, mission, prefix, h, m, s, site, hue, image }: LaunchData) {
  return (
    <a
      href="/starty"
      className="surface-interactive group flex flex-col overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div className="img-sheen relative h-[84px] shrink-0 overflow-hidden" style={{ background: IMG.launchHue(hue) }}>
        <Image
          src={image}
          alt={`${provider} ${mission}`}
          fill
          sizes="260px"
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.08]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, #0c1018 8%, transparent 100%)" }}
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
            {prefix && <span className="mr-1 font-semibold text-text-secondary">{prefix},</span>}
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
      <SectionHeader label="Nadchodzące starty" accent="#38bdf8" href="/starty" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {LAUNCHES.map((l) => (
          <LaunchCard key={l.mission} {...l} />
        ))}
      </div>
    </section>
  );
}

// ─── AKTYWNE MISJE – orbital map ─────────────────────────────────────────────

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
      <SectionHeader label="Aktywne misje" />
      <div
        className="relative overflow-hidden rounded-xl border border-hairline-faint"
        style={{
          height: 182,
          background:
            "radial-gradient(ellipse at 92% 50%, rgba(255,165,35,0.16) 0%, transparent 36%), #060a12",
        }}
      >
        {[
          { w: 96, h: 56, o: 0.5 },
          { w: 214, h: 132, o: 0.32 },
          { w: 366, h: 220, o: 0.2 },
        ].map((ring, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: ring.w,
              height: ring.h,
              left: i === 0 ? "30%" : i === 1 ? "50%" : "58%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              border: `1px solid rgba(255,255,255,${ring.o * 0.12})`,
            }}
          />
        ))}

        {/* Earth */}
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

        {/* Sun edge glow */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 top-0 w-12 pointer-events-none"
          style={{ background: "linear-gradient(to left, rgba(255,180,48,0.22) 0%, transparent 100%)" }}
        />

        {MISSION_PINS.map((pin) => (
          <div key={pin.name} className="absolute flex flex-col items-center" style={pin.style}>
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

// ─── TIMELINE WYDARZEŃ ────────────────────────────────────────────────────────

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
      <SectionHeader label="Timeline wydarzeń" href="/kalendarz" cta="Zobacz kalendarz" />

      <div className="flex items-start gap-6 overflow-x-auto pb-1 scrollbar-none">
        <div className="shrink-0 pt-2">
          <span className="text-[28px] font-extrabold leading-none text-text-primary" style={{ letterSpacing: "-0.03em" }}>
            2026
          </span>
        </div>

        <div className="relative min-w-0 flex-1 pt-2">
          <div className="absolute left-0 right-0 top-[19px] h-px bg-hairline" style={{ background: "var(--hairline)" }} />
          <div className="relative flex gap-6">
            {EVENTS.map((ev, i) => (
              <div key={i} className="flex shrink-0 flex-col items-center" style={{ minWidth: 88 }}>
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

        <button
          type="button"
          disabled
          title="Wkrótce"
          aria-label="Następny okres"
          className="mt-1.5 flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-hairline text-text-tertiary opacity-50"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default async function ContentGrid() {
  const articles = await getAllArticles();
  return (
    <div className="relative">
      {/*
        Editorial grid spine:
        - A single, consistent two-column track (main 1fr + sidebar rail 318px)
          is reused on every row so the vertical seam is continuous and baselines
          align — this is what makes it read as one dashboard, not a stack.
        - A single `gap-y` cadence governs the rhythm between ALL blocks.
        - A distinct top band (pt-16/20) separates the grid from the Hero so the
          Hero keeps the fold and the grid owns its own spatial identity.
      */}
      <div className="container-site pb-14 pt-7 sm:pt-8">
        {/*
          Information-first portal density:
            - Grid sits immediately under the Hero (tight pt) so it's the primary
              content layer and rises above the fold on standard desktop.
            - Group separations kept for structure but compressed (mt-8) — less
              "air", more content per viewport.
            - Sidebar (300px) is a supporting data rail alongside the main column.
        */}

        {/* ── GROUP A — Lead news (primary content layer) ───────────────── */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <DzisiajWKosmosie articles={articles} />
          <LiveMissionCenter />
        </section>

        {/* ── GROUP B — Explore (tabs cluster tightly into launches) ─────── */}
        <section className="reveal mt-8">
          <CategoryTabs />
          <div className="mt-3 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <NadchodzaceStarty />
            <AktyweneMisje />
          </div>
        </section>

        {/* ── GROUP C — Timeline (supporting strip) ─────────────────────── */}
        <section className="reveal mt-8">
          <TimelineWydarzen />
        </section>
      </div>
    </div>
  );
}
