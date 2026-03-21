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
  const cacheAlignedNow = Math.floor(Date.now() / 30_000) * 30_000
  const from = new Date(cacheAlignedNow - 24 * 60 * 60 * 1000).toISOString()
  const timeRangeInput = { ...input, from }

  const [revenue, funnel, revenueSeries, topWallets, health, liveEvents, activeWallets] = await Promise.all([
    getRevenueMetrics(timeRangeInput),
    getQuoteFunnelSummary(timeRangeInput),
    getRevenueDaily(input),
    getTopWalletsByRevenue(timeRangeInput, 10),
    getHealthScore(timeRangeInput),
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

