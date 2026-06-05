/** Max hero height (px) — desktop / mobile CMS preview. */
export const HERO_FRAME_MAX_HEIGHT = {
  desktop: 580,
  mobile: 480,
  /** Responsive article page (matches article-hero-frame vh caps). */
  pageMobile: 480,
  pageDesktop: 580,
} as const;

export const HERO_FRAME_MIN_HEIGHT = 200;

export const HERO_FRAME_DEFAULT_ASPECT = 16 / 9;

export type HeroFrameDimensions = {
  width: number;
  height: number;
};

/**
 * Size the hero box to the image aspect ratio (full width when possible).
 * When height would exceed maxHeight, shrink width and center — no letterbox bars.
 */
export function computeHeroFrameSize(
  containerWidth: number,
  imageAspect: number,
  maxHeight: number
): HeroFrameDimensions {
  if (containerWidth <= 0 || imageAspect <= 0 || !Number.isFinite(imageAspect)) {
    const height = Math.min(
      containerWidth / HERO_FRAME_DEFAULT_ASPECT,
      maxHeight
    );
    return { width: containerWidth, height: Math.max(height, HERO_FRAME_MIN_HEIGHT) };
  }

  const heightAtFullWidth = containerWidth / imageAspect;

  if (heightAtFullWidth <= maxHeight) {
    return {
      width: containerWidth,
      height: Math.max(heightAtFullWidth, HERO_FRAME_MIN_HEIGHT),
    };
  }

  const width = maxHeight * imageAspect;
  return {
    width: Math.min(width, containerWidth),
    height: maxHeight,
  };
}

export function imageAspectFromDimensions(
  width: number,
  height: number
): number | null {
  if (width <= 0 || height <= 0) return null;
  return width / height;
}
