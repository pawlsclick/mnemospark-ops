/** ISO UTC `from` for GraphQL TimeRangeInput (open-ended to "now" when `to` is omitted). */
export function dashboardTimeRangeFromIso() {
  const now = Date.now();
  return {
    from24h: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    from7d: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    from30d: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
