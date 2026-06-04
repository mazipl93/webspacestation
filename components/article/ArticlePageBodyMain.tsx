import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { NewsArticle } from "@/types";
import SourceAttribution from "@/components/article/SourceAttribution";
import WssContextBox from "@/components/article/WssContextBox";
import ArticleContentBlocks from "@/components/article/ArticleContentBlocks";
import InternalLinkTeaser from "@/components/article/InternalLinkTeaser";
import ArticleEditButton from "@/components/article/ArticleEditButton";
import {
  getArticleBodyBlocks,
  splitArticleLeadAndBody,
} from "@/lib/articles/display-content";
import {
  buildWovenBodySegments,
  type InternalLinkCandidate,
} from "@/lib/article/weave-internal-links";
import { hasSourceAttribution, isRssArticle } from "@/lib/ui/article-kind";
import { previewCatMeta } from "@/lib/ui/article-preview-meta";
import { cn } from "@/lib/cn";

export type ArticlePageBodyMainProps = {
  article: NewsArticle;
  weaveCandidates?: InternalLinkCandidate[];
  /** CMS preview — bez linków powrotu na dole karty. */
  preview?: boolean;
  articleId?: string;
  /** W siatce strony artykułu (bez drugiego container-site). */
  layout?: "standalone" | "in-grid";
  className?: string;
};

export default function ArticlePageBodyMain({
  article,
  weaveCandidates = [],
  preview = false,
  articleId,
  layout = "standalone",
  className,
}: ArticlePageBodyMainProps) {
  const meta = previewCatMeta(article.category);
  const bodyBlocks = getArticleBodyBlocks(article);
  const isRss = isRssArticle(article.contentOrigin);
  const { lead, restBlocks } = splitArticleLeadAndBody(article, bodyBlocks);
  const wovenSegments = buildWovenBodySegments(restBlocks, weaveCandidates);

  const articleCard = (
      <article className="card-surface p-7 sm:p-10">
        <div className="max-w-[72ch]">
          {!isRss && lead ? (
            <p
              className="mb-7 border-l-[3px] pl-5 font-medium text-text-primary"
              style={{
                fontSize: "var(--text-body)",
                lineHeight: 1.78,
                borderColor: meta.color,
              }}
            >
              {lead}
            </p>
          ) : null}

          {wovenSegments.map((segment, i) =>
            segment.kind === "paragraph" ? (
              <p
                key={`p-${i}`}
                className="mb-6 text-text-secondary"
                style={{ fontSize: "var(--text-body)", lineHeight: 1.8 }}
              >
                {segment.text}
              </p>
            ) : segment.kind === "list" ? (
              <ArticleContentBlocks
                key={`list-${i}`}
                blocks={[{ kind: "list", items: segment.items }]}
              />
            ) : (
              <InternalLinkTeaser
                key={`link-${segment.article.id}-${i}`}
                article={segment.article}
                categoryLabel={meta.label}
                templateIndex={segment.templateIndex}
              />
            )
          )}

          {isRss && article.contextNote ? (
            <WssContextBox text={article.contextNote} />
          ) : null}

          {hasSourceAttribution(article.originalUrl) ? (
            <SourceAttribution article={article} />
          ) : null}
        </div>

        {!preview ? (
          <>
            <div className="mt-10 flex items-center gap-4">
              <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
              <span className="overline text-text-muted">Web Space Station</span>
              <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/aktualnosci"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-glass px-4 py-2.5 text-[12.5px] font-medium text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary active:scale-[0.97]"
              >
                <ArrowLeft size={14} />
                Wróć do aktualności
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline px-4 py-2.5 text-[12.5px] font-medium text-text-tertiary transition-all duration-300 hover:border-hairline-strong hover:text-text-secondary active:scale-[0.97]"
              >
                Strona główna
              </Link>
              {articleId ? <ArticleEditButton articleId={articleId} /> : null}
            </div>
          </>
        ) : null}
      </article>
  );

  if (layout === "in-grid") {
    return articleCard;
  }

  return (
    <div
      className={cn(
        "container-site py-6 max-sm:py-5 sm:py-10",
        preview ? "" : "reveal",
        className
      )}
    >
      {articleCard}
    </div>
  );
}
