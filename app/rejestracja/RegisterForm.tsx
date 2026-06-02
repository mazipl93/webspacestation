"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  provisionSessionUser,
  redirectAfterAuth,
  safeRedirectPath,
} from "@/lib/auth/login-redirect";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function mapError(message: string): string {
  if (/already registered|already exists/i.test(message)) {
    return "Konto z tym adresem e-mail już istnieje. Zaloguj się.";
  }
  if (/password/i.test(message) && /weak|short|least/i.test(message)) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`;
  }
  return message;
}

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const loginHref =
    redirectTo && redirectTo !== "/"
      ? `/logowanie?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/logowanie";

  function validate(): string | null {
    if (!EMAIL_RE.test(email.trim())) return "Podaj poprawny adres e-mail.";
    if (password.length < MIN_PASSWORD)
      return `Hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`;
    if (password !== confirm) return "Hasła nie są identyczne.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Rejestracja jest chwilowo niedostępna. Spróbuj ponownie później.");
      setLoading(false);
      return;
    }

    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : undefined;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() || email.trim().split("@")[0] },
        emailRedirectTo,
      },
    });

    if (signUpError) {
      setError(mapError(signUpError.message));
      setLoading(false);
      return;
    }

    // If Supabase requires email confirmation, no session is returned — show a
    // "check your inbox" state. Otherwise the user is signed in immediately.
    if (!data.session) {
      setConfirmSent(true);
      setLoading(false);
      return;
    }

    await provisionSessionUser();
    redirectAfterAuth(redirectTo);
  };

  if (confirmSent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
          <CheckCircle2 size={22} />
        </span>
        <div>
          <h2 className="text-[15px] font-bold text-text-primary">
            Sprawdź swoją skrzynkę
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
            Wysłaliśmy link potwierdzający na adres{" "}
            <span className="font-medium text-text-primary">{email.trim()}</span>.
            Kliknij go, aby aktywować konto, a następnie zaloguj się.
          </p>
        </div>
        <Link
          href={loginHref}
          className="font-semibold text-accent-cyan transition-colors hover:text-text-primary"
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Banner tone="error">{error}</Banner> : null}

      <Field label="Nazwa użytkownika" htmlFor="name">
        <TextInput
          id="name"
          type="text"
          autoComplete="nickname"
          value={name}
          placeholder="np. Jan Kowalski"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

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

      <Field label="Hasło" htmlFor="password" hint={`Minimum ${MIN_PASSWORD} znaków.`}>
        <TextInput
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Powtórz hasło" htmlFor="confirm">
        <TextInput
          id="confirm"
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
            Tworzenie konta…
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Załóż konto
          </>
        )}
      </Button>

      <p className="mt-1 text-center text-[13px] text-text-tertiary">
        Masz już konto?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-accent-cyan transition-colors hover:text-text-primary"
        >
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
