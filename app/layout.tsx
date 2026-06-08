import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Oswald } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SiteBackground from "@/components/layout/SiteBackground";
import ServiceWorkerCleanup from "@/components/layout/ServiceWorkerCleanup";
import JsonLd from "@/components/seo/JsonLd";
import { buildSiteJsonLd } from "@/lib/seo/json-ld";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  getDefaultOgImageUrl,
} from "@/lib/seo/site-og";
import "./globals.css";
import { HERO_IMAGE_PRECONNECT_ORIGINS } from "@/lib/home/hero-lcp";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

/** Oswald — pozostałe elementy brandu (hero, typografia). */
const WssBrandOswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-wss-control-loaded",
  display: "swap",
});

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
    images: [
      {
        url: getDefaultOgImageUrl(),
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
  twitter: {
    card: "summary_large_image",
    title: "Web Space Station",
    description: "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych.",
    images: [getDefaultOgImageUrl()],
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
  themeColor: "#060810",
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${WssBrandOswald.variable}`}
      data-portal-theme="slate-soft"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {HERO_IMAGE_PRECONNECT_ORIGINS.map((origin) => (
          <link
            key={origin}
            rel="preconnect"
            href={origin}
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className="antialiased">
        <JsonLd data={buildSiteJsonLd()} />
        <SiteBackground />
        <ServiceWorkerCleanup />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
