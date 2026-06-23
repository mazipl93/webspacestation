import type { Metadata } from "next";
import { ToolPageJsonLd } from "@/components/seo/InteractiveToolSeo";
import { getInteractiveTool } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import ZorzaClient from "./ZorzaClient";

const TOOL = getInteractiveTool("aurora-terminal");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ZorzaPage() {
  return (
    <>
      <ToolPageJsonLd tool={TOOL} />
      <ZorzaClient />
    </>
  );
}
