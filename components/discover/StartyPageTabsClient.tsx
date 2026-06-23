"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  listaPanel: ReactNode;
};

export default function StartyPageTabsClient({ listaPanel }: Props) {
  useEffect(() => {
    // Redirect any lingering #harmonogram hash to the base URL
    if (typeof window !== "undefined" && window.location.hash === "#harmonogram") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return <div className="starty-tabs">{listaPanel}</div>;
}
