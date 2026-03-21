import { env } from '@/lib/config'
import type {
  ISODateString,
  QuoteId,
  RequestId,
  TransactionId,
  WalletAddress,
} from '@/lib/types/api'
import type { FailureCategory, NormalizedStatus } from '@/lib/types/events'

export function normalizeAmount(
  value: number | string | undefined | null,
  decimals = env.DEFAULT_AMOUNT_DECIMALS,
): number {
  if (value === undefined || value === null) return 0
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return 0
  return parsed / decimals
}

export function coerceIsoDate(value?: string | number | null): ISODateString | undefined {
  if (value === undefined || value === null) return undefined
  const asString = String(value).trim()
  if (!asString) return undefined
  if (/^\d+$/.test(asString)) {
    const raw = Number(asString)
    if (!Number.isFinite(raw)) return undefined
    const millis = asString.length <= 10 ? raw * 1000 : raw
    const d = new Date(millis)
    if (!Number.isFinite(d.getTime())) return undefined
    return d.toISOString()
  }
  const date = new Date(asString)
  if (!Number.isFinite(date.getTime())) return undefined
  return date.toISOString()
}

export function normalizeStatus(rawStatus?: string, rawReason?: string | null): NormalizedStatus {
  const status = (rawStatus ?? '').toLowerCase()
  const reason = (rawReason ?? '').toLowerCase()
  const combined = `${status} ${reason}`

  if (
    combined.includes('error') ||
    combined.includes('fail') ||
    combined.includes('revert') ||
    combined.includes('denied')
  ) {
    return 'failed'
  }

  if (status.includes('quote') || status.includes('priced') || status.includes('price_storage')) {
    return 'quote_created'
  }

  if (status.includes('payment_settle') || status.includes('settled') || status.includes('payment_success')) {
    return 'payment_settled'
  }

  if (
    status.includes('confirm_transaction_log_written') ||
    status.includes('upload_confirmed') ||
    status.includes('confirm')
  ) {
    return 'upload_confirmed'
  }

  if (
    status.includes('transaction_log_written') ||
    status.includes('upload_started') ||
    status.includes('upload_initiated')
  ) {
    return 'upload_started'
  }

  return 'unknown'
}

export function normalizeFailureCategory(rawReason?: string | null, rawStatus?: string): FailureCategory {
  const value = `${rawStatus ?? ''} ${rawReason ?? ''}`.toLowerCase()

  if (value.includes('auth') || value.includes('signature') || value.includes('wallet_proof')) return 'auth'
  if (value.includes('payment') || value.includes('settle') || value.includes('usdc')) return 'payment'
  if (value.includes('upload') || value.includes('transaction_log_written')) return 'upload'
  if (value.includes('confirm')) return 'confirm'
  if (value.includes('storage') || value.includes('s3') || value.includes('object')) return 'storage'
  if (value.includes('validation') || value.includes('schema') || value.includes('required')) return 'validation'

  return 'unknown'
}

export function toWalletAddress(value: unknown): WalletAddress | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function toQuoteId(value: unknown): QuoteId | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function toRequestId(value: unknown): RequestId | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function toTransactionId(value: unknown): TransactionId | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
