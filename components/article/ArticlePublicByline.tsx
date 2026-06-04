import Avatar from "@/components/profile/Avatar";
import type { PublicArticleByline } from "@/lib/article/resolve-public-byline";
import { cn } from "@/lib/cn";

export default function ArticlePublicByline({
  byline,
  className,
}: {
  byline: PublicArticleByline;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-hairline-faint bg-white/[0.03] px-3.5 py-2.5",
        className
      )}
    >
      {byline.fromTeam ? (
        <Avatar name={byline.name} src={byline.avatarUrl} size={40} squared />
      ) : (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/8 text-meta font-bold text-text-secondary"
          aria-hidden
        >
          {byline.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          Autor
        </p>
        <p className="text-meta font-semibold text-text-primary">{byline.name}</p>
        {byline.roleLabel && byline.fromTeam ? (
          <p className="text-caption text-text-tertiary">{byline.roleLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
