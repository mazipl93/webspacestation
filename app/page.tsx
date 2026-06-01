import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ContentGrid from "@/components/sections/ContentGrid";

export const metadata: Metadata = {
  title: "Web Space Station – Aktualności kosmiczne",
};

// DB-backed — render on demand so Vercel build never needs DATABASE_URL.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <Hero />

      <ContentGrid />

      <Footer />
    </>
  );
}
