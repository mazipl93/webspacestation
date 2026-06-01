import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/sections/ComingSoon";

export const metadata: Metadata = {
  title: "Galeria zdjęć | Web Space Station",
  description: "Najpiękniejsze zdjęcia z kosmosu — fotografie z teleskopów, misji i orbit.",
};

export default function GaleriaPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <ComingSoon
          title="Galeria zdjęć"
          description="Kolekcja najpiękniejszych fotografii z kosmosu — zdjęcia z teleskopu Webba, misji NASA, ESA i astronautów z pokładu ISS. Wkrótce dostępna."
          icon="🌌"
        />
      </main>
      <Footer />
    </>
  );
}
