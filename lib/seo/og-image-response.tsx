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

/**
 * Satori (@vercel/og): bez radial-gradient w CSS.
 * Elegancki floating glass panel na zdjęciu tła.
 */
export function buildOgImageResponse(entry: OgPageEntry): ImageResponse {
  const bg = entry.backgroundImage ? absoluteAsset(entry.backgroundImage) : null;
  const accent = entry.accent ?? "#38bdf8";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
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
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -60,
                width: 480,
                height: 480,
                borderRadius: 240,
                backgroundColor: accent,
                opacity: 0.14,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 80,
                left: -80,
                width: 420,
                height: 420,
                borderRadius: 210,
                backgroundColor: accent,
                opacity: 0.08,
              }}
            />
          </>
        )}

        {/* Lekkie vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: bg ? "rgba(6,8,16,0.28)" : "rgba(6,8,16,0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            backgroundColor: "rgba(6,8,16,0.5)",
          }}
        />

        {/* Floating glass card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "row",
            margin: "0 48px 44px",
            maxWidth: 1104,
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              width: 4,
              flexShrink: 0,
              borderRadius: 4,
              backgroundColor: accent,
              marginRight: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "32px 40px",
              backgroundColor: "rgba(8, 12, 22, 0.82)",
              borderRadius: "0 14px 14px 0",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderLeft: "none",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: 12,
              }}
            >
              Web Space Station
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                maxWidth: 920,
              }}
            >
              {entry.headline}
            </div>
            <div
              style={{
                fontSize: 21,
                lineHeight: 1.45,
                color: "#b8c5d6",
                marginTop: 14,
                maxWidth: 880,
              }}
            >
              {entry.subtitle}
            </div>
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
