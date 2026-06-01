"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

// Maps Supabase auth errors to Polish, user-facing copy.
function mapError(message: string): string {
  if (message === "Invalid login credentials") {
    return "Nieprawidłowy e-mail lub hasło.";
  }
  if (message === "Email not confirmed") {
    return "Potwierdź adres e-mail, zanim się zalogujesz. Sprawdź swoją skrzynkę.";
  }
  return message;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "Link logowania wygasł lub jest nieprawidłowy. Spróbuj ponownie."
      : null
  );

  const registerHref =
    redirectTo && redirectTo !== "/"
      ? `/rejestracja?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/rejestracja";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Logowanie jest chwilowo niedostępne. Spróbuj ponownie później.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(mapError(signInError.message));
      setLoading(false);
      return;
    }

    // Sync the new session into Server Components, then continue.
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? <Banner tone="error">{error}</Banner> : null}

      <Field label="E-mail" htmlFor="email">
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          placeholder="ty@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Hasło" htmlFor="password">
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Button type="submit" disabled={loading} className="mt-1 w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logowanie…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Zaloguj się
          </>
        )}
      </Button>

      <p className="mt-1 text-center text-[13px] text-text-tertiary">
        Nie masz konta?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-accent-cyan transition-colors hover:text-text-primary"
        >
          Załóż konto
        </Link>
      </p>
    </form>
  );
}
