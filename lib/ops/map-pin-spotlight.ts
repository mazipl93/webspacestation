import type { OpsMapPin } from "@/lib/ops/types";
import {
  ISS_SPOTLIGHT,
  matchCosmodromeSpotlight,
  type CosmodromeSpotlight,
} from "@/lib/ops/cosmodrome-photos";

export type MapPinSpotlight = CosmodromeSpotlight;

/** LL2 `map_image` = podgląd mapy — nie pokazujemy w popupie. */
const MAP_PREVIEW_URL =
  /thespacedevs|launch_images\/pad|\/maps?\/|staticmap|openstreetmap|tile\.openstreetmap|arcgis.*\/tile/i;

export function isMapPreviewImage(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim().toLowerCase();
  return MAP_PREVIEW_URL.test(u) || u.includes("map_image");
}

/** Treść popupu — wyłącznie zdjęcia obiektów, nie mapy z API. */
export function resolveMapPinSpotlight(pin: OpsMapPin): MapPinSpotlight {
  if (pin.kind === "iss") {
    return ISS_SPOTLIGHT;
  }
  return matchCosmodromeSpotlight(pin.label, pin.sublabel);
}
