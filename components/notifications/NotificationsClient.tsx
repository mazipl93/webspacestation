"use client";

import Link from "next/link";
import {
  Bell,
  CalendarClock,
  Lock,
  MessageCircle,
  Rocket,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";

type PlaceholderNotification = {
  id: string;
  icon: LucideIcon;
  accent: string;
  title: string;
  body: string;
  time: string;
  href: string;
  unread?: boolean;
};

// Placeholder feed — real notifications will be Supabase-backed later.
const NOTIFICATIONS: PlaceholderNotification[] = [
  {
    id: "n1",
    icon: Rocket,
    accent: "#38bdf8",
    title: "Start Falcon 9 już za 2 godziny",
    body: "Misja Starlink Group 12-4 startuje z SLC-40 na Cape Canaveral.",
    time: "12 min temu",
    href: "/starty",
    unread: true,
  },
  {
    id: "n2",
    icon: Sparkles,
    accent: "#a855f7",
    title: "Nowy artykuł w kategorii Astronomia",
    body: "JWST uchwycił nowe szczegóły mgławicy w gwiazdozbiorze Oriona.",
    time: "1 godz. temu",
    href: "/aktualnosci/jwst-kosmiczna-meduza",
    unread: true,
  },
  {
    id: "n3",
    icon: MessageCircle,
    accent: "#2f6dff",
    title: "Odpowiedź na Twój komentarz",
    body: "Ktoś odpowiedział w dyskusji pod artykułem o misji Artemis II.",
    time: "5 godz. temu",
    href: "/aktualnosci/starship-flight-14-pelny-sukces",
  },
  {
    id: "n4",
    icon: CalendarClock,
    accent: "#ffb830",
    title: "Przypomnienie o wydarzeniu",
    body: "Starship Flight 14 — okno startowe otwiera się jutro o 14:00.",
    time: "wczoraj",
    href: "/starty",
  },
];

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
  const { user, loading } = useSessionUser();

  if (loading) {
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
      <div className="mb-7 flex items-center gap-2.5">
        <Bell size={18} className="text-accent-cyan" />
        <h1
          className="font-extrabold text-text-primary"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
        >
          Powiadomienia
        </h1>
      </div>

      <ul className="flex flex-col gap-3">
        {NOTIFICATIONS.map((n) => {
          const Icon = n.icon;
          return (
            <li key={n.id}>
              <Link
                href={n.href}
                className="card-surface group flex items-start gap-3.5 p-4 transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover sm:p-5"
                style={
                  n.unread
                    ? { borderColor: "rgba(47,109,255,0.28)" }
                    : undefined
                }
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
                    {n.unread && (
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
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-[12px] text-text-muted">
        To są przykładowe powiadomienia. Wkrótce pojawią się tu prawdziwe alerty.
      </p>
    </PageShell>
  );
}
