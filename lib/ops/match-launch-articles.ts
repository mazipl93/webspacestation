import type { OpsLaunch } from "@/lib/ops/types";

/** Minimal article shape for launch ↔ news matching (no DB import). */
export type BridgeArticle = {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  categorySlug: string;
  publishedAt: string | null;
};

export const LAUNCH_ARTICLE_MIN_SCORE = 8;

const CATEGORY_BONUS: Record<string, number> = {
  misje: 2,
  iss: 1,
  technologie: 1,
};

/** Same operator/rocket alone must never bridge (e.g. „Google płaci SpaceX”). */
const GENERIC_ONLY_TERMS = new Set([
  "spacex",
  "nasa",
  "esa",
  "jaxa",
  "isro",
  "roscosmos",
  "rocket lab",
  "blue origin",
  "ariane",
  "ula",
  "falcon",
  "falcon 9",
  "falcon 9 block 5",
  "starship",
  "electron",
  "new glenn",
  "soyuz",
  "long march",
  "misja nieujawniona",
]);

type MissionFingerprint =
  | { kind: "phrase"; value: string; weight: number }
  | { kind: "all"; values: string[]; weight: number };

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s-/]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryBonus(categorySlug: string): number {
  return CATEGORY_BONUS[categorySlug] ?? 0;
}

function articleHaystack(article: BridgeArticle): string {
  return normalizeText(`${article.title} ${article.slug} ${article.tags.join(" ")}`);
}

function pushPhrase(fps: MissionFingerprint[], raw: string, weight: number): void {
  const value = normalizeText(raw);
  if (!value || GENERIC_ONLY_TERMS.has(value)) return;
  fps.push({ kind: "phrase", value, weight });
}

function pushCodeVariants(fps: MissionFingerprint[], prefix: string, num: string, weight: number): void {
  const p = prefix.toLowerCase();
  const n = num.replace(/\s+/g, "");
  pushPhrase(fps, `${p}-${n}`, weight);
  pushPhrase(fps, `${p} ${n}`, weight - 1);
}

/** Identifiers that mean „ten konkretny lot”, nie ogólny news o operatorze. */
export function launchMissionFingerprints(launch: OpsLaunch): MissionFingerprint[] {
  const fps: MissionFingerprint[] = [];
  const mission = launch.mission ?? "";
  const missionNorm = normalizeText(mission);

  const nrol = mission.match(/\bNROL[- ]?(\d+)\b/i);
  if (nrol) pushCodeVariants(fps, "nrol", nrol[1], 18);

  const starlinkGroup = mission.match(/\bstarlink\s+group\s+(\d+[-–]\d+)\b/i);
  if (starlinkGroup) {
    const batch = starlinkGroup[1].replace(/–/g, "-");
    pushPhrase(fps, `starlink group ${batch}`, 18);
    fps.push({
      kind: "all",
      values: ["starlink", batch],
      weight: 14,
    });
  }

  const starlinkBatch = mission.match(/\bstarlink\s+(\d+[-–]\d+)\b/i);
  if (starlinkBatch && !starlinkGroup) {
    const batch = starlinkBatch[1].replace(/–/g, "-");
    pushPhrase(fps, `starlink ${batch}`, 16);
    fps.push({ kind: "all", values: ["starlink", batch], weight: 13 });
  }

  const h3 = mission.match(/\bH3[- ]?(\d+)\b/i);
  if (h3) pushCodeVariants(fps, "h3", h3[1], 16);

  const crew = mission.match(/\bCrew[- ]?(\d+)\b/i);
  if (crew) pushCodeVariants(fps, "crew", crew[1], 16);

  const artemis = mission.match(/\bArtemis\s+(III|II|IV|3|2|4|I|1)\b/i);
  if (artemis) {
    pushPhrase(fps, `artemis ${artemis[1].toLowerCase()}`, 16);
    pushPhrase(fps, "artemis", 10);
  }

  const starshipFlight = mission.match(/\b(Starship\s+(?:IFT|Flight)[- ]?\d+)\b/i);
  if (starshipFlight) pushPhrase(fps, starshipFlight[1], 17);

  const ussf = mission.match(/\bUSSF[- ]?(\d+)\b/i);
  if (ussf) pushCodeVariants(fps, "ussf", ussf[1], 16);

  const goes = mission.match(/\bGOES[- ]?(\d+[A-Z]?)\b/i);
  if (goes) pushCodeVariants(fps, "goes", goes[1], 16);

  const crs = mission.match(/\bCRS[- ]?(\d+)\b/i);
  if (crs) pushCodeVariants(fps, "crs", crs[1], 15);

  const cygnus = mission.match(/\bCygnus\s+NG[- ]?(\d+)\b/i);
  if (cygnus) pushCodeVariants(fps, "cygnus ng", cygnus[1], 16);

  const progress = mission.match(/\bProgress\s+MS[- ]?(\d+)\b/i);
  if (progress) pushCodeVariants(fps, "progress ms", progress[1], 16);

  // Distinctive mission title (not generic „Test Flight” alone)
  if (
    fps.length === 0 &&
    missionNorm.length >= 10 &&
    !GENERIC_ONLY_TERMS.has(missionNorm) &&
    !/^test flight$/i.test(missionNorm)
  ) {
    pushPhrase(fps, missionNorm, 12);
  }

  return fps;
}

