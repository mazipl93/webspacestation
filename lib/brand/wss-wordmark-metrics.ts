/** Skalowanie wordmarku — nav 52px, stopka 48px. */

export function wssWordmarkMetrics(height: number) {
  const scale = height / 52;
  return {
    scale,
    letterPx: Math.round(38 * scale),
    subPx: Math.max(7, Math.round(7.5 * scale)),
    gap: Math.max(3, Math.round(4 * scale)),
    letterGap: Math.max(7, Math.round(9 * scale)),
    dotSize: Math.max(3, Math.round(3.5 * scale)),
    barH: Math.round(38 * scale * 0.68),
  };
}

export type WssWordmarkMetrics = ReturnType<typeof wssWordmarkMetrics>;
