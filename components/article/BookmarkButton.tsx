"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { useBookmarks } from "@/hooks/useBookmarks";

type Props = {
  slug: string;
  /** Optional sizing variant — `overlay` floats over a card image. */
  variant?: "overlay" | "inline";
  className?: string;
};

export default function BookmarkButton({ slug, variant = "overlay", className }: Props) {
  const { isBookmarked, toggle, isAuthed } = useBookmarks();
  const active = isBookmarked(slug);
  const [justToggled, setJustToggled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const label = !isAuthed
    ? "Zaloguj się, aby zapisać artykuł"
    : active
      ? "Usuń z zapisanych"
      : "Zapisz artykuł";

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={!isAuthed ? "Zaloguj się, aby zapisać" : active ? "Zapisano" : "Zapisz artykuł"}
      onClick={(e) => {
        // The card is wrapped in a <Link> — don't navigate when bookmarking.
        e.preventDefault();
        e.stopPropagation();
        // Bookmarking requires login — send signed-out users to log in (and back).
        if (!isAuthed) {
          const dest =
            pathname && pathname !== "/"
              ? `/logowanie?redirectTo=${encodeURIComponent(pathname)}`
              : "/logowanie";
          router.push(dest);
          return;
        }
        toggle(slug);
        setJustToggled(true);
        window.setTimeout(() => setJustToggled(false), 150);
      }}
      style={active ? { boxShadow: "0 0 12px rgba(56,189,248,0.45)" } : {}}
      className={cn(
        "flex items-center justify-center rounded-lg border transition-all duration-300 active:scale-[0.92]",
        variant === "overlay"
          ? [
              "absolute right-3 top-3 z-20 h-8 w-8 border-hairline bg-black/40 backdrop-blur-md",
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
            ]
          : "h-9 w-9 border-hairline bg-glass",
        active
          ? "border-accent-cyan/50 text-accent-cyan"
          : "text-text-secondary hover:border-hairline-strong hover:text-text-primary",
        justToggled && "scale-90",
        className
      )}
    >
      <Bookmark size={15} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
