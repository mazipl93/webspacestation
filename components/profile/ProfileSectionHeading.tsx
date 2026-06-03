import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  icon: LucideIcon;
  title: string;
  count?: number;
  accentClassName?: string;
  className?: string;
};

export default function ProfileSectionHeading({
  icon: Icon,
  title,
  count,
  accentClassName = "text-accent-cyan",
  className,
}: Props) {
  return (
    <div className={cn("mb-5 flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline bg-glass",
          accentClassName
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-text-primary">{title}</h2>
        {count !== undefined ? (
          <p className="mt-0.5 text-[12px] text-text-muted">
            {count === 1 ? "1 artykuł" : `${count} artykułów`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
