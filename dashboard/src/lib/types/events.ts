import type {
  ISODateString,
  IdempotencyKey,
  ObjectId,
  ObjectIdHash,
  ObjectKey,
  QuoteId,
  RequestId,
  TransactionId,
  WalletAddress,
} from '@/lib/types/api'

export type NormalizedStatus =
  | 'quote_created'
  | 'payment_settled'
  | 'upload_started'
  | 'upload_confirmed'
  | 'failed'
  | 'unknown'

export type FailureCategory =
  | 'auth'
  | 'payment'
  | 'upload'
  | 'confirm'
  | 'storage'
  | 'validation'
  | 'unknown'

export interface DashboardEvent {
  id: string
  timestamp: ISODateString
  walletAddress?: WalletAddress
  eventType: string
  source: string
  route?: string
  lambdaName?: string
  status?: 'success' | 'error' | 'pending' | 'info'
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
  normalizedStatus?: NormalizedStatus
  normalizedReason?: FailureCategory
  quoteId?: QuoteId
  objectId?: ObjectId
  objectIdHash?: ObjectIdHash
  objectKey?: ObjectKey
  transId?: TransactionId
  requestId?: RequestId
  idempotencyKey?: IdempotencyKey
  network?: string
  amount?: number
  message: string
  metadata?: Record<string, unknown>
}

export interface EventFacts {
  eventId: string
  timestamp: ISODateString
  walletAddress?: WalletAddress
  quoteId?: QuoteId
  requestId?: RequestId
  transId?: TransactionId
  idempotencyKey?: IdempotencyKey
  network?: string
  amountNormalized?: number
  normalizedStatus: NormalizedStatus
  normalizedReason?: FailureCategory
  route?: string
  lambdaName?: string
  source: string
  eventType: string
  rawStatus?: string
  rawReason?: string | null
  isFailure: boolean
  metadata?: Record<string, unknown>
}
