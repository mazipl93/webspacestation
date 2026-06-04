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

  if (events.length === 0) {
    return (
      <p className="text-[13px] text-text-tertiary">Brak zaplanowanych wydarzeń w feedzie.</p>
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
            <p className="mt-2 max-w-[20ch] text-[12px] leading-relaxed text-text-tertiary">
              Terminy z Launch Library (NET)
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
              isPage ? "flex-wrap gap-x-8 gap-y-10 sm:gap-x-10" : "gap-6"
            )}
          >
            {events.map((ev) => (
              <div
                key={ev.id}
                className={cn(
                  "flex shrink-0 flex-col items-center",
                  isPage ? "min-w-[100px] sm:min-w-[108px]" : ""
                )}
                style={isPage ? undefined : { minWidth: 88 }}
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
                    "mb-1.5 font-bold uppercase tracking-[0.12em] text-text-tertiary",
                    isPage ? "text-[10px]" : "text-[9px]"
                  )}
                >
                  {ev.quarter}
                </span>
                <p
                  className={cn(
                    "whitespace-pre-line text-center leading-snug text-text-secondary",
                    isPage ? "text-[12px]" : "text-[10.5px]"
                  )}
                >
                  {ev.title}
                </p>
                {isPage && ev.hint && (
                  <p className="mt-2 text-center text-[10px] text-text-muted">{ev.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
