import { cn } from "@/lib/cn";
import type { ArticleStatus } from "@/lib/admin/types";

const STATUS_META: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "Szkic", className: "text-text-tertiary border-hairline bg-white/5" },
  REVIEW: {
    label: "Do sprawdzenia",
    className: "text-accent-amber border-accent-amber/30 bg-accent-amber/10",
  },
  PUBLISHED: {
    label: "Opublikowane",
    className: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  },
  SCHEDULED: {
    label: "Zaplanowane",
    className: "text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10",
  },
  ARCHIVED: { label: "Zarchiwizowany", className: "text-text-muted border-hairline bg-transparent" },
};

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge border px-2 py-0.5 text-overline font-semibold",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}
