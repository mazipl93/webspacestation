import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategoryInfo } from "@/lib/categories";
import { cn } from "@/lib/cn";
import HeroBreadcrumbChip from "@/components/article/HeroBreadcrumbChip";

type Props = {
  categorySlug: string;
  variant?: "overlay" | "panel" | "compact";
  className?: string;
};

/** WSS → Aktualności → dział. `compact` = bez szerokiej ramki (pod okładką). */
export default function ArticleHeroBreadcrumb({
  categorySlug,
  variant = "compact",
  className,
}: Props) {
  const cat = getCategoryInfo(categorySlug);

  if (variant === "compact") {
    const linkClass =
      "shrink-0 text-[12px] font-medium text-text-tertiary transition-colors hover:text-text-primary";

    return (
      <nav
        aria-label="Breadcrumb"
        className={cn("flex w-fit max-w-full flex-wrap items-center gap-1", className)}
      >
        <Link href="/" className={linkClass}>
          WSS
        </Link>
        <ChevronRight size={11} className="shrink-0 text-text-muted" aria-hidden />
        <Link href="/aktualnosci" className={linkClass}>
          Aktualności
        </Link>
        <ChevronRight size={11} className="shrink-0 text-text-muted" aria-hidden />
        <Link
          href={cat.href}
          className="shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors hover:opacity-90"
          style={{ color: cat.color }}
          title={cat.label}
        >
          {cat.label}
        </Link>
      </nav>
    );
  }

  const onPanel = variant === "panel";
  const sepClass = onPanel ? "text-text-muted" : "text-white/40";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        onPanel
          ? "flex w-fit max-w-full flex-wrap items-center gap-1.5"
          : "flex flex-wrap items-center gap-1.5 sm:gap-2",
        className,
      )}
    >
      <HeroBreadcrumbChip href="/" variant={variant === "overlay" ? "overlay" : "panel"} className="shrink-0">
        WSS
      </HeroBreadcrumbChip>
      <ChevronRight size={12} className={cn("shrink-0", sepClass)} aria-hidden />
      <HeroBreadcrumbChip
        href="/aktualnosci"
        variant={variant === "overlay" ? "overlay" : "panel"}
        className="shrink-0"
      >
        Aktualności
      </HeroBreadcrumbChip>
      <ChevronRight size={12} className={cn("shrink-0", sepClass)} aria-hidden />
      <HeroBreadcrumbChip
        href={cat.href}
        variant={variant === "overlay" ? "overlay" : "panel"}
        accent={cat.color}
        className="max-w-[14rem] shrink-0 truncate"
        title={cat.label}
      >
        {cat.label}
      </HeroBreadcrumbChip>
    </nav>
  );
}
