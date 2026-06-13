"use client";

import { useMemo } from "react";
import { getKpColor, getKpLabel } from "@/lib/aurora/api";

interface KpGaugeProps {
  kp: number;
  size?: number;
}

export default function KpGauge({ kp, size = 180 }: KpGaugeProps) {
  const color = getKpColor(kp);
  const label = getKpLabel(kp);
  const isStormy = kp >= 5;

  // SVG arc gauge (semicircle)
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size * 0.38;
  const strokeWidth = size * 0.07;

  // Arc from -π to 0 (bottom semicircle is hidden), we use 0..9 mapped to 0..π arc
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const valueAngle = startAngle + (kp / 9) * Math.PI;

  const describeArc = (start: number, end: number) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Tick marks at 0,1,2,...,9
  const ticks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const angle = startAngle + (i / 9) * Math.PI;
        const innerR = r - strokeWidth * 0.7;
        const outerR = r + strokeWidth * 0.5;
        return {
          x1: cx + innerR * Math.cos(angle),
          y1: cy + innerR * Math.sin(angle),
          x2: cx + outerR * Math.cos(angle),
          y2: cy + outerR * Math.sin(angle),
          label: String(i),
          lx: cx + (r + strokeWidth * 1.3) * Math.cos(angle),
          ly: cy + (r + strokeWidth * 1.3) * Math.sin(angle),
          active: i <= Math.round(kp),
        };
      }),
    [cx, cy, r, strokeWidth, kp]
  );

  // Needle
  const needleAngle = startAngle + (kp / 9) * Math.PI;
  const needleLen = r - strokeWidth * 0.5;
  const needleX = cx + needleLen * Math.cos(needleAngle);
  const needleY = cy + needleLen * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        viewBox={`0 0 ${size} ${size * 0.62}`}
        style={{ width: "100%", maxWidth: size, height: "auto" }}
        className={isStormy ? "animate-pulse-slow" : ""}
      >
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#1a2235"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Gradient colored arc */}
        <defs>
          <linearGradient id="kp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ddff" />
            <stop offset="40%" stopColor="#44ff88" />
            <stop offset="60%" stopColor="#ffdd00" />
            <stop offset="80%" stopColor="#ff6600" />
            <stop offset="100%" stopColor="#ff2222" />
          </linearGradient>
        </defs>
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="url(#kp-grad)"
          strokeWidth={strokeWidth * 0.3}
          strokeLinecap="round"
          opacity={0.3}
        />
        {/* Active arc */}
        <path
          d={describeArc(startAngle, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x1} y1={t.y1}
              x2={t.x2} y2={t.y2}
              stroke={t.active ? color : "#334155"}
              strokeWidth={1.5}
            />
            <text
              x={t.lx} y={t.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={t.active ? color : "#475569"}
              fontSize={size * 0.065}
              fontFamily="monospace"
            >
              {t.label}
            </text>
          </g>
        ))}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <circle cx={cx} cy={cy} r={size * 0.035} fill={color} />
        {/* Center value */}
        <text
          x={cx}
          y={cy - size * 0.01}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.18}
          fontWeight="bold"
          fontFamily="monospace"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        >
          {kp.toFixed(1)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.07}
          fontFamily="monospace"
          opacity={0.9}
        >
          {label}
        </text>
      </svg>
      {isStormy && (
        <div
          className="mt-1 px-3 py-0.5 rounded text-xs font-bold tracking-widest animate-pulse"
          style={{ color, border: `1px solid ${color}`, textShadow: `0 0 8px ${color}` }}
        >
          ⚡ BURZA GEOMAGNETYCZNA
        </div>
      )}
    </div>
  );
}
