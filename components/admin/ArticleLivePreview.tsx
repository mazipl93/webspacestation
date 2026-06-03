import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types";
import SourceAttribution from "@/components/article/SourceAttribution";
import WssContextBox from "@/components/article/WssContextBox";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { getArticleBodyParagraphs } from "@/lib/articles/display-content";
import { hasSourceAttribution } from "@/lib/ui/article-kind";

export default function ArticleLivePreview({
  article,
  status,
}: {
  article: NewsArticle;
  status: string;
}) {
  const bodyParagraphs = getArticleBodyParagraphs(article);

  return (
    <div className="min-h-dvh bg-space-bg">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-meta text-amber-100">
        Podgląd publikacji — status: <strong>{status}</strong>. Na portalu{" "}
        {status === "PUBLISHED" ? "widoczny" : "jeszcze niewidoczny"}.
      </div>

      <div className="relative aspect-[21/9] max-h-[420px] w-full overflow-hidden bg-space-card">
        <Image
          src={article.imageUrl}
          alt={article.imageCredit ?? article.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {article.imageCredit ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(5,7,9,0.92)] to-transparent px-6 pb-4 pt-12">
            <CoverImageCredit
              credit={article.imageCredit}
              source={article.source}
              originalUrl={article.originalUrl}
            />
          </div>
        ) : null}
      </div>

      <div className="container-site py-10">
        <article className="card-surface mx-auto max-w-3xl p-8 sm:p-10">
          <h1 className="text-headline font-extrabold text-text-primary">{article.title}</h1>
          {article.excerpt ? (
            <p className="mt-4 text-body leading-relaxed text-text-secondary">{article.excerpt}</p>
          ) : null}

          {bodyParagraphs.length > 0 ? (
            <div className="mt-8 space-y-5">
              {bodyParagraphs.map((p, i) => (
                <p key={i} className="text-body leading-relaxed text-text-secondary">
                  {p}
                </p>
              ))}
            </div>
          ) : null}

          {article.contextNote ? (
            <div className="mt-8">
              <WssContextBox text={article.contextNote} />
            </div>
          ) : null}

          {hasSourceAttribution(article.originalUrl) ? (
            <SourceAttribution article={article} />
          ) : null}
        </article>

        <p className="mt-8 text-center text-meta text-text-muted">
          <Link href="/aktualnosci" className="text-accent-cyan hover:underline">
            ← Powrót do aktualności (portal)
          </Link>
        </p>
      </div>
    </div>
  );
}
