import { buildEventFacts } from '@/lib/analytics/event-facts'
import { normalizeFailureCategory } from '@/lib/analytics/normalizers'
import type { TimeRangeInput } from '@/lib/types/api'
import type { QuoteFacts } from '@/lib/types/transaction'

function minIso(a?: string, b?: string): string | undefined {
  if (!a) return b
  if (!b) return a
  return a < b ? a : b
}

function maxIso(a?: string, b?: string): string | undefined {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

export async function buildQuoteFacts(input?: TimeRangeInput): Promise<QuoteFacts[]> {
  const events = await buildEventFacts(input)
  const grouped = new Map<string, QuoteFacts>()

  for (const event of events) {
    if (!event.quoteId) continue

    const existing = grouped.get(event.quoteId) ?? {
      quoteId: event.quoteId,
      walletAddress: event.walletAddress,
      network: event.network,
      amountNormalized: event.amountNormalized,
      hasQuoteCreated: false,
      hasPaymentSettled: false,
      hasUploadStarted: false,
      hasUploadConfirmed: false,
      hasFailure: false,
      finalStatus: 'unknown',
      requestIds: [],
      transIds: [],
      idempotencyKeys: [],
      firstSeenAt: event.timestamp,
      lastSeenAt: event.timestamp,
      objectId: (event.metadata?.object_id as string | undefined) ?? undefined,
      objectIdHash: (event.metadata?.object_id_hash as string | undefined) ?? undefined,
      objectKey: (event.metadata?.object_key as string | undefined) ?? undefined,
    }

    existing.firstSeenAt = minIso(existing.firstSeenAt, event.timestamp)
    existing.lastSeenAt = maxIso(existing.lastSeenAt, event.timestamp)

    if (!existing.walletAddress && event.walletAddress) existing.walletAddress = event.walletAddress
    if (!existing.network && event.network) existing.network = event.network
    if ((!existing.amountNormalized || existing.amountNormalized === 0) && event.amountNormalized) {
      existing.amountNormalized = event.amountNormalized
    }

    if (!existing.objectId && event.metadata?.object_id) {
      existing.objectId = String(event.metadata.object_id)
    }
    if (!existing.objectIdHash && event.metadata?.object_id_hash) {
      existing.objectIdHash = String(event.metadata.object_id_hash)
    }
    if (!existing.objectKey && event.metadata?.object_key) {
      existing.objectKey = String(event.metadata.object_key)
    }

    if (event.requestId && !existing.requestIds.includes(event.requestId)) existing.requestIds.push(event.requestId)
    if (event.transId && !existing.transIds.includes(event.transId)) existing.transIds.push(event.transId)
    if (event.idempotencyKey && !existing.idempotencyKeys.includes(event.idempotencyKey)) {
      existing.idempotencyKeys.push(event.idempotencyKey)
    }

    switch (event.normalizedStatus) {
      case 'quote_created':
        existing.hasQuoteCreated = true
        existing.quoteCreatedAt = minIso(existing.quoteCreatedAt, event.timestamp)
        break
      case 'payment_settled':
        existing.hasPaymentSettled = true
        existing.paymentSettledAt = minIso(existing.paymentSettledAt, event.timestamp)
        break
      case 'upload_started':
        existing.hasUploadStarted = true
        existing.uploadStartedAt = minIso(existing.uploadStartedAt, event.timestamp)
        break
      case 'upload_confirmed':
        existing.hasUploadConfirmed = true
        existing.uploadConfirmedAt = minIso(existing.uploadConfirmedAt, event.timestamp)
        break
      case 'failed':
        existing.hasFailure = true
        existing.normalizedReason = event.normalizedReason ?? normalizeFailureCategory(event.rawReason, event.rawStatus)
        if (event.eventType.includes('payment')) existing.failedStage = 'payment'
        else if (event.eventType.includes('confirm')) existing.failedStage = 'confirm'
        else if (event.eventType.includes('upload')) existing.failedStage = 'upload'
        else if (event.eventType.includes('quote')) existing.failedStage = 'quote'
        else existing.failedStage = existing.failedStage ?? 'unknown'
        break
      default:
        break
    }

    grouped.set(event.quoteId, existing)
  }

  const facts = Array.from(grouped.values())
  for (const fact of facts) {
    if (fact.hasFailure) {
      fact.finalStatus = 'failed'
    } else if (fact.hasUploadConfirmed) {
      fact.finalStatus = 'upload_confirmed'
    } else if (fact.hasUploadStarted) {
      fact.finalStatus = 'upload_started'
    } else if (fact.hasPaymentSettled) {
      fact.finalStatus = 'payment_settled'
    } else if (fact.hasQuoteCreated) {
      fact.finalStatus = 'quote_created'
    } else {
      fact.finalStatus = 'unknown'
    }
  }

  return facts.sort((a, b) => (b.lastSeenAt ?? '').localeCompare(a.lastSeenAt ?? ''))
}
