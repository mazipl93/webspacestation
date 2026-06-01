import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Astronomia | Web Space Station",
  description:
    "Odkrycia astronomiczne, teleskopy kosmiczne, egzoplanety, czarne dziury i tajemnice wszechświata.",
};

// DB-backed feed — refresh at most once per minute (ISR).
export const revalidate = 60;

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
