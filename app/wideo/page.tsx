import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/sections/ComingSoon";

export const metadata: Metadata = {
  title: "Wideo | Web Space Station",
  description: "Filmy i transmisje na żywo ze startów i misji kosmicznych.",
};

export default function WideoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <ComingSoon
          title="Wideo"
          description="Transmisje na żywo, relacje ze startów, wywiady i materiały dokumentalne ze świata eksploracji kosmicznej. Sekcja w przygotowaniu."
          icon="📡"
        />
      </main>
      <Footer />
    </>
  );
}
