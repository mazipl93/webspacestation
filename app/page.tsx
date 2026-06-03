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
// On-demand revalidatePath("/") on publish; short ISR as safety net.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative z-[1]">
        <ContentGrid />
      </main>
      <Footer />
    </>
  );
}
