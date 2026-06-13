import { ImageResponse } from "next/og";
import type { OgPageEntry } from "@/lib/seo/page-og-registry";
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from "@/lib/seo/site-og";

type OgImageOptions = {
  /** data: URL — z loadOgBackgroundDataUrl */
  backgroundSrc?: string | null;
};

/**
 * Satori (@vercel/og): bez flex:1 (zawęża tekst do jednego słowa w linii).
 * Stała szerokość karty + data URL tła.
 */
export function buildOgImageResponse(
  entry: OgPageEntry,
  options: OgImageOptions = {},
): ImageResponse {
  const bg = options.backgroundSrc ?? null;
  const accent = entry.accent ?? "#38bdf8";
  const cardWidth = 1104;

  return new ImageResponse(
    (
      <div
        style={{
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          position: "relative",
          backgroundColor: "#060810",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {bg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg}
            alt=""
            width={DEFAULT_OG_IMAGE_WIDTH}
            height={DEFAULT_OG_IMAGE_HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: DEFAULT_OG_IMAGE_WIDTH,
              height: DEFAULT_OG_IMAGE_HEIGHT,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#060810",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: bg ? "rgba(6,8,16,0.22)" : "rgba(6,8,16,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: DEFAULT_OG_IMAGE_WIDTH,
            height: 340,
            backgroundColor: "rgba(6,8,16,0.55)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 48,
            width: cardWidth,
            display: "flex",
            flexDirection: "column",
            padding: "28px 36px 32px 32px",
            backgroundColor: "rgba(8, 12, 22, 0.86)",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderLeft: `5px solid ${accent}`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 10,
            }}
          >
            Web Space Station
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              width: cardWidth - 72,
            }}
          >
            {entry.headline}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              lineHeight: 1.35,
              color: "#c8d3e0",
              marginTop: 12,
              width: cardWidth - 72,
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
