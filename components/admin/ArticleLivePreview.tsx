import Link from "next/link";
import type { NewsArticle } from "@/types";
import ArticlePublicPreview from "@/components/article/ArticlePublicPreview";

export default function ArticleLivePreview({
  article,
  status,
}: {
  article: NewsArticle;
  status: string;
}) {
  return (
    <div className="min-h-dvh bg-space-bg">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-meta text-amber-100">
        Podgląd publikacji — status: <strong>{status}</strong>. Na portalu{" "}
        {status === "PUBLISHED" ? "widoczny" : "jeszcze niewidoczny"}.
      </div>

      <ArticlePublicPreview article={article} embedded viewport="desktop" />

      <p className="mt-8 pb-10 text-center text-meta text-text-muted">
        <Link href="/aktualnosci" className="text-accent-cyan hover:underline">
          ← Powrót do aktualności (portal)
        </Link>
      </p>
    </div>
  );
}
