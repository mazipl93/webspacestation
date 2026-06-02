import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "Web Space Station — wszystkie aktualności" },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Root layout is intentionally free of any server-side session read. Resolving
// the user here (cookies() + Supabase getUser()) would opt the ENTIRE route
// tree out of ISR/static rendering. Auth state is hydrated on the client by
// AuthProvider (Supabase getUser + onAuthStateChange), so public pages stay
// cacheable and auth only runs where it's actually needed.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
