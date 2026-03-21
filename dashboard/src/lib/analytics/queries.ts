import { buildDashboardEvents, buildEventFacts } from '@/lib/analytics/event-facts'
import { buildQuoteFacts } from '@/lib/analytics/quote-facts'
import { buildWalletFacts } from '@/lib/analytics/wallet-facts'
import { fetchAppSyncLiveEvents } from '@/lib/aws/appsync'
import { EMPTY_LAMBDA_SUMMARIES, KNOWN_LAMBDA_LOGICAL_NAMES, KNOWN_ROUTES } from '@/lib/constants'
import type {
  ObjectIdHash,
  QuoteId,
  RequestId,
  TimeRangeInput,
  WalletAddress,
} from '@/lib/types/api'
import type { DashboardEvent, FailureCategory } from '@/lib/types/events'
import type {
  FunnelMetrics,
  HealthScore,
  LambdaSummary,
  LatencyMetrics,
  RevenueMetrics,
  SeriesBreakdownPoint,
  TimeSeriesPoint,
} from '@/lib/types/metrics'
import type { QuoteFacts } from '@/lib/types/transaction'
import type { WalletDetail, WalletFacts } from '@/lib/types/wallet'

function toDayBucket(value: string): string {
  return value.slice(0, 10)
}

function toWeekBucket(value: string): string {
  const d = new Date(value)
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function toMonthBucket(value: string): string {
  return value.slice(0, 7)
}

function asSeriesFromBucketMap(map: Map<string, number>): TimeSeriesPoint[] {
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([bucket, value]) => ({ bucket, value }))
}

function percentile(values: number[], pct: number): number | undefined {
  if (!values.length) return undefined
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.ceil((pct / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))]
}

function toSeriesBreakdown(input: Map<string, number>, limit?: number): SeriesBreakdownPoint[] {
  const rows = Array.from(input.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
  return typeof limit === 'number' ? rows.slice(0, limit) : rows
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return (numerator / denominator) * 100
}

function quoteFactsInRange(facts: QuoteFacts[], input?: TimeRangeInput): QuoteFacts[] {
  if (!input?.from && !input?.to) return facts
  return facts.filter((fact) => {
    const ts = fact.lastSeenAt ?? fact.firstSeenAt
    if (!ts) return true
    if (input.from && ts < input.from) return false
    if (input.to && ts > input.to) return false
    return true
  })
}

function normalizeWalletAddress(walletAddress: string): string {
  return walletAddress.trim().toLowerCase()
}

export async function getActiveWallets(input?: { hours?: number }): Promise<number> {
  const hours = input?.hours ?? 24
  const from = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const events = await buildEventFacts({ from })
  const uniqueWallets = new Set<string>()
  for (const event of events) {
    if (event.walletAddress) {
      uniqueWallets.add(event.walletAddress)
    }
  }
  return uniqueWallets.size
}

export async function getRevenueDaily(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const bucket = new Map<string, number>()

  for (const fact of facts) {
    if (!fact.hasPaymentSettled || !fact.paymentSettledAt) continue
    const key = toDayBucket(fact.paymentSettledAt)
    bucket.set(key, (bucket.get(key) ?? 0) + (fact.amountNormalized ?? 0))
  }

  return asSeriesFromBucketMap(bucket)
}

export async function getRevenueWeekly(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const bucket = new Map<string, number>()
  for (const fact of facts) {
    if (!fact.hasPaymentSettled || !fact.paymentSettledAt) continue
    const key = toWeekBucket(fact.paymentSettledAt)
    bucket.set(key, (bucket.get(key) ?? 0) + (fact.amountNormalized ?? 0))
  }
  return asSeriesFromBucketMap(bucket)
}

export async function getRevenueMonthly(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const bucket = new Map<string, number>()
  for (const fact of facts) {
    if (!fact.hasPaymentSettled || !fact.paymentSettledAt) continue
    const key = toMonthBucket(fact.paymentSettledAt)
    bucket.set(key, (bucket.get(key) ?? 0) + (fact.amountNormalized ?? 0))
  }
  return asSeriesFromBucketMap(bucket)
}

export async function getRevenueMetrics(input?: TimeRangeInput): Promise<RevenueMetrics> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const now = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay
  const thirtyDays = 30 * oneDay

  let revenue24h = 0
  let revenue7d = 0
  let revenue30d = 0
  const perWallet = new Map<string, number>()
  const paymentAmounts: number[] = []

  for (const fact of facts) {
    if (!fact.hasPaymentSettled || !fact.paymentSettledAt) continue
    const amount = fact.amountNormalized ?? 0
    const ts = new Date(fact.paymentSettledAt).getTime()
    const age = now.getTime() - ts

    if (age <= oneDay) revenue24h += amount
    if (age <= sevenDays) revenue7d += amount
    if (age <= thirtyDays) revenue30d += amount
    if (fact.walletAddress) perWallet.set(fact.walletAddress, (perWallet.get(fact.walletAddress) ?? 0) + amount)
    paymentAmounts.push(amount)
  }

  const walletCount = perWallet.size || 1
  const arpu = revenue30d / walletCount
  const sorted = paymentAmounts.sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const medianTransactionSize =
    sorted.length === 0 ? 0 : sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]

  return { revenue24h, revenue7d, revenue30d, arpu, medianTransactionSize }
}

