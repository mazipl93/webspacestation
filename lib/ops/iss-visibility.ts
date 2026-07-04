/** Promień strefy horyzontu ISS (metry) — geometria: gdzie ISS jest nad linią horyzontu. */
export function issVisibilityRadiusM(altitudeKm: number): number {
  const earthKm = 6371;
  const h = Math.max(altitudeKm, 200);
  return Math.sqrt((earthKm + h) ** 2 - earthKm ** 2) * 1000;
}

const EARTH_KM = 6371;

/** Promień horyzontu ISS w km (API wheretheiss.at lub geometria z wysokości). */
export function issVisibilityRadiusKm(
  altitudeKm?: number,
  apiVisibilityKm?: number,
): number {
  if (typeof apiVisibilityKm === "number" && apiVisibilityKm > 0) {
    return apiVisibilityKm;
  }
  const alt = typeof altitudeKm === "number" ? altitudeKm : 408;
  return issVisibilityRadiusM(alt) / 1000;
}

/** Kąt łuku na globusie (stopnie) — ringMaxRadius w globe.gl. */
export function issVisibilityRingDegrees(
  altitudeKm?: number,
  apiVisibilityKm?: number,
): number {
  const radiusKm = issVisibilityRadiusKm(altitudeKm, apiVisibilityKm);
  return (radiusKm / EARTH_KM) * (180 / Math.PI);
}
