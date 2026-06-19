"use client";

import { Eye, Radio, Satellite } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatPassCompact,
  formatPassDuration,
  formatPassPeak,
  formatPassSummary,
  formatPassWindow,
  passBadgeClass,
  passBadgeMeta,
} from "@/lib/ops/format-iss-pass";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
import { POLAND_OBSERVER } from "@/lib/ops/iss-poland-passes.types";
import { useIssPolandPasses } from "@/hooks/useIssPolandPasses";

type Props = {
  limit?: number;
  variant?: "map" | "compact" | "sidebar";
  className?: string;
  initialPasses?: IssPolandPass[];
  initialComputedAt?: string | null;
};

function PassBadge({ kind, small }: { kind: IssPolandPass["observationKind"]; small?: boolean }) {
  const meta = passBadgeMeta(kind);
  return (
    <span
      className={cn("ops-iss-passes__badge", passBadgeClass(kind), small && "ops-iss-passes__badge--sm")}
      title={meta.hint}
    >
      {kind === "visible" ? <Eye size={10} aria-hidden /> : null}
      {kind === "daylight" ? <Radio size={10} aria-hidden /> : null}
      {meta.label}
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
  const { passes, computedAt, tleAt, loading } = useIssPolandPasses({
    limit: sidebar ? Math.max(limit, 8) : limit,
    initialPasses,
    initialComputedAt,
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
            Przeloty nad Polską
          </p>
          {!compact && (
            <p className="ops-iss-passes__sub">
              {sidebar
                ? `Najbliższe 72 h · elewacja ze środka PL`
                : `Tor nad PL · elewacja z ${POLAND_OBSERVER.city} · 72 h`}
            </p>
          )}
        </div>
        <UpdatedAt
          computedAt={computedAt}
          tleAt={tleAt}
          compact={compact || sidebar}
        />
      </header>

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
          Brak przelotów w najbliższych 72 h — sprawdź ponownie za chwilę.
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
              <PassBadge kind={pass.observationKind} small />
            </li>
          ))}
        </ol>
      ) : compact ? (
        <ol className="ops-iss-passes__list ops-iss-passes__list--compact">
          {passes.map((pass) => (
            <li key={pass.id} className="ops-iss-passes__row-compact-wrap">
              <span className="ops-iss-passes__row-compact">{formatPassCompact(pass)}</span>
              <PassBadge kind={pass.observationKind} small />
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
                <PassBadge kind={pass.observationKind} />
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
