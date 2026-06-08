import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";

export const metadata: Metadata = buildListingPageMetadata({
  title: "Aktualności",
  description:
    "Najnowsze wiadomości ze świata kosmosu, astronomii i technologii kosmicznych. Śledź misje, starty rakiet i odkrycia naukowe.",
  path: "/aktualnosci",
});

// ISR: cached for 5 min, invalidated on publish via revalidateTag(ARTICLES_TAG).
export const revalidate = 300;

export default function AktualnostiPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection />
      </main>
      <Footer />
    </>
  );
}
