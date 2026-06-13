import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { getInteractiveTool } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { buildInteractiveToolJsonLd } from "@/lib/seo/json-ld";

const TOOL = getInteractiveTool("aurora-terminal");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export default function AuroraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-root" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
      <JsonLd
        data={buildInteractiveToolJsonLd(TOOL, [
          { name: "Strona główna", path: "/" },
          { name: "Odkrywaj", path: "/starty" },
          { name: TOOL.headline, path: TOOL.path },
        ])}
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      {children}
    </div>
  );
}
