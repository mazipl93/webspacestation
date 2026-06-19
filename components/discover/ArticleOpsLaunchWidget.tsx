import Link from "next/link";
import { ChevronRight, Rocket } from "lucide-react";
import OpsCountdownHero from "@/components/discover/OpsCountdownHero";
import { STARTY_SCHEDULE_HREF } from "@/lib/ops/discover-data";
import { cn } from "@/lib/cn";
import { isOpsLaunchImminent } from "@/lib/ops/ops-widget-utils";
import type { OpsLaunch } from "@/lib/ops/types";

type Props = {
  launch: OpsLaunch;
  className?: string;
};

export default function ArticleOpsLaunchWidget({ launch, className }: Props) {
  const imminent = isOpsLaunchImminent(launch.net);

  return (
    <aside
      className={cn(
        "article-ops-launch-widget card-surface overflow-hidden p-4",
        imminent && "article-ops-launch-widget--imminent",
        className,
      )}
      aria-label="Powiązany start w harmonogramie WSS"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-glass text-accent-cyan">
          <Rocket size={15} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
            Harmonogram WSS
          </p>
          <p className="truncate text-[13px] font-bold text-text-primary">
            {launch.mission}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-text-tertiary">
        {[launch.provider, launch.rocketName].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-3 rounded-lg border border-hairline bg-glass/30 px-3 py-2.5">
        <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {launch.phase === "countdown" || launch.phase === "hold"
            ? "Start za"
            : "Status"}
        </p>
        <OpsCountdownHero
          net={launch.net}
          phase={launch.phase}
          imminent={imminent}
        />
      </div>

      <Link
        href={STARTY_SCHEDULE_HREF}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-cyan transition-colors hover:text-text-primary"
      >
        Pełny harmonogram startów
        <ChevronRight size={13} />
      </Link>
    </aside>
  );
}
