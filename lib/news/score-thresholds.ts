/** Score at or above → breaking badge na kartach (tylko redakcja WSS, bez RSS). */
export const SCORE_BREAKING = 9;

/** Score at or above → top-priority hero (tylko redakcja WSS). */
export const SCORE_TOP_PRIORITY = 12;

export function isBreakingScore(score: number): boolean {
  return score >= SCORE_BREAKING;
}

export function isTopPriorityScore(score: number): boolean {
  return score >= SCORE_TOP_PRIORITY;
}
