import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";

export const metadata: Metadata = buildListingPageMetadata({
  title: "Rozrywka",
  description:
    "Gry, filmy i kultura sci-fi — kosmos w rozrywce: symulatory, RPG, premiery i seriale tematyczne.",
  path: "/rozrywka",
});

export const revalidate = 300;

export default function RozrywkaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="rozrywka" />
      </main>
      <Footer />
    </>
  );
}
