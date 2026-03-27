import { getAddress, isAddress } from "viem";

/**
 * Configured overview wallet for GraphQL variables.
 * Normalizes valid `0x` hex addresses to EIP-55 checksum — many backends key ledgers by checksummed address.
 */
export function overviewWallet(): string {
  const raw = process.env.NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS?.trim() ?? "";
  if (!raw) return "";
  if (isAddress(raw)) {
    try {
      return getAddress(raw);
    } catch {
      return raw;
    }
  }
  return raw;
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
