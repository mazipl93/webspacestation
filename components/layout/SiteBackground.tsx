"use client";

import { usePathname } from "next/navigation";

/** Ambient tło portalu — ciemny newsroom z subtelną głębią kosmiczną. Ukryte w CMS / logowaniu. */
export default function SiteBackground() {
  const pathname = usePathname() ?? "";
  const hide =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/logowanie") ||
    pathname.startsWith("/rejestracja");

  if (hide) return null;

  return (
    <div aria-hidden className="site-cosmos">
      <div className="site-cosmos-base" />
      <div className="site-cosmos-glow" />
      <div className="site-cosmos-stars" />
      <div className="site-cosmos-grain" />
      <div className="site-cosmos-vignette" />
    </div>
  );
}
