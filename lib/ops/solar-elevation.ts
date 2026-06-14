/** Elewacja Słońca (°) — NOAA-style, wystarcza do rozróżnienia dzień / zmrok / noc. */
export function solarElevationDeg(time: Date, latDeg: number, lonDeg: number): number {
  const rad = Math.PI / 180;
  const lat = latDeg * rad;

  const jd = time.getTime() / 86_400_000 + 2440587.5;
  const n = jd - 2451545.0;
  const meanAnomaly = ((357.5291 + 0.98560028 * n) % 360) * rad;
  const meanLong = ((280.459 + 0.98564736 * n) % 360) * rad;
  const eclipticLong =
    meanLong +
    (1.9148 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * rad;
  const obliquity = (23.439 - 0.00000036 * n) * rad;

  const decl = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLong));

  const utcHours =
    time.getUTCHours() +
    time.getUTCMinutes() / 60 +
    time.getUTCSeconds() / 3600 +
    time.getUTCMilliseconds() / 3_600_000;
  const solarTime = utcHours + lonDeg / 15;
  const hourAngle = (solarTime - 12) * 15 * rad;

  const sinAlt =
    Math.sin(lat) * Math.sin(decl) +
    Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle);

  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) / rad;
}

/** Zmierzch cywilny — ISS widoczna gołym okiem zwykle gdy Słońce < −6°. */
export const ISS_VISIBLE_SUN_MAX_DEG = -6;
