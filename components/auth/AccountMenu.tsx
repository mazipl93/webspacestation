"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import Avatar from "@/components/profile/Avatar";

/**
 * Desktop account dropdown for signed-in users: shows the avatar/name and a
 * menu with notifications + sign out. Returns null when signed out so the
 * Navbar can render the "Zaloguj się" CTA instead.
 */
export default function AccountMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-hairline bg-glass py-1.5 pl-1.5 pr-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-300 hover:border-hairline-strong hover:text-text-primary"
      >
        <Avatar name={user.name} src={user.avatarUrl} size={28} squared />
        <span className="hidden max-w-[120px] truncate md:inline">{user.name}</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-hairline p-1.5 shadow-2xl"
            style={{
              background: "rgba(12,16,24,0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            <div className="border-b border-hairline-faint px-3 py-2.5">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {user.name}
              </p>
              <p className="truncate text-[11.5px] text-text-muted">{user.email}</p>
            </div>

            <Link
              href="/profil"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:bg-glass-hover hover:text-text-primary"
            >
              <User size={15} />
              Profil
            </Link>

            <Link
              href="/notifications"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:bg-glass-hover hover:text-text-primary"
            >
              <Bell size={15} />
              Powiadomienia
            </Link>

            <LogoutButton
              next="/"
              formClassName="w-full"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-text-secondary transition-colors duration-200 hover:bg-accent-live/10 hover:text-accent-live"
              onClick={() => setOpen(false)}
            >
              <LogOut size={15} />
              Wyloguj się
            </LogoutButton>
          </div>
        </>
      )}
    </div>
  );
}
