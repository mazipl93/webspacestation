"use client";

import type { CSSProperties } from "react";
import SocialBrandIcon from "@/components/social/SocialBrandIcon";
import { cn } from "@/lib/cn";
import {
  WSS_SOCIAL_PRIMARY,
  getSocialIconColor,
  type SocialProfile,
} from "@/lib/social/wss-social-links";

type Props = {
  profiles?: readonly SocialProfile[];
  size?: "sm" | "md";
  className?: string;
  layout?: "inline" | "drawer";
  tone?: "default" | "nav";
};

const SIZE = {
  sm: { btn: "h-8 w-8", icon: 14 },
  md: { btn: "h-11 w-11", icon: 16 },
} as const;

const DEFAULT_BTN =
  "flex shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.03] text-text-tertiary transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan";

const NAV_BTN =
  "wss-nav-social-link relative flex shrink-0 items-center justify-center rounded-[7px] border text-text-secondary transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan";

function navLinkStyle(profile: SocialProfile): CSSProperties {
  return {
    "--social-hover": getSocialIconColor(profile.id),
  } as CSSProperties;
}

export default function SocialIconLinks({
  profiles = WSS_SOCIAL_PRIMARY,
  size = "sm",
  className,
  layout = "inline",
  tone = "default",
}: Props) {
  const dims = SIZE[size];
  const isNav = tone === "nav";
  const isDrawer = layout === "drawer";

  const links = profiles.map((profile) => (
    <a
      key={profile.id}
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={profile.ariaLabel}
      title={profile.label}
      role="listitem"
      data-platform={profile.id}
      style={isNav ? navLinkStyle(profile) : undefined}
      className={cn(
        isNav ? NAV_BTN : DEFAULT_BTN,
        isDrawer ? "h-11 w-11 justify-self-center" : dims.btn,
      )}
    >
      <SocialBrandIcon
        platform={profile.id}
        size={isDrawer ? 16 : dims.icon}
      />
    </a>
  ));

  if (isNav && isDrawer) {
    return (
      <div
        className={cn(
          "wss-nav-social-cluster wss-nav-social-cluster--drawer flex w-full items-center justify-between gap-4 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 lg:hidden",
          className,
        )}
        role="group"
        aria-label="Śledź nas w mediach społecznościowych"
      >
        <span className="wss-nav-social-label shrink-0">Śledź nas</span>
        <div
          className="grid shrink-0 grid-cols-3 gap-3"
          role="list"
          aria-label="Profile społecznościowe Web Space Station"
        >
          {links}
        </div>
      </div>
    );
  }

  if (isNav) {
    return (
      <div
        className={cn(
          "wss-nav-social-cluster hidden shrink-0 flex-row items-center gap-1.5 rounded-[10px] border border-white/[0.1] bg-white/[0.03] py-0.5 pl-2 pr-0.5 lg:flex",
          className,
        )}
        role="group"
        aria-label="Śledź nas w mediach społecznościowych"
      >
        <span className="wss-nav-social-label shrink-0" aria-hidden="true">
          Śledź nas
        </span>
        <span className="h-4 w-px shrink-0 bg-white/[0.12]" aria-hidden />
        <div
          className="flex flex-row items-center gap-1"
          role="list"
          aria-label="Profile społecznościowe Web Space Station"
        >
          {links}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-1.5",
        layout === "inline" && "hidden lg:flex",
        layout === "drawer" && "lg:hidden",
        className,
      )}
      role="list"
      aria-label="Profile społecznościowe Web Space Station"
    >
      {links}
    </div>
  );
}