export async function getTopWalletsByRevenue(input?: TimeRangeInput, limit = 10): Promise<WalletFacts[]> {
  const wallets = await buildWalletFacts(input)
  return [...wallets].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit)
}

export async function getTopWalletsByFrequency(input?: TimeRangeInput, limit = 10): Promise<WalletFacts[]> {
  const wallets = await buildWalletFacts(input)
  return [...wallets].sort((a, b) => b.totalQuotes - a.totalQuotes).slice(0, limit)
}

export async function getRevenueByNetwork(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const map = new Map<string, number>()

  for (const fact of facts) {
    if (!fact.hasPaymentSettled) continue
    const key = fact.network ?? 'unknown'
    map.set(key, (map.get(key) ?? 0) + (fact.amountNormalized ?? 0))
  }

  return toSeriesBreakdown(map)
}

export async function getWalletGrowthDaily(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const wallets = await buildWalletFacts(input)
  const bucket = new Map<string, number>()

  for (const wallet of wallets) {
    if (!wallet.firstSeenAt) continue
    const key = toDayBucket(wallet.firstSeenAt)
    bucket.set(key, (bucket.get(key) ?? 0) + 1)
  }

  return asSeriesFromBucketMap(bucket)
}

export async function getWalletRetentionCohort(input?: TimeRangeInput): Promise<Array<Record<string, unknown>>> {
  const wallets = await buildWalletFacts(input)
  return wallets.map((wallet) => {
    const first = wallet.firstSeenAt ? new Date(wallet.firstSeenAt).getTime() : 0
    const last = wallet.lastSeenAt ? new Date(wallet.lastSeenAt).getTime() : first
    const ageDays = Math.max(0, Math.round((last - first) / (24 * 60 * 60 * 1000)))
    return {
      walletAddress: wallet.walletAddress,
      firstSeenAt: wallet.firstSeenAt,
      lastSeenAt: wallet.lastSeenAt,
      activeAgain: ageDays >= 1,
      daysBetweenFirstAndLast: ageDays,
    }
  })
}

export async function getWalletList(input?: TimeRangeInput): Promise<WalletFacts[]> {
  return buildWalletFacts(input)
}

export async function getWalletDetail(walletAddress: WalletAddress, input?: TimeRangeInput): Promise<WalletDetail> {
  const [wallets, quotes, events] = await Promise.all([
    buildWalletFacts(input),
    buildQuoteFacts(input),
    buildDashboardEvents(input),
  ])

  const normalizedInput = normalizeWalletAddress(walletAddress)
  const wallet =
    wallets.find((entry) => normalizeWalletAddress(entry.walletAddress) === normalizedInput) ?? null
  const walletQuotes = quotes.filter(
    (entry) => entry.walletAddress && normalizeWalletAddress(entry.walletAddress) === normalizedInput,
  )
  const walletEvents = events.filter(
    (entry) => entry.walletAddress && normalizeWalletAddress(entry.walletAddress) === normalizedInput,
  )

  return { wallet, quotes: walletQuotes, events: walletEvents }
}

export async function getQuoteFunnelSummary(input?: TimeRangeInput): Promise<FunnelMetrics> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const quoteCreated = facts.filter((f) => f.hasQuoteCreated).length
  const paymentSettled = facts.filter((f) => f.hasPaymentSettled).length
  const uploadStarted = facts.filter((f) => f.hasUploadStarted).length
  const uploadConfirmed = facts.filter((f) => f.hasUploadConfirmed).length

  return {
    quoteCreated,
    paymentSettled,
    uploadStarted,
    uploadConfirmed,
    quoteToPaymentRate: safeRate(paymentSettled, quoteCreated),
    paymentToUploadRate: safeRate(uploadStarted, paymentSettled),
    uploadToConfirmRate: safeRate(uploadConfirmed, uploadStarted),
  }
}

