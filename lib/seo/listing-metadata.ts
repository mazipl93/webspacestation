import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  getDefaultOgImageUrl,
} from "@/lib/seo/site-og";
import { getSiteUrl } from "@/lib/site-url";
import { formatPageTitle } from "@/lib/seo/site-title";

/** Metadata for indexable listing pages (departments, /aktualnosci). */
export function buildListingPageMetadata({
  title,
  description,
  path,
  page = 1,
}: {
  title: string;
  description: string;
  path: `/${string}`;
  page?: number;
}): Metadata {
  const pagePath = page > 1 ? `${path}?strona=${page}` : path;
  const canonical = `${getSiteUrl()}${pagePath}`;
  const ogImage = getDefaultOgImageUrl();
  const displayTitle = page > 1 ? `${title} — strona ${page}` : title;
  const pageTitle = formatPageTitle(displayTitle);

  return {
    title: displayTitle,
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
