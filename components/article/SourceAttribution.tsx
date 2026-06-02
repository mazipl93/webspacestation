import { ExternalLink, Globe2 } from "lucide-react";
import type { NewsArticle } from "@/types";

/** Single, clear block for RSS aggregator articles — no duplicate legal text in body. */
export default function SourceAttribution({ article }: { article: NewsArticle }) {
  if (!article.originalUrl) return null;

  const publisher = article.source?.trim() || "wydawcy";

  return (
    <aside
      className="mb-8 rounded-2xl border border-hairline bg-glass/60 p-5 sm:p-6"
      aria-label="Informacja o źródle"
    >
      <div className="flex gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-hairline"
          style={{
            background:
              "linear-gradient(135deg, rgba(47,109,255,0.12) 0%, rgba(56,189,248,0.08) 100%)",
          }}
        >
          <Globe2 size={20} className="text-accent-cyan" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
            Materiał z zewnętrznego źródła
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
            Opracowanie redakcyjne WSS na podstawie materiału u{" "}
            <span className="font-semibold text-text-primary">{publisher}</span>.
            Pełny tekst i szczegóły są u wydawcy.
          </p>
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-blue-hover"
          >
            Czytaj u {publisher}
            <ExternalLink size={15} aria-hidden />
          </a>
        </div>
      </div>
    </aside>
  );
}
