import type { DashboardEvent } from '@/lib/types/events'
import type { WalletFacts } from '@/lib/types/wallet'
import type { ISODateString } from '@/lib/types/api'

export interface TimeSeriesPoint {
  bucket: ISODateString
  value: number
}

export interface SeriesBreakdownPoint {
  label: string
  value: number
}

export interface FunnelMetrics {
  quoteCreated: number
  paymentSettled: number
  uploadStarted: number
  uploadConfirmed: number
  quoteToPaymentRate: number
  paymentToUploadRate: number
  uploadToConfirmRate: number
}

export interface RevenueMetrics {
  revenue24h: number
  revenue7d: number
  revenue30d: number
  arpu?: number
  medianTransactionSize?: number
}

export interface LatencyMetrics {
  quoteToPaymentP50?: number
  quoteToPaymentP95?: number
  paymentToUploadP50?: number
  paymentToUploadP95?: number
  uploadToConfirmP50?: number
  uploadToConfirmP95?: number
}

export interface HealthScore {
  status: 'green' | 'yellow' | 'red'
  successRate: number
  errorRate: number
  throughput: number
  latencyScore: number
}

export interface LambdaSummary {
  lambdaName: string
  logicalName: string
  invocationCount?: number
  errorCount?: number
  lastSeenAt?: string
  lastErrorAt?: string
  lastErrorMessage?: string
}

export interface OverviewData {
  revenue: RevenueMetrics
  funnel: FunnelMetrics
  revenueSeries: TimeSeriesPoint[]
  topWallets: WalletFacts[]
  health: HealthScore
  liveEvents: DashboardEvent[]
}
