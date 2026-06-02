"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, X, Loader2, CornerDownLeft, LogOut, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { SITE_CONTAINER } from "@/lib/site-layout";
import { matchesArticle } from "@/lib/search";
import type { AdminArticle } from "@/lib/admin/types";
import { useAuth } from "@/components/auth/AuthProvider";
import AccountMenu from "@/components/auth/AccountMenu";
import LogoutButton from "@/components/auth/LogoutButton";
import Avatar from "@/components/profile/Avatar";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import { useNotifications } from "@/hooks/useNotifications";

const NAV_LINKS = [
  { label: "Aktualności", href: "/aktualnosci" },
  { label: "Misje", href: "/misje" },
  { label: "Astronomia", href: "/astronomia" },
  { label: "Technologie", href: "/technologie" },
] as const;

const CATEGORY_LINKS = [
  { label: "Ziemia z kosmosu", href: "/ziemia-z-kosmosu" },
  { label: "ISS", href: "/iss" },
] as const;

const MORE_LINKS = [
  { label: "Galeria zdjęć", href: "/galeria" },
  { label: "Wideo", href: "/wideo" },
  { label: "Kalendarz startów", href: "/kalendarz" },
  { label: "Mapa kosmosu", href: "/mapa" },
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Wraps every case-insensitive occurrence of `query` in the text with an
// accent-coloured <mark> (no background — just emphasis), so users can see
// exactly what matched in the preview.
function Highlight({ text, query }: { text: string; query: string }) {
  const term = query.trim();
  if (term.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "ig"));
  const lower = term.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <mark key={i} className="bg-transparent font-semibold text-accent-cyan">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Navbar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // searchOpen = mounted; searchShown = animated-in. Splitting them lets us
  // play both an open AND a close transition instead of an instant unmount.
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchShown, setSearchShown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [catalogue, setCatalogue] = useState<AdminArticle[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fetchStarted = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasUnread: hasUnreadNotifications } = useNotifications();

  // Preserve where the user is so login/register can return them here.
  const redirectQuery =
    pathname && pathname !== "/" ? `?redirectTo=${encodeURIComponent(pathname)}` : "";
  const loginHref = `/logowanie${redirectQuery}`;
  const registerHref = `/rejestracja${redirectQuery}`;

  function isActive(href: string) {
    // Aktualności is active both on /aktualnosci and on any article page
    return pathname === href || pathname.startsWith(href + "/");
  }

  function openSearch() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setNotificationsOpen(false);
    setSearchOpen(true);
    // Next frame: flip to the shown state so the transition actually animates.
    requestAnimationFrame(() => setSearchShown(true));
  }

  function closeSearch() {
    setSearchShown(false);
    setActiveIndex(-1);
    // Unmount after the exit transition so the close isn't an abrupt cut.
    closeTimer.current = window.setTimeout(() => {
      setSearchOpen(false);
      setQuery("");
      setDebouncedQuery("");
      closeTimer.current = null;
    }, 160);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    closeSearch();
  }

  function gotoArticle(slug: string) {
    router.push(`/aktualnosci/${slug}`);
    closeSearch();
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
      return;
    }
    if (previewResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % previewResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? previewResults.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      gotoArticle(previewResults[activeIndex].slug);
    }
  }

  useEffect(() => {
    setMoreOpen(false);
    setCategoriesOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lazily fetch the published catalogue the first time search is opened.
  useEffect(() => {
    if (!searchOpen || fetchStarted.current) return;
    fetchStarted.current = true;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/articles", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { data: AdminArticle[] };
        if (active) setCatalogue(json.data);
      } catch {
        if (active) setCatalogue([]); // fail soft — preview just stays empty
      }
    })();
    return () => {
      active = false;
    };
  }, [searchOpen]);

  // Debounce the live query so we filter on a settled value, not every
  // keystroke. Results are derived from `debouncedQuery`, so the dropdown keeps
  // showing the previous matches while typing — no per-keystroke flicker.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 180);
    return () => window.clearTimeout(id);
  }, [query]);

  // Reset the keyboard cursor whenever the result set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  // Clear any pending close timer on unmount.
  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const previewResults = useMemo(() => {
    if (!catalogue || debouncedQuery.length < 2) return [];
    const q = debouncedQuery.toLowerCase();
    return catalogue.filter((a) => matchesArticle(a, q)).slice(0, 5);
  }, [catalogue, debouncedQuery]);

  const previewLoading =
    searchOpen && debouncedQuery.length >= 2 && catalogue === null;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="border-b transition-colors duration-500"
        style={{
          background: scrolled ? "rgba(5,7,9,0.72)" : "rgba(5,7,9,0.4)",
          borderColor: scrolled ? "var(--hairline)" : "transparent",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <div className={cn(SITE_CONTAINER, "flex h-[4.25rem] items-center gap-3 sm:h-16 sm:gap-4 xl:gap-5")}>
          {/* ── Logo + brand ───────────────────────────────────── */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-[#1a4fd0] shadow-[0_4px_16px_-4px_rgba(47,109,255,0.7)] transition-transform duration-500 group-hover:scale-105 sm:h-9 sm:w-9">
              <RocketIcon />
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </div>
            <div className="leading-none">
              <span className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-extrabold uppercase tracking-[0.12em] text-text-primary sm:text-[14px]">
                  WSS
                </span>
                <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary xl:inline">
                  Web Space Station
                </span>
              </span>
              <span className="mt-1 block text-[10px] font-medium tracking-[0.04em] text-accent-cyan sm:text-[9.5px]">
                Wiadomości kosmiczne na żywo
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ────────────────────────────────────── */}
          <nav className="ml-1 hidden min-w-0 flex-1 items-center lg:flex">
            <div className="flex min-w-0 items-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-300 hover:bg-glass-hover hover:text-text-primary xl:px-3 xl:text-[13px]",
                    isActive(link.href)
                      ? "text-text-primary after:absolute after:inset-x-2.5 after:-bottom-[1px] after:h-[2px] after:rounded-full after:bg-accent-blue xl:after:inset-x-3"
                      : "text-text-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="relative">
                <button
                  onClick={() => {
                    setCategoriesOpen((v) => !v);
                    setMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-300 hover:bg-glass-hover hover:text-text-primary xl:px-3 xl:text-[13px]",
                    CATEGORY_LINKS.some((l) => isActive(l.href))
                      ? "text-text-primary"
                      : "text-text-secondary"
                  )}
                >
                  Kategorie
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-300",
                      categoriesOpen && "rotate-180"
                    )}
                  />
                </button>

                {categoriesOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setCategoriesOpen(false)}
                    />
                    <div
                      className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-hairline p-1.5 shadow-2xl"
                      style={{
                        background: "rgba(12,16,24,0.92)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                      }}
                    >
                      {CATEGORY_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setCategoriesOpen(false)}
                          className="block whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:bg-glass-hover hover:text-text-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setMoreOpen((v) => !v);
                    setCategoriesOpen(false);
                  }}
                  className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-text-secondary transition-colors duration-300 hover:bg-glass-hover hover:text-text-primary xl:px-3 xl:text-[13px]"
                >
                  Więcej
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform duration-300", moreOpen && "rotate-180")}
                  />
                </button>

              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div
                    className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-hairline p-1.5 shadow-2xl"
                    style={{
                      background: "rgba(12,16,24,0.92)",
                      backdropFilter: "blur(24px) saturate(180%)",
                      WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    }}
                  >
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-[13px] text-text-secondary transition-colors duration-200 hover:bg-glass-hover hover:text-text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
              </div>
            </div>
          </nav>

          {/* ── Right actions ──────────────────────────────────── */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <button
                aria-label="Szukaj"
                aria-expanded={searchOpen}
                onClick={() => (searchOpen ? closeSearch() : openSearch())}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-colors duration-300 hover:bg-glass-hover hover:text-text-primary"
              >
                <Search size={18} strokeWidth={2} />
              </button>

              {searchOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeSearch} />
                  <div
                    role="dialog"
                    aria-label="Szukaj artykułów"
                    className={cn(
                      "absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-hairline p-2 shadow-2xl transition-all duration-150 ease-out",
                      searchShown
                        ? "translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                    )}
                    style={{
                      background: "rgba(12,16,24,0.92)",
                      backdropFilter: "blur(24px) saturate(180%)",
                      WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    }}
                  >
                    <form onSubmit={submitSearch}>
                      <div className="relative">
                        <Search
                          size={15}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          autoFocus
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={onSearchKeyDown}
                          role="combobox"
                          aria-expanded={previewResults.length > 0}
                          aria-controls="navbar-search-results"
                          placeholder="Szukaj artykułów…"
                          className="w-full rounded-lg border border-hairline bg-black/30 py-2.5 pl-9 pr-3 text-[13px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-accent-blue/60"
                        />
                      </div>
                    </form>

                    {/* ── Live preview (top 5) ── */}
                    {debouncedQuery.length >= 2 && (
                      <div
                        id="navbar-search-results"
                        role="listbox"
                        className="mt-2 border-t border-hairline-faint pt-2"
                      >
                        {previewLoading ? (
                          <div className="flex items-center gap-2 px-2 py-3 text-[12px] text-text-tertiary">
                            <Loader2 size={14} className="animate-spin" />
                            Szukam…
                          </div>
                        ) : previewResults.length === 0 ? (
                          <p className="px-2 py-3 text-[12px] text-text-muted">
                            Brak podpowiedzi dla „{debouncedQuery}”.
                          </p>
                        ) : (
                          <ul className="flex flex-col">
                            {previewResults.map((a, i) => (
                              <li key={a.id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={i === activeIndex}
                                  onClick={() => gotoArticle(a.slug)}
                                  onMouseEnter={() => setActiveIndex(i)}
                                  className={cn(
                                    "flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
                                    i === activeIndex ? "bg-glass-hover" : "hover:bg-glass-hover"
                                  )}
                                >
                                  <span className="line-clamp-1 text-[13px] font-medium text-text-primary">
                                    <Highlight text={a.title} query={debouncedQuery} />
                                  </span>
                                  <span className="text-[10.5px] uppercase tracking-[0.1em] text-text-muted">
                                    {a.category.name}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
                            closeSearch();
                          }}
                          className="mt-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12px] font-medium text-accent-cyan transition-colors duration-150 hover:bg-glass-hover"
                        >
                          Zobacz wszystkie wyniki
                          <CornerDownLeft size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-label="Powiadomienia"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchShown(false);
                  setNotificationsOpen((v) => !v);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-colors duration-300 hover:bg-glass-hover hover:text-text-primary"
              >
                <Bell size={18} strokeWidth={2} />
                {hasUnreadNotifications && (
                  <span
                    aria-hidden="true"
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-blue ring-2 ring-[#05070d]"
                  />
                )}
              </button>
              <NotificationsPopover
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                loginHref={loginHref}
              />
            </div>

            {authLoading ? (
              <div
                aria-hidden="true"
                className="ml-1.5 hidden h-9 w-[148px] animate-pulse rounded-lg bg-glass sm:block"
              />
            ) : user ? (
              <div className="ml-1.5 hidden sm:block">
                <AccountMenu />
              </div>
            ) : (
              <>
                <Link
                  href={registerHref}
                  className="ml-1.5 hidden items-center rounded-lg px-3 py-2 text-[12.5px] font-semibold text-text-secondary transition-colors duration-300 hover:bg-glass-hover hover:text-text-primary sm:flex"
                >
                  Zarejestruj się
                </Link>
                <Link
                  href={loginHref}
                  className="ml-1 hidden items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_4px_20px_-4px_rgba(47,109,255,0.6)] active:scale-[0.97] sm:flex"
                >
                  Zaloguj się
                </Link>
              </>
            )}

            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-glass-hover hover:text-text-primary lg:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="border-b border-hairline lg:hidden"
          style={{
            background: "rgba(5,7,9,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <nav className={cn(SITE_CONTAINER, "flex flex-col py-3")}>
            {[...NAV_LINKS, ...CATEGORY_LINKS, ...MORE_LINKS].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-[48px] items-center border-b border-hairline-faint text-[17px] font-medium transition-colors last:border-0 hover:text-text-primary md:text-[16px]",
                  isActive(link.href) ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-lg border border-hairline bg-glass px-3 py-2.5">
                  <Avatar name={user.name} src={user.avatarUrl} size={32} squared />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-text-primary">
                      {user.name}
                    </p>
                    <p className="truncate text-[11.5px] text-text-muted">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/profil"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary"
                >
                  <User size={16} />
                  Profil
                </Link>
                <LogoutButton
                  next="/"
                  formClassName="w-full"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition-colors hover:border-accent-live/60 hover:text-accent-live"
                >
                  <LogOut size={16} />
                  Wyloguj się
                </LogoutButton>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href={loginHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-white"
                >
                  Zaloguj się
                </Link>
                <Link
                  href={registerHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-hairline px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary"
                >
                  Zarejestruj się
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function RocketIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C12 2 7 6 7 13H17C17 6 12 2 12 2Z" fill="white" fillOpacity="0.96" />
      <path d="M9 13V17C9 17 10.5 19 12 19C13.5 19 15 17 15 17V13H9Z" fill="white" fillOpacity="0.72" />
      <path d="M9 17L7 20M15 17L17 20" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="10" r="1.5" fill="#2f6dff" />
    </svg>
  );
}
