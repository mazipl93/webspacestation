"use client";

import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useArticleLikes } from "@/hooks/useArticleLikes";

type Props = {
  slug: string;
};

export default function LikeButton({ slug }: Props) {
  const { count, liked, loading, toggling, isAuthed, toggle } = useArticleLikes(slug);
  const router = useRouter();
  const pathname = usePathname();

  const label = !isAuthed
    ? "Zaloguj się, aby polubić artykuł"
    : liked
      ? "Usuń polubienie"
      : "Polub ten artykuł";

  return (
    <button
      type="button"
      onClick={() => {
        if (!isAuthed) {
          const dest =
            pathname && pathname !== "/"
              ? `/logowanie?redirectTo=${encodeURIComponent(pathname)}`
              : "/logowanie";
          router.push(dest);
          return;
        }
        toggle();
      }}
      disabled={toggling}
      aria-pressed={liked}
      aria-label={label}
      title={!isAuthed ? "Zaloguj się, aby polubić" : label}
      className={cn(
        "group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-70",
        liked
          ? "border-accent-live/40 bg-accent-live/10 text-accent-live"
          : "border-hairline bg-glass text-text-secondary hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary"
      )}
      style={liked ? { boxShadow: "0 0 14px -2px rgba(255,59,71,0.4)" } : undefined}
    >
      <Heart
        size={15}
        fill={liked ? "currentColor" : "none"}
        className={cn(
          "transition-transform duration-300",
          !liked && "group-hover:scale-110"
        )}
      />
      <span>Lubię to</span>
      {!loading && count !== null && (
        <span
          className={cn(
            "min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums",
            liked ? "bg-accent-live/15 text-accent-live" : "bg-glass text-text-tertiary"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
