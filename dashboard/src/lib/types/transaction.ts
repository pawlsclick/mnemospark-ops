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
import type { FailureCategory, NormalizedStatus } from '@/lib/types/events'

export interface QuoteFacts {
  quoteId: QuoteId
  walletAddress?: WalletAddress
  network?: string
  amountNormalized?: number
  quoteCreatedAt?: ISODateString
  paymentSettledAt?: ISODateString
  uploadStartedAt?: ISODateString
  uploadConfirmedAt?: ISODateString
  hasQuoteCreated: boolean
  hasPaymentSettled: boolean
  hasUploadStarted: boolean
  hasUploadConfirmed: boolean
  hasFailure: boolean
  finalStatus: NormalizedStatus | 'unknown'
  failedStage?: 'quote' | 'payment' | 'upload' | 'confirm' | 'unknown'
  normalizedReason?: FailureCategory
  objectId?: ObjectId
  objectIdHash?: ObjectIdHash
  objectKey?: ObjectKey
  requestIds: RequestId[]
  transIds: TransactionId[]
  idempotencyKeys: IdempotencyKey[]
  firstSeenAt?: ISODateString
  lastSeenAt?: ISODateString
}

export interface TransactionSummary {
  quoteId: string
  walletAddress?: string
  objectId?: string
  objectKey?: string
  createdAt?: string
  updatedAt?: string
  uploadStatus?: string
  paymentStatus?: string
  overallStatus: string
  requestIds?: string[]
  transIds?: string[]
  errorCode?: string
  errorMessage?: string
}
