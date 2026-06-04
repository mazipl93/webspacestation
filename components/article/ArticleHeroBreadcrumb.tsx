import { ChevronRight } from "lucide-react";
import { getCategoryInfo } from "@/lib/categories";
import { cn } from "@/lib/cn";
import HeroBreadcrumbChip from "@/components/article/HeroBreadcrumbChip";

type Props = {
  categorySlug: string;
  variant?: "overlay" | "panel";
  className?: string;
};

/** WSS → Aktualności → dział (wspólne dla hero desktop i panelu mobile). */
export default function ArticleHeroBreadcrumb({
  categorySlug,
  variant = "overlay",
  className,
}: Props) {
  const cat = getCategoryInfo(categorySlug);
  const onPanel = variant === "panel";
  const sepClass = onPanel ? "text-text-muted" : "text-white/40";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        onPanel
          ? "flex items-center gap-1.5 overflow-x-auto overscroll-x-contain scrollbar-none [-webkit-overflow-scrolling:touch]"
          : "flex flex-wrap items-center gap-1.5 sm:gap-2",
        className,
      )}
    >
      <HeroBreadcrumbChip href="/" variant={variant} className="shrink-0">
        WSS
      </HeroBreadcrumbChip>
      <ChevronRight size={12} className={cn("shrink-0", sepClass)} aria-hidden />
      <HeroBreadcrumbChip href="/aktualnosci" variant={variant} className="shrink-0">
        Aktualności
      </HeroBreadcrumbChip>
      <ChevronRight size={12} className={cn("shrink-0", sepClass)} aria-hidden />
      <HeroBreadcrumbChip
        href={cat.href}
        variant={variant}
        accent={cat.color}
        className="max-w-[min(100%,14rem)] shrink-0 truncate sm:max-w-none"
        title={cat.label}
      >
        {cat.label}
      </HeroBreadcrumbChip>
    </nav>
  );
}
