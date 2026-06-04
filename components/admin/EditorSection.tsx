"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONE_STYLES = {
  default: "border-hairline bg-white/[0.02]",
  content: "border-accent-blue/30 bg-accent-blue/[0.05]",
  publish: "border-emerald-500/30 bg-emerald-500/[0.05]",
  meta: "border-accent-cyan/25 bg-accent-cyan/[0.04]",
  media: "border-accent-amber/25 bg-accent-amber/[0.04]",
  author: "border-violet-400/25 bg-violet-500/[0.05]",
} as const;

export type EditorSectionTone = keyof typeof TONE_STYLES;

export default function EditorSection({
  step,
  title,
  description,
  tone = "default",
  children,
  className,
}: {
  step: number;
  title: string;
  description?: string;
  tone?: EditorSectionTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[0.75rem] border p-5 sm:p-6",
        TONE_STYLES[tone],
        className
      )}
    >
      <header className="mb-5 flex flex-wrap items-start gap-3 border-b border-hairline-faint pb-4">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-meta font-bold tabular-nums text-text-primary"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-title-sm font-semibold text-text-primary">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-prose text-caption leading-relaxed text-text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
