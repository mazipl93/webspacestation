import type { CosmodromeSpotlight } from "@/lib/ops/cosmodrome-photos";

export type SpotlightImageDisplay = {
  fit: "cover" | "contain";
  focus: string;
};

/** Lokalne PNG WSS — cover; Wikimedia / zewnętrzne — contain (cały obiekt widoczny). */
export function resolveSpotlightImageDisplay(
  spotlight: Pick<CosmodromeSpotlight, "imageFit" | "imageFocus">,
  imageUrl: string,
): SpotlightImageDisplay {
  const local =
    imageUrl.startsWith("/images/") || imageUrl.includes("/images/ops-pads/");

  const fit = spotlight.imageFit ?? (local ? "cover" : "contain");
  const focus =
    spotlight.imageFocus ??
    (fit === "cover" ? "center center" : "center center");

  return { fit, focus };
}
