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
import { getKpColor, getDisplayKp } from "@/lib/aurora/api";

interface IndexChartRowProps {
  data: { time: string; value: number }[];
  label: string;
  value: string;
  unit: string;
  color: string;
  referenceY?: number;
  domain?: [number | "auto", number | "auto"];
  height?: number;
  showXAxis?: boolean;
}

function fmtTime(t: string): string {
  try {
    const normalized = t.includes("T") ? t : t.replace(" ", "T") + (t.length === 19 ? "Z" : "");
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return t.slice(11, 16) || t;
    return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t.slice(11, 16) || t;
  }
}

function IndexChartRow({
  data,
  label,
  value,
  unit,
  color,
  referenceY,
  domain,
  height = 72,
  showXAxis = false,
}: IndexChartRowProps) {
  const slice = data.slice(-1440);

  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2 flex gap-2 items-stretch">
      <div className="w-[4rem] sm:w-[4.5rem] shrink-0 flex flex-col justify-center items-center text-center border-r border-slate-800/80 pr-2">
        <span className="text-[11px] lg:text-[8px] text-slate-500 font-mono uppercase leading-tight">{label}</span>
        <span className="text-xl lg:text-base font-bold font-mono leading-none mt-1" style={{ color }}>
          {value}
        </span>
        <span className="text-[11px] lg:text-[8px] text-slate-600 font-mono mt-0.5">{unit}</span>
      </div>
      <div className="flex-1 min-w-0">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={slice} margin={{ top: 2, right: 4, left: 0, bottom: showXAxis ? 2 : 0 }}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 7, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickFormatter={fmtTime}
              hide={!showXAxis}
            />
            <YAxis
              domain={domain || ["auto", "auto"]}
              tick={{ fontSize: 7, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={26}
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
              labelFormatter={(t: unknown) => fmtTime(String(t ?? ""))}
              formatter={(v: unknown) => [Number(v).toFixed(1), unit]}
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
    </div>
  );
}

interface GeomagneticPanelProps {
  kp3Day: KpData[];
  kp1m?: KpData[];
  dst: GeomagneticIndex[];
  symh: GeomagneticIndex[];
}

export default function GeomagneticPanel({ kp3Day, kp1m, dst, symh }: GeomagneticPanelProps) {
  const kpChart = kp3Day.map((d) => ({ time: d.time, value: d.kp }));
  const currentKp = kp1m ? getDisplayKp(kp1m, kp3Day) : kp3Day.at(-1)?.kp ?? 0;
  const kpColor = getKpColor(currentKp);
  const dstNow = dst.at(-1)?.value;
  const symhNow = symh.at(-1)?.value;

  return (
    <div className="space-y-2">
      <IndexChartRow
        label="Kp"
        value={currentKp.toFixed(1)}
        unit="72h"
        data={kpChart}
        color={kpColor}
        domain={[0, 9]}
        height={76}
      />
      <IndexChartRow
        label="Dst"
        value={dstNow?.toFixed(0) ?? "—"}
        unit="nT"
        data={dst.map((d) => ({ time: d.time_tag, value: d.value }))}
        color={dstNow != null && dstNow < -30 ? "#ff6600" : "#60a5fa"}
        referenceY={0}
        height={68}
      />
      <IndexChartRow
        label="SYM-H"
        value={symhNow?.toFixed(0) ?? "—"}
        unit="nT"
        data={symh.map((d) => ({ time: d.time_tag, value: d.value }))}
        color={symhNow != null && symhNow < -30 ? "#ff6600" : "#a78bfa"}
        referenceY={0}
        height={68}
        showXAxis
      />
    </div>
  );
}
