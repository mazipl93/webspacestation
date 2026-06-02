import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContentGrid from "@/components/sections/ContentGrid";

export const metadata: Metadata = {
  title: "Web Space Station – Aktualności kosmiczne",
};

// DB-backed but cacheable: ISR revalidates every 5 min and on-demand via
// revalidateTag(ARTICLES_TAG) after a publish. Reads are wrapped in
// unstable_cache and are build-safe (return [] if the DB is unreachable).
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <ContentGrid />
      </main>
      <Footer />
    </>
  );
}
