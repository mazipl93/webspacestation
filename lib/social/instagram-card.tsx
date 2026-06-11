import type { CategoryInfo } from "@/lib/categories";
import { categoryFallbackBg } from "@/lib/categories";
import { truncateForShareCard } from "@/lib/social/facebook-caption";

/** Instagram feed — 4:5 portrait (optimal mobile screen real estate). */
export const INSTAGRAM_CARD_WIDTH = 1080;
export const INSTAGRAM_CARD_HEIGHT = 1350;

const PANEL_BG = "#0c1018";
const TEXT_PRIMARY = "#f5f7fb";
const TEXT_SECONDARY = "#a3afc7";
/** Solid footer — title, category, logo, domain. */
const BOTTOM_PANEL_HEIGHT = 448;

type InstagramCardProps = {
  title: string;
  hook?: string | null;
  coverUrl?: string | null;
  imageCredit?: string | null;
  category: CategoryInfo;
  categorySlug: string;
  brandBaseUrl: string;
};

function CategoryChip({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        alignSelf: "flex-start",
        padding: "12px 22px",
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: "rgba(255,255,255,0.04)",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          background: color,
        }}
      />
      {label}
    </div>
  );
}

const LOGO_HEIGHT = 58;
const LOGO_ASPECT = 1120 / 405;
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * LOGO_ASPECT);

function formatFotoCredit(credit: string): string {
  const trimmed = credit.trim();
  const body = truncateForShareCard(trimmed, 72);
  return /^foto\s*:/i.test(body) ? body : `Foto: ${body}`;
}

/**
 * Cover on top, solid editorial panel below — legible on any photo.
 */
export function InstagramCardLayout({
  title,
  hook,
  coverUrl,
  imageCredit,
  category,
  categorySlug,
  brandBaseUrl,
}: InstagramCardProps) {
  const displayTitle = title.trim();
  const displayHook = hook?.trim() ? hook.trim() : null;
  const fallbackBg = categoryFallbackBg(categorySlug);
  const titleFontSize = 44;
  const titleLineHeight = 1.12;
  const titleMaxLines = 4;
  const fotoLabel = imageCredit?.trim()
    ? formatFotoCredit(imageCredit.trim())
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PANEL_BG,
        fontFamily: "Inter",
      }}
    >
      {/* Cover */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          height: INSTAGRAM_CARD_HEIGHT - BOTTOM_PANEL_HEIGHT,
          width: "100%",
          background: fallbackBg,
          overflow: "hidden",
        }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires native img
          <img
            src={coverUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 15%, ${category.color}22 0%, transparent 45%)`,
          }}
        />

        {/* Soft fade into bottom panel */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 120,
            background: `linear-gradient(to top, ${PANEL_BG} 0%, transparent 100%)`,
          }}
        />

        {fotoLabel ? (
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 22,
              display: "flex",
              padding: "10px 16px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.72)",
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.35,
              color: "rgba(245,247,251,0.92)",
              letterSpacing: "0.01em",
            }}
          >
            {fotoLabel}
          </div>
        ) : null}
      </div>

      {/* Solid bottom panel — text + brand */}
      <div
        style={{
          flexShrink: 0,
          height: BOTTOM_PANEL_HEIGHT,
          display: "flex",
          flexDirection: "column",
          padding: "28px 44px 40px",
          background: PANEL_BG,
          borderTop: `4px solid ${category.color}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -48,
            right: -48,
            width: 200,
            height: 200,
            borderRadius: 999,
            background: `radial-gradient(circle, ${category.color}22 0%, transparent 68%)`,
          }}
        />

        <CategoryChip label={category.label} color={category.color} />

        <div
          style={{
            marginTop: 22,
            fontSize: titleFontSize,
            fontWeight: 800,
            lineHeight: titleLineHeight,
            letterSpacing: "-0.03em",
            color: TEXT_PRIMARY,
            maxHeight: titleFontSize * titleLineHeight * titleMaxLines,
            overflow: "hidden",
          }}
        >
          {displayTitle}
        </div>

        {displayHook ? (
          <div
            style={{
              marginTop: 16,
              fontSize: 23,
              fontWeight: 600,
              lineHeight: 1.4,
              color: TEXT_SECONDARY,
              maxWidth: 960,
              overflow: "hidden",
            }}
          >
            {displayHook}
          </div>
        ) : null}

        <div style={{ flex: 1, minHeight: 12 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${brandBaseUrl}/brand/wss-logo.png`}
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            style={{
              width: LOGO_WIDTH,
              height: LOGO_HEIGHT,
              objectFit: "contain",
              objectPosition: "left center",
            }}
          />
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 22,
              fontWeight: 700,
              color: "#38bdf8",
              letterSpacing: "0.02em",
            }}
          >
            webspacestation.pl
          </div>
        </div>
      </div>
    </div>
  );
}
