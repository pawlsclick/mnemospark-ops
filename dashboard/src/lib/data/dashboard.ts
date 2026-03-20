import {
  getFailureReasonBreakdown,
  getHealthScore,
  getLiveEvents,
  getQuoteFunnelSummary,
  getRevenueDaily,
  getRevenueMetrics,
  getTopWalletsByRevenue,
  getWalletActivitySeries,
} from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'
import type { OverviewData } from '@/lib/types/metrics'

export async function getOverviewPageData(input?: TimeRangeInput): Promise<OverviewData> {
  const [
    revenue,
    funnel,
    failures,
    revenueSeries,
    walletSeries,
    topWallets,
    health,
    liveEvents,
  ] = await Promise.all([
    getRevenueMetrics(input),
    getQuoteFunnelSummary(input),
    getFailureReasonBreakdown(input),
    getRevenueDaily(input),
    getWalletActivitySeries(input),
    getTopWalletsByRevenue(input, 10),
    getHealthScore(input),
    getLiveEvents(25),
  ])

  return {
    revenue,
    funnel,
    failures,
    revenueSeries,
    walletSeries,
    topWallets,
    health,
    liveEvents,
  }
}
