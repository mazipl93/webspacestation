import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function spotlightPanelStyle(accent: string, strong = false) {
  const top = strong ? "1a" : "16";
  const border = strong ? "38" : "2e";
  const shadow = strong ? "62" : "44";

  return {
    borderColor: `${accent}${border}`,
    background: `linear-gradient(152deg, ${accent}${top} 0%, ${accent}06 32%, transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 38%), var(--color-space-card)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 28px 72px -32px ${accent}${shadow}`,
  } as const;
}

type Props = {
  accent: string;
  children: ReactNode;
  className?: string;
  /** Mocniejszy blask — Temat tygodnia. */
  strong?: boolean;
  /** Cienki pasek akcentu u góry panelu. */
  topStripe?: boolean;
};

/** Wspólny panel redakcyjny homepage (Najnowsze, Popularne, działy…). */
export default function HomepageSpotlightPanel({
  accent,
  children,
  className,
  strong = false,
  topStripe = false,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 sm:p-5 lg:p-6",
        className,
      )}
      style={spotlightPanelStyle(accent, strong)}
    >
      {topStripe ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accent} 22%, ${accent}cc 50%, ${accent} 78%, transparent 100%)`,
          }}
        />
      ) : null}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-full blur-3xl",
          strong
            ? "-left-24 -top-28 h-64 w-64 opacity-40"
            : "-right-16 -top-20 h-48 w-48 opacity-30",
        )}
        style={{ background: accent }}
      />
      {strong ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: accent }}
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
