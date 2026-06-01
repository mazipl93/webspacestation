import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/sections/ComingSoon";

export const metadata: Metadata = {
  title: "Mapa kosmosu | Web Space Station",
  description: "Interaktywna mapa aktywnych misji kosmicznych i obiektów w Układzie Słonecznym.",
};

export default function MapaPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <ComingSoon
          title="Mapa kosmosu"
          description="Interaktywna wizualizacja aktywnych misji, pozycji sond kosmicznych i obiektów w Układzie Słonecznym w czasie rzeczywistym. Wkrótce dostępna."
          icon="🗺️"
        />
      </main>
      <Footer />
    </>
  );
}
