import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Technologie | Web Space Station",
  description:
    "Innowacje w technologiach kosmicznych — rakiety wielokrotnego użytku, silniki kosmiczne, materiały i systemy startowe.",
};

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
