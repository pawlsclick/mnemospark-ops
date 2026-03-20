import {
  getObjectDuplicateSummary,
  getQuoteFacts,
  getQuoteFunnelSummary,
  getQuoteLatencyPercentiles,
  getTransactionStatusDistribution,
} from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'

export async function getTransactionsPageData(input?: TimeRangeInput) {
  const [transactions, funnel, latency, statusDistribution, objectDuplicates] = await Promise.all([
    getQuoteFacts(input),
    getQuoteFunnelSummary(input),
    getQuoteLatencyPercentiles(input),
    getTransactionStatusDistribution(input),
    getObjectDuplicateSummary(input),
  ])

  return {
    transactions,
    funnel,
    latency,
    statusDistribution,
    objectDuplicates,
  }
}
