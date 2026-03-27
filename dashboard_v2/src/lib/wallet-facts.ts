/** Match configured overview wallet to a row from walletFacts (case-insensitive hex). */
export function findWalletFactRow<
  T extends { walletAddress: string },
>(rows: T[] | undefined, target: string): T | undefined {
  const t = target.trim().toLowerCase();
  if (!t) return undefined;
  return rows?.find((r) => r.walletAddress.toLowerCase() === t);
}
