import { computeIssOrbitSegments } from "@/lib/ops/iss-orbit";
import { fetchIssPosition } from "@/lib/ops/iss-tracker";
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
  "iss" | "issOrbit" | "mapPins" | "fetchedAt"
>;

/** Lekki fetch — tylko pozycja ISS + orbita + pinezka na mapie (bez LL2). */
export async function fetchIssCoreFields(
  stored: Pick<OpsCorePayload, "mapPins">,
): Promise<IssCoreFields> {
  const [iss, issOrbit] = await Promise.all([
    fetchIssPosition().catch(() => null),
    computeIssOrbitSegments().catch(() => [] as { lat: number; lon: number }[][]),
  ]);

  const mapPins =
    stored.mapPins.length > 0
      ? refreshIssOnMapPins(stored.mapPins, iss)
      : buildMapPins(iss, []);

  return {
    iss,
    issOrbit,
    mapPins,
    fetchedAt: new Date().toISOString(),
  };
}
