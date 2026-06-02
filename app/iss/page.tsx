import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "ISS | Web Space Station",
  description:
    "Aktualności z Międzynarodowej Stacji Kosmicznej — spacery kosmiczne, ekspedycje, eksperymenty naukowe i rotacje załogi.",
};

// ISR: cached for 5 min, invalidated on publish via revalidateTag(ARTICLES_TAG).
export const revalidate = 300;

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
