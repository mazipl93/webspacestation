import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchClient from "./SearchClient";
import { SEO_NOINDEX_FOLLOW } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Szukaj | Web Space Station",
  description: "Wyszukaj artykuły o kosmosie, misjach, astronomii i technologiach.",
  robots: SEO_NOINDEX_FOLLOW,
};

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Suspense
          fallback={
            <div className="container-site pt-[120px] text-[14px] text-text-tertiary">
              Ładowanie…
            </div>
          }
        >
          <SearchClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
