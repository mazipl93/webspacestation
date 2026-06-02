"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  provisionSessionUser,
  redirectAfterAuth,
  safeRedirectPath,
} from "@/lib/auth/login-redirect";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"), "/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Nieprawidłowy e-mail lub hasło."
          : signInError.message
      );
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
          placeholder="redakcja@wss.space"
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
    </form>
  );
}
