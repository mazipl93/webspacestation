import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";

export const metadata: Metadata = {
  title: "Misje | Web Space Station",
  description:
    "Artykuły o misjach kosmicznych — eksploracja planet, loty załogowe, starty rakiet i programy kosmiczne NASA, SpaceX i ESA.",
};

export const dynamic = "force-dynamic";

export default function MisjePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection category="misje" />
      </main>
      <Footer />
    </>
  );
}
