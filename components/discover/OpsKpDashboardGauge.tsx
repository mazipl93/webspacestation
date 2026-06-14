"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { getKpColor } from "@/lib/aurora/api";

type Props = {
  kp: number;
  className?: string;
};

const KP_MAX = 9;
const LABELED_TICKS = [0, 3, 6, 9];

/** Pozycja % na osi 0–9 — zgodna z tor SVG (0…100%). */
function kpToPct(value: number): number {
  return (value / KP_MAX) * 100;
}

export default function OpsKpDashboardGauge({ kp, className }: Props) {
  const uid = useId().replace(/:/g, "");
  const ratio = Math.min(1, Math.max(0, kp / KP_MAX));
  const color = getKpColor(kp);
  const needlePct = kpToPct(kp);

  return (
    <div className={cn("ops-kp-scale", className)} aria-hidden>
      <div className="ops-kp-scale__value" style={{ left: `${needlePct}%`, color }}>
        {kp.toFixed(1)}
      </div>

      <svg viewBox="0 0 100 12" className="ops-kp-scale__svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`ops-kp-axis-${uid}`} x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%" stopColor="#00ddff" />
            <stop offset="22%" stopColor="#44ff88" />
            <stop offset="44%" stopColor="#ffdd00" />
            <stop offset="66%" stopColor="#ff8800" />
            <stop offset="100%" stopColor="#ff3333" />
          </linearGradient>
          <clipPath id={`ops-kp-clip-${uid}`}>
            <rect x="0" y="3.5" width={100 * ratio} height="5" rx="2.5" />
          </clipPath>
        </defs>

        <rect
          x="0"
          y="3.5"
          width="100"
          height="5"
          rx="2.5"
          fill="rgba(8, 12, 22, 0.82)"
          stroke="rgba(51, 65, 85, 0.5)"
          strokeWidth="0.4"
        />

        {ratio > 0.005 && (
          <rect
            x="0"
            y="3.5"
            width="100"
            height="5"
            rx="2.5"
            fill={`url(#ops-kp-axis-${uid})`}
            clipPath={`url(#ops-kp-clip-${uid})`}
            opacity={0.96}
          />
        )}

        {Array.from({ length: 10 }, (_, i) => {
          const x = (i / KP_MAX) * 100;
          const major = i % 3 === 0;
          const passed = i <= kp + 0.05;
          return (
            <line
              key={i}
              x1={x}
              y1="8.5"
              x2={x}
              y2={major ? 11 : 10}
              stroke={passed ? color : "rgba(100, 116, 139, 0.5)"}
              strokeWidth={major ? 0.55 : 0.35}
              opacity={major ? 0.85 : 0.4}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        <line
          x1={100 * ratio}
          y1="1.5"
          x2={100 * ratio}
          y2="8.5"
          stroke={color}
          strokeWidth="0.9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
        />
        <circle
          cx={100 * ratio}
          cy="6"
          r="1.4"
          fill={color}
          stroke="#0a0f18"
          strokeWidth="0.45"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="ops-kp-scale__labels">
        {LABELED_TICKS.map((n) => {
          const pct = kpToPct(n);
          return (
            <span
              key={n}
              className="ops-kp-scale__label"
              style={{
                left: `${pct}%`,
                transform: n === 0 ? "none" : n === 9 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {n}
            </span>
          );
        })}
      </div>
    </div>
  );
}
