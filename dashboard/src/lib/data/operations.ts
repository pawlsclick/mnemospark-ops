import {
  getApiCallsByRoute,
  getApiFailuresByRoute,
  getEventRatePerMinute,
  getFailureRateByStage,
  getFailureReasonBreakdown,
  getFailuresByNetwork,
  getFailuresByWallet,
  getFailuresOverTime,
  getHealthScore,
  getIdempotencyConflicts,
  getLambdaErrorSummary,
  getLambdaSummary,
  getQuoteLatencyPercentiles,
  getRecentCriticalFailures,
  getRetryCountsPerQuote,
  getRootCausePanel,
  getWalletTrace,
} from '@/lib/analytics/queries'
import type { QuoteId, RequestId, TimeRangeInput, WalletAddress } from '@/lib/types/api'
import type { DashboardEvent } from '@/lib/types/events'
import type {
  HealthScore,
  LambdaSummary,
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
  failuresByWallet: SeriesBreakdownPoint[]
  lambdaErrors: SeriesBreakdownPoint[]
  lambdaSummary: LambdaSummary[]
  apiCallsByRoute: SeriesBreakdownPoint[]
  apiFailuresByRoute: SeriesBreakdownPoint[]
  recentCriticalFailures: DashboardEvent[]
  idempotencyConflicts: SeriesBreakdownPoint[]
  retryCounts: Array<{ quoteId: string; retryCount: number }>
}> {
  const [
    health,
    latency,
    eventRate,
    failuresOverTime,
    failureReasons,
    failureRateByStage,
    failuresByNetwork,
    failuresByWallet,
    lambdaErrors,
    lambdaSummary,
    apiCallsByRoute,
    apiFailuresByRoute,
    recentCriticalFailures,
    idempotencyConflicts,
    retryCounts,
  ] = await Promise.all([
    getHealthScore(input),
    getQuoteLatencyPercentiles(input),
    getEventRatePerMinute(input),
    getFailuresOverTime(input),
    getFailureReasonBreakdown(input),
    getFailureRateByStage(input),
    getFailuresByNetwork(input),
    getFailuresByWallet(input, 10),
    getLambdaErrorSummary(input),
    getLambdaSummary(input),
    getApiCallsByRoute(input),
    getApiFailuresByRoute(input),
    getRecentCriticalFailures(input, 20),
    getIdempotencyConflicts(input),
    getRetryCountsPerQuote(input),
  ])

  return {
    health,
    latency,
    eventRate,
    failuresOverTime,
    failureReasons,
    failureRateByStage,
    failuresByNetwork,
    failuresByWallet,
    lambdaErrors,
    lambdaSummary,
    apiCallsByRoute,
    apiFailuresByRoute,
    recentCriticalFailures,
    idempotencyConflicts,
    retryCounts,
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
