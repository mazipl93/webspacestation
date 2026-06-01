"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Image as ImageIcon,
  PlusCircle,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/auth/permissions";

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Administrator",
  EDITOR: "Redaktor",
  AUTHOR: "Autor",
};

const NAV = [
  { href: "/admin/dashboard", label: "Pulpit", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Artykuły", icon: Newspaper },
  { href: "/admin/categories", label: "Kategorie", icon: FolderTree },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
];

export default function AdminSidebar({
  email,
  role,
}: {
  email: string;
  role: UserRole | null;
}) {
  const pathname = usePathname();
  const initial = (email.trim()[0] || "?").toUpperCase();
  const roleLabel = role ? ROLE_LABEL[role] : "Brak roli";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-hairline bg-space-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-8 w-8 place-items-center rounded-[0.55rem] bg-accent-blue text-white">
          <span className="text-meta font-bold">W</span>
        </div>
        <div className="flex flex-col">
          <span className="text-title-sm font-semibold leading-none">WSS</span>
          <span className="text-overline text-text-tertiary">Newsroom CMS</span>
        </div>
      </div>

      <div className="px-3">
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-[0.6rem] bg-accent-blue px-3 py-2.5 text-meta font-semibold text-white transition-colors hover:bg-accent-blue-hover"
        >
          <PlusCircle className="h-4 w-4" />
          Nowy artykuł
        </Link>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[0.6rem] px-3 py-2 text-meta font-medium transition-colors duration-200",
                active
                  ? "bg-white/8 text-text-primary"
                  : "text-text-tertiary hover:bg-white/5 hover:text-text-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="mb-3 flex items-center gap-2 rounded-[0.6rem] px-3 py-2 text-caption text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-secondary"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Zobacz portal
        </Link>
        <div className="flex items-center gap-3 rounded-[0.6rem] bg-white/5 px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-space-muted text-meta font-semibold text-text-secondary">
            {initial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-meta font-medium text-text-primary">
              {email || "Zalogowano"}
            </span>
            <span
              className={cn(
                "mt-0.5 inline-flex w-fit items-center rounded-badge border px-1.5 py-0.5 text-overline font-semibold",
                role
                  ? "border-accent-blue/30 bg-accent-blue/10 text-accent-cyan"
                  : "border-hairline text-text-muted"
              )}
            >
              {roleLabel}
            </span>
          </div>
          <form action="/logout" method="post" className="ml-auto">
            <button
              type="submit"
              aria-label="Wyloguj"
              className="grid h-8 w-8 place-items-center rounded-[0.5rem] text-text-tertiary transition-colors hover:bg-accent-live/10 hover:text-accent-live"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
