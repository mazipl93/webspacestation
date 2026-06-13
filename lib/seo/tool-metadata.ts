import type { Metadata } from "next";
import type { InteractiveToolSeo } from "@/lib/seo/interactive-tools";
import { getPageOgImageForPath } from "@/lib/seo/site-og";
import { formatPageTitle } from "@/lib/seo/site-title";
import { getSiteUrl } from "@/lib/site-url";

/** Pełne metadata dla stron narzędzi live (ISS, zorza, starty). */
export function buildToolPageMetadata(tool: InteractiveToolSeo): Metadata {
  const canonical = `${getSiteUrl()}${tool.path}`;
  const og = getPageOgImageForPath(tool.path);
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
          url: og.url,
          width: og.width,
          height: og.height,
          alt: tool.ogImageAlt || og.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: tool.description,
      images: [og.url],
    },
  };
}
