export function overviewWallet(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS?.trim() ?? "";
}

export function formatAmount(totalAmount: string) {
  const n = Number.parseFloat(totalAmount);
  if (Number.isNaN(n)) {
    return totalAmount;
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(n);
}
