import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Astronomia | Web Space Station",
  description:
    "Odkrycia astronomiczne, teleskopy kosmiczne, egzoplanety, czarne dziury i tajemnice wszechświata.",
};

// ISR: cached for 5 min, invalidated on publish via revalidateTag(ARTICLES_TAG).
export const revalidate = 300;

export default function AstronomiaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="astronomia" />
      </main>
      <Footer />
    </>
  );
}
