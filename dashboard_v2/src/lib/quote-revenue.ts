/**
 * Sum revenue from quote facts when ledger/wallet aggregates disagree with what you see in Transactions.
 * Uses quotes where hasPaymentSettled is true; amounts from amountNormalized.
 * Optional fromIsoUtc: only quotes whose lastSeenAt parses to >= that instant (compare in JS Date space).
 */
export function aggregateSettledQuoteRevenue(
  quotes: ReadonlyArray<{
    hasPaymentSettled: boolean;
    amountNormalized?: number | null;
    lastSeenAt?: string | null;
  }>,
  options?: { fromIsoUtc?: string | null },
): { total: number; count: number } {
  const fromMs = options?.fromIsoUtc ? Date.parse(options.fromIsoUtc) : null;
  let total = 0;
  let count = 0;
  for (const q of quotes) {
    if (!q.hasPaymentSettled) continue;
    if (fromMs !== null) {
      if (!q.lastSeenAt?.trim()) continue;
      const t = Date.parse(q.lastSeenAt);
      if (Number.isNaN(t) || t < fromMs) continue;
    }
    total += q.amountNormalized ?? 0;
    count += 1;
  }
  return { total, count };
}
