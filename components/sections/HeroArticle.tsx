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

/** Lead-story hero — editorial cover + headline within the news grid. */
export default function HeroArticle({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="flex min-h-[min(88vh,720px)] flex-col overflow-hidden rounded-2xl border border-hairline lg:min-h-[520px]">
      {/* Large cover image */}
      <div
        className="img-sheen relative min-h-[42vh] flex-1 overflow-hidden lg:min-h-[340px]"
        style={{ background: catFallback(article.category) }}
      >
        <Image
          src={article.imageUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.95) 0%, rgba(5,7,9,0.35) 45%, rgba(5,7,9,0.15) 100%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="mb-3" style={fadeIn(0.04)}>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-live px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px]">
              <span className="live-dot" style={{ background: "#fff" }} />
              {article.isBreaking ? "Ważne" : "Główny temat"}
            </span>
          </div>

          <div
            className="mb-3 flex flex-wrap items-center gap-3"
            style={fadeIn(0.08)}
          >
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-[11px]"
              style={{ color: meta.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px"
              style={{ background: "var(--hairline-strong)" }}
            />
            <span className="flex items-center gap-1.5 text-[13px] text-text-tertiary sm:text-[14px]">
              <Calendar size={12} />
              {date}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px"
              style={{ background: "var(--hairline-strong)" }}
            />
            <span className="flex items-center gap-1.5 text-[13px] text-text-tertiary sm:text-[14px]">
              <Clock size={12} />
              {article.readTime ?? 3} min czytania
            </span>
          </div>

          <Link
            href={`/aktualnosci/${article.slug}`}
            className="group block"
            style={fadeIn(0.12)}
          >
            <h1
              className="font-extrabold text-text-primary transition-colors duration-300 group-hover:text-accent-cyan"
              style={{
                fontSize: "clamp(1.625rem, 4vw, 3.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                textShadow: "0 2px 40px rgba(0,0,0,0.6)",
              }}
            >
              {article.title}
            </h1>
          </Link>
        </div>
      </div>

      {/* Lead + CTA */}
      <div className="border-t border-hairline bg-space-card px-5 py-5 sm:px-7 sm:py-6">
        <p
          className="mb-5 max-w-[920px] leading-relaxed text-text-secondary"
          style={{
            fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)",
            lineHeight: 1.6,
            ...fadeIn(0.2),
          }}
        >
          {article.excerpt}
        </p>

        <div style={fadeIn(0.28)}>
          <Link
            href={`/aktualnosci/${article.slug}`}
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent-blue px-5 py-3 text-[14px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_30px_-8px_rgba(47,109,255,0.7)] active:scale-[0.97] sm:text-[15px]"
          >
            Czytaj artykuł
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
