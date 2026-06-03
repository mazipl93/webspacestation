/** Minimum lead time before scheduled publish (clock skew + UX). */
export const SCHEDULE_MIN_LEAD_MS = 60_000;

const DATETIME_LOCAL_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** Build local Date from `YYYY-MM-DD` + `HH:mm` (24h, browser local TZ). */
export function localDateFromParts(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/** Parse `datetime-local` string as local civil time (not UTC). */
export function parseDatetimeLocal(local: string): Date | null {
  const m = local.trim().match(DATETIME_LOCAL_RE);
  if (!m) return null;
  const d = localDateFromParts(
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    Number(m[4]),
    Number(m[5])
  );
  return Number.isFinite(d.getTime()) ? d : null;
}

/** ISO UTC → value for date/time inputs (`YYYY-MM-DDTHH:mm`, local). */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Local `datetime-local` / combined string → ISO for API. */
export function datetimeLocalToIso(local: string): string | null {
  const d = parseDatetimeLocal(local);
  return d ? d.toISOString() : null;
}

export function splitDatetimeLocal(local: string): { date: string; time: string } {
  if (!local.includes("T")) return { date: "", time: "" };
  const [date, timePart] = local.split("T");
  return { date: date ?? "", time: (timePart ?? "").slice(0, 5) };
}

export function combineDatetimeLocal(date: string, time: string): string {
  if (!date.trim() || !time.trim()) return "";
  return `${date.trim()}T${time.trim().slice(0, 5)}`;
}

/** `HH:mm` → parts for 24h dropdowns (no AM/PM). */
export function splitTime24(time: string): { hour: string; minute: string } {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return { hour: "", minute: "" };
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { hour: "", minute: "" };
  }
  return {
    hour: String(hour).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
  };
}

export function combineTime24(hour: string, minute: string): string {
  if (!hour || !minute) return "";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);

export const MINUTES_60 = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

/** Polish month names — avoids DD/MM confusion from native date pickers. */
export const MONTHS_PL: { value: string; label: string }[] = [
  { value: "01", label: "styczeń" },
  { value: "02", label: "luty" },
  { value: "03", label: "marzec" },
  { value: "04", label: "kwiecień" },
  { value: "05", label: "maj" },
  { value: "06", label: "czerwiec" },
  { value: "07", label: "lipiec" },
  { value: "08", label: "sierpień" },
  { value: "09", label: "wrzesień" },
  { value: "10", label: "październik" },
  { value: "11", label: "listopad" },
  { value: "12", label: "grudzień" },
];

export function splitDateIso(date: string): {
  year: string;
  month: string;
  day: string;
} {
  const m = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { year: "", month: "", day: "" };
  return { year: m[1], month: m[2], day: m[3] };
}

export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

/** `YYYY-MM-DD` from dropdown parts (local civil calendar). */
export function combineDateIso(
  year: string,
  month: string,
  day: string
): string {
  if (!year || !month || !day) return "";
  const y = Number(year);
  const mo = Number(month);
  const d = Number(day);
  if (!Number.isFinite(y) || mo < 1 || mo > 12 || d < 1) return "";
  const maxDay = daysInMonth(y, mo);
  if (d > maxDay) return "";
  const probe = new Date(y, mo - 1, d);
  if (
    probe.getFullYear() !== y ||
    probe.getMonth() !== mo - 1 ||
    probe.getDate() !== d
  ) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)}`;
}

export function todayDateParts(): { year: string; month: string; day: string } {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return {
    year: String(n.getFullYear()),
    month: pad(n.getMonth() + 1),
    day: pad(n.getDate()),
  };
}

export function scheduleYearOptions(now = new Date()): string[] {
  const y = now.getFullYear();
  return [String(y), String(y + 1)];
}

/** Unambiguous label for errors (e.g. „3 czerwca 2026, 22:05”). */
export function formatScheduleLabel(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthName = MONTHS_PL[d.getMonth()]?.label ?? pad(d.getMonth() + 1);
  return `${d.getDate()} ${monthName} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type ScheduleLocalValidation =
  | { ok: true; at: Date; iso: string }
  | { ok: false; message: string };

/** True when stored `publishAt` (ISO) has passed — ready to publish. */
export function isPublishScheduleDue(
  publishAtIso: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!publishAtIso?.trim()) return false;
  const t = new Date(publishAtIso).getTime();
  return Number.isFinite(t) && t <= now.getTime();
}

/** Client-side check before „Zaplanuj” (same rules as server). */
export function validateScheduleLocal(
  local: string,
  now: Date = new Date()
): ScheduleLocalValidation {
  const at = parseDatetimeLocal(local);
  if (!at) {
    return { ok: false, message: "Podaj datę i godzinę publikacji (format 24h)." };
  }
  const iso = at.toISOString();
  if (at.getTime() < now.getTime() + SCHEDULE_MIN_LEAD_MS) {
    return {
      ok: false,
      message: `Termin musi być co najmniej 1 minutę w przyszłości (teraz: ${formatScheduleLabel(now)}, wybrane: ${formatScheduleLabel(at)}).`,
    };
  }
  return { ok: true, at, iso };
}
