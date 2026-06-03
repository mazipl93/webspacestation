import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/user";
import { canAccessCms } from "@/lib/auth/permissions";
import { getArticleById } from "@/lib/server/articles";
import { toNewsArticle } from "@/lib/articles";
import ArticleLivePreview from "@/components/admin/ArticleLivePreview";

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { authenticated, user } = await getAuthContext();
  if (!authenticated) redirect("/login");
  if (!user || !canAccessCms(user.role)) redirect("/");

  const row = await getArticleById(id);
  if (!row) notFound();

  const article = toNewsArticle(row);
  const publicHref =
    row.status === "PUBLISHED" ? `/aktualnosci/${row.slug}` : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/articles/${id}/edit`}
          className="inline-flex items-center gap-1.5 text-meta text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Wróć do edycji
        </Link>
        {publicHref ? (
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta text-accent-cyan hover:underline"
          >
            Otwórz na portalu (opublikowany)
          </a>
        ) : null}
      </div>
      <ArticleLivePreview article={article} status={row.status} />
    </div>
  );
}
