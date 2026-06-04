import Link from "next/link";
import { cn } from "@/lib/cn";

/** Ścieżka nawigacji na hero artykułu — jaśniejsze chipy, odróżnione od daty/czytania. */
export default function HeroBreadcrumbChip({
  href,
  children,
  accent,
  variant = "overlay",
  className,
}: {
  href?: string;
  children: React.ReactNode;
  /** Kolor działu (ostatni segment). */
  accent?: string;
  /** overlay = na zdjęciu; panel = pod okładką (mobile). */
  variant?: "overlay" | "panel";
  className?: string;
}) {
  const chipClass = cn(
    "inline-flex items-center rounded-md border font-semibold uppercase tracking-[0.1em] transition-colors duration-200",
    variant === "overlay"
      ? "px-2.5 py-1 text-[11px] shadow-[0_2px_14px_rgba(0,0,0,0.35)] backdrop-blur-md"
      : "min-h-[36px] shrink-0 px-3 py-1.5 text-[11px] bg-glass text-text-secondary shadow-none",
    href &&
      (variant === "overlay"
        ? "hover:bg-white/20"
        : "hover:border-hairline-strong hover:text-text-primary"),
    className,
  );

  const style =
    variant === "panel"
      ? accent
        ? {
            color: accent,
            borderColor: `${accent}44`,
            background: `${accent}10`,
          }
        : undefined
      : accent
        ? {
            color: accent,
            borderColor: `${accent}55`,
            background: `linear-gradient(135deg, ${accent}22 0%, rgba(255,255,255,0.06) 100%)`,
          }
        : {
            color: "rgba(255,255,255,0.94)",
            borderColor: "rgba(255,255,255,0.28)",
            background: "rgba(255,255,255,0.12)",
          };

  if (href) {
    return (
      <Link href={href} className={chipClass} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <span className={chipClass} style={style}>
      {children}
    </span>
  );
}
