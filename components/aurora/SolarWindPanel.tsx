"use client";

import { useMemo, useState, useEffect } from "react";
import type { SolarWindData } from "@/lib/aurora/api";
import {
  getMetricChartDomain,
} from "@/lib/aurora/api";
import AuroraPanel from "./AuroraPanel";
import SolarWindBzChart, { type WindTimeWindow } from "./SolarWindBzChart";
import {
  buildWindChartData,
  fmtUtcShort,
  resolveEarthMarker,
  SolarWindChartRow,
} from "./solar-wind-chart";

interface SolarWindPanelProps {
  data: SolarWindData[];
}

const WINDOW_OPTIONS: { value: WindTimeWindow; label: string }[] = [
  { value: 60, label: "1h" },
  { value: 180, label: "3h" },
  { value: 360, label: "6h" },
];

export default function SolarWindPanel({ data }: SolarWindPanelProps) {
  const [windowMin, setWindowMin] = useState<WindTimeWindow>(180);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setWindowMin(360);
    }
  }, []);

  const windSlice = useMemo(() => data.slice(-windowMin), [data, windowMin]);
  const l1 = windSlice.at(-1);

  const l1Speed = l1?.speed ?? 0;
  const l1Density = l1?.density ?? 0;
  const l1Bt = l1?.bt ?? 0;
  const l1Bz = l1?.bz ?? 0;
  const l1By = l1?.by ?? 0;
  const temp = l1?.temperature ?? 0;

  const chartData = useMemo(() => buildWindChartData(windSlice), [windSlice]);
  const marker = useMemo(
    () => resolveEarthMarker(windSlice, chartData),
    [windSlice, chartData],
  );
  const l1Timestamp = marker?.l1Utc ?? fmtUtcShort(l1?.time_tag);

  const speedDomain = useMemo(
    () => getMetricChartDomain(chartData.map((d) => d.speed).filter((v) => v > 0)),
    [chartData],
  );
  const densityDomain = useMemo(
    () => getMetricChartDomain(chartData.map((d) => d.density).filter((v) => v > 0)),
    [chartData],
  );
  const btDomain = useMemo(() => getMetricChartDomain(chartData.map((d) => d.bt)), [chartData]);

  const windowControl = (
    <div className="flex rounded-md border border-slate-700 overflow-hidden">
      {WINDOW_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setWindowMin(value)}
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
  );

  return (
    <AuroraPanel
      title="Wiatr sloneczny"
      subtitle="DSCOVR · L1 · liczby = teraz na satelicie · linia Ziemia = opoznienie propagacji"
      action={windowControl}
    >
      <div className="space-y-3">
        <SolarWindBzChart
          data={data}
          windowMin={windowMin}
          height={220}
          earthLabel
          showPropagationNote
        />

        <SolarWindChartRow
          label="Bt"
          value={l1Bt.toFixed(1)}
          unit="nT"
          dataKey="bt"
          color="#60a5fa"
          chartData={chartData}
          domain={btDomain}
          marker={marker}
          l1Timestamp={l1Timestamp}
          decimals={1}
          height={80}
        />

        <div className="flex gap-2 text-[9px] font-mono px-1">
          <span className="text-slate-500">By @ DSCOVR:</span>
          <span className="text-violet-400 font-bold">
            {l1By >= 0 ? "+" : ""}{l1By.toFixed(1)} nT
          </span>
          {l1Timestamp && <span className="text-slate-600">{l1Timestamp}</span>}
        </div>

        <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest pt-1">
          Plazma
        </div>

        <SolarWindChartRow
          label="V"
          value={l1Speed > 0 ? l1Speed.toFixed(1) : "—"}
          unit="km/s"
          dataKey="speed"
          color="#34d399"
          chartData={chartData}
          domain={speedDomain}
          marker={marker}
          l1Timestamp={l1Timestamp}
          decimals={0}
        />

        <SolarWindChartRow
          label="N"
          value={l1Density > 0 ? l1Density.toFixed(2) : "—"}
          unit="p/cm³"
          dataKey="density"
          color="#fbbf24"
          chartData={chartData}
          domain={densityDomain}
          marker={marker}
          l1Timestamp={l1Timestamp}
          showXAxis
          decimals={1}
        />

        {temp > 0 && (
          <div className="text-[9px] text-slate-600 font-mono text-center">
            Temperatura plazmy @ DSCOVR: {(temp / 1000).toFixed(0)} kK · {l1Timestamp}
          </div>
        )}

        {marker && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <div className="w-5 border-t-2 border-dashed border-amber-400" />
              <span className="text-[9px] text-amber-400 font-mono">Ziemia teraz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#fbbf2415", border: "1px solid #fbbf2440" }} />
              <span className="text-[9px] text-amber-400/60 font-mono">w tranzycie L1→Ziemia</span>
            </div>
          </div>
        )}
      </div>
    </AuroraPanel>
  );
}
