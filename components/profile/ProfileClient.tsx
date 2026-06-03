"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { useBookmarks } from "@/hooks/useBookmarks";
import { LIKES_CHANGE_EVENT } from "@/lib/likes/events";
import { fetchMyLikedSlugs } from "@/lib/likes/supabase-likes";
import { createClient } from "@/lib/supabase/client";
import { toNewsCard } from "@/lib/search";
import type { AdminArticle } from "@/lib/admin/types";
import type { NewsArticle } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";
import AvatarUploader from "@/components/profile/AvatarUploader";
import AccountSettings from "@/components/profile/AccountSettings";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-b border-hairline"
      style={{
        background:
          "radial-gradient(ellipse 70% 140% at 0% 0%, #2f6dff12 0%, transparent 56%), var(--color-space-bg)",
      }}
    >
      <div className="container-site min-h-[calc(100vh-160px)] pb-14 pt-[96px]">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-hairline px-5 py-10 text-center text-[13px] text-text-muted">
      {children}
    </p>
  );
}

function ArticleGrid({
  loading,
  articles,
  empty,
}: {
  loading: boolean;
  articles: NewsArticle[];
  empty: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[320px] animate-pulse rounded-xl border border-hairline bg-glass"
          />
        ))}
      </div>
    );
  }
  if (articles.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default function ProfileClient() {
  const { user, loading } = useAuth();
  const { slugs: bookmarkSlugs } = useBookmarks();

  const [catalogue, setCatalogue] = useState<AdminArticle[] | null>(null);
  const [likedSlugs, setLikedSlugs] = useState<string[]>([]);
  const [likesLoading, setLikesLoading] = useState(true);

  // Load the published catalogue once so we can resolve saved/liked slugs.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/articles", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { data: AdminArticle[] };
        if (active) setCatalogue(json.data);
      } catch {
        if (active) setCatalogue([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Liked slugs from Supabase (per account), synced after toggle on article page.
  useEffect(() => {
    if (!user) {
      setLikedSlugs([]);
      setLikesLoading(false);
      return;
    }

    let active = true;
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
    } catch {
      setLikesLoading(false);
      return;
    }

    const sync = async () => {
      setLikesLoading(true);
      const slugs = await fetchMyLikedSlugs(supabase!);
      if (active) {
        setLikedSlugs(slugs);
        setLikesLoading(false);
      }
    };

    sync();
    window.addEventListener(LIKES_CHANGE_EVENT, sync);
    return () => {
      active = false;
      window.removeEventListener(LIKES_CHANGE_EVENT, sync);
    };
  }, [user]);

  const cardBySlug = useMemo(() => {
    const map = new Map<string, NewsArticle>();
    (catalogue ?? []).forEach((a) => map.set(a.slug, toNewsCard(a)));
    return map;
  }, [catalogue]);

  const savedArticles = useMemo(
    () => bookmarkSlugs.map((s) => cardBySlug.get(s)).filter(Boolean) as NewsArticle[],
    [bookmarkSlugs, cardBySlug]
  );
  const likedArticles = useMemo(
    () => likedSlugs.map((s) => cardBySlug.get(s)).filter(Boolean) as NewsArticle[],
    [likedSlugs, cardBySlug]
  );

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[920px] space-y-6">
          <div className="h-32 animate-pulse rounded-2xl border border-hairline bg-glass" />
          <div className="h-48 animate-pulse rounded-2xl border border-hairline bg-glass" />
        </div>
      </PageShell>
    );
  }

  // Server page already verified the session; if client state lags, offer re-login.
  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[920px] rounded-2xl border border-hairline bg-glass px-6 py-10 text-center">
          <p className="text-[15px] text-text-secondary">
            Nie udało się wczytać sesji w przeglądarce.
          </p>
          <Link
            href="/logowanie?redirectTo=%2Fprofil"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-accent-blue px-5 py-2.5 text-[14px] font-semibold text-white"
          >
            Zaloguj się ponownie
          </Link>
        </div>
      </PageShell>
    );
  }

  const catalogueLoading = catalogue === null;

  return (
    <PageShell>
      <div className="mx-auto max-w-[920px]">
        {/* ── Account header ── */}
        <section className="card-surface p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <AvatarUploader />
              <div className="min-w-0 text-center sm:text-left">
                <h1 className="truncate text-[22px] font-extrabold tracking-[-0.02em] text-text-primary">
                  {user.name}
                </h1>
                <p className="mt-1 truncate text-[13px] text-text-muted">{user.email}</p>
              </div>
            </div>

            <LogoutButton
              next="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-hairline px-4 py-2.5 text-[13px] font-semibold text-text-secondary transition-colors duration-300 hover:border-accent-live/60 hover:text-accent-live"
            >
              <LogOut size={15} />
              Wyloguj się
            </LogoutButton>
          </div>
        </section>

        {/* ── Account settings ── */}
        <section className="mt-8">
          <div className="mb-5 flex items-center gap-2.5">
            <Settings size={17} className="text-accent-cyan" />
            <h2 className="text-[16px] font-bold text-text-primary">Ustawienia konta</h2>
          </div>
          <AccountSettings />
        </section>

        {/* ── Saved articles ── */}
        <section className="mt-10">
          <div className="mb-5 flex items-center gap-2.5">
            <Bookmark size={17} className="text-accent-cyan" />
            <h2 className="text-[16px] font-bold text-text-primary">Zapisane artykuły</h2>
            <span className="text-[12px] text-text-muted">· {savedArticles.length}</span>
          </div>
          <ArticleGrid
            loading={catalogueLoading}
            articles={savedArticles}
            empty={
              <>
                Nie masz jeszcze zapisanych artykułów. Kliknij ikonę zakładki na dowolnym
                artykule, aby zapisać go na później.
              </>
            }
          />
        </section>

        {/* ── Liked articles ── */}
        <section className="mt-10">
          <div className="mb-5 flex items-center gap-2.5">
            <Heart size={17} className="text-accent-live" />
            <h2 className="text-[16px] font-bold text-text-primary">Polubione artykuły</h2>
            <span className="text-[12px] text-text-muted">· {likedArticles.length}</span>
          </div>
          <ArticleGrid
            loading={catalogueLoading || likesLoading}
            articles={likedArticles}
            empty={
              <>
                Nie polubiłeś jeszcze żadnego artykułu. Użyj „Lubię to” na stronie artykułu —
                lista synchronizuje się z Twoim kontem.
              </>
            }
          />
          <p className="mt-4 text-[11.5px] text-text-muted">
            <Link href="/aktualnosci" className="text-accent-cyan hover:underline">
              Przeglądaj wszystkie artykuły
            </Link>
          </p>
        </section>
      </div>
    </PageShell>
  );
}
