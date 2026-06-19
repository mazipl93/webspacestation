import { computeIssLiveTrack } from "@/lib/ops/iss-orbit";
import { buildMapPins } from "@/lib/ops/map-geo";
import type { OpsCorePayload } from "@/lib/ops/payloads";
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";

export function refreshIssOnMapPins(
  pins: OpsMapPin[],
  iss: OpsIssPosition | null,
): OpsMapPin[] {
  if (!iss) return pins;
  return pins.map((pin) =>
    pin.kind === "iss"
      ? { ...pin, lat: iss.latitude, lon: iss.longitude }
      : pin,
  );
}

export type IssCoreFields = Pick<
  OpsCorePayload,
  "iss" | "issOrbit" | "issOrbitPast" | "issOrbitFuture" | "mapPins" | "fetchedAt"
>;

function issTrackToCoreFields(
  track: Awaited<ReturnType<typeof computeIssLiveTrack>>,
): Omit<IssCoreFields, "mapPins" | "fetchedAt"> {
  if (!track) {
    return {
      iss: null,
      issOrbit: [],
      issOrbitPast: [],
      issOrbitFuture: [],
    };
  }
  return {
    iss: track.iss,
    issOrbitPast: track.orbitPast,
    issOrbitFuture: track.orbitFuture,
    issOrbit: [...track.orbitPast, ...track.orbitFuture],
  };
}

/** Lekki fetch — pozycja + ground track z jednego propagatora SGP4 (bez LL2). */
export async function fetchIssCoreFields(
  stored: Pick<OpsCorePayload, "mapPins">,
): Promise<IssCoreFields> {
  const track = await computeIssLiveTrack().catch(() => null);
  const { iss, issOrbit, issOrbitPast, issOrbitFuture } =
    issTrackToCoreFields(track);

  const mapPins =
    stored.mapPins.length > 0
      ? refreshIssOnMapPins(stored.mapPins, iss)
      : buildMapPins(iss, []);

  return {
    iss,
    issOrbit,
    issOrbitPast,
    issOrbitFuture,
    mapPins,
    fetchedAt: new Date().toISOString(),
  };
}
