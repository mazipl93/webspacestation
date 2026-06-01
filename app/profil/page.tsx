import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileClient from "@/components/profile/ProfileClient";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Twój profil",
  description: "Zarządzaj swoim kontem, zapisanymi i polubionymi artykułami.",
  robots: { index: false, follow: false },
};

// Profile is private — resolve the session on the server and bounce signed-out
// visitors to the login screen (with a return path). Degrades to a redirect
// when Supabase isn't configured.
export default async function ProfilePage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    redirect("/logowanie?redirectTo=%2Fprofil");
  }

  return (
    <>
      <Navbar />
      <main>
        <ProfileClient />
      </main>
      <Footer />
    </>
  );
}
