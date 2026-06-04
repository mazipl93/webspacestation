import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Rozrywka | Web Space Station",
  description:
    "Gry, filmy i kultura sci-fi — kosmos w rozrywce: symulatory, RPG, premiery i seriale tematyczne.",
};

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
