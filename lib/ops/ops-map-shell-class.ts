/** Stała wysokość kafelka mapy — Tailwind, bez polegania wyłącznie na globals.css */
export function opsMapShellClass(mapClassName?: string): string {
  if (mapClassName?.includes("ops-map-page-map")) {
    return [
      "ops-map-page-map",
      "h-[min(50dvh,420px)] min-h-[300px] max-h-[min(50dvh,420px)]",
      "sm:h-[min(55dvh,520px)] sm:min-h-[380px] sm:max-h-[min(55dvh,520px)]",
      "lg:h-[min(62dvh,680px)] lg:min-h-[480px] lg:max-h-[min(62dvh,680px)]",
    ].join(" ");
  }
  if (mapClassName?.includes("ops-map-embed")) {
    return [
      "ops-map-embed",
      "h-[min(48dvh,400px)] min-h-[280px] max-h-[min(48dvh,400px)]",
      "sm:min-h-[320px]",
      "lg:h-[420px] lg:min-h-[420px] lg:max-h-[420px]",
    ].join(" ");
  }
  return "h-[320px] min-h-[280px] max-h-[320px]";
}
