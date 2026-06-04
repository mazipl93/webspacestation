import { BELOW_FIXED_NAV_OFFSET_CLASS } from "@/lib/site-layout";
import { cn } from "@/lib/cn";

/** Odstęp jak na portalu (homepage + artykuł) — podgląd CMS desktop. */
export default function ArticlePreviewNavStub({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-hairline bg-[#050709]/98 backdrop-blur-md",
        compact
          ? "h-10 px-3"
          : `${BELOW_FIXED_NAV_OFFSET_CLASS} items-end px-4 pb-2`
      )}
      aria-hidden
    >
      <span className="text-[11px] font-semibold tracking-wide text-text-muted">
        WSS · podgląd (nav)
      </span>
    </div>
  );
}
