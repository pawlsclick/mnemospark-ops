import type { LambdaSummary } from '@/lib/types/metrics'

export const KNOWN_LAMBDA_LOGICAL_NAMES = [
  'WalletAuthorizerFunction',
  'PriceStorageFunction',
  'StorageUploadFunction',
  'StorageUploadConfirmFunction',
  'PaymentSettleFunction',
  'StorageLsFunction',
  'StorageDownloadFunction',
  'StorageDeleteFunction',
  'StorageHousekeepingFunction',
] as const

export const KNOWN_ROUTES = [
  'POST /price-storage',
  'POST /storage/upload',
  'POST /storage/upload/confirm',
  'POST /payment/settle',
  'GET /storage/ls',
  'POST /storage/ls',
  'GET /storage/download',
  'POST /storage/download',
  'DELETE /storage/delete',
  'POST /storage/delete',
] as const

export const EMPTY_LAMBDA_SUMMARIES: LambdaSummary[] = KNOWN_LAMBDA_LOGICAL_NAMES.map((logicalName) => ({
  logicalName,
  lambdaName: logicalName,
  invocationCount: 0,
  errorCount: 0,
}))
