"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { UserRole } from "@/lib/auth/permissions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from "@/lib/ui/admin-sidebar-storage";
import { cn } from "@/lib/cn";

export default function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCollapsed(readSidebarCollapsed());
    setHydrated(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!hydrated) return;
    writeSidebarCollapsed(collapsed);
  }, [collapsed, hydrated]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex min-h-dvh bg-space-bg">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Zamknij menu"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <AdminSidebar
        email={email}
        role={role}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        mobileOpen={mobileOpen}
        onNavigate={closeMobile}
        onCloseMobile={closeMobile}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-space-bg/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            aria-label="Otwórz menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-[0.55rem] border border-hairline text-text-secondary transition-colors hover:text-text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-meta font-semibold text-text-primary">
            WSS Newsroom
          </span>
        </div>

        <div
          className={cn(
            "mx-auto w-full flex-1 px-6 py-8 transition-[max-width] duration-300 ease-out md:px-10 md:py-10",
            collapsed ? "max-w-none xl:max-w-[1600px]" : "max-w-5xl"
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
