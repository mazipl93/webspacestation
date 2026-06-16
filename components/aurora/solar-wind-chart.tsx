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
import {
  formatChartAxisTime,
  formatChartTooltipTime,
  formatTimeDualFromTag,
} from "@/lib/aurora/time-display";
import { TimestampTagDual } from "./TimeDual";
import DataOriginBadge from "./DataOriginBadge";

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
  fontSize: 12,
  fontFamily: "monospace",
  color: "#e2e8f0",
};

export const EARTH_LINE = { stroke: "#fbbf24", strokeWidth: 1.5, strokeDasharray: "5 3" };

export function fmtWindTime(t: string): string {
  return formatChartAxisTime(t);
}

export function fmtUtcShort(timeTag: string | undefined): string | null {
  if (!timeTag) return null;
  return formatTimeDualFromTag(timeTag);
}

export function buildWindChartData(windSlice: SolarWindData[]): WindChartPoint[] {
  const seen = new Set<string>();
  const points: WindChartPoint[] = [];
  for (const d of windSlice) {
    if (seen.has(d.time_tag)) continue;
    seen.add(d.time_tag);
    points.push({
      time: d.time_tag,
      bz: d.bz,
      bt: d.bt,
      speed: d.speed,
      density: d.density,
    });
  }
  return points;
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
        ifOverflow="visible"
      />
      <ReferenceLine
        x={marker.earthKey}
        {...EARTH_LINE}
        ifOverflow="visible"
        strokeWidth={showLabel ? 2 : EARTH_LINE.strokeWidth}
        label={
          showLabel
            ? {
                value: marker.earthUtc
                  ? `Teraz na Ziemi · ${marker.earthUtc}`
                  : "Teraz na Ziemi",
                position: "insideTopLeft",
                fill: "#fbbf24",
                fontSize: 10,
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
  /** Surowy NOAA tag — timestamp w dwóch wierszach na mobile. */
  timestampTag?: string | null;
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
  timestampTag,
  compact = false,
  children,
}: SolarWindChartRowProps) {
  const chartPx = height >= 200 ? Math.max(220, height) : height >= 100 ? (showXAxis ? 108 : 100) : Math.max(52, height);

  return (
    <div
      className={
        compact
          ? "rounded border border-slate-800/80 bg-slate-950/30 p-1.5 flex gap-1.5 items-stretch"
          : "rounded-xl border border-slate-800 bg-slate-950/40 p-3 lg:p-3 flex flex-col lg:flex-row gap-0 lg:gap-3 items-stretch min-w-0"
      }
    >
      {/* Mobile: poziomy pasek metryki */}
      {!compact && (
        <div className="flex lg:hidden items-start justify-between gap-3 min-w-0 pb-3 border-b border-slate-800/80 mb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[13px] text-slate-500 font-mono uppercase tracking-wide">{label}</span>
              <DataOriginBadge origin="l1-now" />
            </div>
            {sublabel && (
              <span className="block text-[12px] font-mono mt-0.5 capitalize" style={{ color }}>
                {sublabel}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
            <span className="text-2xl font-bold font-mono leading-none" style={{ color }}>
              {value}
            </span>
            <span className="text-[13px] text-slate-500 font-mono">{unit}</span>
          </div>
        </div>
      )}

      {/* Desktop: boczna kolumna */}
      <div
        className={
          compact
            ? "w-[3.25rem] shrink-0 flex flex-col justify-center items-center text-center border-r border-slate-800/60 pr-1.5"
            : "hidden lg:flex w-32 shrink-0 flex-col justify-center items-center text-center border-r border-slate-800/80 pr-3 min-w-0"
        }
      >
        {!compact && (
          <div className="hidden lg:block mb-1.5">
            <DataOriginBadge origin="l1-now" />
          </div>
        )}
        <span
          className={
            compact
              ? "text-[10px] lg:text-[10px] text-slate-500 font-mono uppercase leading-tight mb-0.5"
              : "text-[12px] lg:text-[11px] text-slate-500 font-mono uppercase leading-tight mb-1"
          }
        >
          {label}
        </span>
        <span
          className={
            compact
              ? "text-base font-bold font-mono leading-none"
              : "text-xl lg:text-3xl font-bold font-mono leading-none tabular-nums"
          }
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-[11px] lg:text-[11px] text-slate-500 font-mono mt-0.5">{unit}</span>
        {!compact && (
          <>
            {l1Timestamp && (
              <span className="text-[10px] lg:text-[10px] text-slate-600 font-mono mt-2 leading-snug block max-w-full break-words">
                {l1Timestamp}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] font-mono mt-0.5 leading-tight capitalize" style={{ color }}>
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

      <div className="flex-1 min-w-0 w-full" style={{ minHeight: chartPx }}>
        {chartData.length < 2 ? (
          <div
            className="flex items-center justify-center text-[11px] text-slate-600 font-mono border border-dashed border-slate-800 rounded"
            style={{ height: chartPx }}
          >
            Brak danych wykresu
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={chartPx}>
          <LineChart data={chartData} margin={{ top: 4, right: 6, left: 0, bottom: showXAxis ? 20 : 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="time"
              type="category"
              scale="point"
              hide={!showXAxis}
              tickFormatter={fmtWindTime}
              tick={
                showXAxis
                  ? { fontSize: 11, fill: "#64748b", fontFamily: "monospace" }
                  : false
              }
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              domain={domain}
              tick={{ fontSize: 10, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={34}
              tickFormatter={(v: number) => (decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals))}
            />
            <Tooltip
              contentStyle={WIND_TOOLTIP_STYLE}
              labelFormatter={(t: unknown) => formatChartTooltipTime(String(t ?? ""))}
              formatter={(v: unknown) => [
                typeof v === "number" ? v.toFixed(decimals) : String(v ?? ""),
                unit,
              ]}
            />
            {children}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            <EarthChartOverlay marker={marker} showLabel={earthLabel} />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>

      {!compact && timestampTag && (
        <div className="lg:hidden pt-3 mt-0 border-t border-slate-800/60 text-center min-w-0">
          <TimestampTagDual tag={timestampTag} className="text-[13px]" />
        </div>
      )}
    </div>
  );
}
