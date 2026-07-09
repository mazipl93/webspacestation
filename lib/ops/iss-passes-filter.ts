import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";

/** Nadchodzące przeloty — odrzuca zakończone, sortuje po szczyt elewacji. */
export function filterUpcomingIssPasses(
  passes: IssPolandPass[],
  nowMs = Date.now(),
  limit?: number,
): IssPolandPass[] {
  const fresh = passes
    .filter((p) => new Date(p.endAt).getTime() > nowMs)
    .sort(
      (a, b) =>
        new Date(a.maxAt).getTime() - new Date(b.maxAt).getTime(),
    );

  return limit != null ? fresh.slice(0, limit) : fresh;
}
