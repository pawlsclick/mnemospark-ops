export type WalletAddress = string
export type QuoteId = string
export type RequestId = string
export type TransactionId = string
export type ObjectId = string
export type ObjectIdHash = string
export type ObjectKey = string
export type IdempotencyKey = string
export type ISODateString = string

export interface TimeRangeInput {
  from?: ISODateString
  to?: ISODateString
  route?: string
}

export interface UploadTransactionLogRow {
  quote_id: QuoteId
  trans_id: TransactionId
  event_ts?: ISODateString
  created_at?: ISODateString
  status?: string
  wallet_address?: WalletAddress
  amount?: number | string
  network?: string
  object_id?: ObjectId
  object_id_hash?: ObjectIdHash
  object_key?: ObjectKey
  reason?: string | null
  expires_at?: ISODateString
  request_id?: RequestId
  idempotency_key?: IdempotencyKey
  lambda_name?: string
  route?: string
  [key: string]: unknown
}

export interface QuoteRow {
  quote_id: QuoteId
  wallet_address?: WalletAddress
  amount?: number | string
  network?: string
  object_id?: ObjectId
  object_id_hash?: ObjectIdHash
  provider?: string
  region?: string
  created_at?: ISODateString
  event_ts?: ISODateString
  expires_at?: ISODateString
  status?: string
  reason?: string | null
  request_id?: RequestId
  object_key?: ObjectKey
  [key: string]: unknown
}

export interface PaymentLedgerRow {
  wallet_address: WalletAddress
  quote_id: QuoteId
  amount?: number | string
  network?: string
  event_ts?: ISODateString
  created_at?: ISODateString
  status?: string
  request_id?: RequestId
  reason?: string | null
  payment?: unknown
  payment_authorization?: unknown
  [key: string]: unknown
}

export interface WalletAuthEventRow {
  event_id: string
  wallet_address?: WalletAddress
  event_ts?: ISODateString
  created_at?: ISODateString
  status?: string
  reason?: string | null
  request_id?: RequestId
  [key: string]: unknown
}

export interface ApiCallRow {
  request_id: RequestId
  route?: string
  method?: string
  wallet_address?: WalletAddress
  quote_id?: QuoteId
  status_code?: number
  event_ts?: ISODateString
  created_at?: ISODateString
  error?: string | null
  reason?: string | null
  status?: string
  lambda_name?: string
  [key: string]: unknown
}
