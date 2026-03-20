import {
  fetchApiCallRows,
  fetchPaymentLedgerRows,
  fetchQuotes,
  fetchUploadTransactionLogs,
  fetchWalletAuthEvents,
} from '@/lib/aws/dynamodb'
import type { TimeRangeInput } from '@/lib/types/api'
import type { DashboardEvent, EventFacts } from '@/lib/types/events'
import {
  coerceIsoDate,
  normalizeAmount,
  normalizeFailureCategory,
  normalizeStatus,
  toQuoteId,
  toRequestId,
  toTransactionId,
  toWalletAddress,
} from '@/lib/analytics/normalizers'

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function severityFromStatus(status: EventFacts['normalizedStatus']): DashboardEvent['severity'] {
  if (status === 'failed') return 'high'
  if (status === 'unknown') return 'medium'
  return 'info'
}

function uiStatus(normalized: EventFacts['normalizedStatus']): DashboardEvent['status'] {
  if (normalized === 'failed') return 'error'
  if (normalized === 'unknown') return 'pending'
  return 'success'
}

function classifyEventType(source: string, normalizedStatus: EventFacts['normalizedStatus']): string {
  if (source === 'wallet_auth') {
    return normalizedStatus === 'failed' ? 'wallet_auth_failed' : 'wallet_auth_succeeded'
  }
  if (source === 'quotes') return 'quote_created'
  if (source === 'payments') {
    return normalizedStatus === 'failed' ? 'payment_settle_failed' : 'payment_settled'
  }
  if (source === 'upload_logs') {
    if (normalizedStatus === 'upload_confirmed') return 'upload_confirmed'
    if (normalizedStatus === 'failed') return 'upload_failed'
    return 'upload_started'
  }
  if (source === 'api_calls') return 'api_call_logged'
  return 'lambda_invoked'
}

