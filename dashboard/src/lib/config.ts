export type EnvConfig = {
  AWS_REGION: string
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_SESSION_TOKEN?: string
  QUOTES_TABLE_NAME: string
  UPLOAD_TRANSACTION_LOG_TABLE_NAME: string
  UPLOAD_IDEMPOTENCY_TABLE_NAME: string
  WALLET_AUTH_EVENTS_TABLE_NAME: string
  API_CALLS_TABLE_NAME: string
  PAYMENT_LEDGER_TABLE_NAME: string
  APPSYNC_EVENTS_ENDPOINT?: string
  APPSYNC_API_KEY?: string
  DEFAULT_TIMEZONE?: string
  DEFAULT_AMOUNT_DECIMALS: number
}

const DEFAULT_STACK_PREFIX = process.env.STACK_PREFIX ?? 'mnemospark-staging'

function withFallback(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback
}

function parseDecimals(value: string | undefined): number {
  if (!value) return 1_000_000
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1_000_000
  }
  return parsed
}

export const env: EnvConfig = {
  AWS_REGION: withFallback(process.env.AWS_REGION, 'us-east-1'),
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  QUOTES_TABLE_NAME: withFallback(process.env.QUOTES_TABLE_NAME, `${DEFAULT_STACK_PREFIX}-quotes`),
  UPLOAD_TRANSACTION_LOG_TABLE_NAME: withFallback(
    process.env.UPLOAD_TRANSACTION_LOG_TABLE_NAME,
    `${DEFAULT_STACK_PREFIX}-upload-transaction-log`,
  ),
  UPLOAD_IDEMPOTENCY_TABLE_NAME: withFallback(
    process.env.UPLOAD_IDEMPOTENCY_TABLE_NAME,
    `${DEFAULT_STACK_PREFIX}-upload-idempotency`,
  ),
  WALLET_AUTH_EVENTS_TABLE_NAME: withFallback(
    process.env.WALLET_AUTH_EVENTS_TABLE_NAME,
    `${DEFAULT_STACK_PREFIX}-wallet-auth-events`,
  ),
  API_CALLS_TABLE_NAME: withFallback(process.env.API_CALLS_TABLE_NAME, `${DEFAULT_STACK_PREFIX}-api-calls`),
  PAYMENT_LEDGER_TABLE_NAME: withFallback(process.env.PAYMENT_LEDGER_TABLE_NAME, `${DEFAULT_STACK_PREFIX}-payments`),
  APPSYNC_EVENTS_ENDPOINT: process.env.APPSYNC_EVENTS_ENDPOINT,
  APPSYNC_API_KEY: process.env.APPSYNC_API_KEY,
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE,
  DEFAULT_AMOUNT_DECIMALS: parseDecimals(process.env.DEFAULT_AMOUNT_DECIMALS),
}
