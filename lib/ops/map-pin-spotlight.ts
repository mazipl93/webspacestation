import type { OpsMapPin } from "@/lib/ops/types";
import {
  ISS_SPOTLIGHT,
  matchCosmodromeSpotlight,
  type CosmodromeSpotlight,
} from "@/lib/ops/cosmodrome-photos";
import {
  getMajorCosmodromeSpotlight,
  matchPadToMajorCosmodrome,
} from "@/lib/ops/major-cosmodromes";

export type MapPinSpotlight = CosmodromeSpotlight;

/** LL2 `map_image` = podgląd mapy — nie pokazujemy w popupie. */
const MAP_PREVIEW_URL =
  /thespacedevs|launch_images\/pad|\/maps?\/|staticmap|openstreetmap|tile\.openstreetmap|arcgis.*\/tile/i;

export function isMapPreviewImage(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim().toLowerCase();
  return MAP_PREVIEW_URL.test(u) || u.includes("map_image");
}

function padSpotlightContext(pin: OpsMapPin) {
  return {
    ll2Label: pin.ll2Label,
    lat: pin.lat,
    lon: pin.lon,
  };
}

/** Treść popupu — wyłącznie zdjęcia obiektów, nie mapy z API. */
export function resolveMapPinSpotlight(pin: OpsMapPin): MapPinSpotlight {
  if (pin.kind === "iss") {
    return ISS_SPOTLIGHT;
  }

  const ctx = padSpotlightContext(pin);

  if (pin.ll2Label) {
    return matchCosmodromeSpotlight(pin.label, pin.sublabel, ctx);
  }

  if (pin.siteId) {
    const site = getMajorCosmodromeSpotlight(pin.siteId);
    if (site) return site;
  }

  const nearMajor = matchPadToMajorCosmodrome({ lat: pin.lat, lon: pin.lon });
  if (nearMajor) return nearMajor.spotlight;

  return matchCosmodromeSpotlight(pin.label, pin.sublabel, ctx);
}
