"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import CoverImage from "@/components/article/CoverImage";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import {
  computeHeroFrameSize,
  HERO_FRAME_DEFAULT_ASPECT,
  HERO_FRAME_MIN_HEIGHT,
  imageAspectFromDimensions,
  type HeroFrameDimensions,
} from "@/lib/ui/article-hero-aspect";
import { cn } from "@/lib/cn";
import type { NewsCategory } from "@/types";

const HERO_SIZES = "(max-width: 1320px) 100vw, 1320px";

type Props = {
  src: string;
  alt: string;
  slug?: string;
  category?: NewsCategory | string;
  suppressFallback?: boolean;
  maxHeight: number;
  background: string;
  imageCredit?: string;
  className?: string;
};

function placeholderFrame(
  containerWidth: number,
  maxHeight: number
): HeroFrameDimensions {
  return computeHeroFrameSize(
    containerWidth,
    HERO_FRAME_DEFAULT_ASPECT,
    maxHeight
  );
}

/**
 * Hero frame sized to the cover's aspect ratio — image always fills the box (no blur, no letterbox).
 */
export default function ArticleHeroMedia({
  src,
  alt,
  slug,
  category,
  suppressFallback = false,
  maxHeight,
  background,
  imageCredit,
  className,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [frame, setFrame] = useState<HeroFrameDimensions | null>(null);

  const measure = useCallback(() => {
    const w = outerRef.current?.clientWidth ?? 0;
    if (w > 0) setContainerWidth(w);
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    setImageAspect(null);
  }, [src]);

  useEffect(() => {
    if (containerWidth <= 0) return;
    const aspect = imageAspect ?? HERO_FRAME_DEFAULT_ASPECT;
    setFrame(computeHeroFrameSize(containerWidth, aspect, maxHeight));
  }, [containerWidth, imageAspect, maxHeight]);

  const displayFrame =
    frame ??
    (containerWidth > 0
      ? placeholderFrame(containerWidth, maxHeight)
      : { width: 0, height: HERO_FRAME_MIN_HEIGHT });

  return (
    <div ref={outerRef} className={cn("flex w-full justify-center", className)}>
      <figure
        className="max-w-full"
        style={{
          width: displayFrame.width > 0 ? displayFrame.width : "100%",
        }}
      >
        <div
          className="relative w-full overflow-hidden rounded-lg border border-hairline bg-[#090d13]"
          style={{
            height: Math.max(displayFrame.height, HERO_FRAME_MIN_HEIGHT),
          }}
        >
          <div
            className="absolute inset-0 z-0 bg-[#05070d]"
            style={{ background }}
          />
          <CoverImage
            src={src}
            alt={alt}
            fallbackSeed={slug}
            fallbackCategory={category}
            suppressFallback={suppressFallback}
            fill
            priority
            sizes={HERO_SIZES}
            className="z-[1] object-cover object-center"
            onLoad={(event) => {
              const img = event.currentTarget;
              const aspect = imageAspectFromDimensions(
                img.naturalWidth,
                img.naturalHeight
              );
              if (aspect) setImageAspect(aspect);
            }}
          />
        </div>
        {imageCredit?.trim() ? (
          <CoverImageCredit credit={imageCredit.trim()} variant="hero" />
        ) : null}
      </figure>
    </div>
  );
}
