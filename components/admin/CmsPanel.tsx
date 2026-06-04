"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Wyraźny blok informacyjny na listach CMS (akcje masowe, filtry). */
export default function CmsPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.75rem] border-2 border-hairline-strong bg-white/[0.04] px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}
