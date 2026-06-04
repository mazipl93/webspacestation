"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const PANEL_CLASS =
  "rounded-lg border border-hairline-faint bg-white/[0.05] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-4 sm:py-3.5";

/** Osobna „karta” na pole, przycisk lub przełącznik w edytorze artykułu. */
export function EditorFieldPanel({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(PANEL_CLASS, className)} {...rest}>
      {children}
    </div>
  );
}

/** Wiersz z opisem po lewej i kontrolką (toggle, select) po prawej. */
export function EditorControlPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(PANEL_CLASS, "flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        <span className="text-meta font-medium text-text-secondary">{title}</span>
        {description ? (
          <p className="mt-0.5 text-[10px] leading-snug text-text-muted">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
