import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HomepageSectionTheme } from "@/lib/home/homepage-section-themes";

type Props = {
  theme: HomepageSectionTheme;
  accent: string;
  accentAlt?: string;
  children: ReactNode;
  className?: string;
};

function meshBg(accent: string): CSSProperties {
  return {
    backgroundImage: `
      linear-gradient(${accent}08 1px, transparent 1px),
      linear-gradient(90deg, ${accent}08 1px, transparent 1px)
    `,
    backgroundSize: "24px 24px",
  };
}

/** Unikalna ramka sekcji homepage — każdy dział wygląda inaczej. */
export default function DepartmentSectionFrame({
  theme,
  accent,
  accentAlt,
  children,
  className,
}: Props) {
  const alt = accentAlt ?? accent;

  if (theme === "week-topic") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}40`,
          background: `linear-gradient(145deg, ${accent}1c 0%, ${alt}0a 40%, transparent 70%), var(--color-space-card)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 32px 80px -36px ${accent}66`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, ${alt}, transparent)`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 -top-32 h-72 w-72 rounded-full opacity-45 blur-3xl"
          style={{ background: accent }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
          style={{ background: alt }}
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "latest") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-2xl border p-4 sm:p-5 lg:p-6",
          className,
        )}
        style={{
          borderColor: `${accent}2e`,
          background: `linear-gradient(148deg, ${accent}14 0%, ${accent}05 30%, transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 36%), var(--color-space-card)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 28px 72px -32px ${accent}44`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-30 blur-3xl"
          style={{ background: accent }}
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "popular") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-3xl border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}35`,
          background: `radial-gradient(ellipse 90% 70% at 50% 110%, ${accent}22 0%, transparent 55%), var(--color-space-card)`,
          boxShadow: `inset 0 -2px 0 ${accent}33, 0 24px 64px -28px ${alt}55`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-0 h-32 rounded-full opacity-30 blur-3xl"
          style={{ background: alt }}
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "technologie") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-xl border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}38`,
          background: `linear-gradient(180deg, ${accent}0c 0%, transparent 45%), var(--color-space-card)`,
          boxShadow: `inset 4px 0 0 ${accent}, 0 20px 56px -32px ${accent}44`,
          ...meshBg(accent),
        }}
      >
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "astronomia") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-[1.25rem] border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}30`,
          background: `radial-gradient(ellipse 60% 50% at 10% 0%, ${accent}20 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 95% 100%, ${alt}18 0%, transparent 45%), var(--color-space-card)`,
          boxShadow: `0 28px 72px -36px ${accent}55`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 60% 70%, white, transparent), radial-gradient(1px 1px at 80% 20%, white, transparent), radial-gradient(1.5px 1.5px at 40% 80%, white, transparent)`,
          }}
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "misje") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}33`,
          background: `linear-gradient(118deg, ${accent}14 0%, transparent 42%), var(--color-space-card)`,
          boxShadow: `0 24px 64px -32px ${accent}50`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rotate-12 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, transparent 70%)`,
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          }}
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "ziemia-z-kosmosu") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}30`,
          background: `linear-gradient(180deg, ${accent}12 0%, transparent 38%), var(--color-space-card)`,
          boxShadow: `inset 0 2px 0 ${accent}44, 0 24px 60px -30px ${accent}40`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{
            background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${accent}25 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "iss") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-lg border-y border-r p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}40`,
          borderLeftWidth: 6,
          borderLeftColor: accent,
          background: `repeating-linear-gradient(90deg, ${accent}06 0, ${accent}06 1px, transparent 1px, transparent 48px), var(--color-space-card)`,
          boxShadow: `4px 0 24px -8px ${accent}55`,
        }}
      >
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  if (theme === "nauka") {
    return (
      <div
        className={cn(
          "editorial-surface relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7",
          className,
        )}
        style={{
          borderColor: `${accent}38`,
          background: `radial-gradient(ellipse 70% 55% at 0% 0%, ${accent}1a 0%, transparent 52%), radial-gradient(ellipse 50% 45% at 100% 100%, ${alt}14 0%, transparent 48%), var(--color-space-card)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px -32px ${accent}55`,
        }}
      >
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "editorial-surface relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7",
        className,
      )}
      style={{
        borderColor: `${accent}44`,
        borderTopWidth: 3,
        borderTopColor: accent,
        background: `linear-gradient(180deg, ${accent}0e 0%, transparent 35%), var(--color-space-card)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 56px -28px ${accent}44`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
