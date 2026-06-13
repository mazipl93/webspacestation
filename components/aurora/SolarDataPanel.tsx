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
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
        Aktywność Słoneczna
      </h3>

      {/* X-ray status */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-lg border p-3 text-center col-span-1"
          style={{ borderColor: flareColor, background: `${flareColor}11` }}
        >
          <div className="text-[10px] text-slate-400 font-mono">Klasa X-ray</div>
          <div
            className="text-3xl font-bold font-mono mt-1"
            style={{ color: flareColor, textShadow: `0 0 12px ${flareColor}` }}
          >
            {flareClass}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-1">{formatFlux(latestFlux)}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3 text-center">
          <div className="text-[10px] text-slate-400 font-mono">Plamy słoneczne</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {sunspotNumber ?? "—"}
          </div>
          <div className="text-[9px] text-slate-500 font-mono">SSN</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3 text-center">
          <div className="text-[10px] text-slate-400 font-mono">Radio Blackout</div>
          <div
            className="text-sm font-bold font-mono mt-1"
            style={{ color: latestFlux >= 1e-5 ? "#ff6600" : "#44ff88" }}
          >
            {latestFlux >= 1e-5 ? "⚠ AKTYWNY" : "BRAK"}
          </div>
        </div>
      </div>

      {/* X-ray flux chart */}
      <div>
        <div className="text-[10px] text-slate-500 font-mono mb-1">X-ray flux — 6h (log scale)</div>
        <ResponsiveContainer width="100%" height={85}>
          <AreaChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id="xray-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={flareColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={flareColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={fmt}
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[-9, -3]}
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={20}
              tickFormatter={(v) => String(v)}
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
              formatter={(v: unknown) => [`10^${Number(v).toFixed(1)}`, "Flux"]}
            />
            {classLines.map((cl) => (
              <ReferenceLine
                key={cl.label}
                y={cl.y}
                stroke={cl.color}
                strokeOpacity={0.4}
                strokeDasharray="2 3"
                label={{ value: cl.label, position: "right", fill: cl.color, fontSize: 8, fontFamily: "monospace" }}
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
          <div className="text-[10px] text-slate-500 font-mono mb-1 uppercase tracking-widest">
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
                  className="flex items-center gap-2 text-[10px] font-mono"
                >
                  <span
                    className="font-bold text-xs w-8 text-center rounded px-1"
                    style={{ color: col, background: `${col}22`, border: `1px solid ${col}44` }}
                  >
                    {cls.slice(0, 3)}
                  </span>
                  <span className="text-slate-500">
                    {fmt(f.beginTime)} → {fmt(f.maxTime)}
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
