"use client";

import { cn } from "@/lib/cn";
import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

// ─── Button ───────────────────────────────────────────────────────────────--

type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-blue text-white hover:bg-accent-blue-hover border border-transparent",
  ghost:
    "bg-glass text-text-secondary hover:text-text-primary border border-hairline hover:border-hairline-strong",
  subtle:
    "bg-transparent text-text-tertiary hover:text-text-primary border border-transparent hover:bg-white/5",
  danger:
    "bg-transparent text-accent-live border border-hairline hover:border-accent-live/60 hover:bg-accent-live/10",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-badge px-3.5 py-2 text-meta font-semibold",
        "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────--

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="overline text-text-tertiary"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <span className="text-caption text-text-muted">{hint}</span>
      ) : null}
    </div>
  );
}

const FIELD_BASE =
  "w-full rounded-[0.6rem] bg-space-surface border border-hairline px-3 py-2 text-body text-text-primary " +
  "placeholder:text-text-muted transition-colors duration-200 focus:border-accent-blue focus:outline-none";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return <input {...props} className={cn(FIELD_BASE, props.className)} />;
}

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(props, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(FIELD_BASE, "resize-y leading-relaxed", props.className)}
    />
  );
});

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={cn(FIELD_BASE, "appearance-none cursor-pointer", props.className)}
    />
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────--

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors duration-200",
          checked ? "bg-accent-blue" : "bg-space-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
      {label ? (
        <span className="text-meta text-text-secondary">{label}</span>
      ) : null}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────--

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("card-surface p-5", className)}>{children}</div>
  );
}

// ─── Inline feedback ──────────────────────────────────────────────────────--

export function Banner({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const tones = {
    info: "border-hairline text-text-secondary bg-glass",
    error: "border-accent-live/40 text-accent-live bg-accent-live/10",
    success: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  } as const;
  return (
    <div
      className={cn(
        "rounded-[0.6rem] border px-3.5 py-2.5 text-meta",
        tones[tone]
      )}
    >
      {children}
    </div>
  );
}
