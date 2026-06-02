import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "AI | Web Space Station",
  description:
    "Sztuczna inteligencja, modele językowe i technologie ML — agregat newsów z wybranych źródeł technologicznych.",
};

export const revalidate = 300;

export default function AiPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="ai" />
      </main>
      <Footer />
    </>
  );
}
