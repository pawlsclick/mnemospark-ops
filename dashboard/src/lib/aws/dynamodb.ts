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
    if (typeof candidate !== 'string' && typeof candidate !== 'number') continue
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

async function scanAllRows<T>(
  tableName: string,
  input?: TimeRangeInput & { route?: string },
): Promise<T[]> {
  const rows: T[] = []
  let lastKey: Record<string, unknown> | undefined

  // Build filter expression if needed
  const filterExpressions: string[] = []
  const expressionAttributeValues: Record<string, unknown> = {}
  const expressionAttributeNames: Record<string, string> = {}

  if (input?.route) {
    filterExpressions.push('(#route = :route OR #path = :route)')
    expressionAttributeNames['#route'] = 'route'
    expressionAttributeNames['#path'] = 'path'
    expressionAttributeValues[':route'] = input.route
  }

  try {
    do {
      const command = new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastKey,
        FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      })
      const response = await docClient.send(command)

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
