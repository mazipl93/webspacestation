/** Pin ISS na mapie — bez zależności serwerowych, bezpieczny w komponentach klienckich. */
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";

export const ISS_MAP_PIN_ID = "iss-live";

export function buildIssMapPin(
  iss: Pick<OpsIssPosition, "latitude" | "longitude">,
): OpsMapPin {
  return {
    id: ISS_MAP_PIN_ID,
    label: "ISS",
    sublabel: "Międzynarodowa Stacja Kosmiczna",
    color: "#38bdf8",
    lat: iss.latitude,
    lon: iss.longitude,
    kind: "iss",
  };
}

/**
 * Pin ISS zgodny z aktualną pozycją: przesuwa istniejący albo dodaje brakujący
 * (np. snapshot z DB zapisany, gdy ISS był niedostępny — wtedy mapa nie miała markera).
 */
export function withIssPin(
  pins: OpsMapPin[],
  iss: OpsIssPosition | null | undefined,
): OpsMapPin[] {
  if (!iss) return pins;
  let found = false;
  const next = pins.map((pin) => {
    if (pin.kind !== "iss") return pin;
    found = true;
    return { ...pin, lat: iss.latitude, lon: iss.longitude };
  });
  return found ? next : [buildIssMapPin(iss), ...next];
}
