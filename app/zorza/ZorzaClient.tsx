"use client";

import dynamic from "next/dynamic";

const AuroraTerminal = dynamic(() => import("@/components/aurora/AuroraTerminal"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center text-slate-500 font-mono text-sm"
      style={{ background: "linear-gradient(160deg, #020408 0%, #060810 45%, #030608 100%)" }}
    >
      Ladowanie terminala zorzy…
    </div>
  ),
});

export default function ZorzaClient() {
  return <AuroraTerminal />;
}
