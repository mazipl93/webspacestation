"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/profile/Avatar";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const BUCKET = "avatars";

export default function AvatarUploader() {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<SupabaseClient | null>(null);
  if (clientRef.current === null) {
    try {
      clientRef.current = createClient();
    } catch {
      clientRef.current = null;
    }
  }

  if (!user) return null;

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Dozwolone formaty: PNG, JPG, WEBP, GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Maksymalny rozmiar zdjęcia to 3 MB.");
      return;
    }

    const supabase = clientRef.current;
    if (!supabase) {
      setError("Zmiana zdjęcia jest chwilowo niedostępna.");
      return;
    }

    setBusy(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setError("Sesja wygasła. Zaloguj się ponownie.");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${authUser.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) {
        setError("Nie udało się przesłać zdjęcia. Spróbuj ponownie.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) {
        setError("Nie udało się zapisać zdjęcia profilowego.");
        return;
      }

      router.refresh();
    } catch {
      setError("Wystąpił błąd podczas przesyłania.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    const supabase = clientRef.current;
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      if (updateError) {
        setError("Nie udało się usunąć zdjęcia.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <div className="relative">
        <Avatar name={user.name} src={user.avatarUrl} size={72} squared />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Zmień zdjęcie profilowe"
          title="Zmień zdjęcie profilowe"
          className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl border border-hairline bg-space-card text-text-secondary shadow-lg transition-all duration-300 hover:border-hairline-strong hover:text-text-primary active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {user.avatarUrl && (
        <button
          type="button"
          onClick={removePhoto}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-muted transition-colors duration-200 hover:text-accent-live disabled:opacity-60"
        >
          <Trash2 size={12} />
          Usuń zdjęcie
        </button>
      )}

      {error && (
        <span className="text-[11.5px] text-accent-live" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
