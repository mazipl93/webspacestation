"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { XrayFlux, SolarFlare } from "@/lib/aurora/api";
import { getFlareClass, getFlareColor } from "@/lib/aurora/api";
import { formatChartAxisTime, formatChartTooltipTime, formatTimeDualFromTag } from "@/lib/aurora/time-display";

interface SolarDataPanelProps {
  xrayFlux: XrayFlux[];
  solarFlares: SolarFlare[];
  sunspotNumber: number | null;
}

function formatFlux(f: number): string {
  if (!f || f <= 0) return "—";
  const exp = Math.floor(Math.log10(f));
  const mantissa = (f / Math.pow(10, exp)).toFixed(1);
  return `${mantissa}×10^${exp}`;
}

export default function SolarDataPanel({
  xrayFlux,
  solarFlares,
  sunspotNumber,
}: SolarDataPanelProps) {
  const latestFlux = xrayFlux.at(-1)?.flux ?? 0;
  const flareClass = getFlareClass(latestFlux);
  const flareColor = getFlareColor(latestFlux);

  const chartData = xrayFlux.slice(-180).map((d) => ({
    time: d.time_tag,
    logFlux: d.flux > 0 ? Math.log10(d.flux) : -9,
  }));

  // Reference lines for classes
  const classLines = [
    { y: -8, label: "A", color: "#00ddff" },
    { y: -7, label: "B", color: "#44ff88" },
    { y: -6, label: "C", color: "#ffdd00" },
    { y: -5, label: "M", color: "#ff6600" },
    { y: -4, label: "X", color: "#ff2222" },
  ];

  return (
    <div className="rounded-2xl lg:rounded-2xl lg:aurora-panel-desktop border border-slate-800 bg-slate-900/60 lg:bg-slate-900/55 p-4 lg:p-5 space-y-4 lg:space-y-5 min-w-0 lg:shadow-[0_4px_28px_rgb(0_0_0_/_0.22)]">
      <h3 className="text-[15px] lg:text-[13px] font-bold tracking-[0.14em] text-slate-200 uppercase">
        Aktywność Słoneczna
      </h3>

      {/* Metryki: stos na wąskiej kolumnie desktop, 2+1 na szerszym mobile */}
      <div className="grid grid-cols-2 gap-3 min-w-0">
        <div
          className="col-span-2 rounded-xl border p-4 text-center min-w-0 overflow-hidden"
          style={{ borderColor: flareColor, background: `${flareColor}11` }}
        >
          <div className="text-[12px] text-slate-400 font-mono">Klasa X-ray</div>
          <div
            className="text-4xl font-bold font-mono tabular-nums mt-1"
            style={{ color: flareColor, textShadow: `0 0 12px ${flareColor}` }}
          >
            {flareClass}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 break-words">{formatFlux(latestFlux)}</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-center min-w-0 overflow-hidden">
          <div className="text-[11px] text-slate-400 font-mono leading-snug">Plamy</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-amber-300 tabular-nums mt-1">
            {sunspotNumber ?? "—"}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">SSN</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-center min-w-0 overflow-hidden">
          <div className="text-[11px] text-slate-400 font-mono leading-snug">Radio blackout</div>
          <div
            className="text-sm lg:text-base font-bold font-mono mt-2 leading-snug"
            style={{ color: latestFlux >= 1e-5 ? "#ff6600" : "#44ff88" }}
          >
            {latestFlux >= 1e-5 ? "Aktywny" : "Brak"}
          </div>
        </div>
      </div>
      {/* X-ray flux chart */}
      <div>
        <div className="text-[12px] lg:text-xs text-slate-500 font-mono mb-2">X-ray flux — 6h (log scale)</div>
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id="xray-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={flareColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={flareColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={formatChartAxisTime}
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[-9, -3]}
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={24}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0f1e",
                border: "1px solid #334155",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "monospace",
                color: "#e2e8f0",
              }}
              labelFormatter={(t: unknown) => formatChartTooltipTime(String(t ?? ""))}
              formatter={(v: unknown) => [`10^${Number(v).toFixed(1)}`, "Flux"]}
            />
            {classLines.map((cl) => (
              <ReferenceLine
                key={cl.label}
                y={cl.y}
                stroke={cl.color}
                strokeOpacity={0.4}
                strokeDasharray="2 3"
                label={{ value: cl.label, position: "right", fill: cl.color, fontSize: 10, fontFamily: "monospace" }}
              />
            ))}
            <Area
              type="monotone"
              dataKey="logFlux"
              stroke={flareColor}
              strokeWidth={1.5}
              fill="url(#xray-grad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent flares */}
      {solarFlares.length > 0 && (
        <div>
          <div className="text-[10px] lg:text-xs text-slate-500 font-mono mb-1 uppercase tracking-widest">
            Ostatnie rozbłyski
          </div>
          <div className="space-y-1">
            {solarFlares.slice(0, 5).map((f, i) => {
              const cls = f.classType || "?";
              const clsChar = cls[0] || "A";
              const col = getFlareColor(
                clsChar === "X" ? 1e-4 :
                clsChar === "M" ? 1e-5 :
                clsChar === "C" ? 1e-6 :
                clsChar === "B" ? 1e-7 : 1e-8
              );
              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[12px] lg:text-xs font-mono py-2 border-b border-slate-800/40 last:border-0"
                >
                  <span
                    className="font-bold text-xs w-8 text-center rounded px-1"
                    style={{ color: col, background: `${col}22`, border: `1px solid ${col}44` }}
                  >
                    {cls.slice(0, 3)}
                  </span>
                  <span className="text-slate-500 leading-snug">
                    {formatTimeDualFromTag(f.beginTime)} → {formatTimeDualFromTag(f.maxTime)}
                  </span>
                  {f.sourceLocation && (
                    <span className="text-slate-600">{f.sourceLocation}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
