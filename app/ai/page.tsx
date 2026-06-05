import { permanentRedirect } from "next/navigation";

/** Legacy /ai — merged into technologie (docs/WSS_CONTENT_ARCHITECTURE.md). */
export default function AiPageRedirect() {
  permanentRedirect("/technologie");
}
