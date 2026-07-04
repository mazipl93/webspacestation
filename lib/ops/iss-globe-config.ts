/** Tekstury globusa — CDN three-globe (Blue Marble + topologia + tło gwiazd). */
export const ISS_GLOBE_TEXTURES = {
  globe: "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
  bump: "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png",
  background: "https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png",
} as const;

export type IssGlobeVariant = "compact" | "full";

export type IssGlobeQuality = "desktop" | "mobile";

export const ISS_GLOBE_CAMERA = {
  compact: { altitude: 2.35, mobileAltitude: 2.7 },
  full: { altitude: 2.05, mobileAltitude: 2.85 },
} as const;

export function getIssGlobeCameraAltitude(
  variant: IssGlobeVariant,
  isMobile: boolean,
): number {
  const cam = ISS_GLOBE_CAMERA[variant];
  return isMobile ? cam.mobileAltitude : cam.altitude;
}

export type IssGlobeRenderProfile = {
  quality: IssGlobeQuality;
  bumpImageUrl: string | null;
  backgroundImageUrl: string | null;
  showAtmosphere: boolean;
  showGraticules: boolean;
  animateIn: boolean;
  globeCurvatureResolution: number;
  pathDecimate: number;
  showOrbit3d: boolean;
  showGroundTrack: boolean;
  maxPixelRatio: number;
  pathTransitionMs: number;
  htmlTransitionMs: number;
};

export function resolveIssGlobeProfile(
  variant: IssGlobeVariant,
  isMobile: boolean,
): IssGlobeRenderProfile {
  if (isMobile) {
    return {
      quality: "mobile",
      bumpImageUrl: null,
      backgroundImageUrl: ISS_GLOBE_TEXTURES.background,
      showAtmosphere: false,
      showGraticules: false,
      animateIn: false,
      globeCurvatureResolution: 4,
      pathDecimate: variant === "compact" ? 4 : 3,
      showOrbit3d: true,
      showGroundTrack: false,
      maxPixelRatio: 1.25,
      pathTransitionMs: 0,
      htmlTransitionMs: 0,
    };
  }

  return {
    quality: "desktop",
    bumpImageUrl: ISS_GLOBE_TEXTURES.bump,
    backgroundImageUrl: ISS_GLOBE_TEXTURES.background,
    showAtmosphere: variant === "full",
    showGraticules: variant === "full",
    animateIn: false,
    globeCurvatureResolution: 6,
    pathDecimate: variant === "compact" ? 2 : 1,
    showOrbit3d: true,
    showGroundTrack: false,
    maxPixelRatio: 2,
    pathTransitionMs: 0,
    htmlTransitionMs: 0,
  };
}
