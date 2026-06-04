import type { OpsCalendarEvent, OpsLaunch } from "@/lib/ops/types";

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
  const now = new Date();
  const currentQ = QUARTER_LABEL[now.getUTCMonth()] ?? "Q1";

  return launches.slice(0, 8).map((l) => {
    const d = new Date(l.net);
    const quarter = QUARTER_LABEL[d.getUTCMonth()] ?? "Q1";
    const dateStr = new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);

    const rocket = l.rocketName ? ` · ${l.rocketName}` : "";
    return {
      id: l.id,
      quarter,
      title: `${l.mission}\n${l.provider}${rocket}`,
      hint: `${dateStr} · ${l.site}`,
      active: quarter === currentQ,
      net: l.net,
    };
  });
}
