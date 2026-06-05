import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Popularnonaukowe | Web Space Station",
  description:
    "Artykuły popularnonaukowe o kosmosie — wyjaśnienia, przewodniki i treści evergreen pod SEO.",
};

export const revalidate = 300;

export default function PopularnonaukowePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="popularnonaukowe" />
      </main>
      <Footer />
    </>
  );
}
