"use client";

import { type ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import type { SolarWindData } from "@/lib/aurora/api";
import { getEarthSolarWindMarker } from "@/lib/aurora/api";

export type WindChartPoint = {
  time: string;
  bz: number;
  bt: number;
  speed: number;
  density: number;
};

export type EarthMarker = {
  delayMin: number;
  earthIndex: number;
  latestIndex: number;
  earthKey: string;
  latestKey: string;
  earthUtc: string | null;
  l1Utc: string | null;
};

export const WIND_TOOLTIP_STYLE = {
  background: "#0a0f1e",
  border: "1px solid #334155",
  borderRadius: 4,
  fontSize: 10,
  fontFamily: "monospace",
  color: "#e2e8f0",
};

export const EARTH_LINE = { stroke: "#fbbf24", strokeWidth: 1.5, strokeDasharray: "5 3" };

export function fmtWindTime(t: string): string {
  try {
    const normalized = t.includes("T") ? t : t.replace(" ", "T") + (t.length === 19 ? "Z" : "");
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return t.slice(11, 16);
    return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t.slice(11, 16);
  }
}

export function fmtUtcShort(timeTag: string | undefined): string | null {
  if (!timeTag) return null;
  const d = new Date(timeTag.includes("T") ? timeTag : timeTag.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return null;
  return (
    d.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

export function buildWindChartData(windSlice: SolarWindData[]): WindChartPoint[] {
  return windSlice.map((d) => ({
    time: d.time_tag,
    bz: d.bz,
    bt: d.bt,
    speed: d.speed,
    density: d.density,
  }));
}

export function resolveEarthMarker(
  windSlice: SolarWindData[],
  chartData: WindChartPoint[],
): EarthMarker | null {
  const m = getEarthSolarWindMarker(windSlice);
  if (!m || chartData.length === 0) return null;

  const earthIndex = Math.min(m.earthIndex, chartData.length - 1);
  const latestIndex = chartData.length - 1;
  const earthKey = chartData[earthIndex]?.time;
  const latestKey = chartData[latestIndex]?.time;
  if (!earthKey || !latestKey) return null;

  return {
    delayMin: m.delayMin,
    earthIndex,
    latestIndex,
    earthKey,
    latestKey,
    earthUtc: fmtUtcShort(earthKey),
    l1Utc: fmtUtcShort(latestKey),
  };
}

export function EarthChartOverlay({
  marker,
  showLabel = false,
}: {
  marker: EarthMarker | null;
  showLabel?: boolean;
}) {
  if (!marker) return null;
  return (
    <>
      <ReferenceArea
        x1={marker.earthKey}
        x2={marker.latestKey}
        fill="#fbbf24"
        fillOpacity={0.08}
        stroke="none"
      />
      <ReferenceLine
        x={marker.earthKey}
        {...EARTH_LINE}
        strokeWidth={showLabel ? 2 : EARTH_LINE.strokeWidth}
        label={
          showLabel
            ? {
                value: marker.earthUtc ? `Ziemia ${marker.earthUtc}` : "Ziemia",
                position: "insideTopLeft",
                fill: "#fbbf24",
                fontSize: 8,
                fontFamily: "monospace",
              }
            : undefined
        }
      />
    </>
  );
}

export interface SolarWindChartRowProps {
  label: string;
  value: string;
  unit: string;
  sublabel?: string;
  dataKey: keyof Pick<WindChartPoint, "speed" | "density" | "bt" | "bz">;
  color: string;
  chartData: WindChartPoint[];
  domain: [number, number];
  marker: EarthMarker | null;
  showXAxis?: boolean;
  decimals?: number;
  height?: number;
  earthLabel?: boolean;
  l1Timestamp?: string | null;
  compact?: boolean;
  children?: ReactNode;
}

export function SolarWindChartRow({
  label,
  value,
  unit,
  sublabel,
  dataKey,
  color,
  chartData,
  domain,
  marker,
  showXAxis = false,
  decimals = 1,
  height = 80,
  earthLabel = false,
  l1Timestamp,
  compact = false,
  children,
}: SolarWindChartRowProps) {
  const chartPx = height >= 200 ? 220 : height >= 100 ? 88 : Math.max(44, height);

  return (
    <div
      className={
        compact
          ? "rounded border border-slate-800/80 bg-slate-950/30 p-1.5 flex gap-1.5 items-stretch"
          : "rounded border border-slate-800 bg-slate-950/40 p-2 lg:p-3 flex gap-2 lg:gap-3 items-stretch"
      }
    >
      <div
        className={
          compact
            ? "w-[3.25rem] shrink-0 flex flex-col justify-center items-center text-center border-r border-slate-800/60 pr-1.5"
            : "w-[4.5rem] sm:w-24 lg:w-28 shrink-0 flex flex-col justify-center items-center text-center border-r border-slate-800/80 pr-2 lg:pr-3"
        }
      >
        <span
          className={
            compact
              ? "text-[10px] lg:text-[7px] text-slate-500 font-mono uppercase leading-tight mb-0.5"
              : "text-[12px] lg:text-[9px] text-slate-500 font-mono uppercase leading-tight mb-1"
          }
        >
          {label}
        </span>
        <span
          className={
            compact
              ? "text-base font-bold font-mono leading-none"
              : "text-xl lg:text-xl font-bold font-mono leading-none"
          }
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-[11px] lg:text-[7px] text-slate-500 font-mono mt-0.5">{unit}</span>
        {!compact && (
          <>
            {l1Timestamp && (
              <span className="text-[10px] lg:text-[7px] text-slate-600 font-mono mt-1.5 leading-tight">{l1Timestamp}</span>
            )}
            {sublabel && (
              <span className="text-[7px] font-mono mt-0.5 leading-tight" style={{ color }}>
                {sublabel}
              </span>
            )}
          </>
        )}
        {compact && sublabel && (
          <span className="text-[6px] font-mono mt-0.5 leading-tight" style={{ color }}>
            {sublabel}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <ResponsiveContainer width="100%" height={chartPx}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: showXAxis ? 2 : 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="time"
              type="category"
              scale="point"
              hide={!showXAxis}
              tickFormatter={fmtWindTime}
              tick={showXAxis ? { fontSize: 7, fill: "#64748b", fontFamily: "monospace" } : false}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            {children}
            <YAxis
              domain={domain}
              tick={{ fontSize: 7, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={30}
              tickFormatter={(v: number) => (decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals))}
            />
            <Tooltip
              contentStyle={WIND_TOOLTIP_STYLE}
              labelFormatter={(t: unknown) => fmtWindTime(String(t ?? ""))}
              formatter={(v: unknown) => [
                typeof v === "number" ? v.toFixed(decimals) : String(v ?? ""),
                unit,
              ]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <EarthChartOverlay marker={marker} showLabel={earthLabel} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
