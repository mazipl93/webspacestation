"use client";

import { openCookieConsentSettings } from "@/lib/analytics/consent";

type Props = {
  className?: string;
};

export default function CookieSettingsButton({ className }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => openCookieConsentSettings()}
    >
      Ustawienia cookies
    </button>
  );
}
