"use client";

import { cn } from "@/lib/cn";
import type { OpsMapPin } from "@/lib/ops/types";

type Props = {
  pins: OpsMapPin[];
  activePinId?: string | null;
  onSelectPin?: (pinId: string) => void;
  compact?: boolean;
};

export default function OpsPinList({
  pins,
  activePinId,
  onSelectPin,
  compact = false,
}: Props) {
  const iss = pins.find((p) => p.kind === "iss");
  const pads = pins.filter((p) => p.kind === "pad");
  const ordered = iss ? [iss, ...pads] : pads;
  const interactive = Boolean(onSelectPin);

  if (ordered.length === 0) {
    return (
      <p className="text-[12px] text-text-tertiary">
        Brak punktów do wyświetlenia. Odśwież za chwilę.
      </p>
    );
  }

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3")}>
      <div
        className={cn(
          "flex gap-2",
          compact
            ? "max-w-full flex-wrap"
            : "flex-col sm:flex-row sm:flex-wrap"
        )}
        role={interactive ? "list" : undefined}
      >
        {ordered.map((pin) => {
          const isActive = activePinId === pin.id;
          const label =
            pin.kind === "iss"
              ? pin.label
              : pin.label.length > 36
                ? `${pin.label.slice(0, 34)}…`
                : pin.label;

          const inner = (
            <>
              {pin.kind === "iss" ? (
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-[12px]"
                  aria-hidden
                >
                  🛰
                </span>
              ) : (
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: pin.color }}
                  aria-hidden
                />
              )}
              <span className="min-w-0 text-left">
                <span className="block truncate text-[12px] font-semibold leading-tight text-text-primary">
                  {label}
                </span>
                {pin.kind === "pad" && !compact ? (
                  <span className="mt-0.5 block truncate text-[10px] text-text-tertiary">
                    {pin.sublabel}
                  </span>
                ) : null}
              </span>
            </>
          );

          if (!interactive) {
            return (
              <div
                key={pin.id}
                className="inline-flex max-w-full items-start gap-2 rounded-full border border-hairline-faint px-3 py-1.5"
              >
                {inner}
              </div>
            );
          }

          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => onSelectPin?.(pin.id)}
              className={cn(
                "inline-flex max-w-full items-start gap-2 rounded-full border px-3 py-1.5 transition-colors",
                pin.kind === "iss"
                  ? "border-accent-cyan/25 bg-accent-cyan/5 hover:border-accent-cyan/45 hover:bg-accent-cyan/10"
                  : "border-hairline-faint bg-glass/40 hover:border-hairline hover:bg-glass",
                isActive &&
                  "ring-2 ring-accent-cyan ring-offset-2 ring-offset-[var(--bg-primary,#060910)]"
              )}
              aria-pressed={isActive}
              aria-label={`Pokaż na mapie: ${pin.label}`}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
