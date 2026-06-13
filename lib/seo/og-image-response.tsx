import { ImageResponse } from "next/og";
import type { OgPageEntry } from "@/lib/seo/page-og-registry";
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from "@/lib/seo/site-og";
import { getSiteUrl } from "@/lib/site-url";

function absoluteAsset(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Shared 1200×630 OG card: photo background + branded overlay. */
export function buildOgImageResponse(entry: OgPageEntry): ImageResponse {
  const bg = entry.backgroundImage ? absoluteAsset(entry.backgroundImage) : null;
  const accent = entry.accent ?? "#38bdf8";
  const gradient =
    entry.gradient ??
    `radial-gradient(ellipse 70% 50% at 50% 20%, ${accent}44 0%, transparent 60%), linear-gradient(160deg, #060810 0%, #0a1320 100%)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          color: "#f0f4f8",
        }}
      >
        {bg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: bg
              ? "linear-gradient(to top, rgba(6,8,16,0.92) 0%, rgba(6,8,16,0.55) 45%, rgba(6,8,16,0.25) 100%)"
              : gradient,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "56px 72px",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 16,
            }}
          >
            Web Space Station
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            {entry.headline}
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#94a3b8",
              marginTop: 20,
              maxWidth: 860,
            }}
          >
            {entry.subtitle}
          </div>
        </div>
      </div>
    ),
    {
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
    },
  );
}
