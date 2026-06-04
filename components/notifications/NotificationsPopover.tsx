"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  Lock,
  MessageCircle,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useNotifications } from "@/hooks/useNotifications";
import {
  NAV_OVERLAY_BACKDROP,
  NAV_OVERLAY_PANEL_BASE,
  NAV_OVERLAY_PANEL_POSITION,
  NAV_OVERLAY_PANEL_STYLE,
} from "@/lib/ui/nav-overlay-panel";

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  sparkles: Sparkles,
  message: MessageCircle,
  calendar: CalendarClock,
};

type Props = {
  open: boolean;
  onClose: () => void;
  loginHref: string;
};

export default function NotificationsPopover({ open, onClose, loginHref }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    items,
    hasUnread,
    markRead,
    markAllRead,
    clearAll,
    isLoggedIn,
    loading,
    fetchError,
    subscribedDepartments,
  } = useNotifications();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleItemClick(id: string, href: string) {
    markRead(id);
    onClose();
    router.push(href);
  }

  return (
    <>
      <div className={NAV_OVERLAY_BACKDROP} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Powiadomienia"
        className={cn(
          NAV_OVERLAY_PANEL_BASE,
          NAV_OVERLAY_PANEL_POSITION,
          "w-full sm:w-[min(380px,calc(100vw-2rem))]"
        )}
        style={NAV_OVERLAY_PANEL_STYLE}
      >
        <div className="flex items-center justify-between border-b border-hairline-faint px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-accent-cyan" />
            <h2 className="text-[13px] font-bold text-text-primary">Powiadomienia</h2>
            {hasUnread && (
              <span className="rounded-full bg-accent-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-accent-cyan">
                Nowe
              </span>
            )}
          </div>
          {isLoggedIn && items.length > 0 && (
            <div className="flex items-center gap-3">
              {hasUnread ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-text-tertiary transition-colors hover:text-accent-cyan"
                >
                  Oznacz wszystkie
                </button>
              ) : null}
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-medium text-text-tertiary transition-colors hover:text-accent-live"
              >
                Wyczyść
              </button>
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-glass">
              <Lock size={20} className="text-text-tertiary" />
            </div>
            <p className="text-[13px] leading-relaxed text-text-secondary">
              Zaloguj się, aby odbierać alerty o startach i nowych artykułach.
            </p>
            <Link
              href={loginHref}
              onClick={onClose}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-accent-blue px-4 py-2 text-[13px] font-semibold text-white"
            >
              Zaloguj się
            </Link>
          </div>
        ) : loading ? (
          <ul className="space-y-2 p-2">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-[72px] animate-pulse rounded-xl border border-hairline bg-glass"
              />
            ))}
          </ul>
        ) : fetchError ? (
          <p className="px-4 py-10 text-center text-[13px] text-text-muted">
            Nie udało się wczytać powiadomień. Spróbuj za chwilę.
          </p>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] leading-relaxed text-text-muted">
            <p>
              {subscribedDepartments.length === 0
                ? "Dodaj dział do ulubionych na stronie Misje, Astronomia, Technologie itd., aby dostawać alerty o nowych artykułach."
                : "Lista wyczyszczona lub brak alertów. Nowe starty i artykuły z ulubionych działów pojawią się tutaj automatycznie."}
            </p>
            <Link
              href="/profil"
              onClick={onClose}
              className="mt-4 inline-flex text-[12.5px] font-semibold text-accent-cyan hover:underline"
            >
              Zarządzaj ulubionymi działami
            </Link>
          </div>
        ) : (
          <ul className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            {items.map((n) => {
              const Icon = ICONS[n.icon] ?? Bell;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(n.id, n.href)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 hover:bg-glass-hover",
                      n.isUnread && "bg-accent-blue/[0.06]"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline"
                      style={{ color: n.accent, background: `${n.accent}14` }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-semibold leading-snug text-text-primary">
                          {n.title}
                        </p>
                        {n.isUnread && (
                          <span
                            aria-label="Nieprzeczytane"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-blue"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-text-tertiary">
                        {n.body}
                      </p>
                      <span className="mt-1.5 block text-[10.5px] text-text-muted">
                        {n.time}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {isLoggedIn && (
          <div className="border-t border-hairline-faint p-2">
            <Link
              href="/notifications"
              onClick={onClose}
              className="flex min-h-[44px] items-center justify-center rounded-lg text-[12.5px] font-medium text-accent-cyan transition-colors hover:bg-glass-hover"
            >
              Zobacz wszystkie powiadomienia
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
