import { buildEventFacts } from '@/lib/analytics/event-facts'
import { coerceIsoDate, normalizeFailureCategory } from '@/lib/analytics/normalizers'
import type { TimeRangeInput } from '@/lib/types/api'
import type { QuoteFacts } from '@/lib/types/transaction'
import { fetchApiCallRows } from '../aws/dynamodb'

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
  // 1. Get ALL events and all price-storage API calls
  const [events, priceStorageCalls] = await Promise.all([
    buildEventFacts(input),
    fetchApiCallRows({ ...input, route: '/price-storage' }),
  ])

  const grouped = new Map<string, QuoteFacts>()

  // 2. Seed the map with every quote ever created from the API calls table
  for (const call of priceStorageCalls) {
    if (!call.quote_id) continue
    const callTimestamp =
      coerceIsoDate(
        call.event_ts ??
          call.created_at ??
          (typeof call.timestamp === 'string' || typeof call.timestamp === 'number'
            ? call.timestamp
            : undefined),
      ) ?? new Date().toISOString()

    grouped.set(call.quote_id, {
      quoteId: call.quote_id,
      walletAddress: call.wallet_address,
      hasQuoteCreated: true,
      quoteCreatedAt: callTimestamp,
      firstSeenAt: callTimestamp,
      lastSeenAt: callTimestamp,
      hasPaymentSettled: false,
      hasUploadStarted: false,
      hasUploadConfirmed: false,
      hasFailure: false,
      finalStatus: 'quote_created',
      requestIds: [call.request_id],
      transIds: [],
      idempotencyKeys: [],
      objectId: typeof call.object_id === 'string' ? call.object_id : undefined,
      objectIdHash: typeof call.object_id_hash === 'string' ? call.object_id_hash : undefined,
      objectKey: typeof call.object_key === 'string' ? call.object_key : undefined,
    })
  }

  // 3. Iterate through all other events to enrich the quote facts
  for (const event of events) {
    if (!event.quoteId) continue

    let existing = grouped.get(event.quoteId)
    if (!existing) {
      existing = {
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
        requestIds: event.requestId ? [event.requestId] : [],
        transIds: event.transId ? [event.transId] : [],
        idempotencyKeys: event.idempotencyKey ? [event.idempotencyKey] : [],
        firstSeenAt: event.timestamp,
        lastSeenAt: event.timestamp,
      }
      grouped.set(event.quoteId, existing)
    }

    existing.firstSeenAt = minIso(existing.firstSeenAt, event.timestamp)
    existing.lastSeenAt = maxIso(existing.lastSeenAt, event.timestamp)
    if (event.requestId && !existing.requestIds.includes(event.requestId)) {
      existing.requestIds.push(event.requestId)
    }
    if (event.transId && !existing.transIds.includes(event.transId)) {
      existing.transIds.push(event.transId)
    }
    if (event.idempotencyKey && !existing.idempotencyKeys.includes(event.idempotencyKey)) {
      existing.idempotencyKeys.push(event.idempotencyKey)
    }

    if (!existing.walletAddress && event.walletAddress) {
      existing.walletAddress = event.walletAddress
    }
    if (!existing.amountNormalized && event.amountNormalized) {
      existing.amountNormalized = event.amountNormalized
    }
    if (!existing.network && event.network) {
      existing.network = event.network
    }
    if (!existing.objectIdHash && typeof event.metadata?.object_id_hash === 'string') {
      existing.objectIdHash = event.metadata.object_id_hash
    }
    if (!existing.objectId && typeof event.metadata?.object_id === 'string') {
      existing.objectId = event.metadata.object_id
    }
    if (!existing.objectKey && typeof event.metadata?.object_key === 'string') {
      existing.objectKey = event.metadata.object_key
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
        if (!existing.normalizedReason) {
            existing.normalizedReason = event.normalizedReason ?? normalizeFailureCategory(event.rawReason, event.rawStatus)
            const stage = event.eventType.includes('payment') ? 'payment' 
                        : event.eventType.includes('confirm') ? 'confirm' 
                        : event.eventType.includes('upload') ? 'upload' 
                        : event.eventType.includes('quote') ? 'quote' 
                        : 'unknown';
            if (!existing.failedStage) {
                existing.failedStage = stage;
            }
        }
        break
      default:
        break
    }
  }

  // 4. Determine the final status based on the most advanced stage reached
  const facts = Array.from(grouped.values())
  for (const fact of facts) {
    if (fact.hasUploadConfirmed) {
      fact.finalStatus = 'upload_confirmed'
    } else if (fact.hasUploadStarted) {
      fact.finalStatus = 'upload_started'
    } else if (fact.hasPaymentSettled) {
      fact.finalStatus = 'payment_settled'
    } else if (fact.hasQuoteCreated) {
      fact.finalStatus = 'quote_created'
    }
    // If it has a failure but has reached a later stage, the later stage is more important.
    // Only mark as failed if it hasn't reached a terminal success state.
    if (fact.hasFailure && !fact.hasUploadConfirmed) {
        fact.finalStatus = 'failed'
    }
  }

  return facts.sort((a, b) => (b.lastSeenAt ?? '').localeCompare(a.lastSeenAt ?? ''))
}
