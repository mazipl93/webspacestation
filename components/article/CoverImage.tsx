"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { pickCategoryCoverFallback } from "@/lib/cover-fallbacks";
import type { NewsCategory } from "@/types";

type Props = Omit<ImageProps, "src" | "onError" | "alt"> & {
  src: string;
  alt: string;
  fetchPriority?: "high" | "low" | "auto";
  /** Per-article fallback when CDN 404 (defaults to src). */
  fallbackSeed?: string;
  fallbackCategory?: NewsCategory | string;
};

/** Cover image with graceful fallback when upstream CDN returns 404. */
export default function CoverImage({
  src,
  alt,
  fetchPriority,
  fallbackSeed,
  fallbackCategory = "astronomia",
  ...props
}: Props) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const resolveErrorFallback = () =>
    pickCategoryCoverFallback(
      String(fallbackCategory),
      fallbackSeed?.trim() || src
    );

  const useUnoptimized =
    current.includes("images-assets.nasa.gov") ||
    current.includes("images-api.nasa.gov");

  return (
    <Image
      {...props}
      alt={alt}
      fetchPriority={fetchPriority}
      unoptimized={useUnoptimized}
      src={current || resolveErrorFallback()}
      onError={() => {
        const next = resolveErrorFallback();
        if (current !== next) setCurrent(next);
      }}
    />
  );
}
