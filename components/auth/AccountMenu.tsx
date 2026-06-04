"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import Avatar from "@/components/profile/Avatar";
import { NavDropdownMenu } from "@/components/layout/NavMenuPrimitives";

export default function AccountMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <NavDropdownMenu
      open={open}
      onToggle={() => setOpen((v) => !v)}
      onClose={() => setOpen(false)}
      align="right"
      panelWidth="w-60"
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-hairline bg-glass py-1.5 pl-1.5 pr-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-300 hover:border-hairline-strong hover:text-text-primary"
        >
          <Avatar name={user.name} src={user.avatarUrl} size={28} squared />
          <span className="hidden max-w-[120px] truncate md:inline">{user.name}</span>
          <ChevronDown
            size={14}
            className={cn("transition-transform duration-300 ease-out", open && "rotate-180")}
          />
        </button>
      }
    >
      <div className="mb-1 border-b border-hairline-faint px-2.5 py-2.5">
        <p className="truncate text-[13px] font-semibold text-text-primary">{user.name}</p>
        <p className="truncate text-[11.5px] text-text-muted">{user.email}</p>
      </div>

      <Link
        href="/profil"
        role="menuitem"
        onClick={() => setOpen(false)}
        className="nav-menu-item-enter mt-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:border-hairline hover:bg-glass-hover hover:text-text-primary"
        style={{ animationDelay: "0ms" }}
      >
        <User size={15} />
        Profil
      </Link>

      {user.canAccessCms ? (
        <Link
          href="/admin/dashboard"
          role="menuitem"
          onClick={() => setOpen(false)}
          className="nav-menu-item-enter flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:border-hairline hover:bg-glass-hover hover:text-text-primary"
          style={{ animationDelay: "22ms" }}
        >
          <LayoutDashboard size={15} />
          Panel redakcyjny
        </Link>
      ) : null}

      <Link
        href="/notifications"
        role="menuitem"
        onClick={() => setOpen(false)}
        className="nav-menu-item-enter flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:border-hairline hover:bg-glass-hover hover:text-text-primary"
        style={{ animationDelay: "45ms" }}
      >
        <Bell size={15} />
        Powiadomienia
      </Link>

      <div className="nav-menu-item-enter" style={{ animationDelay: "90ms" }}>
        <LogoutButton
          next="/"
          formClassName="w-full"
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13px] text-text-secondary transition-colors duration-200 hover:bg-accent-live/10 hover:text-accent-live"
        >
          <LogOut size={15} />
          Wyloguj się
        </LogoutButton>
      </div>
    </NavDropdownMenu>
  );
}
