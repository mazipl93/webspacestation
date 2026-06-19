"use client";

import { ArrowUpRight } from "lucide-react";
import SocialBrandIcon from "@/components/social/SocialBrandIcon";
import SocialIconLinks from "@/components/social/SocialIconLinks";
import { cn } from "@/lib/cn";
import { WSS_SOCIAL_PRIMARY, getSocialIconColor } from "@/lib/social/wss-social-links";

type Props = {
  variant?: "footer" | "sidebar";
  className?: string;
  headline?: string;
};

export default function SocialFollowStrip({
  variant = "footer",
  className,
  headline = "Bądź bliżej kosmosu",
}: Props) {
  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "article-panel hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 xl:block",
          className,
        )}
        aria-labelledby="wss-social-sidebar-heading"
      >
        <h2
          id="wss-social-sidebar-heading"
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary"
        >
          Śledź WSS
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-text-tertiary">
          {headline}
        </p>
        <ul className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {WSS_SOCIAL_PRIMARY.map((profile) => (
            <li key={profile.id}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={profile.ariaLabel}
                className={cn(
                  "group flex items-center justify-between gap-2 py-3 transition-colors duration-200 hover:bg-white/[0.03]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center"
                    style={{ color: getSocialIconColor(profile.id) }}
                  >
                    <SocialBrandIcon platform={profile.id} size={14} />
                  </span>
                  <span className="truncate text-[12.5px] font-medium text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
                    {profile.label}
                  </span>
                </span>
                <ArrowUpRight
                  size={12}
                  className="shrink-0 text-text-muted opacity-0 transition-all duration-200 group-hover:opacity-100"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn("mt-6", className)} aria-labelledby="wss-social-footer-heading">
      <p
        id="wss-social-footer-heading"
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary"
      >
        {headline}
      </p>
      <SocialIconLinks
        size="md"
        layout="inline"
        className="!flex mt-3 gap-2"
      />
    </div>
  );
}
