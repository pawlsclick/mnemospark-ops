import { buildDashboardEvents } from '@/lib/analytics/event-facts'
import { buildQuoteFacts } from '@/lib/analytics/quote-facts'
import type { TimeRangeInput } from '@/lib/types/api'
import type { WalletFacts } from '@/lib/types/wallet'

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
  return sorted[mid]
}

function minIso(a?: string, b?: string): string | undefined {
  if (!a) return b
  if (!b) return a
  return a < b ? a : b
}

function maxIso(a?: string, b?: string): string | undefined {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

function normalizeWalletAddress(walletAddress: string): string {
  return walletAddress.trim().toLowerCase()
}

export async function buildWalletFacts(input?: TimeRangeInput): Promise<WalletFacts[]> {
  const [quotes, events] = await Promise.all([buildQuoteFacts(input), buildDashboardEvents(input)])
  const grouped = new Map<string, WalletFacts>()
  const revenueByWallet = new Map<string, number[]>()

  for (const quote of quotes) {
    if (!quote.walletAddress) continue
    const normalizedWalletAddress = normalizeWalletAddress(quote.walletAddress)
    if (!normalizedWalletAddress) continue
    const existing = grouped.get(normalizedWalletAddress) ?? {
      walletAddress: quote.walletAddress.trim(),
      firstSeenAt: quote.firstSeenAt,
      lastSeenAt: quote.lastSeenAt,
      totalQuotes: 0,
      totalUploadsStarted: 0,
      totalUploadsConfirmed: 0,
      totalPaymentsSettled: 0,
      totalFailures: 0,
      totalAuthFailures: 0,
      totalRevenue: 0,
      averageRevenuePerQuote: 0,
      medianTransactionSize: 0,
      lastNetwork: quote.network,
      lastEventType: quote.finalStatus,
    }

    existing.totalQuotes += quote.hasQuoteCreated ? 1 : 0
    existing.totalUploadsStarted += quote.hasUploadStarted ? 1 : 0
    existing.totalUploadsConfirmed += quote.hasUploadConfirmed ? 1 : 0
    existing.totalPaymentsSettled += quote.hasPaymentSettled ? 1 : 0
    existing.totalFailures += quote.hasFailure ? 1 : 0
    existing.totalRevenue += quote.hasPaymentSettled ? quote.amountNormalized ?? 0 : 0
    existing.firstSeenAt = minIso(existing.firstSeenAt, quote.firstSeenAt)
    existing.lastSeenAt = maxIso(existing.lastSeenAt, quote.lastSeenAt)
    if (quote.network) existing.lastNetwork = quote.network
    existing.lastEventType = quote.finalStatus

    if (quote.hasPaymentSettled && quote.amountNormalized) {
      const rows = revenueByWallet.get(normalizedWalletAddress) ?? []
      rows.push(quote.amountNormalized)
      revenueByWallet.set(normalizedWalletAddress, rows)
    }

    grouped.set(normalizedWalletAddress, existing)
  }

  for (const event of events) {
    if (!event.walletAddress) continue
    const normalizedWalletAddress = normalizeWalletAddress(event.walletAddress)
    if (!normalizedWalletAddress) continue
    if (event.eventType === 'wallet_auth_failed') {
      const existing = grouped.get(normalizedWalletAddress)
      if (existing) {
        existing.totalAuthFailures += 1
        existing.lastSeenAt = maxIso(existing.lastSeenAt, event.timestamp)
        if (event.network) existing.lastNetwork = event.network
        existing.lastEventType = event.eventType
      } else {
        grouped.set(normalizedWalletAddress, {
          walletAddress: event.walletAddress.trim(),
          firstSeenAt: event.timestamp,
          lastSeenAt: event.timestamp,
          totalQuotes: 0,
          totalUploadsStarted: 0,
          totalUploadsConfirmed: 0,
          totalPaymentsSettled: 0,
          totalFailures: 0,
          totalAuthFailures: 1,
          totalRevenue: 0,
          averageRevenuePerQuote: 0,
          medianTransactionSize: 0,
          lastEventType: event.eventType,
          lastNetwork: event.network,
        })
      }
    }
  }

  const wallets = Array.from(grouped.values())
  for (const wallet of wallets) {
    wallet.averageRevenuePerQuote = wallet.totalRevenue / (wallet.totalQuotes || 1)
    wallet.medianTransactionSize = median(revenueByWallet.get(normalizeWalletAddress(wallet.walletAddress)) ?? [])
  }

  return wallets.sort((a, b) => b.totalRevenue - a.totalRevenue)
}
