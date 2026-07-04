/** Współdzielone typy i stałe — bezpieczne dla klienta (bez satellite.js). */

export const POLAND_BOUNDS = {
  latMin: 49.0,
  latMax: 54.9,
  lonMin: 14.12,
  lonMax: 24.15,
} as const;

/** Geometryczny środek Polski (Płowce, woj. łódzkie — GUGiK). */
export const POLAND_OBSERVER = {
  city: "środek Polski",
  lat: 52.1201,
  lon: 19.4615,
} as const;

export type IssPassObservationKind = "visible" | "daylight" | "low" | "below" | "shadow";

export type IssPolandPass = {
  id: string;
  /** ISO — ISS wchodzi nad horyzont obserwatora */
  startAt: string;
  /** ISO — ISS schodzi poniżej horyzontu obserwatora */
  endAt: string;
  durationSec: number;
  maxElevationDeg: number;
  /** Azymut przy maks. elewacji (°) */
  azimuthDeg: number;
  /** true = możliwa obserwacja gołym okiem (ciemno + elewacja ≥ 15°) */
  visible: boolean;
  /** Szczegółowa klasyfikacja pod badge w UI */
  observationKind: IssPassObservationKind;
  /** ISO — moment maks. elewacji nad obserwatorem */
  maxAt: string;
};
