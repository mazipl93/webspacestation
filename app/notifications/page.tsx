import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NotificationsClient from "@/components/notifications/NotificationsClient";

import { SEO_NOINDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Powiadomienia",
  description:
    "Powiadomienia o startach rakiet, nowych artykułach i odpowiedziach na komentarze.",
  robots: SEO_NOINDEX,
};

export default function NotificationsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <NotificationsClient />
      </main>
      <Footer />
    </>
  );
}
