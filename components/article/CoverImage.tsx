"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { pickCategoryCoverFallback } from "@/lib/cover-fallbacks";
import { shouldBypassImageOptimizer } from "@/lib/media/cover-url";
import type { NewsCategory } from "@/types";

type Props = Omit<ImageProps, "src" | "onError" | "alt"> & {
  src: string;
  alt: string;
  fetchPriority?: "high" | "low" | "auto";
  /** Per-article fallback when CDN 404 (defaults to src). */
  fallbackSeed?: string;
  fallbackCategory?: NewsCategory | string;
  /** CMS preview — do not swap to category stock on load error. */
  suppressFallback?: boolean;
};

/** Cover image with graceful fallback when upstream CDN returns 404. */
export default function CoverImage({
  src,
  alt,
  fetchPriority,
  fallbackSeed,
  fallbackCategory = "astronomia",
  suppressFallback = false,
  priority,
  loading,
  ...rest
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

  const useUnoptimized = shouldBypassImageOptimizer(current);
  const isPriority = Boolean(priority);

  const resolvedFetchPriority =
    fetchPriority ?? (isPriority ? "high" : undefined);

  return (
    <Image
      {...rest}
      alt={alt}
      priority={isPriority}
      loading={isPriority ? "eager" : loading}
      fetchPriority={resolvedFetchPriority}
      unoptimized={useUnoptimized}
      src={current || (suppressFallback ? current : resolveErrorFallback())}
      onError={() => {
        if (suppressFallback) return;
        const next = resolveErrorFallback();
        if (current !== next) setCurrent(next);
      }}
    />
  );
}