export async function getDropoffByStage(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const funnel = await getQuoteFunnelSummary(input)
  const dropoff = new Map<string, number>([
    ['quote_to_payment_dropoff', Math.max(0, funnel.quoteCreated - funnel.paymentSettled)],
    ['payment_to_upload_dropoff', Math.max(0, funnel.paymentSettled - funnel.uploadStarted)],
    ['upload_to_confirm_dropoff', Math.max(0, funnel.uploadStarted - funnel.uploadConfirmed)],
  ])
  return toSeriesBreakdown(dropoff)
}

export async function getQuoteLatencyPercentiles(input?: TimeRangeInput): Promise<LatencyMetrics> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const quoteToPayment: number[] = []
  const paymentToUpload: number[] = []
  const uploadToConfirm: number[] = []

  for (const fact of facts) {
    if (fact.quoteCreatedAt && fact.paymentSettledAt) {
      quoteToPayment.push(new Date(fact.paymentSettledAt).getTime() - new Date(fact.quoteCreatedAt).getTime())
    }
    if (fact.paymentSettledAt && fact.uploadStartedAt) {
      paymentToUpload.push(new Date(fact.uploadStartedAt).getTime() - new Date(fact.paymentSettledAt).getTime())
    }
    if (fact.uploadStartedAt && fact.uploadConfirmedAt) {
      uploadToConfirm.push(new Date(fact.uploadConfirmedAt).getTime() - new Date(fact.uploadStartedAt).getTime())
    }
  }

  return {
    quoteToPaymentP50: percentile(quoteToPayment, 50),
    quoteToPaymentP95: percentile(quoteToPayment, 95),
    paymentToUploadP50: percentile(paymentToUpload, 50),
    paymentToUploadP95: percentile(paymentToUpload, 95),
    uploadToConfirmP50: percentile(uploadToConfirm, 50),
    uploadToConfirmP95: percentile(uploadToConfirm, 95),
  }
}

