"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TabId = "lista" | "harmonogram";

type Props = {
  listaPanel: ReactNode;
  harmonogramPanel: ReactNode;
};

function tabFromHash(): TabId {
  if (typeof window === "undefined") return "lista";
  return window.location.hash === "#harmonogram" ? "harmonogram" : "lista";
}

export default function StartyPageTabsClient({
  listaPanel,
  harmonogramPanel,
}: Props) {
  const [tab, setTab] = useState<TabId>("lista");

  useEffect(() => {
    const initial = tabFromHash();
    setTab(initial);
    if (initial === "harmonogram") {
      requestAnimationFrame(() => {
        document.getElementById("harmonogram")?.scrollIntoView({ block: "start" });
      });
    }
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selectTab = useCallback((next: TabId) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "harmonogram") {
      url.hash = "harmonogram";
    } else {
      url.hash = "";
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return (
    <div className="starty-tabs">
      <div
        className="starty-tabs__switcher"
        role="tablist"
        aria-label="Widok startów rakiet"
      >
        <button
          type="button"
          role="tab"
          id="starty-tab-lista"
          aria-selected={tab === "lista"}
          aria-controls="starty-panel-lista"
          className={cn(
            "starty-tabs__btn",
            tab === "lista" && "starty-tabs__btn--active",
          )}
          onClick={() => selectTab("lista")}
        >
          Nadchodzące starty
        </button>
        <button
          type="button"
          role="tab"
          id="starty-tab-harmonogram"
          aria-selected={tab === "harmonogram"}
          aria-controls="harmonogram"
          className={cn(
            "starty-tabs__btn",
            tab === "harmonogram" && "starty-tabs__btn--active",
          )}
          onClick={() => selectTab("harmonogram")}
        >
          Harmonogram
        </button>
      </div>

      <div
        role="tabpanel"
        id="starty-panel-lista"
        aria-labelledby="starty-tab-lista"
        hidden={tab !== "lista"}
        className="starty-tabs__panel"
      >
        {listaPanel}
      </div>

      <div
        role="tabpanel"
        id="harmonogram"
        aria-labelledby="starty-tab-harmonogram"
        hidden={tab !== "harmonogram"}
        className="starty-tabs__panel starty-tabs__panel--harmonogram scroll-mt-28"
      >
        {harmonogramPanel}
      </div>
    </div>
  );
}
