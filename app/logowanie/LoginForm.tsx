"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthCallbackLoginError } from "@/lib/auth/auth-callback";
import {
  provisionSessionUser,
  redirectAfterAuth,
  safeRedirectPath,
} from "@/lib/auth/login-redirect";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

import { mapSupabaseAuthError } from "@/lib/auth/supabase-auth-errors";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    mapAuthCallbackLoginError(searchParams.get("error"))
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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(mapSupabaseAuthError(signInError.message));
      setLoading(false);
      return;
    }

    await provisionSessionUser();
    redirectAfterAuth(redirectTo);
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

      <p className="-mt-1 text-right">
        <Link
          href="/zapomnialem-hasla"
          className="text-[12.5px] font-medium text-accent-cyan transition-colors hover:text-text-primary"
        >
          Zapomniałeś hasła?
        </Link>
      </p>

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
