import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();
  return {
    name: "Web Space Station",
    short_name: "WSS",
    description:
      "Portal informacyjny o kosmosie, astronomii i technologiach kosmicznych.",
    start_url: "/",
    display: "standalone",
    background_color: "#060810",
    theme_color: "#060810",
    lang: "pl",
    icons: [
      {
        src: `${base}/favicon-48.png`,
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: `${base}/favicon-96.png`,
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: `${base}/apple-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: `${base}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
