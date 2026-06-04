"use client";

import Link from "next/link";
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
import { useSessionUser } from "@/hooks/useSessionUser";
import { useNotifications } from "@/hooks/useNotifications";

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  sparkles: Sparkles,
  message: MessageCircle,
  calendar: CalendarClock,
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-b border-hairline"
      style={{
        background:
          "radial-gradient(ellipse 70% 140% at 0% 0%, #2f6dff12 0%, transparent 56%), var(--color-space-bg)",
      }}
    >
      <div className="container-site min-h-[calc(100vh-160px)] pb-12 pt-[96px]">
        {children}
      </div>
    </div>
  );
}

export default function NotificationsClient() {
  const { user, loading: sessionLoading } = useSessionUser();
  const router = useRouter();
  const {
    items,
    markRead,
    markAllRead,
    clearAll,
    hasUnread,
    loading: feedLoading,
    fetchError,
    refresh,
    subscribedDepartments,
  } = useNotifications();

  if (sessionLoading) {
    return (
      <PageShell>
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="card-surface flex items-start gap-3.5 p-4 sm:p-5">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-space-surface" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-glass" />
                <div className="h-3 w-full animate-pulse rounded bg-glass" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-glass" />
              </div>
            </li>
          ))}
        </ul>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[460px] text-center">
          <div
            className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline"
            style={{ background: "var(--glass-fill)" }}
          >
            <Lock size={24} className="text-text-tertiary" />
          </div>
          <h1
            className="mb-4 font-extrabold text-text-primary"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
          >
            Powiadomienia
          </h1>
          <p className="mb-8 text-[14px] leading-relaxed text-text-secondary">
            Zaloguj się, aby zobaczyć powiadomienia o startach rakiet, nowych
            artykułach i odpowiedziach na Twoje komentarze.
          </p>
          <Link
            href="/logowanie?redirectTo=%2Fnotifications"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_24px_-8px_rgba(47,109,255,0.6)] active:scale-[0.97]"
          >
            Zaloguj się
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Bell size={18} className="text-accent-cyan" />
          <h1
            className="font-extrabold text-text-primary"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
          >
            Powiadomienia
          </h1>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-4">
            {hasUnread ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[13px] font-medium text-text-tertiary transition-colors hover:text-accent-cyan"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            ) : null}
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] font-medium text-text-tertiary transition-colors hover:text-accent-live"
            >
              Wyczyść powiadomienia
            </button>
          </div>
        )}
      </div>

      {fetchError ? (
        <div className="rounded-2xl border border-hairline bg-glass px-6 py-10 text-center">
          <p className="text-[14px] text-text-secondary">
            Nie udało się wczytać powiadomień.
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-accent-blue px-5 text-[13px] font-semibold text-white"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : feedLoading && items.length === 0 ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="card-surface h-[100px] animate-pulse p-5" />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-glass/40 px-6 py-12 text-center">
          <p className="mx-auto max-w-[420px] text-[14px] leading-relaxed text-text-muted">
            {subscribedDepartments.length === 0
              ? "Dodaj działy do ulubionych — na stronie każdego działu lub w profilu — aby dostawać powiadomienia o nowych artykułach. Starty rakiet zawsze trafiają do dzwonka po zalogowaniu."
              : "Lista wyczyszczona lub brak alertów. Tu pojawią się starty z najbliższych 7 dni oraz nowe artykuły z obserwowanych działów."}
          </p>
          <Link
            href="/profil"
            className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-accent-blue px-5 text-[13px] font-semibold text-white"
          >
            Ulubione działy w profilu
          </Link>
        </div>
      ) : (
      <ul className="flex flex-col gap-3">
        {items.map((n) => {
          const Icon = ICONS[n.icon] ?? Bell;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  markRead(n.id);
                  router.push(n.href);
                }}
                className={cn(
                  "card-surface group flex w-full items-start gap-3.5 p-4 text-left transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover sm:p-5",
                  n.isUnread && "border-accent-blue/30"
                )}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline"
                  style={{ color: n.accent, background: `${n.accent}14` }}
                >
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan">
                      {n.title}
                    </p>
                    {n.isUnread && (
                      <span
                        aria-label="Nieprzeczytane"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-blue"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-text-tertiary">
                    {n.body}
                  </p>
                  <span className="mt-2 block text-[11px] text-text-muted">{n.time}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      )}
    </PageShell>
  );
}
