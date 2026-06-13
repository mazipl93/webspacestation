"use client";

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
import { getBzColor } from "@/lib/aurora/api";

interface SolarWindPanelProps {
  data: SolarWindData[];
}

type ChartPoint = {
  time: string;
  bz: number | null;
  bt: number | null;
  by: number | null;
};

const CHART_H = 120;
const CHART_MARGIN = { top: 8, right: 28, left: 2, bottom: 4 };
const X_AXIS_H = 14;

export default function SolarWindPanel({ data }: SolarWindPanelProps) {
  const latest = data.at(-1);
  const bz = latest?.bz ?? 0;
  const bt = latest?.bt ?? 0;
  const by = latest?.by ?? 0;
  const speed = latest?.speed ?? 0;
  const density = latest?.density ?? 0;
  const temp = latest?.temperature ?? 0;
  const bzColor = getBzColor(bz);
  const bzNegative = bz < 0;

  // ── Earth marker calculation (SWL semantics)
  //
  // The chart shows RAW L1 spacecraft measurements (historical).
  // Right edge = latest measurement from DSCOVR/SWFO-L1.
  //
  // The "Earth" marker is NOT in the future.
  // It marks which past measurement is currently arriving at Earth:
  //
  //   earthTimestamp = latestTimestamp - propagationDelay
  //   propagationDelay = 1,500,000 km / speed (km/s)
  //
  // Region LEFT of marker  → already impacting Earth (past).
  // Region RIGHT of marker → in transit, will arrive in 0..delay min.
  // Right edge of chart    → latest L1 reading, arrives in ~delay min.
  //
  const chartData: ChartPoint[] = data.slice(-120).map((d) => ({
    time: d.time_tag,
    bz: d.bz,
    bt: d.bt,
    by: d.by,
  }));

  const latestKey = chartData.at(-1)?.time ?? null;

  const propagationDelayMin = speed > 100
    ? Math.round(1_500_000 / speed / 60)
    : null;

  // Find the data point that is currently arriving at Earth
  // by counting back `propagationDelayMin` positions from the right edge.
  let earthKey: string | null = null;
  let earthUTC: string | null = null;

  if (propagationDelayMin !== null) {
    const earthIndex = Math.max(0, chartData.length - 1 - propagationDelayMin);
    earthKey = chartData[earthIndex]?.time ?? null;

    if (earthKey) {
      const raw = earthKey;
      const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T") + "Z");
      if (!isNaN(d.getTime())) {
        earthUTC = d.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }) + " UTC";
      }
    }
  }

  const fmt = (t: string) => {
    try {
      const normalized = t.includes("T") ? t : t.replace(" ", "T") + (t.length === 19 ? "Z" : "");
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return t.slice(11, 16);
      return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return t.slice(11, 16);
    }
  };

  // Separate domains: Bz centered on 0 (left axis), Bt magnitude (right axis).
  const bzDomain = (() => {
    const vals = chartData
      .map((d) => d.bz)
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (vals.length === 0) return [-4, 4] as [number, number];
    const absMax = Math.max(
      Math.abs(Math.min(...vals, 0)),
      Math.abs(Math.max(...vals, 0)),
      1,
    );
    const pad = Math.max(0.5, absMax * 0.12);
    return [-absMax - pad, absMax + pad] as [number, number];
  })();

  const btDomain = (() => {
    const vals = chartData
      .map((d) => d.bt)
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (vals.length === 0) return [0, 8] as [number, number];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max(0.3, (max - min) * 0.15);
    return [Math.max(0, min - pad), max + pad] as [number, number];
  })();

  // Pixel position of Bz=0 for HTML overlay (Recharts ReferenceLine is flaky in v3).
  const [yMin, yMax] = bzDomain;
  const plotH = CHART_H - CHART_MARGIN.top - CHART_MARGIN.bottom - X_AXIS_H;
  const zeroLineTop = CHART_MARGIN.top + ((yMax - 0) / (yMax - yMin)) * plotH;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
          Wiatr Sloneczny
          <span className="ml-2 text-[10px] text-slate-500 normal-case">DSCOVR / ACE</span>
        </h3>
        {propagationDelayMin !== null && (
          <div className="text-[10px] font-mono text-amber-400 font-bold">
            opoznienie L1: ~{propagationDelayMin} min
          </div>
        )}
      </div>

      {/* Bz — main highlight */}
      <div
        className="rounded-lg p-3 border-2 text-center"
        style={{
          borderColor: bzColor,
          background: `${bzColor}11`,
          boxShadow: bzNegative ? `0 0 20px ${bzColor}44` : "none",
        }}
      >
        <div className="text-[10px] text-slate-400 font-mono tracking-widest mb-1">
          IMF Bz {bzNegative ? "UJEMNA (korzystna!)" : "Dodatnia"}
        </div>
        <div
          className={`text-3xl sm:text-4xl font-bold font-mono ${bzNegative && bz < -5 ? "animate-pulse" : ""}`}
          style={{
            color: bzColor,
            textShadow: `0 0 20px ${bzColor}`,
          }}
        >
          {bz >= 0 ? "+" : ""}
          {bz.toFixed(1)}
          <span className="text-base sm:text-lg ml-1">nT</span>
        </div>
        {bzNegative && (
          <div className="mt-1 text-xs font-bold tracking-widest" style={{ color: bzColor }}>
            {bz < -20 ? "EKSTREMALNIE UJEMNA" :
             bz < -10 ? "SILNIE UJEMNA" :
             bz < -5  ? "UJEMNA" :
             "LEKKO UJEMNA"}
          </div>
        )}
      </div>

      {/* Other IMF */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2 text-center">
          <div className="text-[10px] text-slate-500 font-mono">Bt calkowite</div>
          <div className="text-lg font-bold font-mono text-sky-400">
            {bt.toFixed(1)} <span className="text-xs">nT</span>
          </div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2 text-center">
          <div className="text-[10px] text-slate-500 font-mono">By</div>
          <div className="text-lg font-bold font-mono text-violet-400">
            {by >= 0 ? "+" : ""}{by.toFixed(1)} <span className="text-xs">nT</span>
          </div>
        </div>
      </div>

      {/* Solar wind params */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="rounded border border-slate-700 bg-slate-800/40 p-1.5 text-center">
          <div className="text-[9px] text-slate-500 font-mono">Predkosc</div>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {speed > 0 ? speed.toFixed(0) : "—"}
          </div>
          <div className="text-[9px] text-slate-600">km/s</div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-1.5 text-center">
          <div className="text-[9px] text-slate-500 font-mono">Gestosc</div>
          <div className="text-sm font-bold font-mono text-amber-400">
            {density > 0 ? density.toFixed(1) : "—"}
          </div>
          <div className="text-[9px] text-slate-600">p/cm3</div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-1.5 text-center">
          <div className="text-[9px] text-slate-500 font-mono">Temp.</div>
          <div className="text-sm font-bold font-mono text-rose-400">
            {temp > 0 ? (temp / 1000).toFixed(0) + "k" : "—"}
          </div>
          <div className="text-[9px] text-slate-600">K</div>
        </div>
      </div>

      {/* Bz/Bt chart with Earth marker */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 font-mono">
            Bz / Bt — 2h pomiarow L1
          </span>
          {earthUTC && (
            <span className="text-[9px] font-mono font-bold text-amber-400">
              Ziemia teraz: {earthUTC}
            </span>
          )}
        </div>
        <div className="relative">
          <ResponsiveContainer width="100%" height={CHART_H}>
            <LineChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="2 4" vertical={false} yAxisId="bz" />

            {earthKey && latestKey && (
              <ReferenceArea
                x1={earthKey}
                x2={latestKey}
                fill="#fbbf24"
                fillOpacity={0.08}
                stroke="none"
              />
            )}

            <XAxis
              dataKey="time"
              tickFormatter={fmt}
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />

            {/* Left: Bz — symmetric around 0 */}
            <YAxis
              yAxisId="bz"
              domain={bzDomain}
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={26}
            />

            {/* Right: Bt — always positive magnitude, own scale */}
            <YAxis
              yAxisId="bt"
              orientation="right"
              domain={btDomain}
              tick={{ fontSize: 7, fill: "#60a5fa", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={22}
            />

            <Tooltip
              contentStyle={{
                background: "#0a0f1e",
                border: "1px solid #334155",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "monospace",
                color: "#e2e8f0",
              }}
              labelFormatter={(t: unknown) => fmt(String(t ?? ""))}
            />

            <Line
              yAxisId="bz"
              type="linear"
              dataKey="bz"
              stroke={bzColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              name="Bz"
            />
            <Line
              yAxisId="bt"
              type="linear"
              dataKey="bt"
              stroke="#60a5fa"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              name="Bt"
              strokeDasharray="4 2"
            />

            <ReferenceLine
              yAxisId="bz"
              y={0}
              stroke="#e2e8f0"
              strokeWidth={2}
              strokeDasharray="6 4"
            />

            {earthKey && (
              <ReferenceLine
                x={earthKey}
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="5 3"
                label={{
                  value: earthUTC ? `Ziemia ${earthUTC}` : "Ziemia",
                  position: "insideTopLeft",
                  fill: "#fbbf24",
                  fontSize: 8,
                  fontFamily: "monospace",
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
          {/* Guaranteed-visible Bz=0 — HTML overlay aligned to bz axis domain */}
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 left-[28px] right-[30px] border-t-2 border-dashed border-slate-200"
            style={{ top: `${zeroLineTop}px` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ background: bzColor }} />
            <span className="text-[9px] text-slate-500 font-mono">Bz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t border-dashed border-sky-400" />
            <span className="text-[9px] text-slate-500 font-mono">Bt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t border-dashed border-slate-400" />
            <span className="text-[9px] text-slate-500 font-mono">Bz = 0</span>
          </div>
          {earthKey && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-5 border-t-2 border-dashed border-amber-400" />
                <span className="text-[9px] text-amber-400 font-mono">Ziemia teraz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: "#fbbf2415", border: "1px solid #fbbf2440" }} />
                <span className="text-[9px] text-amber-400/60 font-mono">w tranzycie</span>
              </div>
            </>
          )}
        </div>

        {/* Explanatory note */}
        {earthKey && propagationDelayMin !== null && (
          <div className="mt-2 text-[9px] text-slate-600 font-mono leading-relaxed">
            Prawy obszar (strefa zolta) = pomiary L1 w drodze do Ziemi.
            Dotara za 0–{propagationDelayMin} min.
          </div>
        )}
      </div>
    </div>
  );
}
