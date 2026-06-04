import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";

export function captionForMapPin(
  pin: OpsMapPin,
  iss?: OpsIssPosition | null
): string | undefined {
  if (pin.kind === "iss") {
    if (iss?.altitudeKm != null) {
      return `Na żywo · ${iss.altitudeKm} km nad Ziemią${
        iss.velocityKmh != null ? ` · ${iss.velocityKmh} km/h` : ""
      }`;
    }
    return "Pozycja na żywo z trackera ISS";
  }
  return pin.sublabel;
}
