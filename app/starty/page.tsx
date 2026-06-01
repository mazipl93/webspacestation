import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/sections/ComingSoon";

export const metadata: Metadata = {
  title: "Starty rakiet | Web Space Station",
  description: "Harmonogram nadchodzących startów rakiet kosmicznych.",
};

export default function StartyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <ComingSoon
          title="Starty rakiet"
          description="Szczegółowy harmonogram nadchodzących startów rakiet z całego świata — odliczania, transmisje na żywo i archiwum misji. Sekcja w przygotowaniu."
          icon="🚀"
        />
      </main>
      <Footer />
    </>
  );
}
