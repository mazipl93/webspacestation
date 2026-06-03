"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

type Props = {
  articleId: string | null;
  coverUrl: string;
  onCoverUrl: (url: string) => void;
  disabled?: boolean;
};

function parseUploadError(body: unknown): string {
  if (body && typeof body === "object") {
    const err = (body as { error?: { message?: string }; message?: string }).error;
    const fromError = err?.message;
    if (typeof fromError === "string" && fromError.trim()) return fromError;
    const direct = (body as { message?: string }).message;
    if (typeof direct === "string" && direct.trim()) return direct;
  }
  return "Nie udało się przesłać okładki.";
}

export default function CoverImageUploader({
  articleId,
  coverUrl,
  onCoverUrl,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_BYTES) {
        setError("Maksymalny rozmiar pliku to 25 MB (przed kompresją).");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Dozwolone formaty: JPG, PNG, WEBP, GIF.");
        return;
      }

      setBusy(true);
      try {
        const body = new FormData();
        body.set("file", file);
        if (articleId) body.set("articleId", articleId);

        const res = await fetch("/api/admin/cover-upload", {
          method: "POST",
          body,
        });
        const json = (await res.json().catch(() => null)) as {
          data?: { url?: string };
          message?: string;
        } | null;

        if (!res.ok) {
          setError(parseUploadError(json));
          return;
        }

        const url = json?.data?.url?.trim();
        if (!url) {
          setError("Brak URL okładki w odpowiedzi serwera.");
          return;
        }
        onCoverUrl(url);
      } catch {
        setError("Błąd sieci podczas przesyłania.");
      } finally {
        setBusy(false);
      }
    },
    [articleId, onCoverUrl]
  );

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={disabled || busy ? -1 : 0}
        aria-disabled={disabled || busy}
        aria-label="Prześlij okładkę artykułu"
        onKeyDown={(e) => {
          if (disabled || busy) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (!disabled && !busy) inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || busy) return;
          onFiles(e.dataTransfer.files);
        }}
        className={cn(
          "grid aspect-video w-full cursor-pointer place-items-center gap-2 rounded-[0.6rem] border border-dashed px-4 py-6 text-center transition-colors duration-200",
          dragOver
            ? "border-accent-cyan/60 bg-accent-cyan/5"
            : "border-hairline hover:border-hairline-strong hover:bg-white/[0.02]",
          (disabled || busy) && "pointer-events-none opacity-60"
        )}
      >
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-accent-cyan" aria-hidden />
            <p className="text-caption text-text-secondary">Kompresja do WebP i upload…</p>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-text-tertiary" aria-hidden />
            <p className="text-caption text-text-secondary">
              Przeciągnij zdjęcie lub kliknij, aby wybrać
            </p>
            <p className="text-[10px] text-text-muted">
              JPG, PNG, WEBP, GIF · max 25 MB · zapis jako WebP (do 1920 px)
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={disabled || busy}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="text-caption text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt="Podgląd okładki"
          className="aspect-video w-full rounded-[0.6rem] border border-hairline object-cover"
        />
      ) : (
        <div className="grid aspect-video w-full place-items-center rounded-[0.6rem] border border-hairline bg-black/20 text-caption text-text-muted">
          Brak okładki
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <Upload className="h-3 w-3 shrink-0" aria-hidden />
        Możesz też wkleić URL zewnętrzny w polu poniżej.
      </p>
    </div>
  );
}
