import type { ArticleWithRelations } from "@/lib/server/articles";
import { cmsRoleLabel } from "@/lib/ui/cms-role-labels";

export type PublicArticleByline = {
  name: string;
  avatarUrl?: string;
  roleLabel?: string;
  /** true when linked CMS user; false = free-text only */
  fromTeam: boolean;
};

export function resolvePublicArticleByline(
  article: Pick<ArticleWithRelations, "authorByline" | "bylineUser">
): PublicArticleByline | undefined {
  if (article.bylineUser) {
    return {
      name: article.bylineUser.name,
      avatarUrl: article.bylineUser.avatarUrl?.trim() || undefined,
      roleLabel: cmsRoleLabel(article.bylineUser.role),
      fromTeam: true,
    };
  }

  const manual = article.authorByline?.trim();
  if (!manual) return undefined;

  return { name: manual, fromTeam: false };
}
