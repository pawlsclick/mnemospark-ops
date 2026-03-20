import type { DashboardEvent } from '@/lib/types/events'
import type { QuoteFacts } from '@/lib/types/transaction'

export interface WalletSummary {
  walletAddress: string
  firstSeenAt?: string
  lastSeenAt?: string
  quoteCount?: number
  uploadCount?: number
  confirmedUploadCount?: number
  paymentCount?: number
  successfulPaymentCount?: number
  failedPaymentCount?: number
  authEventCount?: number
  currentState?: string
  lastEventType?: string
}

export interface WalletFacts {
  walletAddress: string
  firstSeenAt?: string
  lastSeenAt?: string
  totalQuotes: number
  totalUploadsStarted: number
  totalUploadsConfirmed: number
  totalPaymentsSettled: number
  totalFailures: number
  totalAuthFailures: number
  totalRevenue: number
  averageRevenuePerQuote?: number
  medianTransactionSize?: number
  lastNetwork?: string
  lastEventType?: string
}

export interface WalletDetail {
  wallet: WalletFacts | null
  quotes: QuoteFacts[]
  events: DashboardEvent[]
}
