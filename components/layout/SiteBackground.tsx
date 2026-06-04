"use client";

import { usePathname } from "next/navigation";

/** Płaskie ciemne tło strony. Ukryte w CMS / logowaniu. */
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
    </div>
  );
}
