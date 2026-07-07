import { cn } from "@/lib/cn";
import type { OpsIssPosition } from "@/lib/ops/types";
import { formatIssForReader } from "@/lib/ops/format-ops-display";
import { formatOpsInteger } from "@/lib/ops/ops-widget-utils";

type Props = {
  iss: OpsIssPosition;
  className?: string;
  variant?: "default" | "hud";
};

export default function OpsIssTelemetry({
  iss,
  className,
  variant = "default",
}: Props) {
  const coords = formatIssForReader(iss);
  const isHud = variant === "hud";
  const [lat, lon] = coords.coords.split(",").map((s) => s.trim());

  return (
    <div
      className={cn(
        isHud
          ? "iss-globe__telemetry-panel"
          : "rounded-lg border border-white/30 bg-[rgba(6,10,18,0.82)] px-3 py-2.5 text-[11px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      )}
    >
      <p
        className={cn(
          "font-bold uppercase tracking-[0.12em] text-accent-cyan",
          isHud
            ? "iss-globe__telemetry-panel__title"
            : "mb-2",
        )}
      >
        ISS · na żywo
      </p>
      <dl
        className={cn(
          "grid grid-cols-[auto_1fr] gap-x-3",
          isHud ? "iss-globe__telemetry-panel__grid" : "gap-y-1",
        )}
      >
        <dt className={isHud ? "iss-globe__telemetry-panel__label" : "text-white/55"}>
          Szerokość
        </dt>
        <dd className={isHud ? "iss-globe__telemetry-panel__value" : "font-medium tabular-nums"}>
          {lat}
        </dd>
        <dt className={isHud ? "iss-globe__telemetry-panel__label" : "text-white/55"}>
          Długość
        </dt>
        <dd className={isHud ? "iss-globe__telemetry-panel__value" : "font-medium tabular-nums"}>
          {lon}
        </dd>
        {iss.altitudeKm != null ? (
          <>
            <dt className={isHud ? "iss-globe__telemetry-panel__label" : "text-white/55"}>
              Wysokość
            </dt>
            <dd className={isHud ? "iss-globe__telemetry-panel__value" : "font-medium tabular-nums"}>
              {iss.altitudeKm} km
            </dd>
          </>
        ) : null}
        {iss.velocityKmh != null ? (
          <>
            <dt className={isHud ? "iss-globe__telemetry-panel__label" : "text-white/55"}>
              Prędkość
            </dt>
            <dd className={isHud ? "iss-globe__telemetry-panel__value" : "font-medium tabular-nums"}>
              {formatOpsInteger(iss.velocityKmh)} km/h
            </dd>
          </>
        ) : null}
        <dt className={isHud ? "iss-globe__telemetry-panel__label" : "text-white/55"}>
          Obieg
        </dt>
        <dd className={isHud ? "iss-globe__telemetry-panel__value" : "font-medium"}>
          ~92 min
        </dd>
      </dl>
    </div>
  );
}
