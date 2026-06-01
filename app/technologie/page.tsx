import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Technologie | Web Space Station",
  description:
    "Innowacje w technologiach kosmicznych — rakiety wielokrotnego użytku, silniki kosmiczne, materiały i systemy startowe.",
};

// DB-backed feed — refresh at most once per minute (ISR).
export const revalidate = 60;

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
