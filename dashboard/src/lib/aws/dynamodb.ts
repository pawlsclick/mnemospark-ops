import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { env } from '@/lib/config'
import type {
  ApiCallRow,
  PaymentLedgerRow,
  QuoteRow,
  TimeRangeInput,
  UploadTransactionLogRow,
  WalletAuthEventRow,
} from '@/lib/types/api'
import { coerceIsoDate } from '@/lib/analytics/normalizers'

const client = new DynamoDBClient({
  region: env.AWS_REGION,
})

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

function getComparableTimestamp(item: Record<string, unknown>): string | undefined {
  const candidates = [
    item.event_ts,
    item.created_at,
    item.timestamp,
    item.updated_at,
    item.ts,
  ]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const iso = coerceIsoDate(candidate)
    if (iso) return iso
  }

  return undefined
}

function inTimeRange(item: Record<string, unknown>, input?: TimeRangeInput): boolean {
  if (!input?.from && !input?.to) return true
  const ts = getComparableTimestamp(item)
  if (!ts) return true
  if (input.from && ts < input.from) return false
  if (input.to && ts > input.to) return false
  return true
}

async function scanAllRows<T>(tableName: string, input?: TimeRangeInput): Promise<T[]> {
  const rows: T[] = []
  let lastKey: Record<string, unknown> | undefined

  try {
    do {
      const response = await docClient.send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: lastKey,
        }),
      )

      const pageItems = (response.Items ?? []) as T[]
      for (const row of pageItems) {
        if (inTimeRange(row as Record<string, unknown>, input)) {
          rows.push(row)
        }
      }
      lastKey = response.LastEvaluatedKey as Record<string, unknown> | undefined
    } while (lastKey)
  } catch (error) {
    console.warn(`Unable to scan ${tableName}.`, error)
  }

  return rows
}

export async function fetchUploadTransactionLogs(input?: TimeRangeInput): Promise<UploadTransactionLogRow[]> {
  return scanAllRows<UploadTransactionLogRow>(env.UPLOAD_TRANSACTION_LOG_TABLE_NAME, input)
}

export async function fetchQuotes(input?: TimeRangeInput): Promise<QuoteRow[]> {
  return scanAllRows<QuoteRow>(env.QUOTES_TABLE_NAME, input)
}

export async function fetchPaymentLedgerRows(input?: TimeRangeInput): Promise<PaymentLedgerRow[]> {
  return scanAllRows<PaymentLedgerRow>(env.PAYMENT_LEDGER_TABLE_NAME, input)
}

export async function fetchWalletAuthEvents(input?: TimeRangeInput): Promise<WalletAuthEventRow[]> {
  return scanAllRows<WalletAuthEventRow>(env.WALLET_AUTH_EVENTS_TABLE_NAME, input)
}

export async function fetchApiCallRows(input?: TimeRangeInput): Promise<ApiCallRow[]> {
  return scanAllRows<ApiCallRow>(env.API_CALLS_TABLE_NAME, input)
}
