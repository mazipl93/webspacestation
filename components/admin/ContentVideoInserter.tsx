"use client";

import { useCallback, useId, useState } from "react";
import { Video, X } from "lucide-react";
import { Button, Field, TextInput } from "@/components/admin/primitives";
import { resolveVideoEmbedUrl } from "@/lib/articles/content-video";

type Props = {
  disabled?: boolean;
  onInsertVideo: (src: string, caption: string) => void;
};

export default function ContentVideoInserter({
  disabled = false,
  onInsertVideo,
}: Props) {
  const urlInputId = useId();
  const captionInputId = useId();
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setOpen(false);
    setUrlInput("");
    setCaptionInput("");
    setError(null);
  }, []);

  const confirm = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Podaj poprawny URL (YouTube lub Vimeo).");
      return;
    }
    if (!resolveVideoEmbedUrl(trimmed)) {
      setError("Obsługujemy linki YouTube i Vimeo.");
      return;
    }
    onInsertVideo(trimmed, captionInput.trim());
    reset();
  }, [captionInput, onInsertVideo, reset, urlInput]);

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-center px-2.5 py-2 text-meta sm:w-fit"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Video size={14} aria-hidden />
        Dodaj wideo
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-hairline bg-white/[0.02] p-3 sm:max-w-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-text-primary">Wideo z linku</p>
        <button
          type="button"
          className="rounded-md p-1 text-text-muted hover:text-text-primary"
          aria-label="Zamknij"
          onClick={reset}
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <Field label="URL (YouTube / Vimeo)" htmlFor={urlInputId}>
          <TextInput
            id={urlInputId}
            value={urlInput}
            placeholder="https://www.youtube.com/watch?v=…"
            onChange={(e) => setUrlInput(e.target.value)}
          />
        </Field>
        <Field label="Podpis (opcjonalnie)" htmlFor={captionInputId}>
          <TextInput
            id={captionInputId}
            value={captionInput}
            placeholder="Krótki opis materiału"
            onChange={(e) => setCaptionInput(e.target.value)}
          />
        </Field>
        {error ? (
          <p className="text-[11px] text-accent-live" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="primary" className="text-meta" onClick={confirm}>
            Wstaw w treść
          </Button>
          <Button type="button" variant="ghost" className="text-meta" onClick={reset}>
            Anuluj
          </Button>
        </div>
      </div>
    </div>
  );
}
