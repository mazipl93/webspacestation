import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types";
import SourceAttribution from "@/components/article/SourceAttribution";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { inferRssSource } from "@/lib/admin/rss-display";
import { isRssAggregatorArticle } from "@/lib/rss/is-aggregator";

export default function ArticleLivePreview({
  article,
  status,
  subtitle,
}: {
  article: NewsArticle;
  status: string;
  subtitle?: string | null;
}) {
  const rss = isRssAggregatorArticle({
    source: article.source,
    originalUrl: article.originalUrl,
    subtitle,
  });
  const sourceLabel = inferRssSource({
    source: article.source,
    subtitle,
  });

  return (
    <div className="min-h-dvh bg-space-bg">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-meta text-amber-100">
        Podgląd redakcyjny — status: <strong>{status}</strong>. Na portalu publicznym ten
        wpis {status === "PUBLISHED" ? "jest widoczny" : "nie jest jeszcze widoczny"}.
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
              source={sourceLabel ?? article.source}
              originalUrl={article.originalUrl}
            />
          </div>
        ) : null}
      </div>

      <div className="container-site py-10">
        <article className="card-surface mx-auto max-w-3xl p-8 sm:p-10">
          {rss ? (
            <span className="mb-4 inline-block rounded-md border border-hairline bg-glass px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary">
              Ze świata
            </span>
          ) : null}
          <h1 className="text-headline font-extrabold text-text-primary">{article.title}</h1>
          {article.excerpt ? (
            <p className="mt-4 text-body leading-relaxed text-text-secondary">{article.excerpt}</p>
          ) : null}
          {rss && article.originalUrl ? (
            <div className="mt-8">
              <SourceAttribution article={article} />
            </div>
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
