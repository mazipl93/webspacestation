import { ImageResponse } from "next/og";
import type { OgPageEntry } from "@/lib/seo/page-og-registry";
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from "@/lib/seo/site-og";

type OverlayOptions = {
  width: number;
  height: number;
  /** Photo behind — only tints + card. No photo — card only (bg from sharp SVG). */
  hasPhoto: boolean;
};

function scale(value: number, ratio: number): number {
  return Math.round(value * ratio);
}

/** Glass panel + tekst w Satori (ostre fonty); tło przez sharp. */
export function buildOgOverlayResponse(
  entry: OgPageEntry,
  { width, height, hasPhoto }: OverlayOptions,
): ImageResponse {
  const ratio = width / DEFAULT_OG_IMAGE_WIDTH;
  const accent = entry.accent ?? "#38bdf8";
  const cardWidth = scale(1104, ratio);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width,
          height,
          position: "relative",
          backgroundColor: "transparent",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {hasPhoto ? (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(6,8,16,0.22)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width,
                height: scale(340, ratio),
                backgroundColor: "rgba(6,8,16,0.55)",
              }}
            />
          </>
        ) : null}

        <div
          style={{
            position: "absolute",
            bottom: scale(40, ratio),
            left: scale(48, ratio),
            width: cardWidth,
            display: "flex",
            flexDirection: "column",
            padding: `${scale(28, ratio)}px ${scale(36, ratio)}px ${scale(32, ratio)}px ${scale(32, ratio)}px`,
            backgroundColor: "rgba(8, 12, 22, 0.92)",
            borderRadius: scale(14, ratio),
            border: `${Math.max(1, scale(1, ratio))}px solid rgba(255, 255, 255, 0.14)`,
            borderLeft: `${scale(5, ratio)}px solid ${accent}`,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
          }}
        >
          <div
            style={{
              fontSize: scale(13, ratio),
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: scale(10, ratio),
            }}
          >
            Web Space Station
          </div>
          <div
            style={{
              fontSize: scale(46, ratio),
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              width: cardWidth - scale(72, ratio),
            }}
          >
            {entry.headline}
          </div>
          <div
            style={{
              fontSize: scale(22, ratio),
              fontWeight: 400,
              lineHeight: 1.35,
              color: "#d8e2ed",
              marginTop: scale(12, ratio),
              width: cardWidth - scale(72, ratio),
            }}
          >
            {entry.subtitle}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    },
  );
}

export async function renderOgOverlayPng(
  entry: OgPageEntry,
  options: OverlayOptions,
): Promise<Buffer> {
  const response = buildOgOverlayResponse(entry, options);
  return Buffer.from(await response.arrayBuffer());
}

export const OG_RENDER_SCALE = 2;

export function ogRenderDimensions(): { width: number; height: number } {
  return {
    width: DEFAULT_OG_IMAGE_WIDTH * OG_RENDER_SCALE,
    height: DEFAULT_OG_IMAGE_HEIGHT * OG_RENDER_SCALE,
  };
}
