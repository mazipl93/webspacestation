"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Newspaper,
  FolderTree,
  PlusCircle,
  ExternalLink,
  LogOut,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import LogoutButton from "@/components/auth/LogoutButton";
import Avatar from "@/components/profile/Avatar";
import type { UserRole } from "@/lib/auth/permissions";
import {
  canCreateArticle,
  canManageCategories,
  canManageUsers,
} from "@/lib/auth/permissions";

const ROLE_LABEL: Record<UserRole, string> = {
  USER: "Użytkownik",
  AUTHOR: "Autor",
  EDITOR: "Redaktor",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
};

const NAV = [
  { href: "/admin/dashboard", label: "Pulpit", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Artykuły", icon: Newspaper },
  { href: "/admin/categories", label: "Kategorie", icon: FolderTree },
  { href: "/admin/users", label: "Użytkownicy", icon: Users, adminOnly: true },
] as const;

function SidebarTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-[calc(100%+0.45rem)] top-1/2 z-[60] ml-0 -translate-y-1/2 whitespace-nowrap rounded-md border border-hairline bg-space-card px-2.5 py-1.5 text-[11px] font-medium text-text-primary opacity-0 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 max-lg:hidden"
    >
      {label}
    </span>
  );
}

function SidebarNavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center rounded-[0.6rem] text-meta font-medium transition-colors duration-200",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
        active
          ? "bg-white/8 text-text-primary"
          : "text-text-tertiary hover:bg-white/5 hover:text-text-secondary"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed ? (
        <span className="truncate">{label}</span>
      ) : (
        <SidebarTooltip label={label} />
      )}
    </Link>
  );
}

export default function AdminSidebar({
  email,
  name,
  avatarUrl,
  role,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onNavigate,
  onCloseMobile,
}: {
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onNavigate: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const roleLabel = ROLE_LABEL[role];
  const showNewArticle = canCreateArticle(role);
  const navItems = NAV.filter(
    (item) => !("adminOnly" in item && item.adminOnly) || canManageUsers(role)
  ).filter((item) => item.href !== "/admin/categories" || canManageCategories(role));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const showCollapsed = collapsed && !mobileOpen;

  return (
    <aside
      className={cn(
        "cms-sidebar fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col border-r border-hairline bg-space-surface shadow-[8px_0_28px_rgba(0,0,0,0.45)] transition-[width,transform] duration-300 ease-out lg:shadow-none",
        showCollapsed ? "w-[4.5rem]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:sticky lg:top-0 lg:translate-x-0"
      )}
    >
      <div className="border-b border-hairline/60">
        {showCollapsed ? (
          <div className="flex flex-col items-center gap-2 px-2 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-[0.55rem] bg-accent-blue text-white">
              <span className="text-meta font-bold">W</span>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Rozwiń panel boczny"
              aria-expanded={false}
              className="hidden h-8 w-8 place-items-center rounded-[0.5rem] border border-hairline text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary lg:grid"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[0.55rem] bg-accent-blue text-white">
                <span className="text-meta font-bold">W</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-title-sm font-semibold leading-none">
                  WSS
                </span>
                <span className="text-overline text-text-tertiary">Newsroom CMS</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Zamknij menu"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[0.5rem] text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Zwiń panel boczny"
              aria-expanded
              className="hidden h-8 w-8 shrink-0 place-items-center rounded-[0.5rem] border border-hairline text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary lg:grid"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {showNewArticle ? (
        <div className={cn("pt-3", showCollapsed ? "px-2" : "px-3")}>
          <Link
            href="/admin/articles/new"
            onClick={onNavigate}
            title={showCollapsed ? "Nowy artykuł" : undefined}
            className={cn(
              "group relative flex items-center rounded-[0.6rem] bg-accent-blue font-semibold text-white transition-colors hover:bg-accent-blue-hover",
              showCollapsed
                ? "justify-center px-2 py-2.5"
                : "gap-2 px-3 py-2.5 text-meta"
            )}
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            {!showCollapsed ? "Nowy artykuł" : null}
            {showCollapsed ? <SidebarTooltip label="Nowy artykuł" /> : null}
          </Link>
        </div>
      ) : null}

      <nav
        className={cn(
          "mt-3 flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden",
          showCollapsed ? "px-2" : "px-3"
        )}
      >
        {navItems.map(({ href, label, icon }) => (
          <SidebarNavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={isActive(href)}
            collapsed={showCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div
        className={cn(
          "border-t border-hairline py-3",
          showCollapsed ? "px-2" : "px-3"
        )}
      >
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className={cn(
            "group relative mb-3 flex items-center rounded-[0.6rem] text-caption text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-secondary",
            showCollapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2"
          )}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {!showCollapsed ? "Zobacz portal" : null}
          {showCollapsed ? <SidebarTooltip label="Zobacz portal" /> : null}
        </Link>

        <div
          className={cn(
            "flex items-center rounded-[0.6rem] bg-white/5",
            showCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
          )}
        >
          <Avatar
            name={name}
            src={avatarUrl}
            size={32}
            squared
            className={showCollapsed ? "shrink-0" : "shrink-0"}
          />
          {!showCollapsed ? (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-meta font-medium text-text-primary">
                {name}
              </span>
              <span className="truncate text-[10px] text-text-muted">{email}</span>
              <span className="mt-1 inline-flex w-fit items-center rounded-badge border border-accent-blue/30 bg-accent-blue/10 px-1.5 py-0.5 text-overline font-semibold text-accent-cyan">
                {roleLabel}
              </span>
            </div>
          ) : null}
          <LogoutButton
            next="/login"
            formClassName={cn(
              showCollapsed ? "group relative" : "ml-auto"
            )}
            aria-label="Wyloguj"
            className="grid h-8 w-8 place-items-center rounded-[0.5rem] text-text-tertiary transition-colors hover:bg-accent-live/10 hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            {showCollapsed ? <SidebarTooltip label="Wyloguj" /> : null}
          </LogoutButton>
          {showCollapsed ? (
            <span className="sr-only">{email}</span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
