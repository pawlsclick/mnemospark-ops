import {
  getApiCallsByRoute,
  getApiFailuresByRoute,
  getEventRatePerMinute,
  getFailureRateByStage,
  getFailureReasonBreakdown,
  getFailuresByNetwork,
  getFailuresOverTime,
  getHealthScore,
  getIdempotencyConflicts,
  getLambdaErrorSummary,
  getQuoteLatencyPercentiles,
  getRecentCriticalFailures,
  getRootCausePanel,
  getWalletTrace,
} from '@/lib/analytics/queries'
import type { QuoteId, RequestId, TimeRangeInput, WalletAddress } from '@/lib/types/api'
import type { DashboardEvent } from '@/lib/types/events'
import type {
  HealthScore,
  LatencyMetrics,
  SeriesBreakdownPoint,
  TimeSeriesPoint,
} from '@/lib/types/metrics'

export async function getOperationsPageData(input?: TimeRangeInput): Promise<{
  health: HealthScore
  latency: LatencyMetrics
  eventRate: TimeSeriesPoint[]
  failuresOverTime: TimeSeriesPoint[]
  failureReasons: SeriesBreakdownPoint[]
  failureRateByStage: SeriesBreakdownPoint[]
  failuresByNetwork: SeriesBreakdownPoint[]
  lambdaErrors: SeriesBreakdownPoint[]
  apiCallsByRoute: SeriesBreakdownPoint[]
  apiFailuresByRoute: SeriesBreakdownPoint[]
  recentCriticalFailures: DashboardEvent[]
  idempotencyConflicts: SeriesBreakdownPoint[]
}> {
  const [
    health,
    latency,
    eventRate,
    failuresOverTime,
    failureReasons,
    failureRateByStage,
    failuresByNetwork,
    lambdaErrors,
    apiCallsByRoute,
    apiFailuresByRoute,
    recentCriticalFailures,
    idempotencyConflicts,
  ] = await Promise.all([
    getHealthScore(input),
    getQuoteLatencyPercentiles(input),
    getEventRatePerMinute(input),
    getFailuresOverTime(input),
    getFailureReasonBreakdown(input),
    getFailureRateByStage(input),
    getFailuresByNetwork(input),
    getLambdaErrorSummary(input),
    getApiCallsByRoute(input),
    getApiFailuresByRoute(input),
    getRecentCriticalFailures(input, 20),
    getIdempotencyConflicts(input),
  ])

  return {
    health,
    latency,
    eventRate,
    failuresOverTime,
    failureReasons,
    failureRateByStage,
    failuresByNetwork,
    lambdaErrors,
    apiCallsByRoute,
    apiFailuresByRoute,
    recentCriticalFailures,
    idempotencyConflicts,
  }
}

export async function getTracePanelData(input: {
  quoteId?: QuoteId
  requestId?: RequestId
  walletAddress?: WalletAddress
}): Promise<{
  rootCause: Awaited<ReturnType<typeof getRootCausePanel>>
  walletTrace: DashboardEvent[]
}> {
  const walletTrace = input.walletAddress
    ? await getWalletTrace(input.walletAddress)
    : []
  const rootCause = await getRootCausePanel({ quoteId: input.quoteId, requestId: input.requestId })
  return { rootCause, walletTrace }
}
