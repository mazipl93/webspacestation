import type { OpsIssPosition } from "@/lib/ops/types";

/** ISS orbit ~90 min — pozycja z cache starsza niż tyle jest myląca na SSR. */
export const ISS_POSITION_MAX_AGE_MS =
  process.env.NODE_ENV === "development" ? 90_000 : 120_000;

export function isIssPositionStale(
  iss: OpsIssPosition | null | undefined,
  maxAgeMs: number = ISS_POSITION_MAX_AGE_MS,
): boolean {
  if (!iss || typeof iss.timestamp !== "number") return true;
  const ageMs = Date.now() - iss.timestamp * 1000;
  if (!Number.isFinite(ageMs) || ageMs < 0) return true;
  return ageMs > maxAgeMs;
}
