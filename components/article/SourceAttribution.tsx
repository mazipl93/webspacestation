import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/types";

/** Subtle source line for articles based on external publishers. */
export default function SourceAttribution({ article }: { article: NewsArticle }) {
  if (!article.originalUrl) return null;

  const publisher = article.source?.trim() || "wydawcy";

  return (
    <footer
      className="mt-10 border-t border-hairline pt-6"
      aria-label="Źródło artykułu"
    >
      <p className="text-[13px] leading-relaxed text-text-muted max-sm:text-[14px]">
        Źródło:{" "}
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-text-secondary transition-colors hover:text-accent-cyan"
        >
          {publisher}
          <ExternalLink size={12} className="opacity-60" aria-hidden />
        </a>
      </p>
    </footer>
  );
}
