/** Maps Supabase Auth API errors to Polish copy for forms. */
export function mapSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("email rate limit exceeded")) {
    return "Wysłano zbyt wiele wiadomości e-mail w krótkim czasie. Poczekaj ok. godzinę i spróbuj ponownie.";
  }
  if (lower.includes("over_email_send_rate_limit")) {
    return "Poczekaj chwilę przed kolejną prośbą o e-mail (limit Supabase).";
  }
  if (message === "Invalid login credentials") {
    return "Nieprawidłowy e-mail lub hasło.";
  }
  if (message === "Email not confirmed") {
    return "Potwierdź adres e-mail, zanim się zalogujesz. Sprawdź swoją skrzynkę.";
  }
  if (/already registered|already exists/i.test(message)) {
    return "Konto z tym adresem e-mail już istnieje. Zaloguj się.";
  }
  if (/password/i.test(message) && /weak|short|least/i.test(message)) {
    return "Hasło jest zbyt słabe. Użyj co najmniej 8 znaków.";
  }

  return message;
}
