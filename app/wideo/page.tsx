import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import VideoGrid from "@/components/discover/VideoGrid";
import { getVideoOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Wideo",
  description:
    "Materiały wideo NASA — starty, ISS i eksploracja kosmosu z archiwum NASA Video Library.",
  alternates: { canonical: `${getSiteUrl()}/wideo` },
};

export const revalidate = 300;

export default async function WideoPage() {
  const ops = await getVideoOpsData();

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Wideo"
      description="Archiwum wideo NASA (Image and Video Library) — materiały o startach, stacji orbitalnej i misjach."
      accent="#f472b6"
    >
      <VideoGrid items={ops.videos} />
    </DiscoverPageShell>
  );
}
