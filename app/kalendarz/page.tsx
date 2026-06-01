import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/sections/ComingSoon";

export const metadata: Metadata = {
  title: "Kalendarz startów | Web Space Station",
  description: "Terminarz nadchodzących startów rakiet i kluczowych wydarzeń kosmicznych.",
};

export default function KalendarzPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <ComingSoon
          title="Kalendarz startów"
          description="Pełny terminarz nadchodzących startów rakiet, okien startowych i kluczowych wydarzeń kosmicznych z możliwością eksportu do własnego kalendarza."
          icon="📅"
        />
      </main>
      <Footer />
    </>
  );
}
