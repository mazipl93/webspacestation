import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  getDefaultOgImageUrl,
} from "@/lib/seo/site-og";
import { getSiteUrl } from "@/lib/site-url";

/** Metadata for indexable listing pages (departments, /aktualnosci). */
export function buildListingPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: `/${string}`;
}): Metadata {
  const canonical = `${getSiteUrl()}${path}`;
  const ogImage = getDefaultOgImageUrl();
  const pageTitle = `${title} | Web Space Station`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: pageTitle,
      description,
      type: "website",
      locale: "pl_PL",
      images: [
        {
          url: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: DEFAULT_OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
  };
}
