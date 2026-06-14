"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { KpForecast, NoaaAlert } from "@/lib/aurora/api";
import { getKpColor } from "@/lib/aurora/api";

interface ForecastPanelProps {
  forecast: KpForecast[];
  alerts: NoaaAlert[];
}

const ALERT_TYPE_COLOR: Record<string, string> = {
  alert: "#ff2222",
  warning: "#ff6600",
  watch: "#ffaa00",
  summary: "#60a5fa",
  info: "#64748b",
};

const ALERT_TYPE_LABEL: Record<string, string> = {
  alert: "ALERT",
  warning: "OSTRZEZENIE",
  watch: "OBSERWACJA",
  summary: "PODSUMOWANIE",
  info: "INFO",
};

function makeAlertKey(alert: NoaaAlert): string {
  return `${alert.productId}_${alert.issueTime}`;
}

export default function ForecastPanel({ forecast, alerts }: ForecastPanelProps) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const cacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const toTranslate = alerts.slice(0, 5).filter((a) => {
      const key = makeAlertKey(a);
      return !cacheRef.current[key];
    });

    if (toTranslate.length === 0) return;

    toTranslate.forEach((alert) => {
      const key = makeAlertKey(alert);
      fetch("/api/aurora/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: alert.message, type: alert.type }),
      })
        .then((r) => r.json())
        .then(({ translation }: { translation: string }) => {
          if (translation) {
            cacheRef.current[key] = translation;
            setTranslations((prev) => ({ ...prev, [key]: translation }));
          }
        })
        .catch(() => null);
    });
  }, [alerts]);

  const chartData = forecast.slice(0, 24).map((f) => {
    const raw = f.time.includes("T") ? f.time : f.time.replace(" ", "T") + "Z";
    const d = new Date(raw.endsWith("Z") ? raw : raw + "Z");
    const label = isNaN(d.getTime())
      ? f.time.slice(5, 16)
      : d.toLocaleString("pl-PL", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Warsaw",
        });
    return { label, kp: f.kp, color: getKpColor(f.kp) };
  });

  const maxForecast = Math.max(...forecast.map((f) => f.kp), 0);
  const stormAlerts = alerts.filter((a) => a.type === "alert" || a.type === "warning");

  return (
    <div className="space-y-4">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm lg:text-xs font-bold tracking-widest text-slate-200 uppercase mb-3">
            Alerty NOAA Space Weather
          </h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {alerts.slice(0, 8).map((alert, i) => {
              const key = makeAlertKey(alert);
              const col = ALERT_TYPE_COLOR[alert.type] || "#64748b";
              const lbl = ALERT_TYPE_LABEL[alert.type] || alert.type;
              const translation = translations[key] || cacheRef.current[key];
              const isExpanded = expanded[key] ?? false;

              return (
                <div
                  key={i}
                  className="rounded border p-3"
                  style={{ borderColor: `${col}44`, background: `${col}0a` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[12px] lg:text-[9px] font-bold px-2 py-0.5 rounded font-mono"
                      style={{ color: col, background: `${col}22`, border: `1px solid ${col}44` }}
                    >
                      {lbl}
                    </span>
                    <span className="text-[12px] lg:text-[9px] text-slate-500 font-mono">
                      {alert.issueTime.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>

                  {/* Polish translation — prominent */}
                  {i < 5 && (
                    <div className="mb-2">
                      {translation ? (
                        <p className="text-[14px] lg:text-[11px] text-slate-100 leading-relaxed">
                          {translation}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-mono italic">
                          Tlumaczenie...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Original NOAA text — collapsible */}
                  <div>
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                      className="text-[9px] text-slate-600 hover:text-slate-400 font-mono transition-colors"
                    >
                      {isExpanded ? "Ukryj oryginal" : "Pokaz oryginal NOAA"}
                    </button>
                    {isExpanded && (
                      <p className="mt-1 text-[9px] text-slate-500 font-mono leading-relaxed whitespace-pre-wrap break-words">
                        {alert.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3-day Kp forecast */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">
            Prognoza Kp 3 dni
          </h3>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="text-slate-500">max:</span>
            <span style={{ color: getKpColor(maxForecast) }} className="font-bold">
              {maxForecast.toFixed(1)}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 9]}
              tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={16}
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
              formatter={(v: unknown) => [Number(v).toFixed(1), "Kp"]}
            />
            <ReferenceLine y={5} stroke="#ff666633" strokeDasharray="3 3" />
            <Bar dataKey="kp" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  fillOpacity={entry.kp >= 5 ? 0.9 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Storm badge */}
      {stormAlerts.length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-900/20 p-3 text-center animate-pulse">
          <div className="text-red-400 font-bold text-sm tracking-widest">
            AKTYWNA BURZA GEOMAGNETYCZNA
          </div>
          <div className="text-[10px] text-red-300/70 font-mono mt-1">
            Sprawdz alerty NOAA powyzej
          </div>
        </div>
      )}
    </div>
  );
}
