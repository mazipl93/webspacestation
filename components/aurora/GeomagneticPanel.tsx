"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { KpData, GeomagneticIndex } from "@/lib/aurora/api";
import { getKpColor } from "@/lib/aurora/api";

interface IndexChartProps {
  data: { time: string; value: number }[];
  color: string;
  label: string;
  referenceY?: number;
  domain?: [number | "auto", number | "auto"];
  height?: number;
}

function IndexChart({ data, color, label, referenceY, domain, height = 80 }: IndexChartProps) {
  const last24h = data.slice(-1440);

  const fmt = (t: string) => {
    try {
      // Handle both "2026-06-13 00:00:00" and ISO strings
      const normalized = t.includes("T") ? t : t.replace(" ", "T") + (t.length === 19 ? "Z" : "");
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return t.slice(11, 16) || t;
      return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return t.slice(11, 16) || t;
    }
  };

  return (
    <div>
      <div className="text-xs text-slate-400 mb-1 font-mono">{label}</div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={last24h} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={fmt}
          />
          <YAxis
            domain={domain || ["auto", "auto"]}
            tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "#0a0f1e",
              border: `1px solid ${color}33`,
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "monospace",
              color: "#e2e8f0",
            }}
            labelFormatter={(t: unknown) => fmt(String(t ?? ""))}
            formatter={(v: unknown) => [Number(v).toFixed(1), label]}
          />
          {referenceY !== undefined && (
            <ReferenceLine y={referenceY} stroke="#334155" strokeDasharray="3 3" />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface GeomagneticPanelProps {
  kp3Day: KpData[];
  dst: GeomagneticIndex[];
  ae: GeomagneticIndex[];
  symh: GeomagneticIndex[];
}

export default function GeomagneticPanel({
  kp3Day,
  dst,
  ae,
  symh,
}: GeomagneticPanelProps) {
  const kpChart = kp3Day.map((d) => ({ time: d.time, value: d.kp }));
  const currentKp = kp3Day.at(-1)?.kp ?? 0;

  return (
    <div className="space-y-4">
      {/* Kp 72h */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">
            Kp — 72h
          </span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: getKpColor(currentKp) }}
          >
            {currentKp.toFixed(1)}
          </span>
        </div>
        <IndexChart
          data={kpChart}
          color={getKpColor(currentKp)}
          label="Kp index"
          domain={[0, 9]}
          height={70}
        />
      </div>

      {/* Dst */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Dst</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">nT</span>
            <span
              className="text-sm font-mono font-bold"
              style={{ color: dst.at(-1)?.value != null && dst.at(-1)!.value < -30 ? "#ff6600" : "#44ff88" }}
            >
              {dst.at(-1)?.value?.toFixed(0) ?? "—"}
            </span>
          </div>
        </div>
        <IndexChart
          data={dst.map((d) => ({ time: d.time_tag, value: d.value }))}
          color="#60a5fa"
          label="Dst [nT]"
          referenceY={0}
          height={65}
        />
      </div>

      {/* SYM-H */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">SYM-H</span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: symh.at(-1)?.value != null && symh.at(-1)!.value < -30 ? "#ff6600" : "#a78bfa" }}
          >
            {symh.at(-1)?.value?.toFixed(0) ?? "—"} nT
          </span>
        </div>
        <IndexChart
          data={symh.map((d) => ({ time: d.time_tag, value: d.value }))}
          color="#a78bfa"
          label="SYM-H [nT]"
          referenceY={0}
          height={60}
        />
      </div>

      {/* AE */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">AE index</span>
          <span className="text-sm font-mono font-bold" style={{ color: "#fbbf24" }}>
            {ae.length > 0 ? `${ae.at(-1)?.value?.toFixed(0)} nT` : "—"}
          </span>
        </div>
        {ae.length > 0 ? (
          <IndexChart
            data={ae.map((d) => ({ time: d.time_tag, value: d.value }))}
            color="#fbbf24"
            label="AE [nT]"
            height={60}
          />
        ) : (
          <div className="text-[10px] text-slate-600 font-mono py-2 text-center">
            Dane niedostepne w publicznym API NOAA
          </div>
        )}
      </div>
    </div>
  );
}
