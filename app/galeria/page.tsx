import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import GalleryGrid from "@/components/discover/GalleryGrid";
import { getOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Galeria zdjęć",
  description:
    "Zdjęcia z kosmosu — NASA APOD, NASA Image Library i okładki artykułów.",
  alternates: { canonical: `${getSiteUrl()}/galeria` },
};

export const revalidate = 300;

export default async function GaleriaPage() {
  const ops = await getOpsData();

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
