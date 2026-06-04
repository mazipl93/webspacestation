"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Facebook,
  Link2,
  Linkedin,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BookmarkButton from "@/components/article/BookmarkButton";
import LikeButton from "@/components/article/LikeButton";

type Props = {
  title: string;
  slug: string;
};

type CopyState = "idle" | "copied" | "failed";

type ShareTarget = {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  href: (url: string, title: string) => string;
};

// Explicit social share targets — work on desktop regardless of navigator.share.
const SHARE_TARGETS: ShareTarget[] = [
  {
    id: "x",
    label: "Udostępnij na X",
    icon: Twitter,
    color: "#e7e9ea",
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "facebook",
    label: "Udostępnij na Facebooku",
    icon: Facebook,
    color: "#1877f2",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "Udostępnij na LinkedIn",
    icon: Linkedin,
    color: "#0a66c2",
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "Udostępnij przez WhatsApp",
    icon: MessageCircle,
    color: "#25d366",
    href: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
];

export default function ShareBar({ title, slug }: Props) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // navigator.share is detected after mount to avoid hydration mismatch.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    setShareUrl(window.location.href);
  }, []);

  // Fall back to a canonical slug-based path before the URL resolves client-side.
  const resolvedUrl = useMemo(
    () => shareUrl || `/aktualnosci/${slug}`,
    [shareUrl, slug]
  );

  async function copyLink() {
    const url = window.location.href;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // Fallback for browsers without the async clipboard API.
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(input);
    }
    setCopyState(ok ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2200);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      /* user dismissed or share failed — ignore */
    }
  }

  const shareIconClass =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-hairline bg-glass text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover active:scale-[0.97]";

  const actionButtonClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-300 active:scale-[0.97] sm:w-auto";

  return (
    <div className="article-panel card-surface flex max-w-full flex-col gap-4 overflow-hidden p-4 sm:gap-3 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      {/* Primary engagement — like + bookmark stay together on all breakpoints */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <LikeButton slug={slug} />
        <BookmarkButton slug={slug} variant="inline" className="!h-11 !w-11 shrink-0" />
      </div>

      {/* Share targets — stacked on mobile, inline from sm+ */}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className={`${actionButtonClass} bg-accent-blue text-white hover:bg-accent-blue-hover hover:shadow-[0_8px_24px_-8px_rgba(47,109,255,0.7)]`}
          >
            <Share2 size={14} />
            Udostępnij
          </button>
        )}

        <div
          className="grid grid-cols-4 gap-2 sm:contents"
          role="group"
          aria-label="Udostępnij w mediach społecznościowych"
        >
          {SHARE_TARGETS.map((target) => {
            const Icon = target.icon;
            return (
              <a
                key={target.id}
                href={target.href(resolvedUrl, title)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={target.label}
                title={target.label}
                className={shareIconClass}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = target.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "";
                }}
              >
                <Icon size={15} />
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={copyLink}
          aria-live="polite"
          className={`${actionButtonClass} border border-hairline bg-glass font-medium text-text-secondary hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary`}
        >
          {copyState === "copied" ? (
            <>
              <Check size={14} className="text-[#22c55e]" />
              Skopiowano
            </>
          ) : copyState === "failed" ? (
            <>
              <AlertCircle size={14} className="text-accent-live" />
              Nie udało się
            </>
          ) : (
            <>
              <Link2 size={14} />
              Kopiuj link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
