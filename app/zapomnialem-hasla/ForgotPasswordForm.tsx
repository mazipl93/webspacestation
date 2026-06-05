"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapSupabaseAuthError } from "@/lib/auth/supabase-auth-errors";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Podaj poprawny adres e-mail.");
      return;
    }

    setLoading(true);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Reset hasła jest chwilowo niedostępny. Spróbuj ponownie później.");
      setLoading(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-hasla")}`
        : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmed,
      { redirectTo }
    );

    setLoading(false);

    if (resetError) {
      setError(mapSupabaseAuthError(resetError.message));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-[14px] leading-relaxed text-text-secondary">
          Jeśli konto z adresem{" "}
          <span className="font-medium text-text-primary">{email.trim()}</span>{" "}
          istnieje, wysłaliśmy link do ustawienia nowego hasła.
        </p>
        <Link
          href="/logowanie"
          className="font-semibold text-accent-cyan transition-colors hover:text-text-primary"
        >
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Banner tone="error">{error}</Banner> : null}

      <Field label="E-mail" htmlFor="forgot-email">
        <TextInput
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          placeholder="ty@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Button type="submit" disabled={loading} className="mt-1 w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Wysyłanie…
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Wyślij link resetujący
          </>
        )}
      </Button>

      <p className="text-center text-[13px] text-text-tertiary">
        <Link
          href="/logowanie"
          className="font-semibold text-accent-cyan transition-colors hover:text-text-primary"
        >
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
