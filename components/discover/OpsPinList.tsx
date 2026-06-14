"use client";

import { cn } from "@/lib/cn";
import type { OpsMapPin } from "@/lib/ops/types";
import { ISS_MAP_PIN_SRC } from "@/lib/ops/iss-map-pin-icon";

type Props = {
  pins: OpsMapPin[];
  activePinId?: string | null;
  onSelectPin?: (pinId: string) => void;
  compact?: boolean;
  /** Ukryj chip ISS — na /mapa marker wystarcza. */
  hideIss?: boolean;
  /** Dwa boksy pod mapą: starty | kosmodromy. */
  layout?: "stack" | "map-grid";
};

type PinTone = "iss" | "scheduled" | "idle";

function PinChip({
  pin,
  activePinId,
  onSelectPin,
  compact,
  interactive,
  tone,
}: {
  pin: OpsMapPin;
  activePinId?: string | null;
  onSelectPin?: (pinId: string) => void;
  compact?: boolean;
  interactive: boolean;
  tone: PinTone;
}) {
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
        <span className="ops-iss-map-pin ops-iss-map-pin--chip shrink-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ISS_MAP_PIN_SRC} alt="" width={24} height={15} decoding="async" draggable={false} />
        </span>
      ) : (
        <span
          className={cn(
            "shrink-0 rounded-full",
            tone === "scheduled" && "mt-0.5 h-2.5 w-2.5 ring-2 ring-white/90",
            tone === "idle" && "mt-1 h-1.5 w-1.5 opacity-50",
          )}
          style={{ background: tone === "idle" ? "#64748b" : pin.color }}
          aria-hidden
        />
      )}
      <span className="min-w-0 text-left">
        <span
          className={cn(
            "block truncate leading-tight",
            tone === "scheduled" && "text-[12px] font-semibold text-text-primary",
            tone === "idle" && "text-[11px] font-medium text-text-muted",
            tone === "iss" && "text-[12px] font-semibold text-text-primary",
          )}
        >
          {label}
        </span>
        {!compact && pin.kind !== "iss" && tone === "scheduled" ? (
          <span className="mt-0.5 block truncate text-[10px] text-text-tertiary">
            {pin.sublabel.replace(/\s*·\s*start w harmonogramie\s*$/i, "")}
          </span>
        ) : null}
      </span>
    </>
  );

  if (!interactive) {
    return (
      <div
        className={cn(
          "inline-flex max-w-full items-start gap-2 rounded-full border px-3 py-1.5",
          tone === "idle"
            ? "border-transparent px-2 py-1"
            : "border-hairline-faint",
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectPin?.(pin.id)}
      className={cn(
        "inline-flex max-w-full items-start gap-2 rounded-full border transition-colors",
        tone === "iss" &&
          "border-accent-cyan/25 bg-accent-cyan/5 px-3 py-1.5 hover:border-accent-cyan/45 hover:bg-accent-cyan/10",
        tone === "scheduled" &&
          "border-hairline bg-glass/55 px-3 py-1.5 shadow-sm hover:border-hairline hover:bg-glass/70",
        tone === "idle" &&
          "border-transparent bg-transparent px-2 py-1 hover:bg-glass/20",
        isActive &&
          "ring-2 ring-accent-cyan ring-offset-2 ring-offset-[var(--bg-primary,#060910)]",
      )}
      aria-pressed={isActive}
      aria-label={`Pokaż na mapie: ${pin.label}`}
    >
      {inner}
    </button>
  );
}

type PinSectionProps = {
  title: string;
  hint: string;
  groupPins: OpsMapPin[];
  activePinId?: string | null;
  onSelectPin?: (pinId: string) => void;
  compact?: boolean;
  interactive: boolean;
  tone: PinTone;
};

function PinSection({
  title,
  hint,
  groupPins,
  activePinId,
  onSelectPin,
  compact,
  interactive,
  tone,
}: PinSectionProps) {
  if (groupPins.length === 0) return null;

  return (
    <section
      className={cn(
        tone === "scheduled" &&
          "rounded-xl border border-hairline bg-glass/35 p-3 shadow-sm sm:p-3.5",
        tone === "idle" &&
          "rounded-lg border border-hairline-faint/40 bg-transparent px-1 py-2 sm:px-1.5",
        tone === "iss" &&
          "rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-3 sm:p-3.5",
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-3",
          tone === "idle" ? "mb-1.5 px-1" : "mb-2.5",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "uppercase tracking-wider",
                tone === "scheduled" &&
                  "text-[11px] font-bold text-text-primary",
                tone === "idle" &&
                  "text-[10px] font-medium text-text-muted",
                tone === "iss" &&
                  "text-[11px] font-semibold text-text-secondary",
              )}
            >
              {title}
            </h3>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                tone === "scheduled" &&
                  "border border-hairline-faint bg-glass/60 font-semibold text-text-secondary",
                tone === "idle" && "font-normal text-text-muted",
                tone === "iss" &&
                  "border border-hairline-faint font-medium text-text-muted",
              )}
            >
              {groupPins.length}
            </span>
          </div>
          {tone !== "idle" ? (
            <p className="mt-1 text-[10px] leading-snug text-text-tertiary">
              {hint}
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] leading-snug text-text-muted/80">
              {hint}
            </p>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex gap-2",
          tone === "idle"
            ? "flex-wrap gap-x-3 gap-y-0.5 opacity-80"
            : compact
              ? "max-w-full flex-wrap"
              : "flex-col sm:flex-row sm:flex-wrap",
        )}
      >
        {groupPins.map((pin) => (
          <PinChip
            key={pin.id}
            pin={pin}
            activePinId={activePinId}
            onSelectPin={onSelectPin}
            compact={compact}
            interactive={interactive}
            tone={tone}
          />
        ))}
      </div>
    </section>
  );
}

