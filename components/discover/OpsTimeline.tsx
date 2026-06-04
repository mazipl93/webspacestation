import { cn } from "@/lib/cn";
import type { OpsCalendarEvent } from "@/lib/ops/types";

type Props = {
  events: OpsCalendarEvent[];
  year?: number;
  variant?: "strip" | "page";
};

export default function OpsTimeline({
  events,
  year = new Date().getUTCFullYear(),
  variant = "strip",
}: Props) {
  const isPage = variant === "page";
  const sorted = [...events].sort(
    (a, b) => new Date(a.net).getTime() - new Date(b.net).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-[13px] text-text-tertiary">
        Brak zaplanowanych startów w feedzie Launch Library.
      </p>
    );
  }

  return (
    <div
      className={
        isPage
          ? "card-surface rounded-xl border border-hairline p-5 sm:p-6"
          : undefined
      }
    >
      {!isPage && (
        <p className="mb-3 text-[12px] leading-relaxed text-text-tertiary">
          Każdy punkt to{" "}
          <strong className="font-semibold text-text-secondary">rzeczywisty termin startu</strong>{" "}
          (NET) z Launch Library — nie plan redakcyjny ani spekulacja.
        </p>
      )}
      <div
        className={cn(
          "flex items-start gap-6",
          isPage ? "flex-col sm:flex-row sm:gap-8" : "overflow-x-auto pb-1 scrollbar-none"
        )}
      >
        <div className={cn("shrink-0", isPage ? "pt-0" : "pt-2")}>
          <span
            className={cn(
              "font-extrabold leading-none text-text-primary",
              isPage ? "text-[36px] sm:text-[42px]" : "text-[28px]"
            )}
            style={{ letterSpacing: "-0.03em" }}
          >
            {year}
          </span>
          {isPage && (
            <p className="mt-2 max-w-[24ch] text-[12px] leading-relaxed text-text-tertiary">
              Harmonogram nadchodzących startów rakiet (NET, UTC)
            </p>
          )}
        </div>
        <div className={cn("relative min-w-0 flex-1", isPage ? "w-full pt-0" : "pt-2")}>
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background: "var(--hairline)",
              top: isPage ? 11 : 19,
            }}
          />
          <div
            className={cn(
              "relative flex",
              isPage ? "flex-wrap gap-x-8 gap-y-10 sm:gap-x-10" : "gap-5"
            )}
          >
            {sorted.map((ev) => (
              <div
                key={ev.id}
                className={cn(
                  "flex shrink-0 flex-col items-center",
                  isPage ? "min-w-[100px] sm:min-w-[108px]" : ""
                )}
                style={isPage ? undefined : { minWidth: 92 }}
              >
                <div
                  className={cn(
                    "z-10 mb-2.5 rounded-full border-2",
                    isPage ? "h-3 w-3" : "h-2.5 w-2.5",
                    ev.active
                      ? "border-accent-blue bg-accent-blue shadow-[0_0_12px_rgba(47,109,255,0.7)]"
                      : "border-space-muted bg-space-surface"
                  )}
                />
                <span
                  className={cn(
                    "mb-1 font-bold uppercase tracking-[0.1em]",
                    ev.active ? "text-accent-blue" : "text-text-tertiary",
                    isPage ? "text-[10px]" : "text-[9px]"
                  )}
                >
                  {isPage ? ev.quarter : ev.dateLabel}
                </span>
                {ev.active && !isPage && (
                  <span className="mb-1 text-[8px] font-bold uppercase tracking-[0.12em] text-accent-cyan">
                    Najbliższy
                  </span>
                )}
                <p
                  className={cn(
                    "text-center leading-snug text-text-secondary",
                    isPage ? "whitespace-pre-line text-[12px]" : "text-[11px] font-semibold"
                  )}
                >
                  {ev.title}
                </p>
                {ev.hint && (
                  <p
                    className={cn(
                      "mt-1.5 text-center text-text-muted",
                      isPage ? "text-[10px]" : "text-[9px] leading-snug"
                    )}
                  >
                    {ev.hint}
                  </p>
                )}
                {ev.active && isPage && (
                  <span className="mt-2 inline-flex rounded-full border border-accent-blue/30 bg-accent-blue/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent-blue">
                    Najbliższy start
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
