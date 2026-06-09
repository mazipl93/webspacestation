/** User-facing message when Supabase like RPC/view is missing or fails. */
export function articleLikeErrorMessage(raw: string): string {
  const msg = raw.toLowerCase();
  if (
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("toggle_article_like") ||
    msg.includes("toggle_anon_article_like")
  ) {
    return "Polubienia nie są jeszcze skonfigurowane na serwerze. Daj znać redakcji.";
  }
  if (msg.includes("authentication required") || msg.includes("jwt")) {
    return "Sesja wygasła — odśwież stronę i spróbuj ponownie.";
  }
  return "Nie udało się zapisać polubienia. Spróbuj ponownie.";
}
