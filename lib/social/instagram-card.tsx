import type { CategoryInfo } from "@/lib/categories";
import { categoryFallbackBg } from "@/lib/categories";
import { truncateForShareCard } from "@/lib/social/facebook-caption";

/** Instagram feed — 4:5 portrait (optimal mobile screen real estate). */
export const INSTAGRAM_CARD_WIDTH = 1080;
export const INSTAGRAM_CARD_HEIGHT = 1350;

const TEXT_PRIMARY = "#f5f7fb";
const TEXT_SECONDARY = "#c8d0e0";

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
        gap: 10,
        padding: "10px 18px",
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: "rgba(0,0,0,0.55)",
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: color,
        }}
      />
      {label}
    </div>
  );
}

const LOGO_HEIGHT = 44;
const LOGO_ASPECT = 1120 / 405;
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * LOGO_ASPECT);

/**
 * Full-bleed cover with bottom gradient overlay — title on image, IG-native feel.
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
  const titleFontSize = 46;
  const titleLineHeight = 1.12;
  const titleMaxLines = 4;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: fallbackBg,
        fontFamily: "Inter",
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

      {/* Category tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 20% 15%, ${category.color}28 0%, transparent 45%)`,
        }}
      />

      {/* Bottom read gradient — keeps text legible on any cover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(6,8,16,0.97) 0%, rgba(6,8,16,0.88) 28%, rgba(6,8,16,0.35) 52%, transparent 68%)",
        }}
      />

      {/* Accent line above text block */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 340,
          height: 3,
          background: `linear-gradient(90deg, ${category.color} 0%, ${category.color}88 40%, transparent 100%)`,
        }}
      />

      {/* Top chip */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          display: "flex",
        }}
      >
        <CategoryChip label={category.label} color={category.color} />
      </div>

      {imageCredit?.trim() ? (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 48,
            maxWidth: 320,
            padding: "8px 12px",
            borderRadius: 6,
            background: "rgba(0,0,0,0.55)",
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.35,
            color: "rgba(245,247,251,0.85)",
            textAlign: "right",
          }}
        >
          {truncateForShareCard(imageCredit.trim(), 64)}
        </div>
      ) : null}

      {/* Text block + brand */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          padding: "0 48px 52px",
        }}
      >
        <div
          style={{
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
              marginTop: 20,
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.4,
              color: TEXT_SECONDARY,
              maxWidth: 920,
            }}
          >
            {displayHook}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 36,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.12)",
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
              fontSize: 17,
              fontWeight: 600,
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
