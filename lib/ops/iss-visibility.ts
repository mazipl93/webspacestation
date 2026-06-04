/** Promień strefy widoczności ISS na mapie (metry) — bez satellite.js (safe dla klienta). */
export function issVisibilityRadiusM(altitudeKm: number): number {
  const earthKm = 6371;
  const h = Math.max(altitudeKm, 200);
  return Math.sqrt((earthKm + h) ** 2 - earthKm ** 2) * 1000;
}
