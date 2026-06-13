"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import ArticleCardSkeleton from "@/components/article/ArticleCardSkeleton";
import type { AdminArticle } from "@/lib/admin/types";
import { matchesArticle, toNewsCard } from "@/lib/search";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [input, setInput] = useState(query);
  const [articles, setArticles] = useState<AdminArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the input in sync when the URL query changes (e.g. via navbar search).
  useEffect(() => {
    setInput(query);
  }, [query]);

  // Fetch the published catalogue once, then filter client-side.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/articles", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { data: AdminArticle[] };
        if (active) setArticles(json.data);
      } catch {
        if (active) setError("Nie udało się pobrać artykułów.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!articles || !query) return [];
    const q = query.toLowerCase();
    return articles.filter((a) => matchesArticle(a, q));
  }, [articles, query]);

  const loading = articles === null && !error;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <>
      {/* ── Header ── */}
      <div
        className="border-b border-hairline"
        style={{
          background:
            "radial-gradient(ellipse 70% 140% at 0% 0%, #2f6dff12 0%, transparent 56%), var(--color-space-bg)",
        }}
      >
        <div className="container-site pb-6 pt-28">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-1.5 text-[11px] text-text-tertiary"
          >
            <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
              WSS
            </Link>
            <ChevronRight size={11} className="opacity-40" />
            <span className="text-text-secondary">Szukaj</span>
          </nav>

          <h1
            className="font-extrabold text-text-primary"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
          >
            Szukaj artykułów
          </h1>

          <form onSubmit={submit} className="mt-5 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Wpisz frazę, np. Starship, JWST, Falcon…"
                className="w-full rounded-xl border border-hairline bg-black/25 py-3 pl-10 pr-4 text-[14px] text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20"
              />
            </div>
            <button
              type="submit"
              className="whitespace-nowrap rounded-xl bg-accent-blue px-5 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover active:scale-[0.98]"
            >
              Szukaj
            </button>
          </form>

          {query ? (
            <p className="mt-4 text-[13px] text-text-tertiary">
              {loading
                ? "Wyszukiwanie…"
                : `${results.length} ${results.length === 1 ? "wynik" : "wyników"} dla „${query}”`}
            </p>
          ) : null}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="container-site py-9">
        {error ? (
          <div className="card-surface px-8 py-16 text-center">
            <p className="text-[14px] text-text-secondary">{error}</p>
          </div>
        ) : !query ? (
          <div className="card-surface px-8 py-16 text-center">
            <p className="text-[14px] text-text-secondary">
              Wpisz frazę powyżej, aby wyszukać artykuły.
            </p>
          </div>
        ) : loading ? (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <span className="sr-only">Ładowanie wyników…</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="card-surface px-8 py-16 text-center">
            <p className="text-[14px] text-text-secondary">
              Brak wyników dla „{query}”.
            </p>
            <Link
              href="/aktualnosci"
              className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-medium text-accent-cyan hover:underline"
            >
              Przeglądaj wszystkie artykuły
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArticleCard key={a.id} article={toNewsCard(a)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
