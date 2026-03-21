import {
  getActiveWallets,
  getHealthScore,
  getLiveEvents,
  getQuoteFunnelSummary,
  getRevenueDaily,
  getRevenueMetrics,
  getTopWalletsByRevenue,
} from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'
import type { OverviewData } from '@/lib/types/metrics'

export async function getOverviewPageData(input?: TimeRangeInput): Promise<OverviewData> {
  const [revenue, funnel, revenueSeries, topWallets, health, liveEvents, activeWallets] = await Promise.all([
    getRevenueMetrics(input),
    getQuoteFunnelSummary(input),
    getRevenueDaily(input),
    getTopWalletsByRevenue(input, 10),
    getHealthScore(input),
    getLiveEvents(25),
    getActiveWallets({ hours: 24 }),
  ])

  return {
    revenue,
    funnel,
    revenueSeries,
    topWallets,
    health,
    liveEvents,
    activeWallets,
  }
}

