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
}: {
  label: string;
  href?: string;
  accent?: string;
  glow?: string;
  /** Większy nagłówek — panel boczny desktop. */
  prominent?: boolean;
  subtitle?: string;
}) {
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
      {href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-0.5 pt-0.5 text-[13px] font-semibold text-text-tertiary transition-colors hover:text-accent-cyan sm:text-[12px]"
        >
          Więcej
          <ChevronRight size={15} className="sm:h-3.5 sm:w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
