"use client";

import { useEffect, useMemo, useState } from "react";
import { ReferenceArea, ReferenceLine } from "recharts";
import type { SolarWindData } from "@/lib/aurora/api";
import {
  getBzChartDomain,
  getBzColor,
  getVisibleBzThresholds,
  getVisibleBzZones,
} from "@/lib/aurora/api";
import {
  buildWindChartData,
  fmtUtcShort,
  resolveEarthMarker,
  SolarWindChartRow,
} from "./solar-wind-chart";

export type WindTimeWindow = 60 | 180 | 360;

const WINDOW_OPTIONS: { value: WindTimeWindow; label: string }[] = [
  { value: 60, label: "1h" },
  { value: 180, label: "3h" },
  { value: 360, label: "6h" },
];

type Props = {
  data: SolarWindData[];
  windowMin?: WindTimeWindow;
  height?: number;
  showWindowControl?: boolean;
  variant?: "full" | "teaser";
  className?: string;
};

export default function SolarWindBzChart({
  data,
  windowMin: windowMinProp,
  height = 220,
  showWindowControl = false,
  variant = "full",
  className,
}: Props) {
  const isTeaser = variant === "teaser";
  const [internalWindow, setInternalWindow] = useState<WindTimeWindow>(isTeaser ? 60 : 180);
  const windowMin = windowMinProp ?? internalWindow;

  useEffect(() => {
    if (windowMinProp != null || isTeaser) return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setInternalWindow(360);
    }
  }, [windowMinProp, isTeaser]);

  const windSlice = useMemo(() => data.slice(-windowMin), [data, windowMin]);
  const l1 = windSlice.at(-1);
  const l1Bz = l1?.bz ?? 0;
  const bzColor = getBzColor(l1Bz);
  const bzSublabel = l1Bz < 0 ? "poludniowa" : "polnocna";

  const chartData = useMemo(() => buildWindChartData(windSlice), [windSlice]);
  const marker = useMemo(
    () => resolveEarthMarker(windSlice, chartData),
    [windSlice, chartData],
  );
  const l1Timestamp = marker?.l1Utc ?? fmtUtcShort(l1?.time_tag);
  const yDomain = useMemo(() => getBzChartDomain(chartData.map((d) => d.bz)), [chartData]);
  const bzZones = useMemo(() => getVisibleBzZones(yDomain), [yDomain]);
  const bzThresholds = useMemo(() => getVisibleBzThresholds(yDomain), [yDomain]);

  return (
    <div className={className}>
      {showWindowControl && (
        <div className="mb-2 flex justify-end">
          <div className="flex rounded-md border border-slate-700 overflow-hidden">
            {WINDOW_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setInternalWindow(value)}
                className={`px-2.5 py-1 text-[9px] font-mono transition-colors ${
                  windowMin === value
                    ? "bg-slate-700 text-sky-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isTeaser && (
        <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
          Pole magnetyczne IMF
        </div>
      )}

      <SolarWindChartRow
        label="Bz"
        value={`${l1Bz >= 0 ? "+" : ""}${l1Bz.toFixed(1)}`}
        unit="nT"
        sublabel={bzSublabel}
        dataKey="bz"
        color={bzColor}
        chartData={chartData}
        domain={yDomain}
        marker={marker}
        l1Timestamp={l1Timestamp}
        decimals={1}
        height={isTeaser ? 56 : height}
        compact={isTeaser}
      >
        {bzZones.map((zone) => (
          <ReferenceArea
            key={`${zone.y1}-${zone.y2}`}
            y1={zone.y1}
            y2={zone.y2}
            fill={zone.fill}
            fillOpacity={zone.opacity}
            stroke="none"
          />
        ))}
        <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
        {bzThresholds.map((t) => (
          <ReferenceLine
            key={t}
            y={t}
            stroke={t === -5 ? "#ffdd0044" : t === -10 ? "#ffaa0044" : "#ff660044"}
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        ))}
      </SolarWindChartRow>
    </div>
  );
}
