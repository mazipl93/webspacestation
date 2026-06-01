import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { toSessionUser } from "@/lib/auth/session-user";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Web Space Station – Portal informacyjny o kosmosie",
    template: "%s | Web Space Station",
  },
  description:
    "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych. Śledź starty rakiet, misje kosmiczne i odkrycia astronomiczne na żywo.",
  keywords: [
    "kosmos",
    "astronomia",
    "misje kosmiczne",
    "starty rakiet",
    "ISS",
    "SpaceX",
    "NASA",
    "technologie kosmiczne",
  ],
  authors: [{ name: "Web Space Station" }],
  creator: "Web Space Station",
  metadataBase: new URL("https://webspacestation.pl"),
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://webspacestation.pl",
    siteName: "Web Space Station",
    title: "Web Space Station – Portal informacyjny o kosmosie",
    description:
      "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Space Station",
    description: "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Resolve the signed-in user on the server so the first paint already reflects
// the session. Degrades to null when Supabase isn't configured.
async function getInitialUser() {
  try {
    const u = await getCurrentUser();
    return toSessionUser(u);
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getInitialUser();

  return (
    <html
      lang="pl"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
