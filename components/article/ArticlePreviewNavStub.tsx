import { BELOW_FIXED_NAV_OFFSET_CLASS } from "@/lib/site-layout";

/** Odstęp jak na portalu (homepage + artykuł) — podgląd CMS desktop. */
export default function ArticlePreviewNavStub() {
  return (
    <div
      className={`${BELOW_FIXED_NAV_OFFSET_CLASS} flex shrink-0 items-end border-b border-hairline bg-[#050709]/98 px-4 pb-2 backdrop-blur-md`}
      aria-hidden
    >
      <span className="text-[11px] font-semibold tracking-wide text-text-muted">
        WSS · podgląd (nav)
      </span>
    </div>
  );
}
