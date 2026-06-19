"use client";

import { ArrowUpRight } from "lucide-react";
import SocialBrandIcon from "@/components/social/SocialBrandIcon";
import { cn } from "@/lib/cn";
import { WSS_SOCIAL_PRIMARY, getSocialIconColor } from "@/lib/social/wss-social-links";

type Props = {
  className?: string;
  headline?: string;
};

export default function SocialFollowCta({
  className,
  headline = "Podobał Ci się artykuł? Bądź bliżej kosmosu!",
}: Props) {
  return (
    <aside
      className={cn(
        "mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-5 sm:px-6 sm:py-6",
        className,
      )}
      aria-labelledby="wss-social-cta-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p
            id="wss-social-cta-heading"
            className="text-[14px] font-semibold tracking-[-0.01em] text-text-primary sm:text-[15px]"
          >
            {headline}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-text-tertiary">
            Dołącz do społeczności WSS — newsy i misje na bieżąco.
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-white/[0.06] border-t border-white/[0.06] sm:mt-6 sm:border-t-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-white/[0.06]">
          {WSS_SOCIAL_PRIMARY.map((profile, index) => (
            <a
              key={profile.id}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.ariaLabel}
              className={cn(
                "group flex items-center justify-between gap-3 py-3.5 transition-colors duration-200 sm:flex-col sm:items-start sm:justify-start sm:px-4 sm:py-4",
                index > 0 && "border-t border-white/[0.06] sm:border-t-0",
                "hover:bg-white/[0.03] sm:rounded-lg",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center"
                  style={{ color: getSocialIconColor(profile.id) }}
                >
                  <SocialBrandIcon platform={profile.id} size={17} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                    {profile.label}
                  </span>
                  <span className="mt-0.5 block text-[13px] font-medium text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
                    {profile.ctaLabel}
                  </span>
                </div>
              </div>
              <ArrowUpRight
                size={14}
                className="shrink-0 text-text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:mt-3"
                aria-hidden
              />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
