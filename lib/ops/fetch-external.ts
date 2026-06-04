const DEFAULT_TIMEOUT_MS = 12_000;

/** Fetch z limitem czasu — zapobiega wiszącym RSC gdy Celestrak/LL2 nie odpowiada. */
export async function fetchExternal(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } },
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs);
  return fetch(url, { ...init, signal });
}
