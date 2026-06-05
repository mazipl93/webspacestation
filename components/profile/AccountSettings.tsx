"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, KeyRound, Loader2, Trash2, UserRound } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { clearBookmarksForEmail } from "@/hooks/useBookmarks";
import { Banner, Button, Field, TextInput } from "@/components/admin/primitives";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Feedback = { tone: "success" | "error" | "info"; message: string } | null;

function useSupabase() {
  const ref = useRef<SupabaseClient | null>(null);
  if (ref.current === null) {
    try {
      ref.current = createClient();
    } catch {
      ref.current = null;
    }
  }
  return ref.current;
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5 transition-colors duration-300 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline bg-glass text-accent-cyan">
          {icon}
        </span>
        <div>
          <h3 className="text-[14px] font-bold text-text-primary">{title}</h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function NameForm() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const dirty = name.trim() !== (user?.name ?? "") && name.trim().length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !dirty) return;
    setBusy(true);
    setFeedback(null);
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    setBusy(false);
    if (error) {
      setFeedback({ tone: "error", message: "Nie udało się zapisać nazwy." });
      return;
    }
    setFeedback({ tone: "success", message: "Nazwa została zaktualizowana." });
    await fetch("/api/profile/sync", { method: "POST" }).catch(() => undefined);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {feedback && <Banner tone={feedback.tone}>{feedback.message}</Banner>}
      <Field label="Nazwa wyświetlana" htmlFor="settings-name">
        <TextInput
          id="settings-name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Jan Kowalski"
        />
      </Field>
      <div>
        <Button type="submit" disabled={busy || !dirty}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Zapisz nazwę
        </Button>
      </div>
    </form>
  );
}

function EmailForm() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const next = email.trim();
    if (!EMAIL_RE.test(next)) {
      setFeedback({ tone: "error", message: "Podaj poprawny adres e-mail." });
      return;
    }
    if (next.toLowerCase() === (user?.email ?? "").toLowerCase()) {
      setFeedback({ tone: "error", message: "To jest Twój obecny adres e-mail." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await supabase.auth.updateUser(
      { email: next },
      { emailRedirectTo }
    );
    setBusy(false);
    if (error) {
      setFeedback({
        tone: "error",
        message: "Nie udało się zmienić adresu e-mail. Spróbuj ponownie.",
      });
      return;
    }
    setEmail("");
    setFeedback({
      tone: "info",
      message:
        "Wysłaliśmy link potwierdzający na nowy adres. Zmiana zostanie zastosowana po jego kliknięciu.",
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      {feedback && <Banner tone={feedback.tone}>{feedback.message}</Banner>}
      <Field label="Obecny e-mail" htmlFor="settings-email-current">
        <TextInput id="settings-email-current" value={user?.email ?? ""} disabled />
      </Field>
      <Field label="Nowy e-mail" htmlFor="settings-email-new">
        <TextInput
          id="settings-email-new"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nowy@example.com"
        />
      </Field>
      <div>
        <Button type="submit" disabled={busy || !email.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Zmień e-mail
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (next.length < MIN_PASSWORD) {
      setFeedback({
        tone: "error",
        message: `Nowe hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`,
      });
      return;
    }
    if (next !== confirm) {
      setFeedback({ tone: "error", message: "Hasła nie są identyczne." });
      return;
    }

    setBusy(true);
    setFeedback(null);

    // Verify the current password by re-authenticating before changing it.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: current,
    });
    if (signInError) {
      setBusy(false);
      setFeedback({ tone: "error", message: "Obecne hasło jest nieprawidłowe." });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (updateError) {
      setFeedback({ tone: "error", message: "Nie udało się zmienić hasła." });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setFeedback({ tone: "success", message: "Hasło zostało zmienione." });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      {feedback && <Banner tone={feedback.tone}>{feedback.message}</Banner>}
      <Field label="Obecne hasło" htmlFor="settings-pass-current">
        <TextInput
          id="settings-pass-current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Field
        label="Nowe hasło"
        htmlFor="settings-pass-new"
        hint={`Minimum ${MIN_PASSWORD} znaków.`}
      >
        <TextInput
          id="settings-pass-new"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Field label="Powtórz nowe hasło" htmlFor="settings-pass-confirm">
        <TextInput
          id="settings-pass-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <div>
        <Button
          type="submit"
          disabled={busy || !current || !next || !confirm}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Zmień hasło
        </Button>
      </div>
    </form>
  );
}

function DeleteAccountForm() {
  const { user, signOut } = useAuth();
  const supabase = useSupabase();
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [eligibility, setEligibility] = useState<{
    allowed: boolean;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/account/delete", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return;
        setEligibility(json as { allowed: boolean; reason?: string });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user?.email || eligibility?.allowed === false) return;
    if (!confirmed) {
      setFeedback({
        tone: "error",
        message: "Zaznacz potwierdzenie, że rozumiesz skutki usunięcia konta.",
      });
      return;
    }

    setBusy(true);
    setFeedback(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (signInError) {
      setBusy(false);
      setFeedback({ tone: "error", message: "Hasło jest nieprawidłowe." });
      return;
    }

    const res = await fetch("/api/account/delete", {
      method: "POST",
      credentials: "same-origin",
    });
    setBusy(false);

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setFeedback({
        tone: "error",
        message:
          json?.error?.message ??
          "Nie udało się usunąć konta. Spróbuj ponownie później.",
      });
      return;
    }

    clearBookmarksForEmail(user.email);
    signOut("/");
  }

  const blocked = eligibility?.allowed === false;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      {eligibility === null ? (
        <p className="text-[12px] text-text-muted">Sprawdzanie uprawnień…</p>
      ) : blocked ? (
        <Banner tone="info">{eligibility.reason}</Banner>
      ) : (
        <>
          {feedback && <Banner tone={feedback.tone}>{feedback.message}</Banner>}
          <p className="text-[12px] leading-relaxed text-text-muted">
            Usunięcie konta jest trwałe. Znikną komentarze, polubienia,
            subskrypcje działów, zdjęcie profilowe i dane logowania.
          </p>
          <Field label="Hasło" htmlFor="settings-delete-password">
            <TextInput
              id="settings-delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-text-secondary">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline accent-accent-live"
            />
            <span>
              Rozumiem, że tej operacji nie można cofnąć i chcę trwale usunąć
              konto wraz ze wszystkimi danymi.
            </span>
          </label>
          <div>
            <Button
              type="submit"
              variant="danger"
              disabled={busy || !password || !confirmed}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Usuń konto
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

export default function AccountSettings() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SettingsCard
        icon={<UserRound size={16} />}
        title="Nazwa profilu"
        description="Tak będziesz widoczny w komentarzach i na profilu."
      >
        <NameForm />
      </SettingsCard>

      <SettingsCard
        icon={<AtSign size={16} />}
        title="Adres e-mail"
        description="Zmiana wymaga potwierdzenia przez link wysłany na nowy adres."
      >
        <EmailForm />
      </SettingsCard>

      <div className="lg:col-span-2">
        <SettingsCard
          icon={<KeyRound size={16} />}
          title="Hasło"
          description="Dla bezpieczeństwa potwierdź zmianę obecnym hasłem."
        >
          <PasswordForm />
        </SettingsCard>
      </div>

      <div className="lg:col-span-2">
        <SettingsCard
          icon={<Trash2 size={16} />}
          title="Usuń konto"
          description="Trwałe usunięcie konta i wszystkich powiązanych danych (RODO)."
        >
          <DeleteAccountForm />
        </SettingsCard>
      </div>
    </div>
  );
}
