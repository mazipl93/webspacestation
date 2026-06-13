import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Oswald } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SiteAnalytics from "@/components/consent/SiteAnalytics";
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
import {
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  SITE_TITLE_SEP,
  formatPageTitle,
} from "@/lib/seo/site-title";
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
    default: SITE_DEFAULT_TITLE,
    template: `%s${SITE_TITLE_SEP}${SITE_NAME}`,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  description:
    "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych. ISS tracker na żywo, terminal zorzy polarnej i harmonogram startów rakiet.",
  keywords: [
    "kosmos",
    "astronomia",
    "misje kosmiczne",
    "starty rakiet",
    "harmonogram startów",
    "ISS",
    "ISS tracker",
    "śledzenie ISS",
    "zorza polarna",
    "indeks Kp",
    "aurora borealis",
    "space weather",
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
    title: SITE_DEFAULT_TITLE,
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
        { url: "/feed.xml", title: formatPageTitle("Wszystkie aktualności (RSS)") },
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
        <SiteAnalytics />
      </body>
    </html>
  );
}
