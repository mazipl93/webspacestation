/**
 * Pozycja Słońca na globusie (subsolar point) — ten sam model co three-globe / solar-calculator.
 * Zwraca [lng, lat] w stopniach dla uniformu shadery day/night.
 */

const J2000 = Date.UTC(2000, 0, 1, 12);
const MS_PER_CENTURY = 315576e7;
const MS_PER_DAY = 86400000;
const RAD = Math.PI / 180;

function century(date: Date): number {
  return (+date - J2000) / MS_PER_CENTURY;
}

function meanLongitude(t: number): number {
  const l = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  return l < 0 ? l + 360 : l;
}

function meanAnomaly(t: number): number {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t);
}

function equationOfCenter(t: number): number {
  const m = meanAnomaly(t) * RAD;
  return (
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289
  );
}

function trueLongitude(t: number): number {
  return meanLongitude(t) + equationOfCenter(t);
}

function apparentLongitude(t: number): number {
  return trueLongitude(t) - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * t) * RAD);
}

function obliquityOfEcliptic(t: number): number {
  const e0 =
    23 +
    (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const omega = 125.04 - 1934.136 * t;
  return e0 + 0.00256 * Math.cos(omega * RAD);
}

function declinationDeg(t: number): number {
  const ob = obliquityOfEcliptic(t) * RAD;
  const app = apparentLongitude(t) * RAD;
  return (Math.asin(Math.sin(ob) * Math.sin(app)) / RAD);
}

function orbitEccentricity(t: number): number {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
}

/** Równanie czasu w minutach (NOAA / solar-calculator). */
function equationOfTimeMinutes(t: number): number {
  const epsilon = obliquityOfEcliptic(t);
  const l0 = meanLongitude(t);
  const e = orbitEccentricity(t);
  const m = meanAnomaly(t);
  const y = Math.tan((epsilon * RAD) / 2) ** 2;
  const sin2l0 = Math.sin(2 * l0 * RAD);
  const sinm = Math.sin(m * RAD);
  const cos2l0 = Math.cos(2 * l0 * RAD);
  const sin4l0 = Math.sin(4 * l0 * RAD);
  const sin2m = Math.sin(2 * m * RAD);
  const etime =
    y * sin2l0 -
    2 * e * sinm +
    4 * e * y * sinm * cos2l0 -
    0.5 * y * y * sin4l0 -
    1.25 * e * e * sin2m;
  return (etime / RAD) * 4;
}

function normalizeLng(lng: number): number {
  return ((lng + 180) % 360 + 360) % 360 - 180;
}

/** Subsolar point [longitude, latitude] — terminator w czasie rzeczywistym UTC. */
export function subsolarLngLat(date = new Date()): [number, number] {
  const dt = +date;
  const dayStart = new Date(dt);
  dayStart.setUTCHours(0, 0, 0, 0);
  const t = century(date);
  const longitude = ((+dayStart - dt) / MS_PER_DAY) * 360 - 180;
  return [normalizeLng(longitude - equationOfTimeMinutes(t) / 4), declinationDeg(t)];
}
