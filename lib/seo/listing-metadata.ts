import type { Metadata } from "next";
import { getPageKeywords, resolvePageOgImage } from "@/lib/seo/page-og-registry";
import { getSiteUrl } from "@/lib/site-url";
import { formatPageTitle } from "@/lib/seo/site-title";

/** Metadata for indexable listing pages (departments, /aktualnosci, hubs). */
export function buildListingPageMetadata({
  title,
  description,
  path,
  page = 1,
  keywords,
}: {
  title: string;
  description: string;
  path: `/${string}` | "/";
  page?: number;
  keywords?: string[];
}): Metadata {
  const pagePath = page > 1 ? `${path}?strona=${page}` : path;
  const canonical = `${getSiteUrl()}${pagePath === "/" ? "" : pagePath}`;
  const og = resolvePageOgImage(path);
  const displayTitle = page > 1 ? `${title} — strona ${page}` : title;
  const pageTitle = formatPageTitle(displayTitle);
  const resolvedKeywords = keywords ?? getPageKeywords(path);

  return {
    title: displayTitle,
    description,
    ...(resolvedKeywords?.length ? { keywords: resolvedKeywords } : {}),
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      url: canonical,
      title: pageTitle,
      description,
      type: "website",
      locale: "pl_PL",
      images: [
        {
          url: og.url,
          width: og.width,
          height: og.height,
          alt: og.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [og.url],
    },
  };
}
