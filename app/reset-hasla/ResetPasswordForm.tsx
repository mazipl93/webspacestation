"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapSupabaseAuthError } from "@/lib/auth/supabase-auth-errors";
import { redirectAfterAuth } from "@/lib/auth/login-redirect";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

const MIN_PASSWORD = 8;

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD) {
      setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`);
      return;
    }
    if (password !== confirm) {
      setError("Hasła nie są identyczne.");
      return;
    }
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Sesja wygasła. Poproś o nowy link resetujący.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(mapSupabaseAuthError(updateError.message));
      return;
    }

    setDone(true);
    setTimeout(() => redirectAfterAuth("/logowanie"), 1200);
  }

  if (done) {
    return (
      <div className="text-center text-[14px] text-text-secondary">
        Hasło zostało zmienione. Przekierowujemy do logowania…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Banner tone="error">{error}</Banner> : null}

      <Field label="Nowe hasło" htmlFor="reset-password" hint={`Minimum ${MIN_PASSWORD} znaków.`}>
        <TextInput
          id="reset-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Powtórz hasło" htmlFor="reset-confirm">
        <TextInput
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          placeholder="••••••••"
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Field>

      <Button type="submit" disabled={loading} className="mt-1 w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Zapisywanie…
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Ustaw nowe hasło
          </>
        )}
      </Button>

      <p className="text-center text-[13px] text-text-tertiary">
        Link wygasł?{" "}
        <Link
          href="/zapomnialem-hasla"
          className="font-semibold text-accent-cyan transition-colors hover:text-text-primary"
        >
          Wyślij nowy
        </Link>
      </p>
    </form>
  );
}
