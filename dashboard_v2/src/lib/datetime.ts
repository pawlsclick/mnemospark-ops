/**
 * Dashboard timestamps from the API are ISO-8601 strings (typically UTC, e.g. ending in Z).
 * We display them in the viewer's local timezone via Intl; the formatted string notes local vs UTC.
 */
export function formatDashboardDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const mo = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${mo}-${day}T${h}:${min} (local)`;
}

export function formatDashboardDateUtc(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}Z`;
}

export function msAgoIso(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

export const TIME_RANGE_HELP =
  "Backend window uses each field’s timeRange.from (ISO UTC) through now when to is omitted.";
