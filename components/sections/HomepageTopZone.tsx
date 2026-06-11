import { cn } from "@/lib/cn";
import {
  BELOW_FIXED_NAV_OFFSET_CLASS,
  HOMEPAGE_HERO_DOUBLE_GRID,
  HOMEPAGE_LAYOUT_V2,
  LATEST_DESKTOP_STRIP_LIMIT,
} from "@/lib/site-layout";
import type { WeekTopicConfig, WeekTopicPick } from "@/lib/home/week-topic";
import type { NewsArticle } from "@/types";
import HomepageHeroSlider from "@/components/sections/HomepageHeroSlider";
import HomepageOpsStrip from "@/components/sections/HomepageOpsStrip";
import LatestShowcase from "@/components/sections/LatestShowcase";
import WeekTopicSection from "@/components/sections/WeekTopicSection";

const LATEST_MOBILE_LIST_LIMIT = 6;

type Props = {
  heroSlides: NewsArticle[];
  latest: NewsArticle[];
  weekTopicPick: WeekTopicPick;
  weekTopicConfig: WeekTopicConfig;
};

function HomepageTopZoneV2({
  heroSlides,
  latest,
  weekTopicPick,
  weekTopicConfig,
}: Props) {
  const latestStrip = latest.slice(0, LATEST_DESKTOP_STRIP_LIMIT);
  const latestMobile = latest.slice(0, LATEST_MOBILE_LIST_LIMIT);
  const hasWeekTopic = weekTopicPick.articles.length > 0;

  return (
    <div className={BELOW_FIXED_NAV_OFFSET_CLASS}>
      <HomepageHeroSlider articles={heroSlides} />

      <HomepageOpsStrip />

      <div className="mt-5 hidden lg:block">
        <LatestShowcase articles={latestStrip} variant="strip" />
      </div>

      <div className="mt-3 max-lg:scroll-mt-4 lg:hidden">
        <LatestShowcase
          articles={latestMobile}
          variant="list"
          mobileShell
          peekBelowHero
        />
      </div>

      {hasWeekTopic ? (
        <div className="mt-7 max-lg:mt-6">
          <WeekTopicSection
            articles={weekTopicPick.articles}
            config={weekTopicConfig}
            variant="slider"
          />
        </div>
      ) : null}
    </div>
  );
}

function HomepageTopZoneLegacy({
  heroSlides,
  latest,
  weekTopicPick,
  weekTopicConfig,
}: Props) {
  const latestRail = latest.slice(0, 5);
  const latestMobile = latest.slice(0, LATEST_MOBILE_LIST_LIMIT);
  const hasWeekTopic = weekTopicPick.articles.length > 0;

  return (
    <div className={BELOW_FIXED_NAV_OFFSET_CLASS}>
      <div className={cn("gap-8 lg:items-stretch", HOMEPAGE_HERO_DOUBLE_GRID)}>
        <div className="flex min-w-0 flex-col">
          <HomepageHeroSlider articles={heroSlides} />

          <HomepageOpsStrip />

          {hasWeekTopic ? (
            <div className="mt-6 hidden lg:block">
              <WeekTopicSection
                articles={weekTopicPick.articles}
                config={weekTopicConfig}
                variant="slider"
              />
            </div>
          ) : null}

          <div className="mt-3 max-lg:scroll-mt-4 lg:hidden">
            <LatestShowcase
              articles={latestMobile}
              variant="list"
              mobileShell
              peekBelowHero
            />
          </div>

          {hasWeekTopic ? (
            <div className="mt-8 max-lg:mt-6 lg:hidden">
              <WeekTopicSection
                articles={weekTopicPick.articles}
                config={weekTopicConfig}
                variant="slider"
              />
            </div>
          ) : null}
        </div>

        <aside className="hidden min-w-0 flex-col lg:flex lg:sticky lg:top-[5.25rem] lg:z-[2] lg:max-h-[calc(100vh-5.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-0.5">
          <LatestShowcase articles={latestRail} variant="rail" />
        </aside>
      </div>
    </div>
  );
}

export default function HomepageTopZone(props: Props) {
  return HOMEPAGE_LAYOUT_V2 ? (
    <HomepageTopZoneV2 {...props} />
  ) : (
    <HomepageTopZoneLegacy {...props} />
  );
}
