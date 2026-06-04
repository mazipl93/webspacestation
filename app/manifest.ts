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
        src: `${base}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
