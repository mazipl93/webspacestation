import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";

export const metadata: Metadata = buildListingPageMetadata({
  title: "Nauka",
  description: "Jak działa kosmos — fizyka, astronomia i technologie orbitalne.",
  path: "/nauka",
});

export const revalidate = 300;

export default function NaukaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="nauka" />
      </main>
      <Footer />
    </>
  );
}
