import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ArticleMainColumnShell from "@/components/article/ArticleMainColumnShell";
import { getRelatedHubs } from "@/lib/article/related-hubs";

type Props = {
  tags: string[];
};

export default function RelatedHubsWidget({ tags }: Props) {
  const hubs = getRelatedHubs(tags, 3);
  if (hubs.length === 0) return null;

  return (
    <ArticleMainColumnShell as="section" shellClassName="pb-8" aria-label="Powiazane tematy">
      <div className="article-panel card-surface overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-hairline px-5 py-4">
          <span
            className="h-3.5 w-[3px] shrink-0 rounded-full"
            style={{ background: "#f97316", boxShadow: "0 0 10px rgba(249,115,22,0.4)" }}
            aria-hidden
          />
          <h2 className="overline text-text-secondary">Powiazane tematy</h2>
        </div>

        <div className="grid grid-cols-1 gap-0 divide-y divide-hairline-faint sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {hubs.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="surface-interactive group flex flex-col gap-1.5 px-5 py-4 transition-colors duration-200 hover:bg-glass-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[13px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan"
                  style={{ color: hub.accent }}
                >
                  {hub.title}
                </span>
                <ChevronRight
                  size={14}
                  className="shrink-0 text-text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden
                />
              </div>
              <p className="line-clamp-2 text-[12px] leading-snug text-text-muted">
                {hub.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ArticleMainColumnShell>
  );
}
