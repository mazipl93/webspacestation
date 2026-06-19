import Link from "next/link";
import { ChevronRight, Radio } from "lucide-react";
import OpsLaunchPausedBackdrop from "@/components/discover/OpsLaunchPausedBackdrop";
import OpsPreviewBadge from "@/components/discover/OpsPreviewBadge";
import { cn } from "@/lib/cn";
import { STARTY_SCHEDULE_HREF } from "@/lib/ops/discover-data";
import {
  OPS_LAUNCH_FEED_PAUSED_BODY,
  OPS_LAUNCH_FEED_PAUSED_TITLE,
} from "@/lib/ops/ops-outage-copy";

type Props = {
  className?: string;
};

export default function OpsLaunchFeedPaused({ className }: Props) {
  return (
    <div className={cn("ops-launch-paused min-w-0", className)}>
      <OpsLaunchPausedBackdrop />

      <div className="ops-launch-paused__inner">
        <div className="ops-launch-paused__icon" aria-hidden>
          <Radio size={22} className="text-accent-cyan/70" />
        </div>

        <div className="min-w-0 flex-1">
          <OpsPreviewBadge variant="paused" />
          <p className="ops-launch-paused__title">{OPS_LAUNCH_FEED_PAUSED_TITLE}</p>
          <p className="ops-launch-paused__body">{OPS_LAUNCH_FEED_PAUSED_BODY}</p>
          <Link
            href={STARTY_SCHEDULE_HREF}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-cyan transition-colors hover:text-text-primary"
          >
            Pełny harmonogram
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