export async function getFailureReasonBreakdown(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()

  for (const event of events) {
    if (!event.isFailure) continue
    const key = event.normalizedReason ?? 'unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  return toSeriesBreakdown(map)
}

export async function getFailureRateByStage(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const total = facts.length || 1

  const values = new Map<string, number>([
    ['quote', safeRate(facts.filter((f) => f.failedStage === 'quote').length, total)],
    ['payment', safeRate(facts.filter((f) => f.failedStage === 'payment').length, total)],
    ['upload', safeRate(facts.filter((f) => f.failedStage === 'upload').length, total)],
    ['confirm', safeRate(facts.filter((f) => f.failedStage === 'confirm').length, total)],
    ['unknown', safeRate(facts.filter((f) => f.failedStage === 'unknown').length, total)],
  ])

  return toSeriesBreakdown(values)
}

export async function getFailuresOverTime(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()
  for (const event of events) {
    if (!event.isFailure) continue
    const key = toDayBucket(event.timestamp)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return asSeriesFromBucketMap(map)
}

export async function getFailuresByWallet(input?: TimeRangeInput, limit = 10): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()
  for (const event of events) {
    if (!event.isFailure || !event.walletAddress) continue
    map.set(event.walletAddress, (map.get(event.walletAddress) ?? 0) + 1)
  }
  return toSeriesBreakdown(map, limit)
}

export async function getFailuresByNetwork(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()
  for (const event of events) {
    if (!event.isFailure) continue
    const key = event.network ?? 'unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return toSeriesBreakdown(map)
}

export async function getEventRatePerMinute(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()
  for (const event of events) {
    const key = event.timestamp.slice(0, 16)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return asSeriesFromBucketMap(map)
}

export async function getLambdaErrorSummary(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()

  for (const logical of KNOWN_LAMBDA_LOGICAL_NAMES) {
    map.set(logical, 0)
  }

  for (const event of events) {
    if (!event.isFailure) continue
    if (!event.lambdaName) continue
    map.set(event.lambdaName, (map.get(event.lambdaName) ?? 0) + 1)
  }

  return toSeriesBreakdown(map)
}

export async function getApiCallsByRoute(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()
  for (const route of KNOWN_ROUTES) {
    map.set(route, 0)
  }

  for (const event of events) {
    if (event.source !== 'api_calls') continue
    const method = (event.metadata?.method as string | undefined)?.toUpperCase()
    const route = event.route
    if (!route) continue
    const label = method ? `${method} ${route}` : route
    map.set(label, (map.get(label) ?? 0) + 1)
  }

  return toSeriesBreakdown(map)
}

export async function getApiFailuresByRoute(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const map = new Map<string, number>()
  for (const route of KNOWN_ROUTES) {
    map.set(route, 0)
  }

  for (const event of events) {
    if (event.source !== 'api_calls' || !event.isFailure) continue
    const method = (event.metadata?.method as string | undefined)?.toUpperCase()
    const route = event.route
    if (!route) continue
    const label = method ? `${method} ${route}` : route
    map.set(label, (map.get(label) ?? 0) + 1)
  }

  return toSeriesBreakdown(map)
}

export async function getHealthScore(input?: TimeRangeInput): Promise<HealthScore> {
  const [events, latencies] = await Promise.all([buildEventFacts(input), getQuoteLatencyPercentiles(input)])

  const total = events.length || 1
  const failures = events.filter((event) => event.isFailure).length
  const successRate = safeRate(total - failures, total)
  const errorRate = safeRate(failures, total)

  const now = Date.now()
  const windowMinutes = 60
  const throughput = events.filter((event) => new Date(event.timestamp).getTime() >= now - windowMinutes * 60 * 1000)
    .length

  const latencyReference = latencies.uploadToConfirmP95 ?? latencies.paymentToUploadP95 ?? latencies.quoteToPaymentP95 ?? 0
  const latencyScore = latencyReference <= 0 ? 100 : Math.max(0, 100 - latencyReference / 1000)

  const status: HealthScore['status'] =
    errorRate > 20 || latencyScore < 40 ? 'red' : errorRate > 8 || latencyScore < 70 ? 'yellow' : 'green'

  return {
    status,
    successRate,
    errorRate,
    throughput,
    latencyScore,
  }
}

export async function getQuoteTrace(quoteId: QuoteId): Promise<DashboardEvent[]> {
  const events = await buildDashboardEvents()
  return events
    .filter((event) => event.quoteId === quoteId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export async function getRequestTrace(requestId: RequestId): Promise<DashboardEvent[]> {
  const events = await buildDashboardEvents()
  return events
    .filter((event) => event.requestId === requestId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export async function getWalletTrace(walletAddress: WalletAddress, input?: TimeRangeInput): Promise<DashboardEvent[]> {
  const events = await buildDashboardEvents(input)
  const normalizedInput = normalizeWalletAddress(walletAddress)
  return events
    .filter(
      (event) => event.walletAddress && normalizeWalletAddress(event.walletAddress) === normalizedInput,
    )
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export async function getRootCausePanel(input: {
  quoteId?: QuoteId
  requestId?: RequestId
}): Promise<{
  latestEvent?: DashboardEvent
  firstFailureEvent?: DashboardEvent
  relatedEvents: DashboardEvent[]
  likelyFailureCategory?: FailureCategory
  likelyFailedStage?: QuoteFacts['failedStage']
}> {
  let relatedEvents: DashboardEvent[] = []

  if (input.quoteId) {
    relatedEvents = await getQuoteTrace(input.quoteId)
  } else if (input.requestId) {
    relatedEvents = await getRequestTrace(input.requestId)
  }

  const latestEvent = [...relatedEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
  const firstFailureEvent = relatedEvents.find((event) => event.status === 'error')

  return {
    latestEvent,
    firstFailureEvent,
    relatedEvents,
    likelyFailureCategory: firstFailureEvent?.normalizedReason,
    likelyFailedStage: firstFailureEvent?.eventType.includes('payment')
      ? 'payment'
      : firstFailureEvent?.eventType.includes('confirm')
        ? 'confirm'
        : firstFailureEvent?.eventType.includes('upload')
          ? 'upload'
          : firstFailureEvent?.eventType.includes('quote')
            ? 'quote'
            : undefined,
  }
}

export async function getIdempotencyConflicts(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const events = await buildEventFacts(input)
  const counts = new Map<string, number>()
  for (const event of events) {
    if (!event.idempotencyKey) continue
    counts.set(event.idempotencyKey, (counts.get(event.idempotencyKey) ?? 0) + 1)
  }

  const conflicts = new Map<string, number>()
  for (const [key, count] of counts) {
    if (count > 1) conflicts.set(key, count)
  }
  return toSeriesBreakdown(conflicts)
}

export async function getRetryCountsPerQuote(input?: TimeRangeInput): Promise<Array<{ quoteId: QuoteId; retryCount: number }>> {
  const facts = await buildQuoteFacts(input)
  return facts
    .map((fact) => ({ quoteId: fact.quoteId, retryCount: Math.max(0, fact.transIds.length - 1) }))
    .filter((row) => row.retryCount > 0)
    .sort((a, b) => b.retryCount - a.retryCount)
}

export async function getObjectDuplicateSummary(input?: TimeRangeInput): Promise<Array<{ objectIdHash: ObjectIdHash; quoteCount: number }>> {
  const facts = await buildQuoteFacts(input)
  const map = new Map<string, Set<string>>()

  for (const fact of facts) {
    if (!fact.objectIdHash) continue
    const set = map.get(fact.objectIdHash) ?? new Set<string>()
    set.add(fact.quoteId)
    map.set(fact.objectIdHash, set)
  }

  return Array.from(map.entries())
    .map(([objectIdHash, quoteIds]) => ({ objectIdHash, quoteCount: quoteIds.size }))
    .filter((entry) => entry.quoteCount > 1)
    .sort((a, b) => b.quoteCount - a.quoteCount)
}

export async function getLiveEvents(limit = 25): Promise<DashboardEvent[]> {
  const live = await fetchAppSyncLiveEvents(limit)
  if (live.length > 0) {
    return live
      .slice()
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit)
  }

  const events = await buildDashboardEvents()
  return events
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}

export async function getLambdaSummary(input?: TimeRangeInput): Promise<LambdaSummary[]> {
  const events = await buildEventFacts(input)
  const summaries = new Map<string, LambdaSummary>()

  for (const row of EMPTY_LAMBDA_SUMMARIES) {
    summaries.set(row.logicalName, { ...row })
  }

  for (const event of events) {
    if (!event.lambdaName) continue
    const entry = summaries.get(event.lambdaName) ?? {
      logicalName: event.lambdaName,
      lambdaName: event.lambdaName,
      invocationCount: 0,
      errorCount: 0,
    }

    entry.invocationCount = (entry.invocationCount ?? 0) + 1
    entry.lastSeenAt = entry.lastSeenAt && entry.lastSeenAt > event.timestamp ? entry.lastSeenAt : event.timestamp

    if (event.isFailure) {
      entry.errorCount = (entry.errorCount ?? 0) + 1
      entry.lastErrorAt = entry.lastErrorAt && entry.lastErrorAt > event.timestamp ? entry.lastErrorAt : event.timestamp
      entry.lastErrorMessage = event.rawReason ?? event.rawStatus ?? entry.lastErrorMessage
    }

    summaries.set(entry.logicalName, entry)
  }

  return Array.from(summaries.values()).sort((a, b) => (b.errorCount ?? 0) - (a.errorCount ?? 0))
}

export async function getRecentCriticalFailures(input?: TimeRangeInput, limit = 20): Promise<DashboardEvent[]> {
  const events = await buildDashboardEvents(input)
  return events
    .filter((event) => event.status === 'error')
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}

export async function getNewVsReturningWallets(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const wallets = await buildWalletFacts(input)
  let newCount = 0
  let returningCount = 0
  for (const wallet of wallets) {
    const first = wallet.firstSeenAt ? new Date(wallet.firstSeenAt).getTime() : 0
    const last = wallet.lastSeenAt ? new Date(wallet.lastSeenAt).getTime() : first
    if (last - first >= 24 * 60 * 60 * 1000) returningCount += 1
    else newCount += 1
  }
  return [
    { label: 'new_wallets', value: newCount },
    { label: 'returning_wallets', value: returningCount },
  ]
}

export async function getTransactionStatusDistribution(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]> {
  const facts = quoteFactsInRange(await buildQuoteFacts(input), input)
  const map = new Map<string, number>()
  for (const fact of facts) {
    map.set(fact.finalStatus, (map.get(fact.finalStatus) ?? 0) + 1)
  }
  return toSeriesBreakdown(map)
}

export async function getQuoteFacts(input?: TimeRangeInput): Promise<QuoteFacts[]> {
  return buildQuoteFacts(input)
}

export async function getDashboardEvents(input?: TimeRangeInput): Promise<DashboardEvent[]> {
  return buildDashboardEvents(input)
}