export default function OpsPinList({
  pins,
  activePinId,
  onSelectPin,
  compact = false,
  hideIss = false,
  layout = "stack",
}: Props) {
  const interactive = Boolean(onSelectPin);
  const iss = hideIss ? undefined : pins.find((p) => p.kind === "iss");
  const scheduled = pins.filter(
    (p) => p.scheduled && p.kind !== "iss",
  );
  const cosmodromes = pins.filter(
    (p) => p.kind === "cosmodrome" && !p.scheduled,
  );

  if (!iss && scheduled.length === 0 && cosmodromes.length === 0) {
    return (
      <p className="text-[12px] text-text-tertiary">
        Brak punktów do wyświetlenia. Odśwież za chwilę.
      </p>
    );
  }

  const scheduledSection = (
    <PinSection
      title="Start w harmonogramie"
      hint="Kolorowe pinezki — nadchodzące starty. Kliknij, aby wycentrować mapę."
      groupPins={scheduled}
      activePinId={activePinId}
      onSelectPin={onSelectPin}
      compact={compact}
      interactive={interactive}
      tone="scheduled"
    />
  );

  const cosmodromeSection = (
    <PinSection
      title="Kosmodromy"
      hint="Szare pinezki — platformy bez startu w harmonogramie."
      groupPins={cosmodromes}
      activePinId={activePinId}
      onSelectPin={onSelectPin}
      compact={compact}
      interactive={interactive}
      tone="idle"
    />
  );

  if (layout === "map-grid") {
    return (
      <div className="ops-map-pin-grid">
        {scheduledSection}
        {cosmodromeSection}
      </div>
    );
  }

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3")}>
      {iss ? (
        <PinSection
          title="ISS"
          hint="Pozycja na żywo z trackera orbitalnego."
          groupPins={[iss]}
          activePinId={activePinId}
          onSelectPin={onSelectPin}
          compact={compact}
          interactive={interactive}
          tone="iss"
        />
      ) : null}
      {scheduledSection}
      {cosmodromeSection}
    </div>
  );
}
