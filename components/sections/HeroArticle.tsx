import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { NewsArticle } from "@/types";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje: { label: "Misje", color: "#2f6dff" },
  astronomia: { label: "Astronomia", color: "#a855f7" },
  technologie: { label: "Technologie", color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss: { label: "ISS", color: "#ffb830" },
};

const CATEGORY_FALLBACK: Record<string, string> = {
  misje: `
    radial-gradient(ellipse at 50% 92%, rgba(255,130,30,0.72) 0%, rgba(225,70,0,0.34) 15%, transparent 40%),
    linear-gradient(180deg, #060c16 0%, #0a1320 52%, #07090c 100%)`,
  astronomia: `
    radial-gradient(ellipse at 56% 46%, rgba(168,20,240,0.46) 0%, rgba(90,10,205,0.22) 28%, transparent 56%),
    linear-gradient(135deg, #05070f 0%, #0b0514 100%)`,
  technologie: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  "ziemia-z-kosmosu": `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  iss: `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
};

function catMeta(c: string) {
  return CATEGORY_META[c] ?? { label: c, color: "#2f6dff" };
}
function catFallback(c: string) {
  return CATEGORY_FALLBACK[c] ?? CATEGORY_FALLBACK.technologie;
}

function fadeIn(delay = 0, duration = 0.75): CSSProperties {
  return {
    animation: `reveal-fade ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  };
}

/** Lead-story hero — editorial cover + headline, not brand landing. */
export default function HeroArticle({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden sm:min-h-[58vh]">
      <div
        className="absolute inset-0 -z-40"
        style={{
          background:
            "linear-gradient(160deg, #04080f 0%, #060c18 35%, #050a16 60%, #04080d 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="hero-drift absolute inset-0 -z-30"
        style={{ background: catFallback(article.category) }}
      >
        <Image
          src={article.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div
        aria-hidden="true"
        className="hero-glow-drift pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `
            radial-gradient(120% 90% at 78% 42%, rgba(40,110,230,0.14) 0%, transparent 45%),
            radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(2,4,8,0.75) 100%)
          `,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[85%]"
        style={{
          background:
            "linear-gradient(to right, rgba(4,7,12,0.97) 0%, rgba(4,7,12,0.88) 38%, rgba(4,7,12,0.5) 68%, transparent 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #050709 100%)",
        }}
      />

      <div className="hero-fade container-site w-full pb-10 pt-24 sm:pb-12 sm:pt-28">
        <div className="max-w-[780px]">
          {article.isBreaking && (
            <div className="mb-4" style={fadeIn(0.04)}>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-live px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                <span className="live-dot" style={{ background: "#fff" }} />
                Najważniejsze
              </span>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3" style={fadeIn(0.08)}>
            <span
              className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
              style={{ color: meta.color }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px"
              style={{ background: "var(--hairline-strong)" }}
            />
            <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
              <Calendar size={11} />
              {date}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px"
              style={{ background: "var(--hairline-strong)" }}
            />
            <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
              <Clock size={11} />
              {article.readTime ?? 3} min czytania
            </span>
          </div>

          <Link
            href={`/aktualnosci/${article.slug}`}
            className="group block"
            style={fadeIn(0.12)}
          >
            <h1
              className="mb-5 font-extrabold text-text-primary transition-colors duration-300 group-hover:text-accent-cyan"
              style={{
                fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)",
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                textShadow: "0 2px 40px rgba(0,0,0,0.6)",
              }}
            >
              {article.title}
            </h1>
          </Link>

          <p
            className="mb-7 max-w-[620px] leading-relaxed text-text-secondary"
            style={{
              fontSize: "var(--text-title-sm)",
              lineHeight: 1.55,
              textShadow: "0 1px 20px rgba(0,0,0,0.5)",
              ...fadeIn(0.2),
            }}
          >
            {article.excerpt}
          </p>

          <div style={fadeIn(0.28)}>
            <Link
              href={`/aktualnosci/${article.slug}`}
              className="group inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-3 text-[13.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_30px_-8px_rgba(47,109,255,0.7)] active:scale-[0.97]"
            >
              Czytaj artykuł
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
