import LaunchCard from "@/components/discover/LaunchCard";
import { cn } from "@/lib/cn";
import {
  linkForLaunch,
  type LaunchWssArticleLink,
} from "@/lib/ops/launch-article-bridge";
import { providerAccent } from "@/lib/ops/ops-widget-utils";
import type { OpsLaunch } from "@/lib/ops/types";
import type { CSSProperties } from "react";

type Props = {
  launches: OpsLaunch[];
  primaryId: string | undefined;
  articleLinks: Map<string, LaunchWssArticleLink>;
};

export default function StartyLaunchFeed({ launches, primaryId, articleLinks }: Props) {
  if (launches.length === 0) return null;

  return (
    <ul className="starty-launch-feed">
      {launches.map((launch) => {
        const isPrimary = launch.id === primaryId;

        return (
          <li
            key={launch.id}
            className="starty-launch-feed__item"
            style={
              { "--launch-accent": providerAccent(launch.hue) } as CSSProperties
            }
          >
            {isPrimary ? (
              <span className="starty-launch-tile__badge">
                <span className="live-dot shrink-0" aria-hidden />
                Najbliższy
              </span>
            ) : null}
            <LaunchCard
              launch={launch}
              variant="featured"
              className={cn(
                "starty-launch-tile",
                isPrimary && "starty-launch-tile--primary",
              )}
              wssArticle={linkForLaunch(launch.id, articleLinks)}
            />
          </li>
        );
      })}
    </ul>
  );
}
