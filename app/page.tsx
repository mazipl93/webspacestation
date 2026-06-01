import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ContentGrid from "@/components/sections/ContentGrid";

export const metadata: Metadata = {
  title: "Web Space Station – Aktualności kosmiczne",
};

// Home pulls the lead stories from the DB — refresh at most once per minute.
export const revalidate = 60;

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
