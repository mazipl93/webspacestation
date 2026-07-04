import type { IssGlobeVariant } from "@/lib/ops/iss-globe-config";

/** Natural Earth 110m — ten sam zestaw co w przykładach three-globe (~177 państw). */
export const GLOBE_COUNTRIES_GEOJSON_URL =
  "/geo/ne_110m_admin_0_countries.geojson";

export type GlobeCountryFeature = {
  type: "Feature";
  properties: {
    ADMIN?: string;
    ISO_A2?: string;
    [key: string]: unknown;
  };
  geometry: GeoJSON.Geometry;
};

/** Statyczne obrysy — bez hoveru (raycast + re-rendery zamulały globus). */
export type GlobeCountryBorderStyle = {
  altitude: number;
  capColor: string;
  strokeColor: string;
  sideColor: string;
};

export function filterGlobeCountryFeatures(
  features: GlobeCountryFeature[],
): GlobeCountryFeature[] {
  return features.filter((f) => f.properties?.ISO_A2 !== "AQ");
}

export function resolveGlobeCountryBorderStyle(
  variant: IssGlobeVariant,
  isMobile: boolean,
): GlobeCountryBorderStyle | null {
  if (variant === "compact" && isMobile) return null;

  return {
    altitude: 0.002,
    capColor: "rgba(0, 0, 0, 0)",
    strokeColor: "rgba(148, 163, 184, 0.42)",
    sideColor: "rgba(0, 0, 0, 0)",
  };
}
