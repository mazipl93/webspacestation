import type { OpsLaunch } from "@/lib/ops/types";

/**
 * Wzorce misji, które zasługują na wzbogacony brief z web search.
 * Starlinki, OneWeb, Telesat i inne rutynowe serie wpadają do zwykłego batcha.
 */
const INTERESTING_PATTERNS: RegExp[] = [
  // NASA crewed / flagship
  /\bCrew[- ]?(Dragon|Mission|\d)/i,
  /Dragon[- ]?Crew/i,
  /\bArtemis\b/i,
  /\bOrion\b/i,
  /\bSLS\b/i,
  /\bStarliner\b/i,
  // Misje załogowe prywatne
  /\bAxiom\b/i,
  /\bPolaris\b/i,
  /\bInspiration\d/i,
  // Wojskowe / klasyfikowane
  /\bNROL[- ]?\d/i,
  /\bUSSF[- ]?\d/i,
  /national security mission/i,
  /\bUSVS\b/i,
  // SpaceX Starship
  /\bStarship\b/i,
  // Sonda / nauka flagship
  /\bSPHEREx\b/i,
  /\bPACE\b/i,
  /\bPsyche\b/i,
  /Europa Clipper/i,
  /\bDARTx?\b/i,
  /\bOSIRIS/i,
  /\bLucy\b/i,
  /\bDragonfly\b/i,
  /\bRoman\b.*telescope/i,
  // Dragon CRS (cargo ISS — ciekawe ze względu na ISS sekcję)
  /CRS[- ]?\d/i,
  /Cargo.*Dragon|Dragon.*Cargo/i,
];

/** Zwraca true jeśli start zasługuje na brief wzbogacony web searchem. */
export function isInterestingLaunch(launch: OpsLaunch): boolean {
  const text = [launch.mission, launch.provider, launch.rocketName ?? ""].join(" ");
  return INTERESTING_PATTERNS.some((re) => re.test(text));
}

/** Generuje zapytanie wyszukiwarkowe dla danej misji. */
export function getMissionSearchQuery(launch: OpsLaunch): string {
  return `"${launch.mission}" ${launch.provider} launch ${new Date(launch.net).getFullYear()} mission details`;
}
