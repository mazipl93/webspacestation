import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export default function HomepageSectionHeader({
  label,
  href,
  accent = "#22d3ee",
  glow,
  prominent = false,
  subtitle,
  variant = "label",
  kicker,
  featured = false,
  live = false,
}: {
  label: string;
  href?: string;
  accent?: string;
  glow?: string;
  /** Większy nagłówek — panel boczny desktop (tylko variant label). */
  prominent?: boolean;
  subtitle?: string;
  /** editorial = nagłówek portalu; label = kompaktowa etykieta sekcji. */
  variant?: "editorial" | "label";
  /** Krótka etykieta redakcyjna nad tytułem. */
  kicker?: string;
  /** Większy tytuł + grubszy akcent (sekcje wyróżnione). */
  featured?: boolean;
  /** Delikatna kropka „na żywo” przy kickera. */
  live?: boolean;
}) {
  const moreLink = href ? (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-text-tertiary transition-colors hover:text-accent-cyan sm:text-[12.5px]"
    >
      Więcej
      <ChevronRight
        size={15}
        className="transition-transform duration-300 group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5"
      />
    </Link>
  ) : null;

  if (variant === "editorial") {
    return (
      <div className={cn("relative z-[1]", featured ? "mb-6 sm:mb-7" : "mb-5 sm:mb-6")}>
        {kicker ? (
          <p
            className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] sm:text-[12.5px]"
            style={{ color: accent }}
          >
            {live ? (
              <span className="live-dot shrink-0" style={{ background: accent }} />
            ) : null}
            {kicker}
          </p>
        ) : null}
        <div className="flex items-end justify-between gap-4">
          <h2
            className={cn(
              "font-extrabold tracking-[-0.03em] text-text-primary",
              featured
                ? "text-[1.625rem] sm:text-[1.875rem]"
                : "text-[1.375rem] sm:text-[1.5rem]",
            )}
            style={{ lineHeight: 1.06 }}
          >
            {label}
          </h2>
          {moreLink}
        </div>
        {subtitle ? (
          <p className="mt-2.5 max-w-[640px] text-[15px] leading-relaxed text-text-tertiary md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
        <div
          aria-hidden
          className={cn(
            "w-full",
            featured ? "mt-5 h-1 rounded-full" : "mt-4 h-px",
          )}
          style={{
            background: featured
              ? `linear-gradient(90deg, ${accent} 0%, ${accent}88 38%, ${accent}22 72%, transparent 100%)`
              : `linear-gradient(90deg, ${accent} 0%, ${accent}66 42%, transparent 100%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 flex items-start justify-between gap-3 sm:mb-5",
        prominent && "mb-5 rounded-xl border border-hairline-faint px-4 py-3 sm:px-5",
      )}
      style={
        prominent
          ? {
              background: `linear-gradient(135deg, ${accent}14 0%, transparent 72%)`,
              borderColor: `${accent}33`,
            }
          : undefined
      }
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "shrink-0 rounded-full",
              prominent ? "h-5 w-1" : "h-4 w-[3px]",
            )}
            style={{
              background: accent,
              boxShadow: glow ?? `0 0 12px ${accent}99`,
            }}
          />
          <h2
            className={cn(
              "font-extrabold uppercase tracking-[0.12em] text-text-primary",
              prominent
                ? "text-[15px] sm:text-[14px]"
                : "text-[13px] text-text-secondary sm:text-[12px]",
            )}
          >
            {label}
          </h2>
        </div>
        {subtitle ? (
          <p className="mt-1.5 pl-[18px] text-[12px] leading-snug text-text-tertiary sm:text-[11px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {moreLink}
    </div>
  );
}
