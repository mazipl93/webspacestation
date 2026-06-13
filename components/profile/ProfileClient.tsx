"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, LayoutDashboard, LogOut, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { useBookmarks } from "@/hooks/useBookmarks";
import { LIKES_CHANGE_EVENT } from "@/lib/likes/events";
import { fetchMyLikedSlugs } from "@/lib/likes/supabase-likes";
import { createClient } from "@/lib/supabase/client";
import { toNewsCard } from "@/lib/search";
import { SITE_CONTAINER } from "@/lib/site-layout";
import type { AdminArticle } from "@/lib/admin/types";
import type { NewsArticle } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";
import AvatarUploader from "@/components/profile/AvatarUploader";
import AccountSettings from "@/components/profile/AccountSettings";
import ProfileDepartmentSubscriptions from "@/components/profile/ProfileDepartmentSubscriptions";
import ProfileSectionHeading from "@/components/profile/ProfileSectionHeading";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-b border-hairline"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 10% -10%, rgba(47,109,255,0.14) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 0%, rgba(56,189,248,0.08) 0%, transparent 50%), var(--color-space-bg)",
      }}
    >
      <div className={`${SITE_CONTAINER} min-h-[calc(100vh-160px)] pb-16 pt-28`}>
        {children}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className="flex min-w-[7.5rem] flex-col rounded-xl border border-hairline px-4 py-3"
      style={{ background: "var(--glass-fill)" }}
    >
      <span className="text-[22px] font-extrabold tabular-nums tracking-tight text-text-primary">
        {value}
      </span>
      <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
        {label}
      </span>
    </div>
  );
}

function EmptyState({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-glass/40 px-6 py-12 text-center">
      <p className="mx-auto max-w-[420px] text-[14px] leading-relaxed text-text-muted">{children}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-accent-blue px-5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-blue-hover"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
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
  if (articles.length === 0) return <>{empty}</>;
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
        <div className="mx-auto max-w-[960px] space-y-6">
          <div className="h-40 animate-pulse rounded-2xl border border-hairline bg-glass" />
          <div className="h-48 animate-pulse rounded-2xl border border-hairline bg-glass" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[560px] rounded-2xl border border-hairline bg-glass px-6 py-10 text-center">
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
      <div className="mx-auto max-w-[960px]">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-[11px] text-text-tertiary"
        >
          <Link href="/" className="transition-colors hover:text-text-primary">
            WSS
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-text-secondary">Twój profil</span>
        </nav>

        <section className="relative overflow-hidden rounded-2xl border border-hairline">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 120% at 0% 0%, rgba(47,109,255,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 80% at 100% 20%, rgba(56,189,248,0.1) 0%, transparent 50%)",
            }}
          />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <AvatarUploader avatarSize={88} />
                <div className="min-w-0 text-center sm:text-left">
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-cyan">
                    <Sparkles size={11} />
                    Konto
                  </span>
                  <h1 className="truncate text-[clamp(1.35rem,4vw,1.75rem)] font-extrabold tracking-[-0.03em] text-text-primary">
                    {user.name}
                  </h1>
                  <p className="mt-1.5 truncate text-[13px] text-text-muted">{user.email}</p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[200px]">
                {user.canAccessCms ? (
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-blue-hover"
                  >
                    <LayoutDashboard size={16} />
                    Panel redakcyjny
                  </Link>
                ) : null}
                <LogoutButton
                  next="/"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-hairline bg-black/20 px-4 py-2.5 text-[13px] font-semibold text-text-secondary transition-colors duration-300 hover:border-accent-live/50 hover:text-accent-live"
                >
                  <LogOut size={15} />
                  Wyloguj się
                </LogoutButton>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <StatChip label="Zapisane" value={savedArticles.length} accent="#38bdf8" />
              <StatChip label="Polubione" value={likedSlugs.length} accent="#f87171" />
            </div>
          </div>
        </section>

        <ProfileDepartmentSubscriptions />

        <section className="mt-10">
          <ProfileSectionHeading
            icon={Settings}
            title="Ustawienia konta"
            accentClassName="text-accent-cyan"
          />
          <AccountSettings />
        </section>

        <section className="mt-12">
          <ProfileSectionHeading
            icon={Bookmark}
            title="Zapisane artykuły"
            count={savedArticles.length}
          />
          <ArticleGrid
            loading={catalogueLoading}
            articles={savedArticles}
            empty={
              <EmptyState
                action={{ href: "/aktualnosci", label: "Przeglądaj aktualności" }}
              >
                Nie masz jeszcze zapisanych artykułów. Kliknij ikonę zakładki na stronie artykułu,
                aby wrócić do niego później.
              </EmptyState>
            }
          />
        </section>

        <section className="mt-12">
          <ProfileSectionHeading
            icon={Heart}
            title="Polubione artykuły"
            count={likedSlugs.length}
            accentClassName="text-accent-live"
          />
          <ArticleGrid
            loading={catalogueLoading || likesLoading}
            articles={likedArticles}
            empty={
              <EmptyState action={{ href: "/aktualnosci", label: "Znajdź artykuły" }}>
                Nie polubiłeś jeszcze żadnego artykułu. Użyj „Lubię to” na stronie artykułu — lista
                synchronizuje się z Twoim kontem.
              </EmptyState>
            }
          />
        </section>
      </div>
    </PageShell>
  );
}
