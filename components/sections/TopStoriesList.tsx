import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types";

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

/** Vertical headline rail with thumbnails — sits beside the hero on desktop. */
export default function TopStoriesList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <aside className="card-surface flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="h-3.5 w-[3px] shrink-0 rounded-full bg-accent-live"
          style={{ boxShadow: "0 0 10px rgba(255,69,58,0.55)" }}
        />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
          Top stories
        </h2>
      </div>

      <ol className="flex flex-1 flex-col gap-0 divide-y divide-hairline-faint">
        {articles.map((article, i) => {
          const meta = catMeta(article.category);
          return (
            <li key={article.id}>
              <Link
                href={`/aktualnosci/${article.slug}`}
                className="surface-interactive group flex gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-hairline-faint sm:h-16 sm:w-16">
                  <Image
                    src={article.imageUrl}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="tabular-nums text-[11px] font-bold text-text-muted"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                      style={{ color: meta.color }}
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: meta.color }}
                      />
                      {meta.label}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-[15px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan sm:text-[14px] sm:line-clamp-2">
                    {article.title}
                  </p>
                  <span className="mt-1.5 block text-[12px] text-text-muted sm:text-[11px]">
                    {article.timeLabel}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
