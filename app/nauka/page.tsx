import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Nauka | Web Space Station",
  description: "Jak działa kosmos — fizyka, astronomia i technologie orbitalne.",
};

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
