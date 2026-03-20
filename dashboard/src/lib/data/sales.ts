import {
  getDropoffByStage,
  getNewVsReturningWallets,
  getQuoteFunnelSummary,
  getRevenueByNetwork,
  getRevenueDaily,
  getRevenueMetrics,
  getRevenueMonthly,
  getRevenueWeekly,
  getTopWalletsByFrequency,
  getTopWalletsByRevenue,
  getWalletGrowthDaily,
  getWalletRetentionCohort,
} from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'
import type { FunnelMetrics, RevenueMetrics, SeriesBreakdownPoint, TimeSeriesPoint } from '@/lib/types/metrics'
import type { WalletFacts } from '@/lib/types/wallet'

export async function getSalesPageData(input?: TimeRangeInput): Promise<{
  revenue: RevenueMetrics
  revenueDaily: TimeSeriesPoint[]
  revenueWeekly: TimeSeriesPoint[]
  revenueMonthly: TimeSeriesPoint[]
  topWalletsByRevenue: WalletFacts[]
  topWalletsByFrequency: WalletFacts[]
  funnel: FunnelMetrics
  dropoffByStage: SeriesBreakdownPoint[]
  revenueByNetwork: SeriesBreakdownPoint[]
  walletGrowth: TimeSeriesPoint[]
  retention: Array<Record<string, unknown>>
  newVsReturning: SeriesBreakdownPoint[]
}> {
  const [
    revenue,
    revenueDaily,
    revenueWeekly,
    revenueMonthly,
    topWalletsByRevenue,
    topWalletsByFrequency,
    funnel,
    dropoffByStage,
    revenueByNetwork,
    walletGrowth,
    retention,
    newVsReturning,
  ] = await Promise.all([
    getRevenueMetrics(input),
    getRevenueDaily(input),
    getRevenueWeekly(input),
    getRevenueMonthly(input),
    getTopWalletsByRevenue(input, 10),
    getTopWalletsByFrequency(input, 10),
    getQuoteFunnelSummary(input),
    getDropoffByStage(input),
    getRevenueByNetwork(input),
    getWalletGrowthDaily(input),
    getWalletRetentionCohort(input),
    getNewVsReturningWallets(input),
  ])

  return {
    revenue,
    revenueDaily,
    revenueWeekly,
    revenueMonthly,
    topWalletsByRevenue,
    topWalletsByFrequency,
    funnel,
    dropoffByStage,
    revenueByNetwork,
    walletGrowth,
    retention,
    newVsReturning,
  }
}
