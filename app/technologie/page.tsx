import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";

export const metadata: Metadata = buildListingPageMetadata({
  title: "Technologie kosmiczne",
  description:
    "Rakiety, satelity, napędy i inżynieria kosmiczna — w tym AI w kontekście badań i eksploracji.",
  path: "/technologie",
});

// ISR: cached for 5 min, invalidated on publish via revalidateTag(ARTICLES_TAG).
export const revalidate = 300;

export default function TechnologiePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="technologie" />
      </main>
      <Footer />
    </>
  );
}
