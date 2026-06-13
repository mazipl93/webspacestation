import { cn } from "@/lib/cn";
import type { OpsIssPosition } from "@/lib/ops/types";
import { formatIssForReader } from "@/lib/ops/format-ops-display";

type Props = {
  iss: OpsIssPosition;
  className?: string;
};

export default function OpsIssTelemetry({ iss, className }: Props) {
  const coords = formatIssForReader(iss);

  return (
    <div
      className={cn(
        "rounded-lg border border-white/30 bg-[rgba(6,10,18,0.82)] px-3 py-2.5 text-[11px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      )}
    >
      <p className="mb-2 font-bold uppercase tracking-[0.12em] text-accent-cyan">
        ISS · na żywo
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-white/55">Szerokość</dt>
        <dd className="font-medium tabular-nums">{coords.coords.split(",")[0]?.trim()}</dd>
        <dt className="text-white/55">Długość</dt>
        <dd className="font-medium tabular-nums">{coords.coords.split(",")[1]?.trim()}</dd>
        {iss.altitudeKm != null && (
          <>
            <dt className="text-white/55">Wysokość</dt>
            <dd className="font-medium tabular-nums">{iss.altitudeKm} km</dd>
          </>
        )}
        {iss.velocityKmh != null && (
          <>
            <dt className="text-white/55">Prędkość</dt>
            <dd className="font-medium tabular-nums">
              {iss.velocityKmh.toLocaleString("pl-PL")} km/h
            </dd>
          </>
        )}
        <dt className="text-white/55">Obieg</dt>
        <dd className="font-medium">~92 min</dd>
      </dl>
    </div>
  );
}
