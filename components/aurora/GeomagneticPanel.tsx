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
import { formatChartAxisTime, formatChartTooltipTime } from "@/lib/aurora/time-display";

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
  const chartHeight = showXAxis ? height + 22 : height;

  return (
    <div className="rounded-xl lg:rounded-lg border border-slate-800/80 bg-slate-950/40 lg:bg-slate-950/45 p-3 lg:p-3.5 flex flex-col lg:flex-row gap-0 lg:gap-3 items-stretch min-w-0">
      <div className="flex lg:hidden items-baseline justify-between gap-3 min-w-0 pb-3 border-b border-slate-800/80 mb-3">
        <span className="text-[13px] text-slate-500 font-mono uppercase tracking-wide shrink-0">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5 tabular-nums min-w-0">
          <span className="text-2xl font-bold font-mono leading-none" style={{ color }}>
            {value}
          </span>
          <span className="text-[13px] text-slate-600 font-mono">{unit}</span>
        </div>
      </div>

      <div className="hidden lg:flex w-[5.5rem] shrink-0 flex-col justify-center items-center text-center border-r border-slate-800/80 pr-3 min-w-0">
        <span className="text-[11px] text-slate-500 font-mono uppercase leading-tight">{label}</span>
        <span className="text-2xl lg:text-3xl font-bold font-mono leading-none mt-1 tabular-nums" style={{ color }}>
          {value}
        </span>
        <span className="text-[11px] text-slate-600 font-mono mt-0.5">{unit}</span>
      </div>

      <div className="flex-1 min-w-0 w-full">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={slice} margin={{ top: 2, right: 6, left: 0, bottom: showXAxis ? 20 : 2 }}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={32}
              tickFormatter={formatChartAxisTime}
              hide={!showXAxis}
            />
            <YAxis
              domain={domain || ["auto", "auto"]}
              tick={{ fontSize: 10, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0f1e",
                border: `1px solid ${color}33`,
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "monospace",
                color: "#e2e8f0",
              }}
              labelFormatter={(t: unknown) => formatChartTooltipTime(String(t ?? ""))}
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
  showTimeAxis?: boolean;
}

export default function GeomagneticPanel({
  kp3Day,
  kp1m,
  dst,
  symh,
  showTimeAxis = false,
}: GeomagneticPanelProps) {
  const kpChart = kp3Day.map((d) => ({ time: d.time, value: d.kp }));
  const currentKp = kp1m ? getDisplayKp(kp1m, kp3Day) : kp3Day.at(-1)?.kp ?? 0;
  const kpColor = getKpColor(currentKp);
  const dstNow = dst.at(-1)?.value;
  const symhNow = symh.at(-1)?.value;
  const rowHeight = showTimeAxis ? 88 : 92;

  return (
    <div className="space-y-3 lg:space-y-3.5">
      <IndexChartRow
        label="Kp"
        value={currentKp.toFixed(1)}
        unit="72h"
        data={kpChart}
        color={kpColor}
        domain={[0, 9]}
        height={rowHeight}
        showXAxis={showTimeAxis}
      />
      <IndexChartRow
        label="Dst"
        value={dstNow?.toFixed(0) ?? "—"}
        unit="nT"
        data={dst.map((d) => ({ time: d.time_tag, value: d.value }))}
        color={dstNow != null && dstNow < -30 ? "#ff6600" : "#60a5fa"}
        referenceY={0}
        height={rowHeight - 4}
        showXAxis={showTimeAxis}
      />
      <IndexChartRow
        label="SYM-H"
        value={symhNow?.toFixed(0) ?? "—"}
        unit="nT"
        data={symh.map((d) => ({ time: d.time_tag, value: d.value }))}
        color={symhNow != null && symhNow < -30 ? "#ff6600" : "#a78bfa"}
        referenceY={0}
        height={rowHeight - 4}
        showXAxis={showTimeAxis}
      />
    </div>
  );
}
