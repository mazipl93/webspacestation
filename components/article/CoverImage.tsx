"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { SEARCH_FALLBACK_IMAGE } from "@/lib/search";

type Props = Omit<ImageProps, "src" | "onError" | "alt"> & {
  src: string;
  alt: string;
  fetchPriority?: "high" | "low" | "auto";
};

/** Cover image with graceful fallback when upstream CDN returns 404. */
export default function CoverImage({ src, alt, fetchPriority, ...props }: Props) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <Image
      {...props}
      alt={alt}
      fetchPriority={fetchPriority}
      src={current || SEARCH_FALLBACK_IMAGE}
      onError={() => {
        if (current !== SEARCH_FALLBACK_IMAGE) setCurrent(SEARCH_FALLBACK_IMAGE);
      }}
    />
  );
}
