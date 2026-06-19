import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { NewsArticle } from "@/types";
import SourceAttribution from "@/components/article/SourceAttribution";
import WssContextBox from "@/components/article/WssContextBox";
import ArticleContentBlocks from "@/components/article/ArticleContentBlocks";
import ArticleFigure from "@/components/article/ArticleFigure";
import ArticleVideoEmbed from "@/components/article/ArticleVideoEmbed";
import InternalLinkTeaser from "@/components/article/InternalLinkTeaser";
import ArticleEditButton from "@/components/article/ArticleEditButton";
import SocialFollowCta from "@/components/social/SocialFollowCta";
import {
  getArticleBodyBlocks,
  splitArticleLeadAndBody,
} from "@/lib/articles/display-content";
import {
  buildWovenBodySegments,
  type InternalLinkCandidate,
} from "@/lib/article/weave-internal-links";
import { injectHubAnchors } from "@/lib/article/hub-anchor-links";
import { hasSourceAttribution, isRssArticle } from "@/lib/ui/article-kind";
import { previewCatMeta } from "@/lib/ui/article-preview-meta";
import { ARTICLE_PROSE_MAX, ARTICLE_SHELL } from "@/lib/ui/article-editorial-layout";
import { renderInlineMarkdown } from "@/lib/articles/render-inline-markdown";
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

  // Shared state for hub anchor injection — 1 link per hub per article
  const usedHubHrefs = new Set<string>();

  const articleCard = (
      <article className="min-w-0 pt-1 sm:pt-2">
        <div className={ARTICLE_PROSE_MAX}>
          {!isRss && lead ? (
            <p
              className="mb-7 border-l-[3px] pl-5 font-medium text-text-primary"
              style={{
                fontSize: "var(--text-body)",
                lineHeight: 1.78,
                borderColor: meta.color,
              }}
            >
              {renderInlineMarkdown(injectHubAnchors(lead, usedHubHrefs))}
            </p>
          ) : null}

          {wovenSegments.map((segment, i) =>
            segment.kind === "paragraph" ? (
              <p
                key={`p-${i}`}
                className="mb-6 text-text-secondary"
                style={{ fontSize: "var(--text-body)", lineHeight: 1.8 }}
              >
                {renderInlineMarkdown(injectHubAnchors(segment.text, usedHubHrefs))}
              </p>
            ) : segment.kind === "list" ? (
              <ArticleContentBlocks
                key={`list-${i}`}
                blocks={[{ kind: "list", items: segment.items }]}
              />
            ) : segment.kind === "figure" ? (
              <ArticleFigure
                key={`fig-${i}`}
                src={segment.src}
                caption={segment.caption}
                className="max-w-[min(52rem,100%)]"
              />
            ) : segment.kind === "video" ? (
              <ArticleVideoEmbed
                key={`vid-${i}`}
                src={segment.src}
                caption={segment.caption}
                className="max-w-[min(52rem,100%)]"
              />
            ) : segment.kind === "heading" ? (
              <ArticleContentBlocks
                key={`h-${i}`}
                blocks={[
                  {
                    kind: "heading",
                    level: segment.level,
                    text: segment.text,
                  },
                ]}
              />
            ) : (
              <InternalLinkTeaser
                key={`link-${segment.article.id}-${i}`}
                article={segment.article}
                sourceCategory={article.category}
                templateIndex={segment.templateIndex}
              />
            )
          )}

          {article.contextNote ? (
            <WssContextBox text={article.contextNote} />
          ) : null}

          {hasSourceAttribution(article.originalUrl) ? (
            <SourceAttribution article={article} />
          ) : null}

          {!preview ? <SocialFollowCta /> : null}
        </div>

        {!preview ? (
          <div className="article-panel card-surface mt-10 w-full max-w-none p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10" />
              <span className="overline text-text-muted">Web Space Station</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
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
          </div>
        ) : null}
      </article>
  );

  if (layout === "in-grid") {
    return articleCard;
  }

  return (
    <div
      className={cn(
        cn(ARTICLE_SHELL, "py-6 max-sm:py-5 sm:py-10"),
        className,
      )}
    >
      {articleCard}
    </div>
  );
}
