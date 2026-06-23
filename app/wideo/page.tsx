import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import VideoGrid from "@/components/discover/VideoGrid";
import { getVideoOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";
import { resolvePageOgImage, getPageKeywords } from "@/lib/seo/page-og-registry";

const CANONICAL = `${getSiteUrl()}/wideo`;
const OG = resolvePageOgImage("/wideo");
const TITLE = "Wideo";
const DESCRIPTION = "Materiały wideo NASA — starty, ISS i eksploracja kosmosu z archiwum NASA Video Library.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: getPageKeywords("/wideo"),
  alternates: { canonical: CANONICAL },
  openGraph: {
    url: CANONICAL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG.url, width: OG.width, height: OG.height, alt: OG.alt }],
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const revalidate = 300;

export default async function WideoPage() {
  const ops = await getVideoOpsData();

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Wideo"
      description="Archiwum wideo NASA: materiały o startach, stacji orbitalnej i misjach."
      accent="#f472b6"
    >
      <VideoGrid items={ops.videos} />
    </DiscoverPageShell>
  );
}
