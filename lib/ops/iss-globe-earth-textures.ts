import type { IssGlobeQuality } from "@/lib/ops/iss-globe-config";

/** Tekstury Ziemi — ten sam zestaw co three-globe (NASA / webgl-earth), hostowane lokalnie. */
export const ISS_GLOBE_EARTH_TEXTURES = {
  /** NASA Blue Marble — ~2k, żywe kolory, najlepszy dzień. */
  dayHi: "/geo/earth-blue-marble.jpg",
  /** Lżejsza mapa dnia (three-globe earth-day). */
  dayLite: "/geo/earth-day.jpg",
  /** Black Marble — światła miast w nocy. */
  night: "/geo/earth-night.jpg",
  /** Topografia — relief w shaderze. */
  bump: "/geo/earth-topology.png",
  /** Maski oceanów — specular na wodzie. */
  specular: "/geo/earth-water.png",
  /** Warstwa chmur (webgl-earth) — tylko desktop full, lazy. */
  clouds: "/geo/earth-clouds.png",
} as const;

export type IssGlobeEarthTextureSet = {
  day: string;
  night: string;
  bump: string | null;
  specular: string | null;
  bumpStrength: number;
  specularStrength: number;
  showClouds: boolean;
};

export function resolveIssGlobeEarthTextures(
  quality: IssGlobeQuality,
  variant: "compact" | "full",
): IssGlobeEarthTextureSet {
  if (quality === "mobile") {
    return {
      day: ISS_GLOBE_EARTH_TEXTURES.dayLite,
      night: ISS_GLOBE_EARTH_TEXTURES.night,
      bump: null,
      specular: null,
      bumpStrength: 0,
      specularStrength: 0,
      showClouds: false,
    };
  }

  if (variant === "compact") {
    return {
      day: ISS_GLOBE_EARTH_TEXTURES.dayHi,
      night: ISS_GLOBE_EARTH_TEXTURES.night,
      bump: ISS_GLOBE_EARTH_TEXTURES.bump,
      specular: ISS_GLOBE_EARTH_TEXTURES.specular,
      bumpStrength: 0.14,
      specularStrength: 0.22,
      showClouds: false,
    };
  }

  return {
    day: ISS_GLOBE_EARTH_TEXTURES.dayHi,
    night: ISS_GLOBE_EARTH_TEXTURES.night,
    bump: ISS_GLOBE_EARTH_TEXTURES.bump,
    specular: ISS_GLOBE_EARTH_TEXTURES.specular,
    bumpStrength: 0.2,
    specularStrength: 0.32,
    showClouds: false,
  };
}
