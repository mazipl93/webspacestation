"use client";

import { Clock, Eye, Satellite } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatPassDuration,
  formatPassSummary,
  formatPassWindow,
} from "@/lib/ops/format-iss-pass";
import { POLAND_OBSERVER } from "@/lib/ops/iss-poland-passes";
import { useIssPolandPasses } from "@/hooks/useIssPolandPasses";

type Props = {
  limit?: number;
  variant?: "map" | "compact";
  className?: string;
};

function UpdatedAt({ computedAt }: { computedAt: string | null }) {
  if (!computedAt) return null;
  const label = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(computedAt));

  return (
    <span className="text-[10px] text-text-muted">
      TLE · aktualizacja {label}
    </span>
  );
}

export default function OpsIssPolandPasses({
  limit = 4,
  variant = "map",
  className,
}: Props) {
  const { passes, computedAt, loading } = useIssPolandPasses(limit);
  const compact = variant === "compact";

  return (
    <section
      className={cn("ops-iss-passes", compact && "ops-iss-passes--compact", className)}
      aria-label="Przeloty ISS nad Polską"
    >
      <header className="ops-iss-passes__header">
        <div className="min-w-0">
          <p className="ops-iss-passes__kicker">
            <Satellite size={compact ? 12 : 14} aria-hidden />
            Przeloty nad Polską
          </p>
          <p className="ops-iss-passes__sub">
            {compact
              ? `${limit} najbliższe · elewacja z ${POLAND_OBSERVER.city}`
              : `Ground track + elewacja z ${POLAND_OBSERVER.city} · TLE/SGP4`}
          </p>
        </div>
        <UpdatedAt computedAt={computedAt} />
      </header>

      {loading && passes.length === 0 ? (
        <div className="ops-iss-passes__skeleton" aria-hidden>
          {Array.from({ length: limit }, (_, i) => (
            <div key={i} className="ops-iss-passes__skeleton-row" />
          ))}
        </div>
      ) : passes.length === 0 ? (
        <p className="ops-iss-passes__empty">
          Brak przelotów w najbliższych 48 h — sprawdź ponownie za chwilę.
        </p>
      ) : (
        <ol className="ops-iss-passes__list">
          {passes.map((pass, i) => (
            <li key={pass.id} className="ops-iss-passes__item">
              <div className="ops-iss-passes__item-top">
                <span className="ops-iss-passes__index">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="ops-iss-passes__window">
                    <Clock size={11} className="shrink-0 opacity-70" aria-hidden />
                    {formatPassWindow(pass)}
                  </p>
                  <p className="ops-iss-passes__meta">{formatPassSummary(pass)}</p>
                </div>
                {pass.visible ? (
                  <span className="ops-iss-passes__badge ops-iss-passes__badge--visible">
                    <Eye size={10} aria-hidden />
                    Widoczny
                  </span>
                ) : (
                  <span className="ops-iss-passes__badge">Nad horizontem</span>
                )}
              </div>
              {!compact && (
                <p className="ops-iss-passes__detail">
                  Czas nad terytorium: {formatPassDuration(pass.durationSec)} · szczyt o{" "}
                  {new Intl.DateTimeFormat("pl-PL", {
                    timeZone: "Europe/Warsaw",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(pass.maxAt))}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
