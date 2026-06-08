import { ImageResponse } from "next/og";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from "@/lib/seo/site-og";

export const alt = DEFAULT_OG_IMAGE_ALT;
export const size = {
  width: DEFAULT_OG_IMAGE_WIDTH,
  height: DEFAULT_OG_IMAGE_HEIGHT,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 75% 15%, rgba(56,189,248,0.22) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 12% 88%, rgba(47,109,255,0.2) 0%, transparent 50%), linear-gradient(145deg, #060810 0%, #0a1320 48%, #060810 100%)",
          color: "#f0f4f8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#38bdf8",
            marginBottom: 20,
          }}
        >
          Web Space Station
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            maxWidth: 920,
          }}
        >
          Aktualności kosmiczne na żywo
        </div>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.45,
            color: "#94a3b8",
            marginTop: 28,
            maxWidth: 820,
          }}
        >
          Misje, astronomia, starty rakiet i odkrycia naukowe
        </div>
      </div>
    ),
    { ...size }
  );
}
