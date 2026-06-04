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
import WssLogo from "@/components/brand/WssLogo";
import LogoutButton from "@/components/auth/LogoutButton";
import Avatar from "@/components/profile/Avatar";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import { useNotifications } from "@/hooks/useNotifications";
import {
  NAV_OVERLAY_BACKDROP,
  NAV_OVERLAY_PANEL_BASE,
  NAV_OVERLAY_PANEL_POSITION,
  NAV_OVERLAY_PANEL_STYLE,
} from "@/lib/ui/nav-overlay-panel";
import {
  NAV_DESKTOP_ACTIONS,
  NAV_DESKTOP_TRACK,
  navTrackLinkClass,
} from "@/lib/ui/nav-desktop";
import {
  NAV_CATEGORY_LINKS,
  NAV_MOBILE_SECTIONS,
  NAV_MORE_LINKS,
  NAV_PRIMARY_LINKS,
  navLinkAccent,
} from "@/lib/ui/nav-menu-config";
import {
  NavDropdownMenu,
  NavMenuItem,
  NavMenuSectionLabel,
  NavMobileAccordion,
} from "@/components/layout/NavMenuPrimitives";

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
  const [mobileMounted, setMobileMounted] = useState(false);
  const [mobileShown, setMobileShown] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    categories: false,
    more: false,
  });
  const mobileCloseTimer = useRef<number | null>(null);
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
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      if (mobileCloseTimer.current) {
        window.clearTimeout(mobileCloseTimer.current);
        mobileCloseTimer.current = null;
      }
      setMobileMounted(true);
      requestAnimationFrame(() => setMobileShown(true));
      return;
    }
    setMobileShown(false);
    mobileCloseTimer.current = window.setTimeout(() => {
      setMobileMounted(false);
      mobileCloseTimer.current = null;
    }, 220);
  }, [mobileOpen]);

  useEffect(
    () => () => {
      if (mobileCloseTimer.current) window.clearTimeout(mobileCloseTimer.current);
    },
    []
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setCategoriesOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function closeMobileNav() {
    setMobileOpen(false);
  }

  function toggleMobileSection(id: string) {
    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

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
        className="wss-nav-bar"
        data-scrolled={scrolled ? "true" : "false"}
      >
        <div className={cn(SITE_CONTAINER, "flex h-[4.25rem] items-center gap-3 sm:h-16 sm:gap-4")}>
          <WssLogo asLink height={48} className="shrink-0" />

          <span
            aria-hidden
            className="hidden h-7 w-px shrink-0 bg-white/[0.08] lg:block"
          />

          {/* Desktop — pill track (wyśrodkowany) */}
          <nav
            className="hidden min-w-0 flex-1 justify-center lg:flex"
            aria-label="Główne menu"
          >
            <div className={NAV_DESKTOP_TRACK}>
              {NAV_PRIMARY_LINKS.map((link) => {
                const active = isActive(link.href);
                const accent = navLinkAccent(link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navTrackLinkClass(active)}
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-2 bottom-0.5 h-0.5 rounded-full"
                        style={{ background: accent }}
                      />
                    ) : null}
                  </Link>
                );
              })}

              <NavDropdownMenu
                label="Kategorie"
                open={categoriesOpen}
                onToggle={() => {
                  setCategoriesOpen((v) => !v);
                  setMoreOpen(false);
                }}
                onClose={() => setCategoriesOpen(false)}
                active={NAV_CATEGORY_LINKS.some((l) => isActive(l.href))}
                panelWidth="w-[min(100vw-2rem,19rem)]"
              >
                <NavMenuSectionLabel>Działy tematyczne</NavMenuSectionLabel>
                {NAV_CATEGORY_LINKS.map((link, i) => (
                  <NavMenuItem
                    key={link.href}
                    link={link}
                    index={i}
                    onSelect={() => setCategoriesOpen(false)}
                  />
                ))}
              </NavDropdownMenu>

              <NavDropdownMenu
                label="Więcej"
                open={moreOpen}
                onToggle={() => {
                  setMoreOpen((v) => !v);
                  setCategoriesOpen(false);
                }}
                onClose={() => setMoreOpen(false)}
                active={NAV_MORE_LINKS.some((l) => isActive(l.href))}
                panelWidth="w-[min(100vw-2rem,19rem)]"
              >
                <NavMenuSectionLabel>Odkrywaj WSS</NavMenuSectionLabel>
                {NAV_MORE_LINKS.map((link, i) => (
                  <NavMenuItem
                    key={link.href}
                    link={link}
                    index={i}
                    onSelect={() => setMoreOpen(false)}
                  />
                ))}
              </NavDropdownMenu>
            </div>
          </nav>

          <div className={cn("ml-auto flex shrink-0 items-center gap-2", NAV_DESKTOP_ACTIONS)}>
            <div className="relative">
              <button
                aria-label="Szukaj"
                aria-expanded={searchOpen}
                onClick={() => (searchOpen ? closeSearch() : openSearch())}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors duration-200 hover:bg-white/[0.06] hover:text-text-primary"
              >
                <Search size={18} strokeWidth={2} />
              </button>

              {searchOpen && (
                <>
                  <div className={NAV_OVERLAY_BACKDROP} onClick={closeSearch} />
                  <div
                    role="dialog"
                    aria-label="Szukaj artykułów"
                    className={cn(
                      NAV_OVERLAY_PANEL_BASE,
                      NAV_OVERLAY_PANEL_POSITION,
                      "w-full p-2 transition-all duration-150 ease-out sm:w-80",
                      searchShown
                        ? "translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                    )}
                    style={NAV_OVERLAY_PANEL_STYLE}
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
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors duration-200 hover:bg-white/[0.06] hover:text-text-primary"
              >
                <Bell size={17} strokeWidth={2} />
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
                  className="hidden items-center rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary sm:flex"
                >
                  Rejestracja
                </Link>
                <Link
                  href={loginHref}
                  className="hidden items-center rounded-lg bg-accent-blue px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-accent-blue-hover active:scale-[0.98] sm:flex"
                >
                  Zaloguj
                </Link>
              </>
            )}

            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary lg:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer (animowane) ─────────────────────────── */}
      {mobileMounted ? (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ease-out lg:hidden",
              mobileShown ? "opacity-100" : "opacity-0"
            )}
            onClick={closeMobileNav}
            aria-hidden
          />
          <div
            className={cn(
              "relative z-[45] border-b border-hairline transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
              mobileShown
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-3 opacity-0"
            )}
            style={{
              background:
                "linear-gradient(180deg, rgba(8,12,20,0.98) 0%, rgba(5,7,11,0.97) 100%)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
            }}
          >
            <nav className={cn(SITE_CONTAINER, "flex max-h-[min(78vh,640px)] flex-col overflow-y-auto overscroll-contain py-3")}>
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                Artykuły
              </p>
              <ul className="mb-2 flex flex-col gap-0.5">
                {NAV_PRIMARY_LINKS.map((link, i) => {
                  const accent = navLinkAccent(link);
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMobileNav}
                        className={cn(
                          "nav-menu-item-enter flex min-h-[48px] items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
                          active
                            ? "bg-glass-hover text-text-primary"
                            : "text-text-secondary hover:bg-glass/60 hover:text-text-primary"
                        )}
                        style={{ animationDelay: `${i * 35}ms` }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            color: accent,
                            background: `${accent}14`,
                            border: `1px solid ${accent}33`,
                          }}
                        >
                          {Icon ? <Icon size={15} aria-hidden /> : null}
                        </span>
                        <span className="text-[15px] font-semibold">{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {NAV_MOBILE_SECTIONS.filter((s) => s.id !== "primary").map((section) => (
                <NavMobileAccordion
                  key={section.id}
                  label={section.label}
                  links={section.links}
                  open={Boolean(mobileExpanded[section.id])}
                  onToggle={() => toggleMobileSection(section.id)}
                  onNavigate={closeMobileNav}
                  isActive={isActive}
                />
              ))}

              {user ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-hairline-faint pt-4">
                  <div className="flex items-center gap-3 rounded-xl border border-hairline bg-glass px-3 py-2.5">
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
                    onClick={closeMobileNav}
                    className="flex items-center justify-center gap-2 rounded-xl border border-hairline px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary"
                  >
                    <User size={16} />
                    Profil
                  </Link>
                  <LogoutButton
                    next="/"
                    formClassName="w-full"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-hairline px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition-colors hover:border-accent-live/60 hover:text-accent-live"
                  >
                    <LogOut size={16} />
                    Wyloguj się
                  </LogoutButton>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2 border-t border-hairline-faint pt-4">
                  <Link
                    href={loginHref}
                    onClick={closeMobileNav}
                    className="flex items-center justify-center rounded-xl bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-white"
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href={registerHref}
                    onClick={closeMobileNav}
                    className="flex items-center justify-center rounded-xl border border-hairline px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary"
                  >
                    Zarejestruj się
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
