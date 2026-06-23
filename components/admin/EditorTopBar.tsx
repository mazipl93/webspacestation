"use client";

import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { Button } from "@/components/admin/primitives";
import StatusBadge from "@/components/admin/StatusBadge";
import type { ArticleStatus } from "@/lib/admin/types";

interface EditorTopBarProps {
  title: string;
  status: ArticleStatus;
  lastSavedAt: Date | null;
  dirty: boolean;
  saving: boolean;
  canPublish: boolean;
  onSave(): void;
  onSaveDraft(): void;
  onPublish(): void;
  onOpenMobileSidebar(): void;
}

export default function EditorTopBar({
  title,
  status,
  lastSavedAt,
  dirty,
  saving,
  canPublish,
  onSave,
  onSaveDraft,
  onPublish,
  onOpenMobileSidebar,
}: EditorTopBarProps) {
  const displayTitle =
    title.length > 52 ? `${title.slice(0, 52)}…` : title || "Nowy artykuł";

  const saveLabel = saving
    ? "Zapisywanie…"
    : dirty
      ? "Niezapisany"
      : lastSavedAt
        ? `Zapisano ${lastSavedAt.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : null;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-space-surface/95 px-4 backdrop-blur lg:px-5">
      <Link
        href="/admin/articles"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline text-text-tertiary transition-colors hover:text-text-primary"
        aria-label="Powrót do listy"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <StatusBadge status={status} />
        <span className="min-w-0 truncate text-[13px] font-medium text-text-secondary">
          {displayTitle}
        </span>
        {saveLabel && (
          <span className="hidden shrink-0 text-caption text-text-muted lg:block">
            · {saveLabel}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {status !== "PUBLISHED" && (
          <Button
            variant="ghost"
            onClick={onSave}
            disabled={saving}
            className="hidden py-1.5 text-[13px] sm:inline-flex"
          >
            Zapisz
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={onSaveDraft}
          disabled={saving}
          className="hidden py-1.5 text-[13px] sm:inline-flex"
        >
          {status === "REVIEW" ? "Przenieś do szkiców" : "Zapisz szkic"}
        </Button>
        {canPublish && status !== "PUBLISHED" && (
          <Button
            variant="primary"
            onClick={onPublish}
            disabled={saving}
            className="hidden py-1.5 text-[13px] sm:inline-flex"
          >
            Publikuj
          </Button>
        )}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-text-tertiary transition-colors hover:text-text-primary lg:hidden"
          aria-label="Ustawienia artykułu"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
