/**
 * Na Vercel SSR czyta wyłącznie ops_cache_entries (Supabase).
 * Zewnętrzne API (LL2, ISS, NASA) tylko w cronie / npm run ops:refresh.
 */
export function shouldFetchExternalOpsOnSsr(): boolean {
  if (process.env.OPS_SSR_FETCH_EXTERNAL === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.VERCEL === "1") return false;
  return false;
}
