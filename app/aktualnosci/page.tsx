import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Aktualności | Web Space Station",
  description:
    "Najnowsze wiadomości ze świata kosmosu, astronomii i technologii kosmicznych. Śledź misje, starty rakiet i odkrycia naukowe.",
  openGraph: {
    title: "Aktualności | Web Space Station",
    description:
      "Najnowsze wiadomości ze świata kosmosu, astronomii i technologii kosmicznych.",
    type: "website",
    locale: "pl_PL",
  },
};

// DB-backed feed — refresh at most once per minute (ISR).
export const revalidate = 60;

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
