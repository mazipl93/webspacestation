"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { Button, Field, TextInput } from "@/components/admin/primitives";
import { normalizeCoverImageUrl } from "@/lib/media/cover-url";

type Props = {
  articleId: string | null;
  disabled?: boolean;
  onInsertImage: (src: string, caption: string) => void;
};

type PanelMode = "closed" | "link" | "caption";

export default function ContentImageInserter({
  articleId,
  disabled = false,
  onInsertImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const urlInputId = useId();
  const captionInputId = useId();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelMode>("closed");
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);

  const resetPanel = useCallback(() => {
    setPanel("closed");
    setUrlInput("");
    setCaptionInput("");
    setPendingSrc(null);
    setError(null);
  }, []);

  const submitInsert = useCallback(
    (src: string, caption: string) => {
      const trimmedCaption = caption.trim();
      if (!trimmedCaption) {
        setError("Podpis jest wymagany — wpisz krótki opis grafiki.");
        return;
      }
      onInsertImage(src, trimmedCaption);
      resetPanel();
    },
    [onInsertImage, resetPanel]
  );

  const openLinkForm = useCallback(() => {
    setError(null);
    setUrlInput("");
    setCaptionInput("");
    setPendingSrc(null);
    setPanel("link");
  }, []);

  const confirmLink = useCallback(() => {
    const normalized = normalizeCoverImageUrl(urlInput);
    if (!normalized) {
      setError("Podaj poprawny URL grafiki (http:// lub https://).");
      return;
    }
    submitInsert(normalized, captionInput);
  }, [captionInput, submitInsert, urlInput]);

  const confirmCaption = useCallback(() => {
    if (!pendingSrc) {
      resetPanel();
      return;
    }
    submitInsert(pendingSrc, captionInput);
  }, [captionInput, pendingSrc, resetPanel, submitInsert]);

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

        setPendingSrc(url);
        setCaptionInput("");
        setPanel("caption");
      } catch {
        setError("Błąd sieci podczas uploadu.");
      } finally {
        setBusy(false);
      }
    },
    [articleId]
  );

  const panelOpen = panel !== "closed";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          className="justify-center px-2.5 py-2 text-meta sm:w-fit"
          disabled={disabled || busy || panelOpen}
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
          disabled={disabled || busy || panelOpen}
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkForm}
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

      {panel === "link" ? (
        <div className="flex flex-col gap-3 rounded-[0.6rem] border border-hairline bg-[#090d13] p-3">
          <Field label="URL grafiki" htmlFor={urlInputId}>
            <TextInput
              id={urlInputId}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://…"
              value={urlInput}
              disabled={disabled}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmLink();
                }
                if (e.key === "Escape") resetPanel();
              }}
            />
          </Field>
          <Field
            label="Podpis pod grafiką"
            htmlFor={captionInputId}
            hint="Wyświetlany tuż pod obrazem na stronie artykułu."
          >
            <TextInput
              id={captionInputId}
              type="text"
              placeholder="Krótki opis grafiki"
              value={captionInput}
              disabled={disabled}
              onChange={(e) => setCaptionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmLink();
                }
                if (e.key === "Escape") resetPanel();
              }}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              className="px-2.5 py-2 text-meta"
              disabled={disabled}
              onClick={confirmLink}
            >
              Wstaw grafikę
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="px-2.5 py-2 text-meta"
              disabled={disabled}
              onClick={resetPanel}
            >
              Anuluj
            </Button>
          </div>
        </div>
      ) : null}

      {panel === "caption" ? (
        <div className="flex flex-col gap-3 rounded-[0.6rem] border border-hairline bg-[#090d13] p-3">
          <p className="text-caption text-text-secondary">
            Grafika przesłana. Dodaj podpis przed wstawieniem do treści.
          </p>
          <Field
            label="Podpis pod grafiką"
            htmlFor={captionInputId}
            hint="Wyświetlany tuż pod obrazem na stronie artykułu."
          >
            <TextInput
              id={captionInputId}
              type="text"
              placeholder="Krótki opis grafiki"
              value={captionInput}
              disabled={disabled}
              autoFocus
              onChange={(e) => setCaptionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmCaption();
                }
                if (e.key === "Escape") resetPanel();
              }}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              className="px-2.5 py-2 text-meta"
              disabled={disabled}
              onClick={confirmCaption}
            >
              Wstaw grafikę
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="px-2.5 py-2 text-meta"
              disabled={disabled}
              onClick={resetPanel}
            >
              Anuluj
            </Button>
          </div>
        </div>
      ) : null}

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
