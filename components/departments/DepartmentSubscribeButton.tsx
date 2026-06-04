"use client";

import Link from "next/link";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { getCategoryInfo } from "@/lib/categories";
import { isSubscribableDepartment } from "@/lib/departments/subscriptions";
import { useDepartmentSubscriptions } from "@/hooks/useDepartmentSubscriptions";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  categorySlug: string;
  className?: string;
};

export default function DepartmentSubscribeButton({
  categorySlug,
  className,
}: Props) {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, toggle, toggling, loading } = useDepartmentSubscriptions();

  if (!isSubscribableDepartment(categorySlug)) return null;

  const meta = getCategoryInfo(categorySlug);
  const accent = meta.color;
  const loginHref = `/logowanie?redirectTo=${encodeURIComponent(meta.href)}`;

  if (authLoading) {
    return (
      <div
        className={cn(
          "h-11 w-full max-w-[320px] animate-pulse rounded-xl border border-hairline bg-glass sm:w-auto",
          className
        )}
      />
    );
  }

  if (!user) {
    return (
      <Link
        href={loginHref}
        className={cn(
          "inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-xl border border-hairline bg-glass px-4 py-2.5 text-[13px] font-semibold text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary sm:w-auto",
          className
        )}
      >
        <Bell size={16} style={{ color: accent }} />
        Zaloguj się — powiadomienia z działu
      </Link>
    );
  }

  const subscribed = isSubscribed(categorySlug);
  const busy = loading || toggling === categorySlug;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void toggle(categorySlug)}
      className={cn(
        "inline-flex w-full max-w-[400px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-left text-[13px] font-semibold transition-all duration-200 sm:w-auto",
        subscribed
          ? "border-hairline-strong text-text-primary"
          : "border-hairline text-text-secondary hover:border-hairline-strong hover:text-text-primary",
        className
      )}
      style={
        subscribed
          ? {
              background: `${accent}18`,
              boxShadow: `0 0 0 1px ${accent}33`,
            }
          : { background: "var(--glass-fill)" }
      }
      aria-pressed={subscribed}
    >
      {busy ? (
        <Loader2 size={16} className="shrink-0 animate-spin" style={{ color: accent }} />
      ) : subscribed ? (
        <BellRing size={16} className="shrink-0" style={{ color: accent }} />
      ) : (
        <Bell size={16} className="shrink-0" style={{ color: accent }} />
      )}
      <span className="min-w-0">
        {subscribed ? (
          <>
            Obserwujesz {meta.label}
            <span className="mt-0.5 block text-[11px] font-medium text-text-muted">
              Powiadomienia o nowych artykułach włączone
            </span>
          </>
        ) : (
          <>
            Dodaj {meta.label} do ulubionych
            <span className="mt-0.5 block text-[11px] font-medium text-text-muted">
              Dostaniesz alert przy nowych artykułach w tym dziale
            </span>
          </>
        )}
      </span>
    </button>
  );
}
