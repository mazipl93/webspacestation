"use client";

import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "storm" | "warning" | "info";
  timestamp: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_COLORS = {
  storm: { border: "#ff2222", bg: "#1a0000", text: "#ff6666", icon: "⚡" },
  warning: { border: "#ff8800", bg: "#1a0a00", text: "#ffaa44", icon: "⚠" },
  info: { border: "#60a5fa", bg: "#000f1a", text: "#93c5fd", icon: "ℹ" },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const c = TOAST_COLORS[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-lg border px-4 py-3 max-w-sm shadow-lg flex items-start gap-3 cursor-pointer"
            style={{
              borderColor: c.border,
              background: c.bg,
              boxShadow: `0 0 20px ${c.border}44`,
            }}
            onClick={() => onDismiss(toast.id)}
          >
            <span className="text-lg leading-none">{c.icon}</span>
            <div>
              <p
                className="text-sm font-bold font-mono"
                style={{ color: c.text }}
              >
                {toast.message}
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                Kliknij aby zamknąć
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismiss };
}
