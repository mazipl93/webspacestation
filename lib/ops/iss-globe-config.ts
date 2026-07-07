/** Tekstury globusa — lokalne NASA Blue Marble (wysoka jakość). */
export const ISS_GLOBE_TEXTURES = {
  /** NASA Blue Marble ~5400×2700 — desktop / full. */
  globeHi: "/geo/earth-blue-marble.jpg",
  bump: "/geo/earth-topology.png",
  background:
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png",
} as const;

export type IssGlobeVariant = "compact" | "full";

export type IssGlobeQuality = "desktop" | "mobile";

export const ISS_GLOBE_CAMERA = {
  /** Homepage teaser — cała kula w kadrze, lekko przybliżona (nie regionalny zoom). */
  compact: { altitude: 2.22, mobileAltitude: 2.22 },
  full: { altitude: 2.05, mobileAltitude: 2.85 },
} as const;

export function getIssGlobeCameraAltitude(
  variant: IssGlobeVariant,
  isMobile: boolean,
): number {
  const cam = ISS_GLOBE_CAMERA[variant];
  return isMobile ? cam.mobileAltitude : cam.altitude;
}

/** Płynne podążanie kamery za ISS przy odświeżaniu co ~5 s. */
export const ISS_GLOBE_FOLLOW = {
  desktopTransitionMs: 420,
  mobileTransitionMs: 0,
} as const;

/** Podgląd (homepage) — bez animacji kamery; pełny tracker zachowuje płynność. */
export function getIssGlobeFollowTransitionMs(
  variant: IssGlobeVariant,
  interactive: boolean,
  isMobile: boolean,
): number {
  if (variant === "compact" || !interactive) return 0;
  return isMobile
    ? ISS_GLOBE_FOLLOW.mobileTransitionMs
    : ISS_GLOBE_FOLLOW.desktopTransitionMs;
}

export const ISS_GLOBE_ZOOM = {
  minFactor: { full: 1.05, compact: 1.35 } as const,
  maxFactor: { full: 3.5, compact: 3.2 } as const,
} as const;

export function getIssGlobeZoomLimits(
  variant: IssGlobeVariant,
  isMobile: boolean,
  interactive: boolean,
): {
  minMultiplier: number;
  maxMultiplier: number;
  enableZoom: boolean;
} {
  if (!interactive || (isMobile && variant === "compact")) {
    return { minMultiplier: 1, maxMultiplier: 1, enableZoom: false };
  }

  const minFactor = ISS_GLOBE_ZOOM.minFactor[variant];
  const maxFactor = ISS_GLOBE_ZOOM.maxFactor[variant];

  return {
    minMultiplier: 1 / maxFactor,
    maxMultiplier: maxFactor / minFactor,
    enableZoom: true,
  };
}

export type IssGlobeRenderProfile = {
  quality: IssGlobeQuality;
  globeImageUrl: string;
  bumpImageUrl: string | null;
  backgroundImageUrl: string | null;
  showAtmosphere: boolean;
  showGraticules: boolean;
  globeCurvatureResolution: number;
  pathDecimate: number;
  maxPixelRatio: number;
};

export function resolveIssGlobeProfile(
  variant: IssGlobeVariant,
  isMobile: boolean,
): IssGlobeRenderProfile {
  const stars = ISS_GLOBE_TEXTURES.background;

  if (isMobile) {
    return {
      quality: "mobile",
      globeImageUrl: ISS_GLOBE_TEXTURES.globeHi,
      bumpImageUrl: ISS_GLOBE_TEXTURES.bump,
      backgroundImageUrl: stars,
      showAtmosphere: variant === "full",
      showGraticules: false,
      globeCurvatureResolution: variant === "full" ? 6 : 5,
      pathDecimate: variant === "compact" ? 4 : 3,
      maxPixelRatio: 1.25,
    };
  }

  return {
    quality: "desktop",
    globeImageUrl: ISS_GLOBE_TEXTURES.globeHi,
    bumpImageUrl: ISS_GLOBE_TEXTURES.bump,
    backgroundImageUrl: stars,
    showAtmosphere: variant === "full",
    showGraticules: variant === "full",
    globeCurvatureResolution: variant === "full" ? 10 : 8,
    pathDecimate: variant === "compact" ? 2 : 1,
    maxPixelRatio: variant === "compact" ? 1.5 : 2,
  };
}

/** Matowe oświetlenie — bez odblasku słońca na oceanach. */
export function flattenGlobeMaterial(globe: {
  globeMaterial?: () => import("three").Material;
}): void {
  const mat = globe.globeMaterial?.();
  if (!mat || !("shininess" in mat)) return;
  const phong = mat as import("three").MeshPhongMaterial;
  phong.shininess = 0;
  phong.specular.set(0, 0, 0);
  phong.needsUpdate = true;
}
