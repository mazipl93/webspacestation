import type { OpsCalendarEvent, OpsLaunch } from "@/lib/ops/types";
import { formatLaunchSummary } from "@/lib/ops/localize-ops";

const QUARTER_LABEL: Record<number, string> = {
  0: "Q1",
  1: "Q1",
  2: "Q1",
  3: "Q2",
  4: "Q2",
  5: "Q2",
  6: "Q3",
  7: "Q3",
  8: "Q3",
  9: "Q4",
  10: "Q4",
  11: "Q4",
};

export function buildCalendarFromLaunches(launches: OpsLaunch[]): OpsCalendarEvent[] {
  const sorted = [...launches].sort(
    (a, b) => new Date(a.net).getTime() - new Date(b.net).getTime()
  );

  return sorted.slice(0, 8).map((l, index) => {
    const d = new Date(l.net);
    const quarter = QUARTER_LABEL[d.getUTCMonth()] ?? "Q1";
    const dateStr = new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(d);
    const dateLabel = new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(d);

    return {
      id: l.id,
      quarter,
      dateLabel,
      title: l.mission,
      hint: `${dateStr} UTC · ${formatLaunchSummary(l)}`,
      active: false,
      net: l.net,
    };
  });
}
