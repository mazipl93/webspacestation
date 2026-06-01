import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "ISS | Web Space Station",
  description:
    "Aktualności z Międzynarodowej Stacji Kosmicznej — spacery kosmiczne, ekspedycje, eksperymenty naukowe i rotacje załogi.",
};

// DB-backed feed — refresh at most once per minute (ISR).
export const revalidate = 60;

export default function IssPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="iss" />
      </main>
      <Footer />
    </>
  );
}
