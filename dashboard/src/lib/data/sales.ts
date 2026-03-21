import {
  getDropoffByStage,
  getNewVsReturningWallets,
  getQuoteFunnelSummary,
  getRevenueByNetwork,
  getRevenueDaily,
  getRevenueMetrics,
  getRevenueWeekly,
  getTopWalletsByFrequency,
  getTopWalletsByRevenue,
  getWalletGrowthDaily,
} from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'
import type { FunnelMetrics, RevenueMetrics, SeriesBreakdownPoint, TimeSeriesPoint } from '@/lib/types/metrics'
import type { WalletFacts } from '@/lib/types/wallet'

export async function getSalesPageData(input?: TimeRangeInput): Promise<{
  revenue: RevenueMetrics
  revenueDaily: TimeSeriesPoint[]
  revenueWeekly: TimeSeriesPoint[]
  topWalletsByRevenue: WalletFacts[]
  topWalletsByFrequency: WalletFacts[]
  funnel: FunnelMetrics
  dropoffByStage: SeriesBreakdownPoint[]
  revenueByNetwork: SeriesBreakdownPoint[]
  walletGrowth: TimeSeriesPoint[]
  newVsReturning: SeriesBreakdownPoint[]
}> {
  const [
    revenue,
    revenueDaily,
    revenueWeekly,
    topWalletsByRevenue,
    topWalletsByFrequency,
    funnel,
    dropoffByStage,
    revenueByNetwork,
    walletGrowth,
    newVsReturning,
  ] = await Promise.all([
    getRevenueMetrics(input),
    getRevenueDaily(input),
    getRevenueWeekly(input),
    getTopWalletsByRevenue(input, 10),
    getTopWalletsByFrequency(input, 10),
    getQuoteFunnelSummary(input),
    getDropoffByStage(input),
    getRevenueByNetwork(input),
    getWalletGrowthDaily(input),
    getNewVsReturningWallets(input),
  ])

  return {
    revenue,
    revenueDaily,
    revenueWeekly,
    topWalletsByRevenue,
    topWalletsByFrequency,
    funnel,
    dropoffByStage,
    revenueByNetwork,
    walletGrowth,
    newVsReturning,
  }
}
