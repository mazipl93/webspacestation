import type { CategoryInfo } from "@/lib/categories";
import { categoryFallbackBg } from "@/lib/categories";
import { truncateForShareCard } from "@/lib/social/facebook-caption";

export const SHARE_CARD_WIDTH = 1200;
export const SHARE_CARD_HEIGHT = 630;

const COVER_WIDTH = 684;
const ACCENT_WIDTH = 4;
const PANEL_BG = "#0c1018";
const TEXT_PRIMARY = "#f5f7fb";
const TEXT_SECONDARY = "#a3afc7";

type ShareCardProps = {
  title: string;
  hook?: string | null;
  coverUrl?: string | null;
  /** Cover photo attribution — manual CMS field or RSS auto-credit. */
  imageCredit?: string | null;
  category: CategoryInfo;
  categorySlug: string;
  /** Origin for brand assets, e.g. https://webspacestation.pl */
  brandBaseUrl: string;
};

function CategoryChip({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        padding: "8px 14px",
        borderRadius: 6,
        border: `1px solid ${color}55`,
        background: "rgba(0,0,0,0.42)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
        }}
      />
      {label}
    </div>
  );
}

const LOGO_HEIGHT = 48;
/** Intrinsic asset ratio (808×460) — `WssLogoWordmark`. */
const LOGO_ASPECT = 808 / 460;
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * LOGO_ASPECT);

function WssBrandFooter({ brandBaseUrl }: { brandBaseUrl: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "auto",
        paddingTop: 24,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires native img */}
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
          fontSize: 15,
          fontWeight: 600,
          color: "#38bdf8",
          letterSpacing: "0.02em",
        }}
      >
        webspacestation.pl
      </div>
    </div>
  );
}

/**
 * Editorial split layout — mirrors featured ArticleCard + HeroArticle chips.
 * Cover left, category-tinted accent bar, dark space-card panel right.
 */
function CoverImageCredit({ credit }: { credit: string }) {
  const label = truncateForShareCard(credit, 72);
  return (
    <div
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 14,
        display: "flex",
        padding: "6px 10px",
        borderRadius: 4,
        background: "rgba(0,0,0,0.62)",
        fontFamily: "Inter",
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.35,
        color: "rgba(245,247,251,0.88)",
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </div>
  );
}

export function ShareCardLayout({
  title,
  hook,
  coverUrl,
  imageCredit,
  category,
  categorySlug,
  brandBaseUrl,
}: ShareCardProps) {
  const displayTitle = title.trim();
  const displayHook = hook?.trim() ? hook.trim() : null;
  const titleLineHeight = 1.1;
  const titleFontSize = 40;
  const titleMaxLines = 3;
  const fallbackBg = categoryFallbackBg(categorySlug);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        background: "#060810",
        fontFamily: "Inter",
      }}
    >
      {/* Cover column */}
      <div
        style={{
          position: "relative",
          width: COVER_WIDTH,
          height: "100%",
          display: "flex",
          flexShrink: 0,
          background: fallbackBg,
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
            background: `radial-gradient(circle at 18% 12%, ${category.color}22 0%, transparent 42%)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, transparent 52%, rgba(12,16,24,0.55) 78%, rgba(12,16,24,0.96) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(5,7,9,0.35) 0%, transparent 38%)",
          }}
        />

        {imageCredit?.trim() ? (
          <CoverImageCredit credit={imageCredit.trim()} />
        ) : null}
      </div>

      {/* Category accent */}
      <div
        style={{
          width: ACCENT_WIDTH,
          height: "100%",
          flexShrink: 0,
          background: category.color,
          boxShadow: `0 0 28px ${category.color}66`,
        }}
      />

      {/* Content panel */}
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "44px 40px 40px 36px",
          background: PANEL_BG,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: 999,
            background: `radial-gradient(circle, ${category.color}28 0%, transparent 68%)`,
          }}
        />

        <CategoryChip label={category.label} color={category.color} />

        <div
          style={{
            marginTop: 22,
            fontSize: titleFontSize,
            fontWeight: 800,
            lineHeight: titleLineHeight,
            letterSpacing: "-0.025em",
            color: TEXT_PRIMARY,
            maxWidth: 460,
            maxHeight: titleFontSize * titleLineHeight * titleMaxLines,
            overflow: "hidden",
          }}
        >
          {displayTitle}
        </div>

        {displayHook ? (
          <div
            style={{
              marginTop: 18,
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.45,
              color: TEXT_SECONDARY,
              maxWidth: 440,
            }}
          >
            {displayHook}
          </div>
        ) : null}

        <WssBrandFooter brandBaseUrl={brandBaseUrl} />
      </div>
    </div>
  );
}
