import Link from "next/link";
import { cn } from "@/lib/cn";

/** Ścieżka nawigacji na hero artykułu — jaśniejsze chipy, odróżnione od daty/czytania. */
export default function HeroBreadcrumbChip({
  href,
  children,
  accent,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  /** Kolor działu (ostatni segment). */
  accent?: string;
  className?: string;
}) {
  const chipClass = cn(
    "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] shadow-[0_2px_14px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors duration-200",
    href && "hover:bg-white/20",
    className,
  );

  const style = accent
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
