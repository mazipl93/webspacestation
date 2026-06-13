import type { Metadata } from "next";
import type { InteractiveToolSeo } from "@/lib/seo/interactive-tools";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  getDefaultOgImageUrl,
} from "@/lib/seo/site-og";
import { formatPageTitle } from "@/lib/seo/site-title";
import { getSiteUrl } from "@/lib/site-url";

/** Pełne metadata dla stron narzędzi live (ISS, zorza, starty). */
export function buildToolPageMetadata(tool: InteractiveToolSeo): Metadata {
  const canonical = `${getSiteUrl()}${tool.path}`;
  const ogImage = getDefaultOgImageUrl();
  const pageTitle = formatPageTitle(tool.title);

  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical },
    category: "science",
    robots: { index: true, follow: true },
    openGraph: {
      url: canonical,
      title: pageTitle,
      description: tool.description,
      type: "website",
      locale: "pl_PL",
      images: [
        {
          url: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: tool.ogImageAlt || DEFAULT_OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: tool.description,
      images: [ogImage],
    },
  };
}