export async function buildEventFacts(input?: TimeRangeInput): Promise<EventFacts[]> {
  const [quotes, uploads, payments, authEvents, apiCalls] = await Promise.all([
    fetchQuotes(input),
    fetchUploadTransactionLogs(input),
    fetchPaymentLedgerRows(input),
    fetchWalletAuthEvents(input),
    fetchApiCallRows(input),
  ])

  const events: EventFacts[] = []

  for (const row of quotes) {
    const status = normalizeStatus(row.status, row.reason)
    events.push({
      eventId: `quote:${row.quote_id}:${row.created_at ?? row.event_ts ?? 'na'}`,
      timestamp:
        coerceIsoDate(row.created_at ?? row.event_ts ?? str(row.timestamp)) ??
        new Date().toISOString(),
      walletAddress: toWalletAddress(row.wallet_address ?? str(row.addr)),
      quoteId: toQuoteId(row.quote_id),
      requestId: toRequestId(row.request_id),
      network: str(row.network),
      amountNormalized: normalizeAmount(row.amount ?? str(row.storage_price)),
      normalizedStatus: status,
      normalizedReason: status === 'failed' ? normalizeFailureCategory(row.reason, row.status) : undefined,
      source: 'quotes',
      eventType: classifyEventType('quotes', status),
      rawStatus: row.status,
      rawReason: row.reason,
      isFailure: status === 'failed',
      metadata: row,
    })
  }

  for (const row of uploads) {
    const status = normalizeStatus(row.status, row.reason)
    events.push({
      eventId: `upload:${row.quote_id}:${row.trans_id}`,
      timestamp:
        coerceIsoDate(row.event_ts ?? row.created_at ?? str(row.timestamp)) ??
        new Date().toISOString(),
      walletAddress: toWalletAddress(row.wallet_address ?? str(row.addr)),
      quoteId: toQuoteId(row.quote_id),
      requestId: toRequestId(row.request_id),
      transId: toTransactionId(row.trans_id),
      idempotencyKey:
        typeof row.idempotency_key === 'string' && row.idempotency_key.length > 0
          ? row.idempotency_key
          : undefined,
      network: str(row.network ?? row.payment_network),
      amountNormalized: normalizeAmount(row.amount ?? str(row.payment_amount)),
      normalizedStatus: status,
      normalizedReason: status === 'failed' ? normalizeFailureCategory(row.reason, row.status) : undefined,
      route: str(row.route ?? row.path),
      lambdaName: str(row.lambda_name),
      source: 'upload_logs',
      eventType: classifyEventType('upload_logs', status),
      rawStatus: row.status,
      rawReason: row.reason,
      isFailure: status === 'failed',
      metadata: row,
    })
  }

  for (const row of payments) {
    const status = normalizeStatus(row.status ?? str(row.payment_status), row.reason)
    events.push({
      eventId: `payment:${row.wallet_address}:${row.quote_id}`,
      timestamp:
        coerceIsoDate(
          row.event_ts ?? row.created_at ?? str(row.payment_received_at) ?? str(row.timestamp),
        ) ?? new Date().toISOString(),
      walletAddress: toWalletAddress(row.wallet_address),
      quoteId: toQuoteId(row.quote_id),
      requestId: toRequestId(row.request_id),
      network: str(row.network),
      amountNormalized: normalizeAmount(row.amount ?? str(row.storage_price)),
      normalizedStatus: status,
      normalizedReason: status === 'failed' ? normalizeFailureCategory(row.reason, row.status) : undefined,
      source: 'payments',
      eventType: classifyEventType('payments', status),
      rawStatus: row.status,
      rawReason: row.reason,
      isFailure: status === 'failed',
      metadata: row,
    })
  }

  for (const row of authEvents) {
    const normalizedFromResult =
      str(row.result)?.toLowerCase() === 'allow' ? 'wallet_auth_succeeded' : 'wallet_auth_failed'
    const status = normalizeStatus(normalizedFromResult, row.reason)
    events.push({
      eventId: `auth:${row.event_id}`,
      timestamp:
        coerceIsoDate(row.event_ts ?? row.created_at ?? str(row.timestamp)) ??
        new Date().toISOString(),
      walletAddress: toWalletAddress(row.wallet_address),
      requestId: toRequestId(row.request_id),
      normalizedStatus: status,
      normalizedReason: status === 'failed' ? normalizeFailureCategory(row.reason, row.status) : undefined,
      source: 'wallet_auth',
      eventType: classifyEventType('wallet_auth', status),
      rawStatus: row.status,
      rawReason: row.reason,
      isFailure: status === 'failed',
      metadata: row,
    })
  }

  for (const row of apiCalls) {
    const apiStatusCode =
      typeof row.status_code === 'number'
        ? row.status_code
        : typeof row.status_code === 'string'
          ? Number(row.status_code)
          : undefined
    const status =
      apiStatusCode && apiStatusCode >= 400
        ? 'failed'
        : normalizeStatus(row.status, row.reason ?? row.error)
    events.push({
      eventId: `api:${row.request_id}`,
      timestamp:
        coerceIsoDate(row.event_ts ?? row.created_at ?? str(row.timestamp)) ??
        new Date().toISOString(),
      walletAddress: toWalletAddress(row.wallet_address),
      quoteId: toQuoteId(row.quote_id),
      requestId: toRequestId(row.request_id),
      route: str(row.route ?? row.path),
      lambdaName: typeof row.lambda_name === 'string' ? row.lambda_name : undefined,
      normalizedStatus: status,
      normalizedReason:
        status === 'failed' ? normalizeFailureCategory(row.error ?? row.reason ?? null, row.status) : undefined,
      source: 'api_calls',
      eventType: classifyEventType('api_calls', status),
      rawStatus: row.status,
      rawReason: row.error ?? row.reason,
      isFailure: status === 'failed',
      metadata: row,
    })
  }

  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  return events
}

export async function buildDashboardEvents(input?: TimeRangeInput): Promise<DashboardEvent[]> {
  const facts = await buildEventFacts(input)
  return facts.map((fact) => ({
    id: fact.eventId,
    timestamp: fact.timestamp,
    walletAddress: fact.walletAddress,
    eventType: fact.eventType,
    source: fact.source,
    route: fact.route,
    lambdaName: fact.lambdaName,
    status: uiStatus(fact.normalizedStatus),
    severity: severityFromStatus(fact.normalizedStatus),
    normalizedStatus: fact.normalizedStatus,
    normalizedReason: fact.normalizedReason,
    quoteId: fact.quoteId,
    objectId: (fact.metadata?.object_id as string | undefined) ?? undefined,
    objectIdHash: (fact.metadata?.object_id_hash as string | undefined) ?? undefined,
    objectKey: (fact.metadata?.object_key as string | undefined) ?? undefined,
    transId: fact.transId,
    requestId: fact.requestId,
    idempotencyKey: fact.idempotencyKey,
    network: fact.network,
    amount: fact.amountNormalized,
    message: `${fact.eventType} from ${fact.source}`,
    metadata: fact.metadata,
  }))
}
