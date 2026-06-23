import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import GalleryGrid from "@/components/discover/GalleryGrid";
import { getGalleryOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";
import { resolvePageOgImage, getPageKeywords } from "@/lib/seo/page-og-registry";

const CANONICAL = `${getSiteUrl()}/galeria`;
const OG = resolvePageOgImage("/galeria");
const TITLE = "Galeria zdjęć";
const DESCRIPTION = "Zdjęcia z kosmosu — NASA APOD, NASA Image Library i okładki artykułów.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: getPageKeywords("/galeria"),
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

export default async function GaleriaPage() {
  const ops = await getGalleryOpsData();

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Galeria zdjęć"
      description="Astronomiczne zdjęcie dnia NASA, archiwum NASA oraz kadry z publikacji działu Astronomia."
      accent="#c084fc"
    >
      <GalleryGrid items={ops.gallery} />
    </DiscoverPageShell>
  );
}
