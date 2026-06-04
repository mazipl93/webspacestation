"use client";

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { navLinkAccent, type NavMenuLink } from "@/lib/ui/nav-menu-config";
import { navTrackDropdownTriggerClass } from "@/lib/ui/nav-desktop";

const PANEL_STYLE = {
  background:
    "linear-gradient(165deg, rgba(14,18,28,0.97) 0%, rgba(8,11,18,0.96) 55%, rgba(6,8,14,0.98) 100%)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  boxShadow:
    "0 0 0 1px rgba(56,189,248,0.08), 0 24px 48px -16px rgba(0,0,0,0.65), 0 0 40px -20px rgba(47,109,255,0.15)",
} as const;

const PANEL_TRANSITION_MS = 200;

type NavDropdownMenuProps = {
  label?: string;
  /** Własny trigger (np. avatar konta). */
  trigger?: ReactNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  active?: boolean;
  panelWidth?: string;
  align?: "left" | "right";
  children: ReactNode;
};

/** Desktop flyout z animowanym otwarciem i zamknięciem. */
export function NavDropdownMenu({
  label,
  trigger,
  open,
  onToggle,
  onClose,
  active = false,
  panelWidth = "w-[min(100vw-2rem,17.5rem)]",
  align = "left",
  children,
}: NavDropdownMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setMounted(true);
      requestAnimationFrame(() => setShown(true));
      return;
    }
    setShown(false);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
      closeTimer.current = null;
    }, PANEL_TRANSITION_MS);
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    []
  );

  const defaultTrigger = (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={onToggle}
      className={navTrackDropdownTriggerClass(active, open)}
    >
      {label}
      <ChevronDown
        size={14}
        className={cn(
          "transition-transform duration-300 ease-out",
          open && "rotate-180"
        )}
      />
    </button>
  );

  const resolvedTrigger =
    trigger && isValidElement(trigger)
      ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
          onClick: () => onToggle(),
          "aria-expanded": open,
          "aria-haspopup": "menu",
        } as Record<string, unknown>)
      : defaultTrigger;

  return (
    <div className="relative">
      {resolvedTrigger}

      {mounted ? (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 transition-opacity duration-200 ease-out",
              shown ? "opacity-100" : "opacity-0"
            )}
            onClick={onClose}
            aria-hidden
          />
          <div
            role="menu"
            className={cn(
              "absolute top-full z-50 mt-2.5 origin-top overflow-hidden rounded-2xl border border-hairline p-2 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
              panelWidth,
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
              shown
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-[0.97] opacity-0"
            )}
            style={PANEL_STYLE}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function NavMenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 px-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </p>
  );
}

export function NavMenuItem({
  link,
  onSelect,
  index = 0,
  compact = false,
}: {
  link: NavMenuLink;
  onSelect: () => void;
  index?: number;
  compact?: boolean;
}) {
  const accent = navLinkAccent(link);
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "nav-menu-item-enter group flex gap-3 rounded-xl border border-transparent px-2.5 transition-all duration-200",
        compact ? "py-2.5" : "py-3",
        "hover:border-hairline hover:bg-glass-hover"
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 group-hover:border-hairline-strong"
        style={{
          borderColor: `${accent}33`,
          background: `linear-gradient(135deg, ${accent}18 0%, transparent 100%)`,
          color: accent,
        }}
      >
        {Icon ? <Icon size={16} strokeWidth={2} aria-hidden /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}88` }}
          />
          <span className="truncate text-[13px] font-semibold text-text-primary transition-colors group-hover:text-accent-cyan">
            {link.label}
          </span>
        </span>
        {link.description && !compact ? (
          <span className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-text-muted">
            {link.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

type MobileAccordionProps = {
  label: string;
  links: NavMenuLink[];
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isActive: (href: string) => boolean;
};

export function NavMobileAccordion({
  label,
  links,
  open,
  onToggle,
  onNavigate,
  isActive,
}: MobileAccordionProps) {
  return (
    <div className="border-b border-hairline-faint last:border-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 py-2 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
          {label}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-text-muted transition-transform duration-300 ease-out",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-0.5 pb-3">
            {links.map((link, i) => {
              const accent = navLinkAccent(link);
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      "nav-menu-item-enter flex min-h-[48px] items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-200",
                      active
                        ? "bg-glass-hover text-text-primary"
                        : "text-text-secondary hover:bg-glass/60 hover:text-text-primary"
                    )}
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        color: accent,
                        background: `${accent}14`,
                        border: `1px solid ${accent}33`,
                      }}
                    >
                      {Icon ? <Icon size={15} aria-hidden /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold leading-snug">
                        {link.label}
                      </span>
                    </span>
                    {active ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: accent }}
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
