import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
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
    ];
  },
  images: {
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
