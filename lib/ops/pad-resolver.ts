/** Rozpoznawanie ramp LL2 (generyczne aliasy) → czytelne etykiety i haystack dla spotlight. */

export type PadResolveContext = {
  label: string;
  provider?: string;
  lat?: number;
  lon?: number;
};

function stripScheduleSuffix(text: string): string {
  return text.replace(/\s*·\s*start w harmonogramie\s*$/i, "").trim();
}

/** Wskazówka geograficzna dla haystack — rozróżnia m.in. Andøya vs Mahia. */
function geoPadHint(lat: number, lon: number): string {
  if (lat > 55 && lat < 72 && lon > 5 && lon < 32) {
    return "andoya andøya norway nordland isar";
  }
  if (lat < -35 && lat > -45 && lon > 175 && lon < 180) {
    return "mahia new zealand rocket lab";
  }
  if (lat > 36 && lat < 38 && lon > 120 && lon < 123) {
    return "haiyang shandong yellow sea offshore";
  }
  if (lat > 8 && lat < 10 && lon > 78 && lon < 81) {
    return "sriharikota sdsc isro";
  }
  if (lat > 38 && lat < 41 && lon > 111 && lon < 113) {
    return "taiyuan shanxi china";
  }
  if (lat > 28 && lat < 29 && lon > 101 && lon < 103) {
    return "xichang sichuan china";
  }
  return "";
}

export function buildPadHaystack(ctx: PadResolveContext): string {
  const operator = stripScheduleSuffix(ctx.provider ?? "");
  const parts = [ctx.label.trim(), operator];
  if (ctx.lat != null && ctx.lon != null) {
    const hint = geoPadHint(ctx.lat, ctx.lon);
    if (hint) parts.push(hint);
  }
  return parts.join(" ").toLowerCase();
}

type LabelRule = {
  test: (haystack: string) => boolean;
  label: string;
};

/** Etykiety na mapie — po rozpoznaniu obiektu, nie surowy tekst LL2. */
const DISPLAY_LABEL_RULES: LabelRule[] = [
  {
    test: (h) =>
      /rocket lab/i.test(h) &&
      /lc-2|lc 2|launch complex 2|\(lc-2\)/i.test(h),
    label: "Rocket Lab LC-2 · Wallops",
  },
  {
    test: (h) =>
      /rocket lab/i.test(h) &&
      /mahia|launch complex 1|\blc-1\b|new zealand/i.test(h),
    label: "Rocket Lab LC-1 · Mahia",
  },
  {
    test: (h) =>
      /orbital launch pad|andoya|andøya|nordmela|isar|spectrum/i.test(h) &&
      !/rocket lab|mahia|new zealand/i.test(h),
    label: "Andøya · Orbital Launch Pad",
  },
  {
    test: (h) => /haiyang/i.test(h) && /offshore|launch location|launch site/i.test(h),
    label: "Haiyang · start z morza",
  },
  {
    test: (h) => /offshore launch platform/i.test(h),
    label: "Platforma morska · Chiny",
  },
  {
    test: (h) => /kwajalein|reagan test site|omelek|marshall islands/i.test(h),
    label: "Reagan Test Site · Kwajalein",
  },
  {
    test: (h) =>
      /launch complex 2|\(lc-2\)/i.test(h) && /rocket lab/i.test(h),
    label: "Rocket Lab LC-2 · Wallops",
  },
  {
    test: (h) => /taiyuan/i.test(h),
    label: "Taiyuan · CNSA",
  },
  {
    test: (h) => /xichang/i.test(h),
    label: "Xichang · CNSA",
  },
];

export function resolvePadDisplayLabel(
  ctx: PadResolveContext,
  localizedFallback?: string,
): string {
  const haystack = buildPadHaystack(ctx);
  for (const { test, label } of DISPLAY_LABEL_RULES) {
    if (test(haystack)) return label;
  }
  const fallback = localizedFallback?.trim() || ctx.label.trim();
  return fallback || "Miejsce startu";
}
