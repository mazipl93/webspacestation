"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/admin/primitives";

type Props = {
  articleId: string | null;
  disabled?: boolean;
  onInsertImage: (src: string, caption: string) => void;
};

export default function ContentImageInserter({
  articleId,
  disabled = false,
  onInsertImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promptCaption = useCallback((): string | null => {
    for (;;) {
      const raw =
        window.prompt(
          "Podpis pod grafiką (wymagany — tuż pod obrazem na stronie)",
          ""
        ) ?? null;
      if (raw === null) return null;
      const trimmed = raw.trim();
      if (trimmed) return trimmed;
      window.alert("Podpis jest wymagany — wpisz krótki opis grafiki.");
    }
  }, []);

  const insertFromUrl = useCallback(() => {
    setError(null);
    const url = window.prompt("URL grafiki (PNG, JPG, WebP…)", "https://");
    if (!url?.trim()) return;
    const caption = promptCaption();
    if (caption === null) return;
    onInsertImage(url.trim(), caption);
  }, [onInsertImage, promptCaption]);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
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
          error?: { message?: string };
        } | null;

        if (!res.ok) {
          setError(json?.error?.message ?? "Upload nie powiódł się.");
          return;
        }

        const url = json?.data?.url?.trim();
        if (!url) {
          setError("Brak URL w odpowiedzi serwera.");
          return;
        }

        const caption = promptCaption();
        if (caption === null) return;
        onInsertImage(url, caption);
      } catch {
        setError("Błąd sieci podczas uploadu.");
      } finally {
        setBusy(false);
      }
    },
    [articleId, onInsertImage, promptCaption]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          className="justify-center px-2.5 py-2 text-meta sm:w-fit"
          disabled={disabled || busy}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <ImagePlus size={14} aria-hidden />
          )}
          Upload grafiki
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="justify-center px-2.5 py-2 text-meta sm:w-fit"
          disabled={disabled || busy}
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertFromUrl}
        >
          <Link2 size={14} aria-hidden />
          Link do grafiki
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          disabled={disabled || busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-[10px] text-text-muted">
        W treści: linia z URL + podpis w następnej linii (jeden blok). Składnia:{" "}
        <code className="text-text-tertiary">![podpis](url)</code> lub{" "}
        <code className="text-text-tertiary">![](url)</code> + podpis poniżej.
      </p>
      {error ? (
        <p className="text-caption text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
