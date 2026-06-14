"use client";

import { useMemo, useState, useEffect } from "react";
import type { SolarWindData } from "@/lib/aurora/api";
import {
  getMetricChartDomain,
  getBzColor,
} from "@/lib/aurora/api";
import AuroraPanel from "./AuroraPanel";
import SolarWindBzChart, { type WindTimeWindow } from "./SolarWindBzChart";
import {
  buildWindChartData,
  fmtUtcShort,
  resolveEarthMarker,
  SolarWindChartRow,
} from "./solar-wind-chart";
import { TimestampTagDual } from "./TimeDual";
import DataOriginBadge from "./DataOriginBadge";

interface SolarWindPanelProps {
  data: SolarWindData[];
  showTimeAxis?: boolean;
}

const WINDOW_OPTIONS: { value: WindTimeWindow; label: string }[] = [
  { value: 60, label: "1h" },
  { value: 180, label: "3h" },
  { value: 360, label: "6h" },
];

export default function SolarWindPanel({ data, showTimeAxis = false }: SolarWindPanelProps) {
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
  const propagationMin = marker?.delayMin ?? null;
  const l1Timestamp = marker?.l1Utc ?? fmtUtcShort(l1?.time_tag);
  const l1TimeTag = l1?.time_tag ?? marker?.latestKey ?? null;

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
    <div className="flex rounded-md lg:rounded-lg border border-slate-700 overflow-hidden">
      {WINDOW_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setWindowMin(value)}
          className={`px-3 py-1.5 lg:px-3.5 lg:py-2 text-[12px] lg:text-[13px] font-mono transition-colors ${
            windowMin === value
              ? "bg-slate-700 text-sky-300"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const rowHeight = showTimeAxis ? 96 : 100;
  const bzHeight = showTimeAxis ? 220 : 272;

  return (
    <AuroraPanel
      title="Wiatr sloneczny"
      subtitle={
        propagationMin != null
          ? `DSCOVR @ L1 · NOAA SWPC · propagacja ~${propagationMin} min do Ziemi`
          : "DSCOVR @ L1 · NOAA SWPC"
      }
      action={windowControl}
    >
      <div className="space-y-4 lg:space-y-5 min-w-0">
        {/* Desktop: szybki odczyt @ L1 */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-2">
            <DataOriginBadge origin="l1-now" />
          </div>
          <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Bz", value: `${l1Bz >= 0 ? "+" : ""}${l1Bz.toFixed(1)}`, unit: "nT", color: getBzColor(l1Bz) },
            { label: "Bt", value: l1Bt.toFixed(1), unit: "nT", color: "#60a5fa" },
            { label: "V", value: l1Speed > 0 ? l1Speed.toFixed(0) : "—", unit: "km/s", color: "#34d399" },
            { label: "N", value: l1Density > 0 ? l1Density.toFixed(2) : "—", unit: "p/cm³", color: "#fbbf24" },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-800/80 bg-slate-950/50 px-2 py-2.5 text-center"
            >
              <div className="text-[11px] lg:text-[11px] text-slate-500 font-mono uppercase tracking-wide">{label}</div>
              <div className="text-xl lg:text-2xl font-bold font-mono tabular-nums mt-0.5" style={{ color }}>
                {value}
              </div>
              <div className="text-[10px] text-slate-600 font-mono">{unit}</div>
            </div>
          ))}
          </div>
        </div>

        <SolarWindBzChart
          data={data}
          windowMin={windowMin}
          height={bzHeight}
          showTimeAxis={showTimeAxis}
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
          timestampTag={l1TimeTag}
          decimals={1}
          height={rowHeight}
          showXAxis={showTimeAxis}
        />

        <div className="rounded-xl lg:rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-3 lg:px-4 lg:py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[14px] lg:text-[13px] font-mono">
          <span className="text-slate-500 uppercase text-[13px] lg:text-[11px] tracking-wide">By</span>
          <span className="text-violet-400 font-bold text-xl lg:text-lg tabular-nums">
            {l1By >= 0 ? "+" : ""}{l1By.toFixed(1)} nT
          </span>
          {l1Timestamp && (
            <span className="hidden lg:inline text-slate-600 text-[12px] ml-auto">{l1Timestamp}</span>
          )}
        </div>

        <div className="aurora-wind-divider hidden lg:flex">Plazma</div>
        <div className="text-[13px] lg:hidden text-slate-500 font-mono uppercase tracking-widest pt-1">
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
          timestampTag={l1TimeTag}
          decimals={0}
          height={rowHeight}
          showXAxis={showTimeAxis}
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
          timestampTag={l1TimeTag}
          showXAxis={showTimeAxis}
          decimals={1}
          height={rowHeight}
        />

        {temp > 0 && (
          <div className="text-[12px] lg:text-[12px] text-slate-600 font-mono text-center px-3 py-2.5 lg:py-3 rounded-lg lg:rounded-lg border border-slate-800/50 bg-slate-950/25">
            Temperatura plazmy: {(temp / 1000).toFixed(0)} kK
            {l1TimeTag && (
              <span className="lg:hidden block mt-1">
                <TimestampTagDual tag={l1TimeTag} className="text-[12px]" />
              </span>
            )}
            <span className="hidden lg:inline"> · {l1Timestamp}</span>
          </div>
        )}
      </div>
    </AuroraPanel>
  );
}
