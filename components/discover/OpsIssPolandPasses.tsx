"use client";

import { useState } from "react";
import { Eye, Satellite } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatPassCompact,
  formatPassDuration,
  formatPassPeak,
  formatPassSummary,
  formatPassWindow,
} from "@/lib/ops/format-iss-pass";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
import { useIssPolandPasses } from "@/hooks/useIssPolandPasses";
import IssLocationPicker, { type IssLocation } from "@/components/discover/IssLocationPicker";

type Props = {
  limit?: number;
  variant?: "map" | "compact" | "sidebar";
  className?: string;
  initialPasses?: IssPolandPass[];
  initialComputedAt?: string | null;
};

function VisibleBadge({ small }: { small?: boolean }) {
  return (
    <span
      className={cn("ops-iss-passes__badge ops-iss-passes__badge--visible", small && "ops-iss-passes__badge--sm")}
      title="Ciemne niebo, ISS oświetlona — widoczna gołym okiem"
    >
      <Eye size={10} aria-hidden />
      Widoczny
    </span>
  );
}

function UpdatedAt({
  computedAt,
  tleAt,
  compact,
}: {
  computedAt: string | null;
  tleAt?: string | null;
  compact?: boolean;
}) {
  const stamp = tleAt ?? computedAt;
  if (!stamp) return null;
  const label = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(stamp));

  return (
    <span
      className={cn(
        "ops-iss-passes__fresh inline-flex items-center gap-1 text-text-muted",
        compact ? "text-[9px]" : "text-[10px]",
      )}
      title="Ten sam propagator SGP4 i TLE co mapa ISS"
    >
      <span className="ops-iss-passes__fresh-dot" aria-hidden />
      SGP4 · {label}
    </span>
  );
}

export default function OpsIssPolandPasses({
  limit = 4,
  variant = "map",
  className,
  initialPasses,
  initialComputedAt,
}: Props) {
  const compact = variant === "compact";
  const sidebar = variant === "sidebar";

  const [location, setLocation] = useState<IssLocation | null>(null);

  const { passes, computedAt, tleAt, loading } = useIssPolandPasses({
    limit: sidebar ? Math.max(limit, 8) : limit,
    initialPasses: location ? [] : initialPasses,
    initialComputedAt: location ? null : initialComputedAt,
    lat: location?.lat,
    lon: location?.lon,
  });

  return (
    <section
      className={cn(
        "ops-iss-passes",
        compact && "ops-iss-passes--compact",
        sidebar && "ops-iss-passes--sidebar",
        className,
      )}
      aria-label="Przeloty ISS nad Polską"
    >
      <header className="ops-iss-passes__header">
        <div className="min-w-0">
          <p className="ops-iss-passes__kicker">
            <Satellite size={compact ? 11 : 13} aria-hidden />
            {location ? `Widoczne z: ${location.name}` : "Widoczne z Polski"}
          </p>
          {!compact && (
            <p className="ops-iss-passes__sub">
              {sidebar
                ? `Najbliższe 10 dni · tylko przeloty widoczne gołym okiem`
                : `Ciemne niebo + ISS oświetlona · 10 dni naprzód`}
            </p>
          )}
        </div>
        <UpdatedAt
          computedAt={computedAt}
          tleAt={tleAt}
          compact={compact || sidebar}
        />
      </header>

      {!compact && (
        <IssLocationPicker
          location={location}
          onChange={setLocation}
          className="ops-iss-passes__location"
        />
      )}

      {loading && passes.length === 0 ? (
        <div className="ops-iss-passes__skeleton" aria-hidden>
          {Array.from({ length: compact ? 3 : sidebar ? 5 : limit }, (_, i) => (
            <div
              key={i}
              className={cn(
                "ops-iss-passes__skeleton-row",
                (compact || sidebar) && "ops-iss-passes__skeleton-row--compact",
              )}
            />
          ))}
        </div>
      ) : passes.length === 0 ? (
        <p className="ops-iss-passes__empty">
          {location
            ? `Brak widocznych przelotów nad ${location.name} w najbliższych 10 dniach.`
            : "Brak widocznych przelotów w najbliższych 10 dniach — latem w Polsce to normalne (białe noce). Sprawdź ponownie za kilka dni."}
        </p>
      ) : sidebar ? (
        <ol className="ops-iss-passes__sidebar-list">
          {passes.map((pass, i) => (
            <li key={pass.id} className="ops-iss-passes__sidebar-row">
              <span className="ops-iss-passes__sidebar-num">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="ops-iss-passes__sidebar-peak">{formatPassPeak(pass)}</p>
                <p className="ops-iss-passes__sidebar-meta">
                  {formatPassSummary(pass)} · tor {formatPassWindow(pass)}
                </p>
                <p className="ops-iss-passes__sidebar-detail">
                  {formatPassDuration(pass.durationSec)} nad PL
                </p>
              </div>
              <VisibleBadge small />
            </li>
          ))}
        </ol>
      ) : compact ? (
        <ol className="ops-iss-passes__list ops-iss-passes__list--compact">
          {passes.map((pass) => (
            <li key={pass.id} className="ops-iss-passes__row-compact-wrap">
              <span className="ops-iss-passes__row-compact">{formatPassCompact(pass)}</span>
              <VisibleBadge small />
            </li>
          ))}
        </ol>
      ) : (
        <ol className="ops-iss-passes__list">
          {passes.map((pass, i) => (
            <li key={pass.id} className="ops-iss-passes__item">
              <div className="ops-iss-passes__item-top">
                <span className="ops-iss-passes__index">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="ops-iss-passes__window">
                    Szczyt {formatPassPeak(pass)}
                  </p>
                  <p className="ops-iss-passes__meta">
                    {formatPassSummary(pass)} · tor {formatPassWindow(pass)}
                  </p>
                </div>
                <VisibleBadge />
              </div>
              <p className="ops-iss-passes__detail">
                {formatPassDuration(pass.durationSec)} nad terytorium Polski
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
