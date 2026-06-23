import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ai",
        destination: "/technologie",
        permanent: true,
      },
      {
        source: "/ai/:path*",
        destination: "/technologie",
        permanent: true,
      },
      {
        source: "/popularnonaukowe",
        destination: "/nauka",
        permanent: true,
      },
      {
        source: "/popularnonaukowe/:path*",
        destination: "/nauka",
        permanent: true,
      },
      {
        source: "/wyjasniamy",
        destination: "/nauka",
        permanent: true,
      },
      {
        source: "/wyjasniamy/:path*",
        destination: "/nauka",
        permanent: true,
      },
      {
        source: "/wiedza",
        destination: "/nauka",
        permanent: true,
      },
      {
        source: "/wiedza/:path*",
        destination: "/nauka",
        permanent: true,
      },
      {
        source: "/rozrywka",
        destination: "/technologie",
        permanent: true,
      },
      {
        source: "/rozrywka/:path*",
        destination: "/technologie",
        permanent: true,
      },
      {
        source: "/kalendarz",
        destination: "/starty#harmonogram",
        permanent: true,
      },
    ];
  },
  images: {
    // Default imageSizes tops out at 384 — too small for retina card/thumb slots.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640, 828, 1080],
    remotePatterns: [
      // Supabase Storage (covers i media CMS) — serwowane bezpośrednio (unoptimized w CoverImage).
      { protocol: "https", hostname: "*.supabase.co" },
      // NASA — wiele subdomen (apod, images-assets, assets.science, www).
      { protocol: "https", hostname: "*.nasa.gov" },
      // ESA
      { protocol: "https", hostname: "*.esa.int" },
      // ESO
      { protocol: "https", hostname: "*.eso.org" },
      // YouTube thumbnails (VideoGrid)
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // WordPress.com CDN — wspólny host dla wielu serwisów kosmicznych (Spaceflight Now, etc.)
      { protocol: "https", hostname: "*.wp.com" },
      // Unsplash (artykuły redakcyjne)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Avatary użytkowników Supabase Auth
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // Jeśli brakuje domeny: sprawdź Vercel → projekt → Logs → filtruj /_next/image
      // i dodaj tutaj zanim włączysz na produkcji.
    ],
  },
};

export default nextConfig;
