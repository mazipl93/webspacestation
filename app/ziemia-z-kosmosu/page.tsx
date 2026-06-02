import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Ziemia z kosmosu | Web Space Station",
  description:
    "Zdjęcia i obserwacje Ziemi z orbity — zmiany klimatu, zorze polarne, burze geomagnetyczne i nocne światła kontynentów.",
};

// ISR: cached for 5 min, invalidated on publish via revalidateTag(ARTICLES_TAG).
export const revalidate = 300;

export default function ZiemiaZKosmosPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="ziemia-z-kosmosu" />
      </main>
      <Footer />
    </>
  );
}