function fingerprintMatches(haystack: string, fp: MissionFingerprint): boolean {
  if (fp.kind === "phrase") return haystack.includes(fp.value);
  return fp.values.every((v) => haystack.includes(v));
}

function fingerprintScore(haystack: string, fingerprints: MissionFingerprint[]): number {
  let score = 0;
  for (const fp of fingerprints) {
    if (fingerprintMatches(haystack, fp)) score += fp.weight;
  }
  return score;
}

/** @deprecated diagnostic only */
export function launchSearchTerms(launch: OpsLaunch): string[] {
  return launchMissionFingerprints(launch).flatMap((fp) =>
    fp.kind === "phrase" ? [fp.value] : fp.values,
  );
}

/** Score — tylko gdy artykuł dotyczy tego lotu (kod misji / nazwa), nie ogólnego SpaceX. */
export function scoreLaunchArticleMatch(
  launch: OpsLaunch,
  article: BridgeArticle,
  nowMs = Date.now(),
): number {
  const fingerprints = launchMissionFingerprints(launch);
  if (fingerprints.length === 0) return 0;

  const haystack = articleHaystack(article);
  const core = fingerprintScore(haystack, fingerprints);
  if (core < 8) return 0;

  let score = core + categoryBonus(article.categorySlug);

  if (article.publishedAt) {
    const age = nowMs - Date.parse(article.publishedAt);
    if (age <= 14 * 86_400_000) score += 1;
    else if (age <= 45 * 86_400_000) score += 0.5;
  }

  // Prefer news published near NET (±21 dni) — typowy news przed startem
  const netMs = Date.parse(launch.net);
  if (article.publishedAt && !Number.isNaN(netMs)) {
    const pubMs = Date.parse(article.publishedAt);
    const delta = Math.abs(netMs - pubMs);
    if (delta <= 21 * 86_400_000) score += 2;
    else if (delta <= 45 * 86_400_000) score += 1;
  }

  return Math.round(score);
}

export function pickArticleForLaunch(
  launch: OpsLaunch,
  articles: BridgeArticle[],
  reservedIds: Set<string> = new Set(),
  minScore = LAUNCH_ARTICLE_MIN_SCORE,
): BridgeArticle | null {
  let best: BridgeArticle | null = null;
  let bestScore = minScore - 1;

  for (const article of articles) {
    if (reservedIds.has(article.id)) continue;
    const score = scoreLaunchArticleMatch(launch, article);
    if (score > bestScore) {
      bestScore = score;
      best = article;
      continue;
    }
    if (
      score === bestScore &&
      best?.publishedAt &&
      article.publishedAt &&
      Date.parse(article.publishedAt) > Date.parse(best.publishedAt)
    ) {
      best = article;
    }
  }

  return best;
}

export function buildLaunchArticleMap(
  launches: OpsLaunch[],
  articles: BridgeArticle[],
): Map<string, BridgeArticle> {
  const map = new Map<string, BridgeArticle>();
  const reserved = new Set<string>();

  for (const launch of launches) {
    const match = pickArticleForLaunch(launch, articles, reserved);
    if (match) {
      map.set(launch.id, match);
      reserved.add(match.id);
    }
  }

  return map;
}

export function pickLaunchForArticle(
  article: BridgeArticle,
  launches: OpsLaunch[],
  minScore = LAUNCH_ARTICLE_MIN_SCORE,
): OpsLaunch | null {
  let best: OpsLaunch | null = null;
  let bestScore = minScore - 1;

  for (const launch of launches) {
    let score = scoreLaunchArticleMatch(launch, article);
    if (
      launch.phase === "countdown" ||
      launch.phase === "window" ||
      launch.phase === "live"
    ) {
      score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = launch;
      continue;
    }
    if (score === bestScore && best && Date.parse(launch.net) < Date.parse(best.net)) {
      best = launch;
    }
  }

  return best;
}

export function toLaunchArticleHref(slug: string): string {
  return `/aktualnosci/${slug}`;
}
