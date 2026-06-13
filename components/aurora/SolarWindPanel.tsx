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

  // Y-axis must always include 0 — otherwise ReferenceLine y=0 disappears when
  // all Bz values are on one side of zero (common during northward IMF).
  const yDomain = (() => {
    const vals = chartData
      .flatMap((d) => [d.bz, d.bt])
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (vals.length === 0) return [-5, 5] as [number, number];
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 0);
    const pad = Math.max(0.5, (max - min) * 0.1);
    return [min - pad, max + pad] as [number, number];
  })();

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
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 2 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="2 4" vertical={false} />

            {/* In-transit zone: from Earth marker to right edge (latest L1 reading).
                These measurements were taken by the spacecraft but have not yet
                reached Earth. They will arrive in the next ~propagationDelayMin min. */}
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
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={24}
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
              type="monotone"
              dataKey="bz"
              stroke={bzColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              name="Bz"
            />
            <Line
              type="monotone"
              dataKey="bt"
              stroke="#60a5fa"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              name="Bt"
              strokeDasharray="4 2"
            />

            {/* Bz = 0 baseline — after lines so it stays visible on top */}
            <ReferenceLine
              y={0}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              ifOverflow="extendDomain"
            />

            {/* Earth marker — the measurement currently arriving at Earth */}
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
