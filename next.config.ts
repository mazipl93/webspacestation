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
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
